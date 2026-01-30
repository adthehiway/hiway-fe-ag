import { io, Socket } from "socket.io-client";

export interface TokenResponse {
  token: string;
  expiresAt?: string;
}

export interface TokenError {
  message: string;
  code: string;
  error?: string;
}

export class StreamingTokenError extends Error {
  public readonly code: string;
  public readonly error?: string;
  public readonly originalError: TokenError;

  constructor(tokenError: TokenError) {
    super(tokenError.message);
    this.name = "StreamingTokenError";
    this.code = tokenError.code;
    this.error = tokenError.error;
    this.originalError = tokenError;
  }
}

export interface StreamingEvents {
  connected: (data: { authenticated: boolean; sessionId: string }) => void;
  disconnected: () => void;
  reconnecting: () => void;
  reconnected: () => void;
  reconnectionFailed: () => void;
  tokenReceived: (data: TokenResponse) => void;
  tokenError: (error: TokenError) => void;
  sessionRevoked: (data: { reason: string }) => void;
  streamLimitExceeded: (data: {
    message: string;
    hoursUsed: number;
    hoursLimit: number;
  }) => void;
  streamLimitRestored: (data: { message: string }) => void;
  heartbeatResponse: (data: { timestamp: number }) => void;
  watchStartResponse: (data: {
    status: string;
    sessionId: string;
    timestamp: string;
  }) => void;
  watchStartError: (error: { error: string; message: string }) => void;
  watchDurationResponse: (data: {
    status: string;
    totalDuration: number;
    timestamp: string;
  }) => void;
  watchDurationError: (error: { error: string; message: string }) => void;
  watchEndResponse: (data: {
    status: string;
    totalDuration: number;
    timestamp: string;
  }) => void;
  watchEndError: (error: { error: string; message: string }) => void;
}

