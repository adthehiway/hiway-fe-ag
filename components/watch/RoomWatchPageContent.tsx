"use client";

import { AuthenticationModalWidget } from "@/components/auth/authentication-modal.widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import ClientNotFound from "@/components/ui/client-not-found";
import { NavBarWatchWidget } from "@/components/watch/nav-bar-watch.widget";
import WatchService from "@/services/watch";
import {
  cn,
  formatNumber,
  getFileNameFromName,
  getOrCreateSessionId,
} from "@/lib/utils";
import { SmartLinkAccess, IWatch } from "@/types";
import {
  Loader2,
  Share2Icon,
  Play,
  Clock,
  Calendar,
  RotateCcwIcon,
  ListVideo,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
// @ts-expect-error - Package is not typed
import { getCurrencySymbol } from "@brixtol/currency-symbols";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { VideoPlayer } from "@/components/common/video-player.component";
import { useStreaming } from "@/hooks/useStreaming";
import DetailsModal from "@/components/watch/DetailsModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SmartRoomService from "@/services/smartrooms";
import { StripeCheckoutModal } from "./StripeCheckoutModal";

interface RoomSmartLink {
  id: string;
  slug: string;
  name: string;
  media: {
    id: string;
    title: string;
    thumbnail?: string;
    duration?: string;
    year?: number;
    genres?: string[];
  };
}

interface RoomData {
  accessError?: {
    error: string;
    code: string;
    message: string;
  };
  id: string;
  slug: string;
  name: string;
  description?: string;
  type: SmartLinkAccess;
  displayName?: string;
  subHeader?: string;
  companyLogo?: string;
  companyName?: string;
  price?: number;
  rentalPrice?: number;
  currency?: string;
  thumbnail?: string;
  backgroundUrl?: string;
  backgroundColor?: string;
  totalViews?: number;
  authentication: boolean;
  requiredDetails?: string[];
  embedStyle?: string;
  buttonText?: string;
  trailerLink?: string;
  filmLink?: string;
  hasAccess: boolean;
  smartLinks: RoomSmartLink[];
  expiresAt?: string | null;
  expiresAtEnabled: boolean;
  maxViews?: number | null;
  maxViewsEnabled: boolean;
  isRecurring?: boolean;
  subscriptionInterval?: "month" | "year";
}

export default function RoomWatchPageContent({ slug }: { slug?: string }) {
  const router = useRouter();
  const [fetchInProgress, setFetchInProgress] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [roomData, setRoomData] = useState<RoomData>();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [roomSlug, setRoomSlug] = useState<string | undefined>(slug);
  const [errorMessage, setErrorMessage] = useState<{
    error: string;
    code: string;
    message: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSmartLink, setSelectedSmartLink] =
    useState<RoomSmartLink | null>(null);
  const { data: user } = useUser();

  // Streaming State
  const [accessToken, setAccessToken] = useState<string>();
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerIsReady, setPlayerIsReady] = useState(false);
  const [videoData, setVideoData] = useState<IWatch>(); // The actual IWatch data for the selected video
  const [forceHidePlayer, setForceHidePlayer] = useState(false);
  const [sid, setSid] = useState<string>();
  const [lastToastMessage, setLastToastMessage] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();

  const downloadMedia = () => {
    if (!selectedSmartLink) return;
    setIsDownloading(true);
    setDownloadPercent(0);
    WatchService.downloadMediaBySmartlinkSlug(
      selectedSmartLink.slug,
      (percent) => setDownloadPercent(percent),
    )
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = getFileNameFromName(selectedSmartLink.name || "download");
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      })
      .catch((error: any) => {
        console.error("Error downloading media:", error);
        toast.error("Failed to download media");
      })
      .finally(() => {
        setIsDownloading(false);
        setDownloadPercent(0);
      });
  };

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
    disconnect: disconnectStreaming,
    onSessionRevoked,
    onLimitExceeded,
    onConnectionLost,
    onReconnected,
    onReconnectionFailed,
  } = useStreaming();

  useEffect(() => {
    if (slug) {
      setRoomSlug(slug);
    } else {
      setShowError(true);
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSessionId(getOrCreateSessionId());
    }
  }, []);

  // Initial Streaming Connection
  useEffect(() => {
    connectToStreaming().catch((error) => {
      console.error("Failed to connect to streaming server:", error);
    });

    return () => {
      if (selectedSmartLink) {
        stopStream(selectedSmartLink.slug);
      }
      disconnectStreaming();
    };
  }, []);

  // Streaming Event Handlers
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
      // pauseVideo(); // Need to implement if we want strict pausing
    });

    onReconnected(() => {
      setForceHidePlayer(false);
      // If we have a selected smart link with URL param, retry loading
      if (selectedSmartLink && typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const smartLinkSlugParam = searchParams.get("s");
        if (
          smartLinkSlugParam &&
          smartLinkSlugParam === selectedSmartLink.slug &&
          !showPlayer &&
          !accessToken
        ) {
          // Reset auto-load flag to allow retry
          setAutoLoadAttempted(false);
        }
      }
    });

    onReconnectionFailed(() => {
      showToast("Failed to reconnect. Please refresh the page.", "error");
    });
  }, [
    onSessionRevoked,
    onLimitExceeded,
    onConnectionLost,
    onReconnected,
    onReconnectionFailed,
  ]);

  // Fetch Room Data
  const fetchRoomData = () => {
    if (!roomSlug) return;
    setFetchInProgress(true);
    setErrorMessage(undefined);
    const searchParams = new URLSearchParams(window.location.search);
    const sidParam = searchParams.get("sid");
    const smartLinkSlugParam = searchParams.get("s"); // Get smart link slug from URL

    WatchService.getRoomBySlug({
      slug: roomSlug,
      sid: sidParam || undefined,
      sessionId: sessionId || undefined,
    })
      .then((data: RoomData) => {
        setRoomData(data);
        setFetchInProgress(false);
        setShowError(false);

        if (data.hasAccess && data.smartLinks.length > 0) {
          // If smart link slug is in URL, find and select it, otherwise select first
          if (smartLinkSlugParam) {
            const foundSmartLink = data.smartLinks.find(
              (sl) => sl.slug === smartLinkSlugParam,
            );
            if (foundSmartLink) {
              setSelectedSmartLink(foundSmartLink);
              // Reset auto-load flag when setting new smart link from URL
              setAutoLoadAttempted(false);
            } else {
              // If slug not found, default to first and update URL
              setSelectedSmartLink(data.smartLinks[0]);
              updateUrlWithSmartLink(data.smartLinks[0].slug);
              setAutoLoadAttempted(false);
            }
          } else {
            setSelectedSmartLink(data.smartLinks[0]);
            // Update URL with first smart link slug
            updateUrlWithSmartLink(data.smartLinks[0].slug);
            setAutoLoadAttempted(false);
          }
        }

        if (data.accessError) {
          setErrorMessage(data.accessError);
        }
      })
      .catch((error: any) => {
        setFetchInProgress(false);
        handleRoomError(error);
      });
  };

  // Helper function to remove sid from URL
  function removeURLParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete("sid");
    window.history.pushState({}, "", url.toString());
  }

  // Helper function to update URL with smart link slug
  const updateUrlWithSmartLink = (smartLinkSlug: string) => {
    if (typeof window === "undefined" || !roomSlug) return;

    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);

    // Update or add 's' parameter
    searchParams.set("s", smartLinkSlug);

    // Build new URL (preserves all existing params including 'sid')
    const newUrl = `${currentUrl.pathname}?${searchParams.toString()}`;

    // Update URL without page reload
    router.replace(newUrl, { scroll: false });
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomSlug, sessionId]);

  // Auto-load video if smart link slug is in URL and user has access
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !roomData?.hasAccess ||
      !selectedSmartLink ||
      showPlayer ||
      accessToken ||
      isLoading ||
      autoLoadAttempted ||
      !streamingConnected ||
      isReconnecting
    )
      return;

    const searchParams = new URLSearchParams(window.location.search);
    const smartLinkSlugParam = searchParams.get("s");

    // If URL has a smart link slug and it matches the selected one, auto-load
    if (smartLinkSlugParam && smartLinkSlugParam === selectedSmartLink.slug) {
      setAutoLoadAttempted(true);
      // Small delay to ensure everything is ready
      setTimeout(() => {
        handleWatchSmartLink(selectedSmartLink);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    roomData?.hasAccess,
    selectedSmartLink?.slug,
    showPlayer,
    accessToken,
    isLoading,
    streamingConnected,
    isReconnecting,
    autoLoadAttempted,
  ]);

  // Token Creation
  const createToken = async () => {
    if (!selectedSmartLink) return;
    if (accessToken) return; // Already have token

    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      // Get sid from URL
      const sidParam = new URLSearchParams(window.location.search).get("sid");
      setSid(sidParam || undefined);
      removeURLParams();

      if (streamingConnected) {
        const token = await getStreamingToken(
          selectedSmartLink.slug,
          sidParam || undefined,
        );
        setAccessToken(token);
        setShowPlayer(true);
      } else {
        // Try to connect first
        await connectToStreaming();
        const token = await getStreamingToken(
          selectedSmartLink.slug,
          sidParam || undefined,
        );
        setAccessToken(token);
        setShowPlayer(true);
      }
    } catch (error: any) {
      console.error("Token creation error:", error);
      if (error.name === "StreamingTokenError" && error.originalError) {
        const streamingError = error.originalError;
        setErrorMessage({
          error: streamingError.error || streamingError.code || "UNKNOWN_ERROR",
          code: streamingError.code || "UNKNOWN_ERROR",
          message: streamingError.message || "Failed to get access token",
        });
      } else {
        let errorCode = error.code || error.message || "UNKNOWN_ERROR";
        let errorMsg = error.message || "Failed to get access token";
        setErrorMessage({
          error: errorMsg,
          code: errorCode,
          message: errorMsg,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomError = (error: any) => {
    const statusCode = error.response?.status;
    const errorData = error.response?.data;

    if (statusCode === 404) {
      setShowNotFound(true);
      setShowError(true);
      return;
    }

    // Extract room data from error if available (common pattern in this app for 401/402)
    let data: RoomData | null = null;
    if (errorData) {
      if (errorData.id || errorData.slug || errorData.name) {
        data = errorData as RoomData;
      } else if (errorData.room) {
        data = errorData.room as RoomData;
      } else if (errorData.data) {
        data = errorData.data as RoomData;
      }
    }

    if ((statusCode === 401 || statusCode === 402) && data) {
      setRoomData(data);
      setShowError(false);
      if (statusCode === 401) {
        setErrorMessage({
          error: "AUTHENTICATION_REQUIRED",
          code: "AUTHENTICATION_REQUIRED",
          message: errorData?.message || "Authentication required",
        });
      } else {
        setErrorMessage({
          error: "PAYMENT_REQUIRED",
          code: "PAYMENT_REQUIRED",
          message: errorData?.message || "Payment required",
        });
      }
    } else {
      if (data) {
        setRoomData(data);
        setShowError(false);
      } else {
        setShowError(true);
      }
      // Set general error message
      setErrorMessage({
        error: "UNKNOWN_ERROR",
        code: statusCode === 403 ? "FORBIDDEN" : "UNKNOWN_ERROR",
        message: errorData?.message || "An error occurred",
      });
    }
  };

  const generateStripeCheckout = (rental?: boolean) => {
    if (!roomData) return;
    WatchService.createRoomCheckoutLink(roomData.id, rental)
      .then((response: { id: string; clientSecret: string }) => {
        setCheckoutClientSecret(response.clientSecret);
        setShowCheckoutModal(true);
      })
      .catch(() => {
        toast.error("Failed to create checkout session");
      });
  };

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    setCheckoutClientSecret(undefined);
    window.location.reload();
  };

  const handleWatchSmartLink = async (smartLink: RoomSmartLink) => {
    if (!roomData?.hasAccess) {
      // If no access, we might want to show purchase options
      if (roomData?.type === SmartLinkAccess.PAYWALL) {
        toast.error("Please purchase access to watch");
      } else {
        toast.error("You do not have access to this content");
      }
      return;
    }

    // Reset auto-load flag when manually selecting
    setAutoLoadAttempted(false);

    // Update URL with smart link slug
    updateUrlWithSmartLink(smartLink.slug);

    setSelectedSmartLink(smartLink);
    // Reset player state for new video
    setShowPlayer(false);
    setAccessToken(undefined);
    setVideoData(undefined);
    setPlayerIsReady(false);

    setIsLoading(true);

    try {
      // Ensure streaming is connected first
      if (!streamingConnected) {
        await connectToStreaming();
        // Wait a bit for connection to stabilize
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Fetch full IWatch data for the smartlink to get hash/offering
      const data = await WatchService.getBySmartLinkSlug(smartLink.slug);
      setVideoData(data);

      // Ensure we're still connected before getting token
      if (!streamingConnected) {
        await connectToStreaming();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Get sid from URL
      const sidParam = new URLSearchParams(window.location.search).get("sid");
      setSid(sidParam || undefined);
      removeURLParams();

      // Get streaming token
      const token = await getStreamingToken(
        smartLink.slug,
        sidParam || undefined,
      );
      setAccessToken(token);
      setShowPlayer(true);
    } catch (error: any) {
      console.error("Error preparing video:", error);
      if (error.message.includes("Token request already in progress")) {
        toast.error(
          "Slow down, you're trying to watch too many videos at once",
        );
        return;
      }
      if (error.message.includes("Token request timeout")) {
        toast.error("Failed to load video details");
        return;
      }
      if (error.message.includes("Not connected to streaming server")) {
        toast.error("Failed to load video details");
        return;
      }
      toast.error("Failed to load video details");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    if (lastToastMessage === message) return;
    setLastToastMessage(message);
    setTimeout(() => setLastToastMessage(""), 5000);
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast.info(message);
  };

  const getWatchButtonClickHandler = () => {
    if (errorMessage?.code === "AUTHENTICATION_REQUIRED") {
      setShowLoginModal(true);
      return;
    }
    if (errorMessage?.code === "PAYMENT_REQUIRED") {
      generateStripeCheckout();
      return;
    }
    if (errorMessage?.code === "PRECONDITION_REQUIRED") {
      // Check if this is for room-level access (from roomData.accessError)
      // Room-level errors come from roomData.accessError when user is logged in but hasn't submitted details
      if (
        roomData &&
        roomData.requiredDetails &&
        roomData.requiredDetails.length > 0
      ) {
        setShowRoomDetails(true);
      } else if (
        videoData?.requiredDetails &&
        videoData.requiredDetails.length > 0
      ) {
        // This is for video-level access
        setShowDetails(true);
      }
      return;
    }

    // If we have access and a selected link, watch it
    if (roomData?.hasAccess && selectedSmartLink) {
      handleWatchSmartLink(selectedSmartLink);
    } else if (roomData?.hasAccess && roomData.smartLinks.length > 0) {
      // Select first one
      handleWatchSmartLink(roomData.smartLinks[0]);
    }
  };

  const getBackgroundImage = (roomData: RoomData) => {
    if (roomData.backgroundUrl) return roomData.backgroundUrl;
    if (roomData.thumbnail) return roomData.thumbnail;
    return "";
  };

  const getSmartLinkThumbnail = (smartLink: RoomSmartLink) => {
    if (!smartLink.media.thumbnail) return "";
    if (smartLink.media.thumbnail.startsWith("http")) {
      return smartLink.media.thumbnail;
    }
    return `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${smartLink.media.thumbnail}?width=1920`;
  };

  const shareLink = () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({
        title: roomData?.displayName || roomData?.name || "Watch Room",
        text: roomData?.subHeader || roomData?.description || "",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast("Link copied to clipboard!");
    }
  };

  if (fetchInProgress) {
    return (
      <div className="fixed w-full h-full top-0 left-0 right-0 z-50">
        <Loader />
      </div>
    );
  }

  if (showNotFound) {
    return (
      <ClientNotFound
        title="Room Not Found"
        description="The room could not be found."
      />
    );
  }

  if (
    showError &&
    !roomData &&
    errorMessage?.code !== "AUTHENTICATION_REQUIRED" &&
    errorMessage?.code !== "PAYMENT_REQUIRED"
  ) {
    return (
      <ClientNotFound
        title="Error"
        description={errorMessage?.message || "Failed to load room"}
      />
    );
  }

  if (!roomData) return null;

  return (
    <>
      {!showPlayer && (
        <div className="fixed top-0 left-0 right-0 z-10">
          <NavBarWatchWidget isPlayerVisible={false} />
        </div>
      )}

      <div
        className={cn(
          "relative z-9 w-full min-h-screen overflow-x-hidden",
          roomData.hasAccess ? "bg-zinc-950" : "bg-black",
        )}
      >
        {/* Background - Only show when user doesn't have access */}
        {!roomData.hasAccess && !playerIsReady && (
          <>
            {getBackgroundImage(roomData) && (
              <>
                {roomData.backgroundColor && (
                  <div
                    className="absolute z-[1] w-full h-full"
                    style={{ backgroundColor: roomData.backgroundColor }}
                  />
                )}
                <img
                  alt={roomData.displayName}
                  src={getBackgroundImage(roomData)}
                  className="absolute z-0 w-full h-full object-cover"
                  width={1920}
                  height={1080}
                />
              </>
            )}
            <div className="h-full w-full bg-gradient-to-b from-black to-transparent absolute z-1" />
          </>
        )}

        <div className="relative z-10">
          {!roomData.hasAccess ? (
            <div className="relative w-full  h-screen flex flex-col justify-center gap-4 py-4 px-4 xl:px-8 z-2 ">
              <div className="flex flex-row items-center gap-2">
                {roomData.companyLogo && (
                  <div
                    className="w-[17.09px] h-[17.09px] xl:w-[22px] xl:h-[22px] border border-white-100 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${roomData.companyLogo})`,
                    }}
                  />
                )}
                {roomData.companyName && (
                  <p className="font-primary font-bold text-[12px] xl:text-[16px] leading-[14.06px] xl:leading-[18.75px] text-white-100 uppercase">
                    {roomData.companyName}
                  </p>
                )}
              </div>

              <p className="font-primary font-bold text-xl xl:text-[48px] sm:text-[32px] leading-[36px] uppercase text-white">
                {roomData.displayName || roomData.name}
              </p>

              {(roomData.subHeader || roomData.description) && (
                <p className="font-primary block text-[14px] xl:text-[16px] leading-[20px] text-white-100 font-normal max-w-3xl">
                  {roomData.subHeader || roomData.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 items-center">
                {roomData.totalViews !== undefined && (
                  <p className="font-primary block text-[12px] xl:text-[14px] leading-[12px] xl:leading-[14px] text-white-100 font-normal">
                    <span className="inline-block pr-[10px]">
                      {formatNumber(roomData.totalViews)} views
                    </span>
                    {roomData.smartLinks.length > 0 && (
                      <>
                        |
                        <span className="inline-block pl-[10px]">
                          {roomData.smartLinks.length} videos
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-row items-center gap-2 pt-4">
                {roomData.type === SmartLinkAccess.PAYWALL && (
                  <Button
                    size="default"
                    onClick={getWatchButtonClickHandler}
                    disabled={isLoading}
                  >
                    {errorMessage?.code === "AUTHENTICATION_REQUIRED"
                      ? "Sign In to Watch"
                      : roomData.isRecurring
                        ? "Subscribe Now"
                        : roomData.buttonText || "Buy Now"}
                    {roomData.price && (
                      <span className="ml-1">
                        {getCurrencySymbol(roomData.currency)}{" "}
                        {formatNumber(roomData.price)}
                      </span>
                    )}
                  </Button>
                )}
                {(roomData.type === SmartLinkAccess.PRIVATE ||
                  roomData.type === SmartLinkAccess.SHARED) && (
                  <Button
                    size="default"
                    onClick={getWatchButtonClickHandler}
                    disabled={isLoading}
                  >
                    {errorMessage?.code === "AUTHENTICATION_REQUIRED"
                      ? "Sign In to Watch"
                      : // : errorMessage?.code === "PRECONDITION_REQUIRED"
                        // ? "Provide Details"
                        errorMessage?.code === "FORBIDDEN"
                        ? errorMessage?.message
                        : roomData.isRecurring
                          ? "Subscribe Now"
                          : "Watch Now"}
                  </Button>
                )}

                {!user && roomData.type === SmartLinkAccess.PAYWALL && (
                  <Button
                    size="default"
                    onClick={() => setShowLoginModal(true)}
                    disabled={isLoading}
                  >
                    Already Purchased
                  </Button>
                )}

                {roomData.trailerLink && (
                  <Button
                    size="default"
                    onClick={() => window.open(roomData.trailerLink, "_blank")}
                  >
                    <Share2Icon className="w-4 h-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}

                <Button size="default" onClick={shareLink}>
                  <Share2Icon className="w-4 h-4 mr-2" />
                  Share
                </Button>

                {roomData.smartLinks.length > 0 && (
                  <Button
                    size="default"
                    variant="secondary"
                    onClick={() => setShowPlaylistModal(true)}
                  >
                    <ListVideo className="w-4 h-4 mr-2" />
                    {roomData.smartLinks.length} Videos
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full px-2 sm:px-3 pt-14 pb-2">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3">
                {/* LEFT COLUMN (Main Content) */}
                <div className="lg:col-span-8 space-y-3">
                  {/* PLAYER SECTION */}
                  <div className="w-full aspect-video bg-black overflow-hidden rounded-lg">
                    {showPlayer && accessToken && videoData ? (
                      <VideoPlayer
                        showShareButton={true}
                        token={accessToken}
                        versionHash={videoData.hash as string}
                        offering={videoData.offering as string}
                        autoplay={true}
                        controls={{ markInOut: false, previewMode: false }}
                        contentInfo={{
                          title: videoData.displayName,
                          subtitle: videoData.subHeader,
                          companyLogo: videoData.companyLogo,
                        }}
                        onReady={() => {
                          setPlayerIsReady(true);
                          if (selectedSmartLink)
                            startStream(selectedSmartLink.slug);
                        }}
                        smartlinkSlug={selectedSmartLink?.slug}
                        showEndScreenProp={true}
                        startWatchSession={startWatchSession}
                        updateWatchDuration={updateWatchDuration}
                        endWatchSession={endWatchSession}
                        filmLink={videoData.filmLink}
                      />
                    ) : (
                      <div
                        className="w-full h-full relative group cursor-pointer"
                        onClick={getWatchButtonClickHandler}
                      >
                        {selectedSmartLink?.media.thumbnail ? (
                          <Image
                            src={getSmartLinkThumbnail(selectedSmartLink)}
                            alt={selectedSmartLink.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                            <Play size={64} className="text-white/30" />
                          </div>
                        )}
                        {isLoading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg">
                              <Play
                                size={32}
                                className="text-black ml-1 fill-black"
                              />
                            </div>
                          </div>
                        )}
                        {selectedSmartLink?.media.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium text-white">
                            {selectedSmartLink.media.duration}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-base sm:text-lg font-semibold text-white line-clamp-2">
                      {roomData.displayName || roomData.name}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70 pb-2 border-b border-white/10">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-medium">
                          {roomData.totalViews !== undefined
                            ? `${formatNumber(roomData.totalViews)} views`
                            : "0 views"}
                        </span>
                        {selectedSmartLink?.media.year && (
                          <span>{selectedSmartLink.media.year}</span>
                        )}
                        {selectedSmartLink?.media.duration && (
                          <span>{selectedSmartLink.media.duration}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={shareLink}
                        >
                          <Share2Icon className="w-4 h-4 mr-2" />
                          Share
                        </Button>

                        {videoData?.isDownloadable && (
                          <Button
                            disabled={isDownloading}
                            variant="secondary"
                            size="sm"
                            onClick={downloadMedia}
                          >
                            {isDownloading ? (
                              downloadPercent === 0 ? (
                                <>Starting...</>
                              ) : (
                                <>{downloadPercent}%</>
                              )
                            ) : (
                              <>Download</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white/5 rounded p-3 space-y-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        {(roomData.companyLogo || videoData?.companyLogo) && (
                          <Image
                            src={
                              videoData?.companyLogo ||
                              roomData.companyLogo ||
                              ""
                            }
                            width={32}
                            height={32}
                            alt="Company"
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {roomData.companyName}
                          </h3>
                          <p className="text-[10px] text-white/60">Owner</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {selectedSmartLink
                          ? videoData?.subHeader || roomData.description
                          : roomData.description}
                      </p>
                      {selectedSmartLink?.media.genres &&
                        selectedSmartLink.media.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {selectedSmartLink.media.genres.map((g) => (
                              <Badge
                                key={g}
                                variant="secondary"
                                className="text-xs"
                              >
                                {g}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (Playlist) */}
                <div className="lg:col-span-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-white px-1 pb-1">
                      Up next
                    </h3>
                    <div className="space-y-1.5 max-h-[calc(100vh-120px)] overflow-y-auto">
                      {roomData.smartLinks.map((smartLink) => (
                        <div
                          key={smartLink.id}
                          onClick={() => handleWatchSmartLink(smartLink)}
                          className={cn(
                            "flex gap-2 p-1.5 rounded cursor-pointer transition-colors hover:bg-white/10",
                            selectedSmartLink?.id === smartLink.id
                              ? "bg-white/10"
                              : "",
                          )}
                        >
                          <div className="relative w-36 aspect-video bg-zinc-900 rounded overflow-hidden flex-shrink-0">
                            {smartLink.media.thumbnail ? (
                              <Image
                                src={getSmartLinkThumbnail(smartLink)}
                                alt={smartLink.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play size={16} className="text-white/50" />
                              </div>
                            )}
                            {smartLink.media.duration && (
                              <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] text-white">
                                {smartLink.media.duration}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            <h4
                              className={cn(
                                "text-sm font-medium text-white line-clamp-2",
                                selectedSmartLink?.id === smartLink.id &&
                                  "text-accent",
                              )}
                            >
                              {smartLink.name}
                            </h4>
                            <p className="text-xs text-white/50 mt-1 line-clamp-1">
                              {smartLink.media.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthenticationModalWidget
        isOpen={showLoginModal}
        redirectTo={roomSlug ? `/room/${roomSlug}` : undefined}
        handleClose={(reload) => {
          if (reload) window.location.reload();
          else {
            setShowLoginModal(false);
            // Refetch logic could be added here
          }
        }}
      />

      <DetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        smartlinkId={videoData?.id || ""}
        data={videoData?.requiredDetails || []}
        sessionId={sessionId}
        onDone={() => {
          setShowDetails(false);
          createToken();
        }}
      />

      <DetailsModal
        isOpen={showRoomDetails}
        onClose={() => setShowRoomDetails(false)}
        smartlinkId={roomData?.id || ""}
        data={roomData?.requiredDetails || []}
        sessionId={sessionId}
        onSubmit={async (roomId, details, sessionId) => {
          await SmartRoomService.addDetails(roomId, details, sessionId);
        }}
        onDone={() => {
          setShowRoomDetails(false);
          fetchRoomData();
        }}
      />

      {roomData && (
        <Dialog open={showPlaylistModal} onOpenChange={setShowPlaylistModal}>
          <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] bg-zinc-950 border-zinc-800 text-white p-0 gap-0 flex flex-col">
            <DialogHeader className="p-4 sm:p-6 border-b border-zinc-800 flex-shrink-0">
              <DialogTitle>Videos in this Room</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {roomData.smartLinks.length} videos available
              </DialogDescription>
            </DialogHeader>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto max-h-[calc(90vh-120px)]">
              {roomData.smartLinks.map((smartLink) => (
                <div
                  key={smartLink.id}
                  className="flex gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="relative w-24 sm:w-40 aspect-video bg-zinc-900 rounded-md overflow-hidden flex-shrink-0">
                    {smartLink.media.thumbnail ? (
                      <Image
                        src={getSmartLinkThumbnail(smartLink)}
                        alt={smartLink.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play
                          size={16}
                          className="sm:w-5 sm:h-5 text-white/30"
                        />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium text-white">
                      {smartLink.media.duration || "0:00"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="text-sm sm:text-base font-medium text-white line-clamp-2 mb-1">
                      {smartLink.media.title}
                    </h4>

                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap">
                      {smartLink.media.year && (
                        <Badge
                          variant="outline"
                          className="text-[9px] sm:text-[10px] h-4 sm:h-5 border-zinc-700 text-zinc-400"
                        >
                          {smartLink.media.year}
                        </Badge>
                      )}
                      {smartLink.media.genres?.slice(0, 2).map((g) => (
                        <Badge
                          key={g}
                          variant="secondary"
                          className="text-[9px] sm:text-[10px] h-4 sm:h-5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
