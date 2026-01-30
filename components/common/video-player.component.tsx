"use client";

import { useEffect, useRef, useState } from "react";
import { useDla } from "@/contexts/dla";
import { GeoService } from "@/services/geo";
import { getDeviceType, getSource, cn } from "@/lib/utils";
import { Loader } from "../ui/loader";
import { Button } from "../ui/button";
import { useUser } from "@/hooks/useUser";
import { Share2Icon, RotateCcwIcon } from "lucide-react";
import { toast } from "react-toastify";
import { NavBarWatchWidget } from "../watch/nav-bar-watch.widget";

interface IControls {
  markInOut: boolean;
  previewMode: boolean;
  markInOutCallback?: (values: { in: number; out: number }) => void;
}

interface IContentInfo {
  title?: string;
  subtitle?: string;
  companyLogo?: string;
  rating?: string;
}

interface Props {
  versionHash: string;
  offering: string;
  token: string;
  autoplay: boolean;
  clipStart?: number;
  clipEnd?: number;
  controls: IControls;
  contentInfo?: IContentInfo;
  onReady?: (ready: boolean) => void;
  embedded?: boolean;
  smartlinkSlug?: string;
  showEndScreenProp?: boolean;
  filmLink?: string;
  shareUrl?: string; // Custom share URL (e.g., for trailers)
  showShareButton: boolean;
  onDuration?: (duration: number) => void;
  startWatchSession?: (
    smartlinkSlug: string,
    metadata?: {
      deviceType?: string;
      country?: string;
      source?: string;
    },
  ) => void;
  updateWatchDuration?: (smartlinkSlug: string, duration: number) => void;
  endWatchSession?: (smartlinkSlug: string, finalDuration?: number) => void;
}

