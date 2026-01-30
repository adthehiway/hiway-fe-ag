import { cn, getFileNameFromName } from "@/lib/utils";
import WatchService from "@/services/watch";
import { IWatch, SmartLinkAccess } from "@/types";
import { useState } from "react";
import { toast } from "react-toastify";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";
// @ts-expect-error - Package is not typed
import { getCurrencySymbol } from "@brixtol/currency-symbols";
import { Loader2, Play, Share2Icon, Download } from "lucide-react";
import Link from "next/link";

const MediaPage = ({
  data,
  isEmbed,
  smartlinkSlug,
  errorMessage,
  isLoading,
  getWatchButtonClickHandler,
  generateStripeCheckout,
  setShowLoginModal,
  sid,
  setShowTrailerModal,
}: {
  data: IWatch;
  isEmbed: boolean;
  smartlinkSlug?: string;
  errorMessage?: {
    error: string;
    code: string;
    message: string;
  };
  isLoading: boolean;
  getWatchButtonClickHandler: () => void;
  generateStripeCheckout: (rental?: boolean) => void;
  setShowLoginModal: (show: boolean) => void;
  sid?: string;
  setShowTrailerModal?: (show: boolean) => void;
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const { data: user } = useUser();

  // Temporary values for data we don't have
  const tempData = {
    imdbRating: "9/10",
    rottenTomatoesRating: "90%",
    additionalVersions: [],
  };

  const downloadMedia = () => {
    setIsDownloading(true);
    setIsButtonDisabled(true);
    setDownloadPercent(0);
    WatchService.downloadMediaBySmartlinkSlug(
      smartlinkSlug as string,
      (percent) => setDownloadPercent(percent)
    )
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = getFileNameFromName(data?.displayName || "download");
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      })
      .catch((error: any) => {
        console.error("Error downloading media:", error);
      })
      .finally(() => {
        setIsDownloading(false);
        setIsButtonDisabled(false);
        setDownloadPercent(0);
      });
  };

  const shareLink = () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({
        title: data?.displayName || "Watch",
        text: data?.subHeader || "",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast("Link copied to clipboard!");
    }
  };

  const getWatchButtonText = () => {
    if (errorMessage) {
      switch (errorMessage.code) {
        case "UNAUTHORIZED":
          return "Watch Now";
        case "PAYMENT_REQUIRED":
          return data?.type === SmartLinkAccess.PAYWALL
            ? data?.buttonText
            : "Watch Now";
        case "PRECONDITION_REQUIRED":
          return "Watch Now";
        default:
          if (errorMessage.message) {
            return errorMessage.message;
          }
      }
    }
    return "Watch Now";
  };

  const getBackgroundImage = () => {
    if (data.backgroundUrl) return data.backgroundUrl;
    if (data.cfThumbnail) {
      return `${process.env.NEXT_PUBLIC_CONTENT_FABRIC_BASE_URL_STATICS}${data.cfThumbnail}?width=1920`;
    }
    return null;
  };

  const synopsisText = data.description || "";
  const shortSynopsis =
    synopsisText.length > 200
      ? synopsisText.substring(0, 200) + "..."
      : synopsisText;

  return (
    <div
      className={cn(
        "relative w-full min-h-screen flex flex-col lg:max-w-10/12 mx-auto"
      )}
    >
      {/* Fixed Background Image */}
      <div className="fixed inset-0 z-0 h-screen w-full">
        {getBackgroundImage() && (
          <img
            src={getBackgroundImage() || ""}
            alt={data.displayName}
            className="w-full h-full object-cover"
          />
        )}
        {!getBackgroundImage() && data.backgroundColor && (
          <div
            className="w-full h-full"
            style={{ backgroundColor: data.backgroundColor }}
          />
        )}
        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/70" />
        {/* Gradient Overlay */}
      </div>

      {/* Hero Section with Background */}
      <div className="relative w-full h-screen flex flex-col justify-end pb-32 px-4 xl:px-8 z-10 ">
        {/* Content Overlay */}
        <div className="relative z-10  w-full">
          {/* Company Logo and Name */}
          <div className="flex flex-row items-center gap-2 mb-4">
            {data.companyLogo && (
              <div
                className="w-[17.09px] h-[17.09px] xl:w-[22px] xl:h-[22px] border border-white rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${data.companyLogo})`,
                }}
              />
            )}
            {data.companyName && (
              <p className="font-primary font-bold text-[12px] xl:text-[16px] leading-[14.06px] xl:leading-[18.75px] text-white uppercase">
                {data.companyName}
              </p>
            )}
          </div>

          {/* Title */}
          <h1 className="font-primary font-bold text-3xl xl:text-5xl sm:text-4xl leading-tight text-white uppercase mb-4">
            {data.displayName}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {data.duration && (
              <Badge className="bg-white/20 text-white border-white/30">
                {data.duration}
              </Badge>
            )}
            {data.year && (
              <>
                <Badge className="bg-white/20 text-white border-white/30">
                  {data.year || 2021}
                </Badge>
              </>
            )}
            {data.language && (
              <>
                {" "}
                <Badge className="bg-white/20 text-white border-white/30">
                  {data.language}
                </Badge>
              </>
            )}
            {data.rating && (
              <>
                <Badge className="bg-white/20 text-white border-white/30">
                  {data.rating}
                </Badge>
              </>
            )}
            {data.contentType && (
              <>
                <Badge className="bg-white/20 text-white border-white/30">
                  {data.contentType}
                </Badge>
              </>
            )}
          </div>

          {/* Synopsis */}
          <div className="mb-6 max-w-3xl">
            <p className="text-white text-sm xl:text-base leading-relaxed">
              {isSynopsisExpanded ? synopsisText : shortSynopsis}
              {synopsisText.length > 200 && (
                <button
                  onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                  className="text-teal-400 hover:text-teal-300 ml-2 underline"
                >
                  {isSynopsisExpanded ? "Read less" : "Read all"}
                </button>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row items-center gap-3 mb-4 flex-wrap">
            {errorMessage?.code === "PAYMENT_REQUIRED" ? (
              <>
                <Button
                  disabled={isLoading || isButtonDisabled || isDownloading}
                  onClick={() => generateStripeCheckout(false)}
                >
                  BUY NOW - {getCurrencySymbol(data.currency)}
                  {data.price}
                </Button>
                {data.rentalPrice && (
                  <Button
                    disabled={isLoading || isButtonDisabled || isDownloading}
                    onClick={() => generateStripeCheckout(true)}
                  >
                    RENT NOW - {getCurrencySymbol(data.currency)}
                    {data.rentalPrice}
                  </Button>
                )}
                {!user && data.type === SmartLinkAccess.PAYWALL && !sid && (
                  <Button
                    disabled={isLoading || isButtonDisabled || isDownloading}
                    size={isEmbed ? "sm" : "default"}
                    onClick={() => {
                      setShowLoginModal(true);
                    }}
                  >
                    Already Purchased
                  </Button>
                )}
              </>
            ) : (
              <Button
                disabled={isLoading || isButtonDisabled || isDownloading}
                onClick={getWatchButtonClickHandler}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    Loading...
                    <Loader2 className="animate-spin inline-block" />
                  </span>
                ) : (
                  getWatchButtonText()
                )}
              </Button>
            )}

            <Button size={isEmbed ? "sm" : "default"} onClick={shareLink}>
              <Share2Icon className="w-4 h-4 mr-2" />
              Share
            </Button>

            {data.isDownloadable && (
              <Button
                size={isEmbed ? "sm" : "default"}
                onClick={downloadMedia}
                disabled={isDownloading || isLoading}
              >
                {isDownloading ? (
                  <span className="flex items-center gap-2 relative z-10">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{downloadPercent}%</span>
                  </span>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </>
                )}
                {isDownloading && (
                  <div className="absolute inset-0 bg-teal-500/20">
                    <div
                      className="h-full bg-teal-500/40 transition-all duration-300"
                      style={{ width: `${downloadPercent}%` }}
                    />
                  </div>
                )}
              </Button>
            )}

            {data.trailerLink && (
              <Button
                size={isEmbed ? "sm" : "default"}
                variant="secondary"
                disabled={isDownloading}
                onClick={() => {
                  if (setShowTrailerModal) {
                    setShowTrailerModal(true);
                  } else if (data.trailerLink) {
                    window.location.href = data.trailerLink;
                  }
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Trailer
              </Button>
            )}
            {/* <Button
              className="rounded-full bg-white/20 hover:bg-white/30 text-white p-3"
              size="icon"
            >
              <Volume2 className="w-5 h-5" />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-6 xl:p-8 mx-4 xl:mx-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Run Time</p>
              <p className="text-white">{data.duration || "122min"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Year of Release</p>
              <p className="text-white">{data.year || 2021}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Audio Language</p>
              <p className="text-white">{data.language}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Genres</p>
              <div className="flex flex-wrap gap-2">
                {data.genres && data.genres.length > 0 ? (
                  data.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">{data.contentType}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-4">
            {data.audioTracks && data.audioTracks.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Audio Files</p>
                <p className="text-white">
                  {data.audioTracks.map((audio) => audio.label).join(", ")}
                </p>
              </div>
            )}
            {data.subtitles && data.subtitles.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Subtitles</p>
                <p className="text-white">
                  {data.subtitles.map((subtitle) => subtitle.label).join(", ")}
                </p>
              </div>
            )}
            {data.copyrightDetails && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Copyright</p>
                <p className="text-white">{data.copyrightDetails}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* check if we have a director in the crew */}
            {data.crew?.find((crew) => crew.position === "director") && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Director</p>
                <p className="text-white">
                  {
                    data.crew?.find((crew) => crew.position === "director")
                      ?.name
                  }
                </p>
              </div>
            )}
            {/* check if we have a producer in the crew */}
            {data.crew?.find((crew) => crew.position === "producer") && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Producer</p>
                <p className="text-white">
                  {
                    data.crew?.find((crew) => crew.position === "producer")
                      ?.name
                  }
                </p>
              </div>
            )}
            {/* <div className="flex gap-4 mt-6">
              <div className="flex flex-col items-center">
                <div className="text-white font-bold text-lg mb-1">IMDb</div>
                <div className="text-white text-sm">{tempData.imdbRating}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-white font-bold text-lg mb-1">
                  Rotten Tomatoes
                </div>
                <div className="text-white text-sm">
                  {tempData.rottenTomatoesRating}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Content Boxes */}
      <div className="relative z-10 px-4 xl:px-8 pb-8 space-y-6">
        {/* CAST */}
        {data.cast && data.cast.length > 0 && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-white text-xl font-bold mb-6">CAST</h2>
            <div className="flex flex-wrap gap-4">
              {data.cast.map((member, index) => (
                <div
                  key={member.id || index}
                  className="flex flex-col items-center text-center"
                >
                  <Avatar className="w-20 h-20 mb-3 ">
                    <AvatarImage
                      src={member.image}
                      alt={member.name}
                      className="border-2 border-white/20"
                    />
                    <AvatarFallback className="bg-white/10 text-white text-lg font-semibold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white font-medium text-sm mb-1">
                    {member.name}
                  </p>
                  {member.characterName && (
                    <p className="text-gray-400 text-xs">
                      {member.characterName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BTS, Posters, Additional Versions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.associatedContent?.map((content) => (
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-white text-xl font-bold mb-4">
                {content.type}
              </h2>
              <Link href={`/watch?s=${content.slug}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-3">
                    <img
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="bg-white/20 rounded-full p-3 group-hover:bg-white/30 transition-colors">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                    {content.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {content.duration}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-teal-400 transition-colors">
                    {content.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}

          {/* Posters Section */}
          {data.poster && data.poster.length > 0 && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-white text-xl font-bold mb-4">Posters</h2>
              {data.poster.map((poster) => (
                <div className="">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                    <img
                      src={
                        poster.url
                          ? `${poster.url}?width=640`
                          : "/images/default.png"
                      }
                      alt={poster.filename || "Poster"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.description && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-white text-xl font-bold mb-4">Description</h2>
            <p className="text-white">{data.description}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-6">
        Powered by{" "}
        <img
          src="/images/logo.png"
          alt="Hiway"
          width={50}
          height={50}
          className="text-accent inline-block"
        />
      </div>
    </div>
  );
};

export default MediaPage;
