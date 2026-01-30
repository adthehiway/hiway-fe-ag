import { useState, useEffect, useCallback, useRef } from "react";
import {
  StreamingClient,
  TokenResponse,
  TokenError,
} from "@/lib/streaming-client";

export interface UseStreamingReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  isReconnecting: boolean;
  currentToken: string | null;
  error: string | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  requestToken: (smartlinkSlug: string, sid?: string, sessionId?: string) => Promise<string>;
  startStream: (smartlinkSlug: string) => void;
  stopStream: (smartlinkSlug: string, duration?: number) => void;
  startWatchSession: (
    smartlinkSlug: string,
    metadata?: {
      deviceType?: string;
      country?: string;
      source?: string;
    }
  ) => void;
  updateWatchDuration: (smartlinkSlug: string, duration: number) => void;
  endWatchSession: (smartlinkSlug: string, finalDuration?: number) => void;
  disconnect: () => void;
  clearError: () => void;
  onSessionRevoked: (callback: () => void) => void;
  onLimitExceeded: (callback: () => void) => void;
  onConnectionLost: (callback: () => void) => void;
  onReconnected: (callback: () => void) => void;
  onReconnectionFailed: (callback: () => void) => void;
}

export const useStreaming = (): UseStreamingReturn => {
  const [client, setClient] = useState<StreamingClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const clientRef = useRef<StreamingClient | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const sessionRevokedCallbackRef = useRef<(() => void) | null>(null);
  const limitExceededCallbackRef = useRef<(() => void) | null>(null);
  const connectionLostCallbackRef = useRef<(() => void) | null>(null);
  const reconnectedCallbackRef = useRef<(() => void) | null>(null);
  const reconnectionFailedCallbackRef = useRef<(() => void) | null>(null);

  // Initialize streaming client
  const connect = useCallback(async () => {
    try {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current) {
        console.log("Connection already in progress, skipping...");
        return;
      }

      isConnectingRef.current = true;
      setError(null);
      setIsLoading(true);

      // Clean up existing client
      if (clientRef.current) {
        clientRef.current.disconnect();
      }

      const streamingClient = new StreamingClient();
      clientRef.current = streamingClient;

      // Set up event handlers
      streamingClient.on("connected", (data) => {
        setIsConnected(true);
        setIsAuthenticated(data.authenticated);
      });

      streamingClient.on("disconnected", () => {
        setIsConnected(false);
        setIsAuthenticated(false);

        if (connectionLostCallbackRef.current) {
          connectionLostCallbackRef.current();
        }
      });

      streamingClient.on("reconnecting", () => {
        setIsReconnecting(true);
      });

      streamingClient.on("reconnected", () => {
        setIsReconnecting(false);
        setError(null);

        // Call reconnected callback
        if (reconnectedCallbackRef.current) {
          reconnectedCallbackRef.current();
        }
      });

      streamingClient.on("reconnectionFailed", () => {
        setIsReconnecting(false);
        setCurrentToken(null);
        setError("Failed to reconnect to streaming server");

        // Call reconnection failed callback
        if (reconnectionFailedCallbackRef.current) {
          reconnectionFailedCallbackRef.current();
        }
      });

      streamingClient.on("tokenReceived", (data: TokenResponse) => {
        setCurrentToken(data.token);
        setError(null);
      });

      streamingClient.on("tokenError", (error: TokenError) => {
        setError(error.message);
        setCurrentToken(null);
      });

      streamingClient.on("sessionRevoked", (data) => {
        setCurrentToken(null);

        // Call session revoked callback
        if (sessionRevokedCallbackRef.current) {
          sessionRevokedCallbackRef.current();
        }
      });

      streamingClient.on("streamLimitExceeded", (data) => {
        setCurrentToken(null);

        // Call limit exceeded callback
        if (limitExceededCallbackRef.current) {
          limitExceededCallbackRef.current();
        }
      });

      // Connect to server
      await streamingClient.connect();

      setClient(streamingClient);
    } catch (err: any) {
      setError(err.message || "Failed to connect to streaming server");
      setIsConnected(false);
      setIsAuthenticated(false);
      setCurrentToken(null);

      // Call connection lost callback on connection failure
      if (connectionLostCallbackRef.current) {
        connectionLostCallbackRef.current();
      }
    } finally {
      setIsLoading(false);
      isConnectingRef.current = false;
    }
  }, []);

  // Request streaming token
  const requestToken = useCallback(
    async (smartlinkSlug: string, sid?: string ,sessionId?: string): Promise<string> => {
      if (!clientRef.current) {
        throw new Error("Not connected to streaming server");
      }

      try {
        setError(null);
        const token = await clientRef.current.requestToken(smartlinkSlug, sid, sessionId);
        return token;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to get streaming token";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const startStream = useCallback((smartlinkSlug: string) => {
    if (clientRef.current) {
      clientRef.current.startStream(smartlinkSlug);
    }
  }, []);

  const stopStream = useCallback((smartlinkSlug: string, duration = 0) => {
    if (clientRef.current) {
      clientRef.current.stopStream(smartlinkSlug, duration);
    }
  }, []);

  const startWatchSession = useCallback(
    (
      smartlinkSlug: string,
      metadata?: {
        deviceType?: string;
        country?: string;
        source?: string;
      }
    ) => {
      if (clientRef.current) {
        clientRef.current.startWatchSession(smartlinkSlug, metadata);
      }
    },
    []
  );

  const updateWatchDuration = useCallback(
    (smartlinkSlug: string, duration: number) => {
      if (clientRef.current) {
        clientRef.current.updateWatchDuration(smartlinkSlug, duration);
      }
    },
    []
  );

  // End watch session
  const endWatchSession = useCallback(
    (smartlinkSlug: string, finalDuration?: number) => {
      if (clientRef.current) {
        clientRef.current.endWatchSession(smartlinkSlug, finalDuration);
      }
    },
    []
  );

  // Disconnect
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
      setClient(null);
      setIsConnected(false);
      setIsAuthenticated(false);
      setCurrentToken(null);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Callback registration functions
  const onSessionRevoked = useCallback((callback: () => void) => {
    sessionRevokedCallbackRef.current = callback;
  }, []);

  const onLimitExceeded = useCallback((callback: () => void) => {
    limitExceededCallbackRef.current = callback;
  }, []);

  const onConnectionLost = useCallback((callback: () => void) => {
    connectionLostCallbackRef.current = callback;
  }, []);

  const onReconnected = useCallback((callback: () => void) => {
    reconnectedCallbackRef.current = callback;
  }, []);

  const onReconnectionFailed = useCallback((callback: () => void) => {
    reconnectionFailedCallbackRef.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    isAuthenticated,
    isReconnecting,
    currentToken,
    error,
    isLoading,
    connect,
    requestToken,
    startStream,
    stopStream,
    startWatchSession,
    updateWatchDuration,
    endWatchSession,
    disconnect,
    clearError,
    onSessionRevoked,
    onLimitExceeded,
    onConnectionLost,
    onReconnected,
    onReconnectionFailed,
  };
};