export function VideoPlayer(props: Props) {
  const [player, setPlayer] = useState<any>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const viewId = useRef<string | null>(null);
  const hasCreatedView = useRef<boolean>(false);
  const { WatchService } = useDla();
  const { data: user } = useUser();
  const viewStartTime = useRef<number>(0);
  const viewTrackingInterval = useRef<NodeJS.Timeout | null>(null);
  const isTrackingActive = useRef<boolean>(false);
  const hasVideoEnded = useRef<boolean>(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_DELAY = 500; // 3 seconds

  // Mouse activity handling
  const resetInactivityTimer = () => {
    setShowNavbar(true);

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    inactivityTimer.current = setTimeout(() => {
      setShowNavbar(false);
    }, INACTIVITY_DELAY);
  };

  const handleMouseActivity = () => {
    resetInactivityTimer();
  };

  function playerCallback({ player, videoElement }: any) {
    if (props.onReady) {
      props.onReady(true);
    }
    // if (!props.smartlinkSlug) {
    //   return;
    // }

    let handleLoadedMetadata: (() => void) | undefined;

    // Attach event listeners for play, pause, and ended
    if (videoElement) {
      videoRef.current = videoElement;
      handleLoadedMetadata = () => {
        if (!props.onDuration) return;
        const duration = videoElement.duration;
        if (Number.isFinite(duration) && duration > 0) {
          props.onDuration(duration);
        }
      };

      videoElement.addEventListener("play", handleVideoPlay);
      videoElement.addEventListener("pause", handleVideoPause);
      videoElement.addEventListener("ended", handleVideoEnd);
      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);

      if (videoElement.readyState >= 1) {
        handleLoadedMetadata();
      }
    }

    // Clean up listeners on unmount
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("play", handleVideoPlay);
        videoElement.removeEventListener("pause", handleVideoPause);
        videoElement.removeEventListener("ended", handleVideoEnd);
        if (handleLoadedMetadata) {
          videoElement.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata,
          );
        }
      }
    };
  }

  async function startVideo() {
    if (typeof window === "undefined") {
      return;
    }

    const targetContainerElement = document.getElementById("video-player");
    if (!targetContainerElement) {
      return;
    }

    const {
      InitializeEluvioPlayer,
      EluvioPlayerParameters,
      // @ts-expect-error no declaration file
    } = await import("@HiwayDev/elv-player-js");

    const player = await InitializeEluvioPlayer(targetContainerElement, {
      clientOptions: {
        network:
          process.env.NEXT_PUBLIC_CONTENT_FABRIC_NETWORK_NAME === "demov3"
            ? EluvioPlayerParameters.networks.DEMO
            : EluvioPlayerParameters.networks.MAIN,
        staticToken: props.token,
      },
      sourceOptions: {
        playoutParameters: {
          versionHash: props.versionHash,
          offering: props.offering,
          clipStart: props.clipStart || undefined,
          clipEnd: props.clipEnd || undefined,
        },
        contentInfo: props.contentInfo || {},
      },
      playerOptions: {
        title: !props.embedded,
        watermark: true,
        markInOut: props.controls.markInOut,
        markInOutCallback: props.controls.markInOutCallback || undefined,
        previewMode: props.controls.previewMode,
        autoplay: props.autoplay,
        playerCallback,
      },
    });
    setPlayer(player);
    player.UpdateContentInfo(props.contentInfo);
  }
  useEffect(() => {
    startVideo();
  }, [props.controls.markInOut]);

  useEffect(() => {
    if (player && props.controls.previewMode) {
      player.UpdateContentInfo(props.contentInfo);
    }
  }, [props.contentInfo]);

  const initializeWatchSession = async () => {
    if (
      !hasCreatedView.current &&
      props.smartlinkSlug &&
      props.startWatchSession
    ) {
      try {
        const countryCode = await GeoService.getInstance().getCountryCode();
        const deviceType = getDeviceType();
        const source = getSource();

        // Start WebSocket watch session
        props.startWatchSession(props.smartlinkSlug, {
          deviceType,
          country: countryCode,
          source,
        });

        hasCreatedView.current = true;
      } catch (error) {
        console.error("Failed to initialize WebSocket watch session:", error);
      }
    }
  };

  const startDurationTracking = () => {
    if (isTrackingActive.current) {
      return;
    }

    isTrackingActive.current = true;
    viewStartTime.current = Date.now();

    if (viewTrackingInterval.current) {
      clearInterval(viewTrackingInterval.current);
    }

    // Send duration updates via WebSocket every 10 seconds
    viewTrackingInterval.current = setInterval(() => {
      if (
        !props.smartlinkSlug ||
        !props.updateWatchDuration ||
        !isTrackingActive.current
      )
        return;

      const viewDuration = Math.floor(
        (Date.now() - viewStartTime.current) / 1000,
      );

      if (viewDuration > 0) {
        try {
          // Send duration increment via WebSocket
          props.updateWatchDuration(props.smartlinkSlug, viewDuration);
          // Reset the start time after successful update
          viewStartTime.current = Date.now();
        } catch (error) {
          console.error(
            "Failed to update watch duration via WebSocket:",
            error,
          );
        }
      }
    }, 10000); // 10 seconds interval
  };

  const pauseDurationTracking = () => {
    if (!isTrackingActive.current) {
      return;
    }

    // Send final duration increment before pausing
    if (props.smartlinkSlug && props.updateWatchDuration) {
      const finalDuration = Math.floor(
        (Date.now() - viewStartTime.current) / 1000,
      );

      if (finalDuration > 0) {
        try {
          props.updateWatchDuration(props.smartlinkSlug, finalDuration);
        } catch (error) {
          console.error("Failed to send final duration before pause:", error);
        }
      }
    }

    // Stop the tracking interval
    if (viewTrackingInterval.current) {
      clearInterval(viewTrackingInterval.current);
      viewTrackingInterval.current = null;
    }

    isTrackingActive.current = false;
  };

  const endWatchSession = async () => {
    // First pause tracking to send final increment
    pauseDurationTracking();

    if (
      props.smartlinkSlug &&
      props.endWatchSession &&
      hasCreatedView.current
    ) {
      try {
        // End WebSocket watch session
        props.endWatchSession(props.smartlinkSlug);
        hasCreatedView.current = false;
      } catch (error) {
        console.error("Failed to end WebSocket watch session:", error);
      }
    }
  };

  const handleVideoPlay = async () => {
    // Initialize watch session if not done yet
    if (!hasCreatedView.current) {
      await initializeWatchSession();
    }

    // If video ended and user is replaying, reset end state
    if (hasVideoEnded.current) {
      hasVideoEnded.current = false;
      setShowEndScreen(false);
    }

    // Start duration tracking
    startDurationTracking();
  };

  const handleVideoPause = () => {
    // Only pause tracking if video hasn't ended
    if (!hasVideoEnded.current) {
      pauseDurationTracking();
    }
  };

  const handleVideoEnd = () => {
    hasVideoEnded.current = true;

    // Pause duration tracking (don't end session, allow for replay)
    pauseDurationTracking();

    setShowEndScreen(true);
  };

  const handleReplay = () => {
    setShowEndScreen(false);
    hasVideoEnded.current = false;

    if (player) {
      // Reset video to beginning and play
      const videoElement = document.querySelector("#video-player video");
      if (videoElement) {
        (videoElement as HTMLVideoElement).currentTime = 0;
        (videoElement as HTMLVideoElement).play();
      }
    }
  };

  const handleShare = async () => {
    try {
      // Use custom shareUrl if provided (e.g., for trailers), otherwise use current page URL
      // Use the original URL as-is, don't modify it
      const shareUrl =
        props.shareUrl ||
        (typeof window !== "undefined" ? window.location.href : "");

      if (!shareUrl) {
        toast.error("No link available to share");
        return;
      }

      // Skip native share API - always copy to clipboard directly
      // This prevents the share menu from opening on MacBook and other devices

      // Check if we're in an iframe - if so, try to communicate with parent window
      const isInIframe = window.self !== window.top;

      if (isInIframe) {
        // Try to use parent window's clipboard (if same origin)
        // Parent will use the original trailerLink URL and show toast
        try {
          window.parent.postMessage(
            { type: "COPY_TO_CLIPBOARD", text: shareUrl },
            "*", // In production, use specific origin for security
          );
          // Don't show toast here - parent will show it after copying the original URL
          return;
        } catch (postMessageError) {
          console.error("PostMessage failed:", postMessageError);
          // Fall through to local clipboard methods
        }
      }

      // Try modern clipboard API first
      let clipboardSuccess = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          clipboardSuccess = true;
          toast.success("Link copied to clipboard!");
        } catch (clipboardError: any) {
          // Clipboard API blocked (common in iframes)
          console.warn(
            "Clipboard API blocked, using fallback:",
            clipboardError,
          );
        }
      }

      // Fallback to document.execCommand if clipboard API failed or unavailable
      if (!clipboardSuccess) {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = shareUrl;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          textArea.setAttribute("readonly", "");
          document.body.appendChild(textArea);

          // Select and copy
          textArea.select();
          textArea.setSelectionRange(0, shareUrl.length);

          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (successful) {
            toast.success("Link copied to clipboard!");
          } else {
            throw new Error("execCommand copy failed");
          }
        } catch (execError) {
          console.error("All copy methods failed:", execError);
          // Last resort: show the URL in a toast or alert
          toast.info(`Please copy this link manually: ${shareUrl}`, {
            autoClose: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share link");
    }
  };

  // Mouse activity effect
  useEffect(() => {
    // Start the inactivity timer when component mounts
    resetInactivityTimer();

    // Add mouse event listeners to the player container
    const playerContainer = document.getElementById("video-player");
    if (playerContainer) {
      playerContainer.addEventListener("mousemove", handleMouseActivity);
      playerContainer.addEventListener("mouseenter", handleMouseActivity);
    }

    // Cleanup function
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      if (playerContainer) {
        playerContainer.removeEventListener("mousemove", handleMouseActivity);
        playerContainer.removeEventListener("mouseenter", handleMouseActivity);
      }
    };
  }, [player]); // Re-run when player is initialized

  useEffect(() => {
    return () => {
      endWatchSession();

      hasCreatedView.current = false;
      viewId.current = null;
      isTrackingActive.current = false;
      hasVideoEnded.current = false;

      // Clean up inactivity timer
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className={`w-full h-full aspect-video ${
          props.embedded ? "bg-gray-925" : ""
        } relative`}
      >
        <div id="video-player"></div>

        {player && (
          <>
            {/* Navbar - hidden for embedded players */}
            {!props.embedded && (
              <div
                className={cn(
                  "fixed top-0 left-0 right-0 z-10 transition-opacity duration-300 ease-in-out",
                  showNavbar ? "opacity-100" : "opacity-0 pointer-events-none",
                )}
              >
                <NavBarWatchWidget isEmbedded={props.embedded} />
              </div>
            )}

            {props.showShareButton ? (
              <div
                className={cn(
                  "absolute top-4 left-4 z-50 transition-opacity duration-300 ease-in-out",
                  showNavbar ? "opacity-100" : "opacity-0 pointer-events-none",
                )}
                onMouseEnter={handleMouseActivity}
              >
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  className="bg-black/70 border-white/30 text-white hover:bg-black/90 hover:border-white/50 backdrop-blur-sm shadow-lg"
                  title="Share"
                >
                  <Share2Icon className="w-4 h-4" />
                </Button>
              </div>
            ) : undefined}

            {/* Company Logo - Top Right Corner - shows/hides with navbar */}
            {props.contentInfo?.companyLogo && (
              <div
                className={cn(
                  "absolute top-4 right-4 z-40 transition-opacity duration-300 ease-in-out",
                  showNavbar ? "opacity-100" : "opacity-0 pointer-events-none",
                )}
                onMouseEnter={handleMouseActivity}
              >
                <img
                  src={props.contentInfo.companyLogo}
                  alt="Company Logo"
                  className="h-8 w-auto max-w-[120px] object-contain"
                />
              </div>
            )}
          </>
        )}

        {!player && (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
            <Loader />
          </div>
        )}

        {showEndScreen && props.showEndScreenProp && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/50  flex flex-col justify-center items-center z-10">
            <div className="text-center space-y-6">
              {props.contentInfo && (
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    Thank you for watching!
                  </h2>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleReplay}
                  // className="flex items-center gap-2 bg-white text-black hover:bg-gray-200"
                >
                  <RotateCcwIcon className="w-4 h-4" />
                  Replay
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  // className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-black"
                >
                  <Share2Icon className="w-4 h-4" />
                  Share
                </Button>
              </div>

              {props.filmLink && (
                <Button
                  onClick={() => {
                    if (props.filmLink) {
                      window.location.href = props.filmLink;
                    }
                  }}
                >
                  <Share2Icon className="w-4 h-4" />
                  Watch Film
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
