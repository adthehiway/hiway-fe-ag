import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { IMedia, ISmartLink } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import InputEnhanced from "@/components/ui/input-enhanced";
import { useCompany } from "@/hooks/useCompanies";
import Image from "next/image";
import AgeRatingselect from "../common/age-rating-select";

const PlayOutInstructions = ({
  smartLink,
  onChange,
  media,
  mediaLoading,
  errors,
}: {
  smartLink: Partial<ISmartLink>;
  onChange: (field: keyof ISmartLink, value: any) => void;
  media?: IMedia;
  mediaLoading: boolean;
  errors: { [key: string]: string | undefined };
}) => {
  const [showPricing, setShowPricing] = useState(!!smartLink.pricingName);
  const [showSubHeader, setShowSubHeader] = useState(!!smartLink.subHeader);
  const [showAgeRating, setShowAgeRating] = useState(!!smartLink.ageRating);
  const [showLogo, setShowLogo] = useState(!!smartLink.companyLogo);
  const [showPlaybook, setShowPlaybook] = useState(!!smartLink.playbookContent);
  const { data: comapny } = useCompany();
  const [isSmartlinkLoaded, setIsSmartlinkLoaded] = useState(false);
  const [showTrailerButton, setShowTrailerButton] = useState(
    !!smartLink.showTrailerButton
  );
  const [trailerAutoplay, setTrailerAutoplay] = useState(
    !!smartLink.trailerAutoplay
  );
  const [showFilmButton, setShowFilmButton] = useState(
    !!smartLink.showFilmButton
  );

  useEffect(() => {
    if (isSmartlinkLoaded) return;
    setShowPricing(!!smartLink.pricingName);
    setShowSubHeader(!!smartLink.subHeader);
    setShowAgeRating(!!smartLink.ageRating);
    setShowLogo(!!smartLink.companyLogo);
    setShowPlaybook(!!smartLink.playbookContent);
    setShowTrailerButton(!!smartLink.showTrailerButton);
    // Set trailer autoplay from smartLink data (check both autoPlayTrailer and trailerAutoplay)
    const autoplayValue = (smartLink as any).autoPlayTrailer ?? smartLink.trailerAutoplay ?? false;
    setTrailerAutoplay(autoplayValue === true);
    setShowFilmButton(!!smartLink.showFilmButton);
    if (smartLink.status) {
      setIsSmartlinkLoaded(true);
    }
  }, [smartLink]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customise Optional Play-Out Instructions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between ">
            <div>
              <Label className="mb-2 text-white text-sm">
                Show Custom Title
              </Label>
              <div className="text-muted-foreground text-sm">
                Display custom title for this SmartLink
              </div>
            </div>
            <Switch
              checked={showPricing}
              onCheckedChange={(checked) => {
                setShowPricing(checked);
                onChange("pricingName", checked ? smartLink.pricingName : "");
              }}
            />
          </div>
          {showPricing && (
            <div className="">
              <InputEnhanced
                placeholder="Custom Title"
                value={smartLink.pricingName || ""}
                onChange={(e) => onChange("pricingName", e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between ">
            <div>
              <Label className="mb-2 text-white text-sm">Show Sub Header</Label>
              <div className="text-muted-foreground text-sm">
                Add descriptive subtitle
              </div>
            </div>
            <Switch
              checked={showSubHeader}
              onCheckedChange={(checked) => {
                setShowSubHeader(checked);
                onChange("subHeader", checked ? smartLink.subHeader : "");
              }}
            />
          </div>
          {showSubHeader && (
            <InputEnhanced
              placeholder="Sub Header"
              value={smartLink.subHeader || ""}
              onChange={(e) => onChange("subHeader", e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ">
            <div>
              <Label className="mb-2 text-white text-sm">
                Show Company Logo
              </Label>
              <div className="text-muted-foreground text-sm">
                Display your brand logo
              </div>
            </div>
            <Switch
              checked={showLogo}
              onCheckedChange={(checked) => {
                setShowLogo(checked);
                onChange("companyLogo", checked ? comapny?.logo : null);
              }}
            />
          </div>
          {showLogo && (
            <div className="flex items-center justify-center">
              <Image
                src={smartLink.companyLogo || comapny?.logo || ""}
                alt="Company Logo"
                width={100}
                height={100}
                className="rounded-full object-cover "
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between ">
            <div>
              <Label className="mb-2 text-white text-sm">Show Age Rating</Label>
              {!showSubHeader && (
                <div className="text-muted-foreground text-sm">
                  Select the age rating for the content
                </div>
              )}
            </div>
            <Switch
              checked={showAgeRating}
              onCheckedChange={(checked) => {
                setShowAgeRating(checked);
                onChange(
                  "ageRating",
                  checked ? media?.metadata?.rating || "" : null
                );
              }}
            />
          </div>
          {showAgeRating && (
            // <InputEnhanced
            //   disabled={!!media?.metadata?.rating || mediaLoading}
            //   label="Age Rating"
            //   placeholder="Age Rating"
            //   value={smartLink.ageRating || ""}
            //   onSelectChange={(value) => onChange("ageRating", value)}
            //   select
            //   options={Object.values(MediaRating).map((rating) => ({
            //     label: rating,
            //     value: rating,
            //   }))}
            // />
            <AgeRatingselect
              value={smartLink.ageRating || ""}
              onChange={(v) => onChange("ageRating", v)}
            />
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between ">
            <div>
              <Label className="mb-2 text-white text-sm">
                Show Trailer Button
              </Label>
              <div className="text-muted-foreground text-sm">
                Insert a Smartlink here to show trailer button on the video
                player welcome screen
              </div>
            </div>
            <Switch
              checked={showTrailerButton}
              onCheckedChange={(checked) => {
                setShowTrailerButton(checked);
                onChange("showTrailerButton", checked);
              }}
            />
          </div>
          {showTrailerButton && (
            <>
              <InputEnhanced
                placeholder="Trailer Link"
                value={smartLink.trailerLink || ""}
                onChange={(e) => {
                  // Remove autoplay parameter if user manually edits the link
                  let cleanValue = e.target.value;
                  cleanValue = cleanValue.replace(/[?&]autoplay=true/g, "");
                  cleanValue = cleanValue.replace(/[?&]$/, "");
                  onChange("trailerLink", cleanValue);
                }}
                error={errors.trailerLink}
              />
              {/* <div className="flex items-center justify-between">
                <Label className="text-white text-sm">
                  Autoplay Trailer
                </Label>
                <Switch
                  checked={trailerAutoplay}
                  onCheckedChange={(checked) => {
                    setTrailerAutoplay(checked);
                    // Explicitly send boolean value (true or false)
                    onChange("trailerAutoplay", checked === true ? true : false);
                  }}
                />
              </div> */}
              {/* {trailerAutoplay && (
                <p className="text-xs text-muted-foreground">

                </p>
              )} */}
            </>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between ">
            <div>
              <Label className="mb-2 text-white text-sm">
                Show Watch Film Button
              </Label>
              <div className="text-muted-foreground text-sm">
                To show a button at the end of the trailer to watch full film
                enter the SmartLink below
              </div>
            </div>
            <Switch
              checked={showFilmButton}
              onCheckedChange={(checked) => {
                setShowFilmButton(checked);
                onChange("showFilmButton", checked);
              }}
            />
          </div>
          {showFilmButton && (
            <InputEnhanced
              placeholder="Film Link"
              value={smartLink.filmLink || ""}
              onChange={(e) => onChange("filmLink", e.target.value)}
              error={errors.filmLink}
            />
          )}
        </div>
        <InputEnhanced
          label="Button Text"
          placeholder="Button Text"
          value={smartLink.buttonText || ""}
          onChange={(e) => onChange("buttonText", e.target.value)}
          error={errors.buttonText}
        />
      </CardContent>
    </Card>
  );
};

export default PlayOutInstructions;