export class StreamingClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentToken: string | null = null;
  private eventHandlers: Partial<StreamingEvents> = {};
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isReconnecting = false;
  private lastDisconnectTime = 0;
  private reconnectDebounceMs = 2000; // Wait 2 seconds between disconnect events
  private pendingTokenRequests = new Map<
    string,
    {
      resolve: (token: string) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  constructor() {
    this.setupEventListeners = this.setupEventListeners.bind(this);
  }

  // Connect to the streaming server
  async connect(): Promise<{ authenticated: boolean; sessionId: string }> {
    try {
      // If already connected, disconnect first
      if (this.socket?.connected) {
        console.log("Disconnecting existing connection before reconnecting");
        this.socket.disconnect();
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/v1", "");
      const socketOptions: any = {
        forceNew: true,
        transports: ["websocket"],
        timeout: 10000,
      };

      // Add auth token if provided (for authenticated users)

      this.socket = io(`${backendUrl}/streaming`, socketOptions);

      // Set up event listeners
      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        this.socket!.on("connected", (data) => {
          // clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emitEvent("connected", data);
          resolve(data);
        });

        this.socket!.on("connect_error", (error) => {
          console.error("Connection error:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    }
  }

  // Set up event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    // Remove existing listeners to prevent stacking
    this.socket.removeAllListeners();

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      this.stopHeartbeat();
      this.emitEvent("disconnected");

      this.rejectPendingTokenRequests(new Error("Connection lost"));

      if (this.shouldReconnect(reason)) {
        const now = Date.now();
        const timeSinceLastDisconnect = now - this.lastDisconnectTime;

        if (timeSinceLastDisconnect < this.reconnectDebounceMs) {
          return;
        }

        this.lastDisconnectTime = now;

        this.emitEvent("reconnecting");
        this.handleReconnect();
      } else {
        this.reconnectAttempts = 0;
      }
    });

    this.socket.on("tokenResponse", (data: TokenResponse) => {
      this.currentToken = data.token;
      this.emitEvent("tokenReceived", data);

      // Resolve any pending token request
      this.resolvePendingTokenRequest(data.token);
    });

    this.socket.on("tokenError", (error: TokenError) => {
      this.emitEvent("tokenError", error);

      // Reject any pending token request
      this.rejectPendingTokenRequests(new StreamingTokenError(error));
    });

    this.socket.on("sessionRevoked", (data) => {
      this.currentToken = null;
      this.emitEvent("sessionRevoked", data);
    });

    this.socket.on("streamLimitExceeded", (data) => {
      this.emitEvent("streamLimitExceeded", data);
    });

    this.socket.on("streamLimitRestored", (data) => {
      this.emitEvent("streamLimitRestored", data);
    });

    this.socket.on("heartbeatResponse", (data) => {
      this.emitEvent("heartbeatResponse", data);
    });

    // Watch duration tracking events
    this.socket.on("watchStartResponse", (data) => {
      this.emitEvent("watchStartResponse", data);
    });

    this.socket.on("watchStartError", (error) => {
      this.emitEvent("watchStartError", error);
    });

    this.socket.on("watchDurationResponse", (data) => {
      this.emitEvent("watchDurationResponse", data);
    });

    this.socket.on("watchDurationError", (error) => {
      this.emitEvent("watchDurationError", error);
    });

    this.socket.on("watchEndResponse", (data) => {
      this.emitEvent("watchEndResponse", data);
    });

    this.socket.on("watchEndError", (error) => {
      this.emitEvent("watchEndError", error);
    });
  }

  // Handle reconnection logic
  private handleReconnect() {
    if (
      this.isReconnecting ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emitEvent("reconnectionFailed");
      }
      return;
    }

    this.isReconnecting = true;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect()
        .then(() => {
          this.isReconnecting = false;
          this.reconnectAttempts = 0; // Reset attempts on successful reconnection
          this.emitEvent("reconnected");
        })
        .catch(() => {
          this.isReconnecting = false;
          this.handleReconnect();
        });
    }, delay);
  }

  // Request access token for a smartlink
  async requestToken(smartlinkSlug: string, sid?: string, sessionId?: string): Promise<string> {
    if (!this.isConnected || !this.socket) {
      throw new Error("Not connected to streaming server");
    }

    // Check if there's already a pending request for this slug
    if (this.pendingTokenRequests.has(smartlinkSlug)) {
      throw new Error("Token request already in progress for this smartlink");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingTokenRequests.delete(smartlinkSlug);
        reject(new Error("Token request timeout"));
      }, 30000);

      // Store the request
      this.pendingTokenRequests.set(smartlinkSlug, {
        resolve,
        reject,
        timeout,
      });

      // Request token
      this.socket!.emit("requestToken", { smartlinkSlug, sid, sessionId });
    });
  }

  // Send heartbeat to keep session active
  private sendHeartbeat() {
    if (this.isConnected && this.socket) {
      this.socket.emit("heartbeat");
    }
  }

  // Start heartbeat interval
  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000);
  }

  // Stop heartbeat interval
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Notify server when stream starts
  startStream(smartlinkSlug: string) {
    if (this.isConnected && this.socket) {
      this.socket.emit("streamStart", { smartlinkSlug });
    }
  }

  // Notify server when stream stops
  stopStream(smartlinkSlug: string, duration = 0) {
    if (this.isConnected && this.socket) {
      this.socket.emit("streamStop", { smartlinkSlug, duration });
    }
  }

  // Start watch session for duration tracking
  startWatchSession(
    smartlinkSlug: string,
    metadata?: {
      deviceType?: string;
      country?: string;
      source?: string;
    }
  ) {
    if (this.isConnected && this.socket) {
      this.socket.emit("watchStart", {
        smartlinkSlug,
        ...metadata,
      });
    }
  }

  // Update watch duration
  updateWatchDuration(smartlinkSlug: string, duration: number) {
    if (this.isConnected && this.socket) {
      this.socket.emit("watchDuration", { smartlinkSlug, duration });
    }
  }

  // End watch session
  endWatchSession(smartlinkSlug: string, finalDuration?: number) {
    if (this.isConnected && this.socket) {
      this.socket.emit("watchEnd", { smartlinkSlug, finalDuration });
    }
  }

  // Disconnect from server
  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentToken = null;
      this.reconnectAttempts = 0;
    }
  }

  // Event handler management
  on<K extends keyof StreamingEvents>(event: K, handler: StreamingEvents[K]) {
    this.eventHandlers[event] = handler;
  }

  off<K extends keyof StreamingEvents>(event: K) {
    delete this.eventHandlers[event];
  }

  private emitEvent<K extends keyof StreamingEvents>(event: K, data?: any) {
    const handler = this.eventHandlers[event];
    if (handler) {
      (handler as any)(data);
    }
  }

  // Determine if we should reconnect based on disconnect reason
  private shouldReconnect(reason: string): boolean {
    // Don't reconnect on these specific reasons
    const noReconnectReasons = [
      "io server disconnect", // Server initiated disconnect
      "io client disconnect", // Client initiated disconnect
      "transport close", // Transport layer closed (often during page refresh/navigation)
      "transport error", // Transport error (may be temporary but let's be conservative)
    ];

    // Don't reconnect if reason matches any in the list
    if (noReconnectReasons.includes(reason)) {
      return false;
    }

    // Don't reconnect if we're in development and it's likely a hot reload
    if (
      process.env.NODE_ENV === "development" &&
      reason === "transport close"
    ) {
      return false;
    }

    // Reconnect for other reasons like network issues, ping timeout, etc.
    return true;
  }

  // Helper methods for token request management
  private resolvePendingTokenRequest(token: string) {
    // Find the first pending request and resolve it
    for (const [slug, request] of this.pendingTokenRequests.entries()) {
      clearTimeout(request.timeout);
      request.resolve(token);
      this.pendingTokenRequests.delete(slug);
      break; // Only resolve the first one
    }
  }

  private rejectPendingTokenRequests(error: Error) {
    for (const [slug, request] of this.pendingTokenRequests.entries()) {
      clearTimeout(request.timeout);
      request.reject(error);
    }
    this.pendingTokenRequests.clear();
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get token(): string | null {
    return this.currentToken;
  }

  get reconnecting(): boolean {
    return this.isReconnecting;
  }
}
