"use client";

import { AuthenticationModalWidget } from "@/components/auth/authentication-modal.widget";
import { VideoPlayer } from "@/components/common/video-player.component";
import { Button } from "@/components/ui/button";
import ClientNotFound from "@/components/ui/client-not-found";
import { Loader } from "@/components/ui/loader";
import DetailsModal from "@/components/watch/DetailsModal";
import { NavBarWatchWidget } from "@/components/watch/nav-bar-watch.widget";
import { useDla } from "@/contexts/dla";
import { useStreaming } from "@/hooks/useStreaming";
import { cn, getOrCreateSessionId } from "@/lib/utils";
import { EmbedStyle, IWatch } from "@/types";
import { Loader2, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MediaPage from "./MediaPage";
import { StripeCheckoutModal } from "./StripeCheckoutModal";

export default function WatchPageContent({
  isEmbed = false,
  slug,
}: {
  isEmbed?: boolean;
  slug?: string;
}) {
  const { WatchService } = useDla();
  const [fetchInProgress, setFetchInProgress] = useState(true);
  const [accessToken, setAccessToken] = useState<string>();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [playerIsReady, setPlayerIsReady] = useState(false);
  const [data, setData] = useState<IWatch>();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [smartlinkSlug, setSmartlinkSlug] = useState<string>();

  const [showDetails, setShowDetails] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [mode, setMode] = useState<"skip" | "autoplay" | null>(null);
  const [errorMessage, setErrorMessage] = useState<{
    error: string;
    code: string;
    message: string;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string>();

  // Listen for clipboard copy messages from iframe (for trailer share button)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In production, verify event.origin for security
      // For now, accept from any origin since trailer links might be from different domains
      if (event.data?.type === "COPY_TO_CLIPBOARD" && event.data?.text) {
        const copyText = async () => {
          try {
            // Use the original trailer link URL (data.trailerLink) if available
            // Otherwise use the URL from the message
            const urlToCopy = data?.trailerLink || event.data.text;

            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(urlToCopy);
              toast.success("Link copied to clipboard!");
            } else {
              // Fallback to execCommand
              const textArea = document.createElement("textarea");
              textArea.value = urlToCopy;
              textArea.style.position = "fixed";
              textArea.style.left = "-999999px";
              textArea.style.top = "-999999px";
              document.body.appendChild(textArea);
              textArea.select();
              textArea.setSelectionRange(0, urlToCopy.length);
              const successful = document.execCommand("copy");
              document.body.removeChild(textArea);

              if (successful) {
                toast.success("Link copied to clipboard!");
              } else {
                toast.info(`Please copy this link manually: ${urlToCopy}`, {
                  autoClose: 5000,
                });
              }
            }
          } catch (error) {
            console.error("Failed to copy from parent:", error);
            const urlToCopy = data?.trailerLink || event.data.text;
            toast.info(`Please copy this link manually: ${urlToCopy}`, {
              autoClose: 5000,
            });
          }
        };
        copyText();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [data?.trailerLink]);
  const [forceHidePlayer, setForceHidePlayer] = useState(false);
  const [lastToastMessage, setLastToastMessage] = useState<string>("");
  const [sid, setSid] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();
  const {
    isConnected: streamingConnected,
    isReconnecting,
    requestToken: getStreamingToken,
    connect: connectToStreaming,
    startStream,
    stopStream,
    startWatchSession,
    updateWatchDuration,
    endWatchSession,
    error: streamingError,
    disconnect: disconnectStreaming,
    onSessionRevoked,
    onLimitExceeded,
    onConnectionLost,
    onReconnected,
    onReconnectionFailed,
  } = useStreaming();

  useEffect(() => {
    if (slug) {
      setSmartlinkSlug(slug);
    } else {
      setShowError(true);
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSessionId(getOrCreateSessionId());
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const modeParam = url.searchParams.get("mode");
    if (modeParam === "skip" || modeParam === "autoplay") {
      setMode(modeParam);
    }
  }, []);

  useEffect(() => {
    connectToStreaming().catch((error) => {
      console.error("Failed to connect to streaming server:", error);
    });

    return () => {
      if (smartlinkSlug) {
        stopStream(smartlinkSlug);
      }
      disconnectStreaming();
    };
  }, []);

  useEffect(() => {
    onSessionRevoked(() => {
      setAccessToken(undefined);
      setShowPlayer(false);
      setPlayerIsReady(false);
      setForceHidePlayer(true);
    });

    onLimitExceeded(() => {
      setAccessToken(undefined);
      setShowPlayer(false);
      setPlayerIsReady(false);
      setForceHidePlayer(true);
      setErrorMessage({
        error: "STREAMING_LIMIT_EXCEEDED",
        code: "FORBIDDEN",
        message: "Streaming Unavailable",
      });
    });

    onConnectionLost(() => {
      pauseVideo();
      // showToast("Connection lost. Attempting to reconnect...", "warn");
    });

    // Handle reconnection - resume video playback
    onReconnected(() => {
      console.log("Reconnected - resuming video playback");
      console.log("Current state after reconnect:", {
        showPlayer,
        accessToken: !!accessToken,
        forceHidePlayer,
      });
      // Ensure player stays visible after reconnection
      setForceHidePlayer(false);

      // Let the useEffect handle token creation to avoid duplication
      showToast("Reconnected! Video playback resumed.", "success");
    });

    // Handle reconnection failure - show error and allow manual retry
    onReconnectionFailed(() => {
      console.log("Reconnection failed - showing retry option");
      showToast(
        "Failed to reconnect. Please refresh the page or try again.",
        "error",
      );
    });
  }, [onSessionRevoked, onConnectionLost, onReconnected, onReconnectionFailed]);

  // Monitor access token and close player if token becomes invalid (only for session revocation)
  useEffect(() => {
    if (showPlayer && !accessToken && forceHidePlayer) {
      console.log("Access token lost and forced hide - closing video player");
      setShowPlayer(false);
      setPlayerIsReady(false);
    }
  }, [accessToken, showPlayer, forceHidePlayer]);

  function removeURLParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete("sid");
    window.history.pushState({}, "", url.toString());
  }

  // Helper to prevent duplicate toasts
  const showToast = (
    message: string,
    type: "success" | "error" | "warn" | "info" = "info",
  ) => {
    if (lastToastMessage === message) {
      console.log("Preventing duplicate toast:", message);
      return;
    }

    setLastToastMessage(message);

    // Clear the last message after 5 seconds to allow showing it again if needed
    setTimeout(() => {
      setLastToastMessage("");
    }, 5000);

    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warn":
        toast.warn(message);
        break;
      default:
        toast.info(message);
        break;
    }
  };

  function pauseVideo() {
    const videoElement = document.querySelector(
      "#video-player video",
    ) as HTMLVideoElement;
    if (videoElement && !videoElement.paused) {
      videoElement.pause();
    }
  }

  function resumeVideo() {
    const videoElement = document.querySelector(
      "#video-player video",
    ) as HTMLVideoElement;
    if (videoElement && videoElement.paused) {
      videoElement.play().catch(console.error);
    }
  }

  function generateStripeCheckout(rental?: boolean) {
    const watchData = data as IWatch;
    WatchService.createCheckoutLink(watchData.id, rental)
      .then((response: { id: string; clientSecret: string }) => {
        setCheckoutClientSecret(response.clientSecret);
        setShowCheckoutModal(true);
      })
      .catch((error: any) => {
        setShowError(true);
        toast.error("Failed to create checkout session");
      });
  }

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    setCheckoutClientSecret(undefined);
    window.location.reload();
  };

  useEffect(() => {
    console.log(smartlinkSlug);
    if (!smartlinkSlug) return;

    setFetchInProgress(true);
    WatchService.getBySmartLinkSlug(smartlinkSlug)
      .then((data: IWatch) => {
        setData(data);
        setFetchInProgress(false);
      })
      .catch((error: any) => {
        setFetchInProgress(false);
        setShowError(true);
        // if axios error 404
        if (error.response?.status === 404) {
          console.log("notfound");
          setShowNotFound(true);
          return;
        }
      });
  }, [smartlinkSlug]);

  useEffect(() => {
    if (!smartlinkSlug || !streamingConnected || accessToken) return;

    const initToken = async () => {
      await createToken();
    };
    initToken();
  }, [smartlinkSlug, streamingConnected]);

  useEffect(() => {
    if (
      mode &&
      data &&
      accessToken &&
      streamingConnected &&
      !showPlayer &&
      !errorMessage
    ) {
      setShowPlayer(true);
    }
  }, [mode, data, accessToken, streamingConnected, showPlayer, errorMessage]);

  const createToken = async (): Promise<string | undefined> => {
    if (!smartlinkSlug) return;

    if (accessToken) {
      return accessToken;
    }
    setErrorMessage(undefined);
    setIsLoading(true);

    try {
      if (streamingConnected) {
        const sid = new URLSearchParams(window.location.search).get("sid");
        setSid(sid || undefined);
        removeURLParams();
        const token = await getStreamingToken(
          smartlinkSlug,
          sid || undefined,
          sessionId,
        );
        setAccessToken(token);
        return token;
      }
    } catch (error: any) {
      if (error.name === "StreamingTokenError" && error.originalError) {
        const streamingError = error.originalError;
        setErrorMessage({
          error: streamingError.error || streamingError.code || "UNKNOWN_ERROR",
          code: streamingError.code || "UNKNOWN_ERROR",
          message: streamingError.message || "Failed to get access token",
        });
      } else {
        let errorCode = error.code || error.message || "UNKNOWN_ERROR";
        let errorMessage = error.message || "Failed to get access token";
        setErrorMessage({
          error: errorMessage,
          code: errorCode,
          message: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
    return undefined;
  };

  const getBackgroundImage = (data: IWatch) => {
    if (data.backgroundUrl) return data.backgroundUrl;
    return `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${data.cfThumbnail}?width=1920`;
  };

  const getWatchButtonClickHandler = () => {
    if (errorMessage) {
      switch (errorMessage.code) {
        case "UNAUTHORIZED":
          setShowLoginModal(true);
          break;
        case "PAYMENT_REQUIRED":
          generateStripeCheckout();
          break;
        case "PRECONDITION_REQUIRED":
          setShowDetails(true);
          break;
        default:
          showToast(errorMessage.message, "error");
      }
    } else {
      if (!accessToken) {
        showToast("No access token available. Please try again.", "error");
        return;
      }

      if (!streamingConnected && !isReconnecting) {
        showToast(
          "Not connected to streaming server. Attempting to reconnect...",
          "warn",
        );
        connectToStreaming()
          .then(() => {
            if (accessToken) {
              setShowPlayer(true);
            }
          })
          .catch(() => {
            showToast("Failed to connect to streaming server.", "error");
          });
        return;
      }

      if (isReconnecting) {
        showToast("Reconnection in progress. Please wait...", "info");
        return;
      }

      return setShowPlayer(true);
    }
  };

  return (
    <>
      {fetchInProgress && (
        <div className="fixed w-full h-full top-0 left-0 right-0 z-50">
          {/* Loader */}
          <Loader />
        </div>
      )}

      {showNotFound && (
        <ClientNotFound
          title="Content Not Found"
          description="The content you're looking for could not be found. It may have been moved, deleted, or you may not have permission to access it."
        />
      )}

      {!fetchInProgress && !showError && !showNotFound && data && (
        <>
          {!isEmbed && !showPlayer && (
            <div className="fixed top-0 left-0 right-0 z-10">
              <NavBarWatchWidget isPlayerVisible={showPlayer} />
            </div>
          )}
          <div className="relative z-9 w-full h-full">
            {!playerIsReady && (
              <>
                {!data.backgroundUrl && data.backgroundColor && (
                  <div
                    className="absolute z-[1] w-full h-full"
                    style={{ backgroundColor: data.backgroundColor }}
                  />
                )}

                <img
                  alt={data.displayName}
                  src={getBackgroundImage(data)}
                  className="absolute z-0 w-full h-full object-cover"
                  width={1920}
                  height={1080}
                />
              </>
            )}
            {/* <div className="h-full w-full bg-gradient-to-b from-black to-transparent absolute z-1" /> */}

            {(() => {
              const shouldShow = showPlayer && accessToken && !forceHidePlayer;

              return shouldShow;
            })() && (
              <>
                {(!streamingConnected || isReconnecting) && (
                  <div className="absolute top-4 right-4 z-50 bg-black/80 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                    {isReconnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Reconnecting...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm">Connection Lost</span>
                      </>
                    )}
                  </div>
                )}

                <div className=""></div>
                <div
                  className={cn(
                    "w-full h-full relative top-0 left-0  z-8",
                    // !isEmbed ? "pt-[75px]" : ""
                  )}
                >
                  <VideoPlayer
                    showShareButton={true}
                    token={accessToken!}
                    versionHash={data.hash as string}
                    offering={data.offering as string}
                    autoplay={mode === "autoplay" ? true : false}
                    embedded={isEmbed}
                    controls={{
                      markInOut: false,
                      previewMode: false,
                    }}
                    clipStart={data.clipStart}
                    clipEnd={data.clipEnd}
                    contentInfo={{
                      title: data.displayName,
                      subtitle: data.subHeader,
                      companyLogo: data.companyLogo
                        ? data.companyLogo
                        : undefined,
                      rating: data.rating,
                    }}
                    onReady={() => {
                      setPlayerIsReady(true);
                      // Start stream when player is ready and auto-playing
                      if (smartlinkSlug) {
                        startStream(smartlinkSlug);
                      }
                    }}
                    smartlinkSlug={smartlinkSlug}
                    showEndScreenProp={true}
                    // WebSocket duration tracking methods
                    startWatchSession={startWatchSession}
                    updateWatchDuration={updateWatchDuration}
                    endWatchSession={endWatchSession}
                    filmLink={data.filmLink}
                    shareUrl={
                      smartlinkSlug
                        ? `${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : ""
                          }/watch?s=${smartlinkSlug}`
                        : undefined
                    }
                  />
                </div>
              </>
            )}

            {!showPlayer && (
              <>
                {/* Play Button Only Overlay */}
                {isEmbed &&
                  data.embedStyle === EmbedStyle.PLAY_BUTTON_ONLY &&
                  !errorMessage && (
                    <div
                      className="absolute inset-0 z-10 flex items-center justify-center"
                      onClick={
                        !isLoading ? getWatchButtonClickHandler : undefined
                      }
                    >
                      {isLoading ? (
                        <div className="size-20 relative rounded-full overflow-hidden">
                          <Loader />
                        </div>
                      ) : (
                        <div className="bg-muted/50 rounded-full p-6 hover:bg-opacity-70 transition-all duration-200">
                          <Play className="w-16 h-16 text-white fill-white" />
                        </div>
                      )}
                    </div>
                  )}

                {/* Default Content Layout - Hide when in PLAY_BUTTON_ONLY mode */}
                {!(
                  isEmbed && data.embedStyle === EmbedStyle.PLAY_BUTTON_ONLY
                ) && (
                  <MediaPage
                    data={data}
                    isEmbed={isEmbed}
                    smartlinkSlug={smartlinkSlug}
                    isLoading={isLoading}
                    getWatchButtonClickHandler={getWatchButtonClickHandler}
                    generateStripeCheckout={generateStripeCheckout}
                    setShowLoginModal={setShowLoginModal}
                    sid={sid}
                    errorMessage={errorMessage}
                    setShowTrailerModal={setShowTrailerModal}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}

      <AuthenticationModalWidget
        isOpen={showLoginModal}
        redirectTo={`/watch?s=${smartlinkSlug}`}
        handleClose={(reload: boolean) => {
          if (reload) {
            console.log("here");
            window.location.reload();
          } else setShowLoginModal(false);
        }}
      ></AuthenticationModalWidget>

      <DetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        smartlinkId={data?.id || ""}
        data={data?.requiredDetails || []}
        sessionId={sessionId}
        onDone={async () => {
          setShowDetails(false);
          if (!streamingConnected) {
            try {
              await connectToStreaming();
            } catch (error) {
              console.error("Failed to connect to streaming:", error);
              return;
            }
          }
          const token = await createToken();
          if (token && !showPlayer) {
            setShowPlayer(true);
          }
        }}
      />

      {/* Trailer Autoplay Modal */}
      {data?.trailerLink && (
        <Dialog open={showTrailerModal} onOpenChange={setShowTrailerModal}>
          <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 bg-black border-zinc-800">
            <DialogHeader className="p-4 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-white">Trailer</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTrailerModal(false)}
                  className="text-white hover:bg-zinc-800"
                >
                  <X size={20} />
                </Button>
              </div>
            </DialogHeader>
            <div className="w-full h-[calc(90vh-80px)]">
              <iframe
                src={`${data.trailerLink}${
                  data.trailerLink.includes("?") ? "&" : "?"
                }autoplay=true`}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; clipboard-write"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stripe Checkout Modal */}
      {checkoutClientSecret && (
        <StripeCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => {
            setShowCheckoutModal(false);
            setCheckoutClientSecret(undefined);
          }}
          clientSecret={checkoutClientSecret}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
}
