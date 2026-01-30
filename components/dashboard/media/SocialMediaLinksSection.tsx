import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputEnhanced from "@/components/ui/input-enhanced";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaFormData, MediaSocialLink } from "./hooks/useMediaForm";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface SocialMediaLinksSectionProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

const SOCIAL_PLATFORMS = [
  { label: "Instagram", value: "instagram" },
  { label: "Twitter", value: "twitter" },
  { label: "Facebook", value: "facebook" },
  { label: "YouTube", value: "youtube" },
  { label: "TikTok", value: "tiktok" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Vimeo", value: "vimeo" },
  { label: "Other", value: "other" },
];

export function SocialMediaLinksSection({
  form,
  onFieldChange,
}: SocialMediaLinksSectionProps) {
  const [newLink, setNewLink] = useState<MediaSocialLink>({
    platform: "",
    url: "",
    handle: "",
  });

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddLink = () => {
    if (!newLink.platform || !newLink.url.trim()) return;

    const trimmedUrl = newLink.url.trim();

    // Validate URL format
    if (!isValidUrl(trimmedUrl)) {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    const link: MediaSocialLink = {
      ...newLink,
      url: trimmedUrl,
      handle: newLink.handle?.trim() || undefined,
    };

    onFieldChange("socialLinks", [...form.socialLinks, link]);
    setNewLink({ platform: "", url: "", handle: "" });
  };

  const handleRemoveLink = (index: number) => {
    onFieldChange(
      "socialLinks",
      form.socialLinks.filter((_, i) => i !== index)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media & Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Add social media accounts and promotional links for this content
        </p>

        {/* Add New Link Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-secondary/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputEnhanced
              select
              value={newLink.platform}
              onSelectChange={(value) =>
                setNewLink((prev) => ({ ...prev, platform: value }))
              }
              options={SOCIAL_PLATFORMS.map((platform) => ({
                label: platform.label,
                value: platform.value,
              }))}
              placeholder="Select platform"
              label="Platform"
            />

            <InputEnhanced
              placeholder="https://..."
              label="URL / Link"
              value={newLink.url}
              onChange={(e) =>
                setNewLink((prev) => ({ ...prev, url: e.target.value }))
              }
            />

            <InputEnhanced
              placeholder="@username"
              label="Handle (Optional)"
              value={newLink.handle || ""}
              onChange={(e) =>
                setNewLink((prev) => ({ ...prev, handle: e.target.value }))
              }
            />
          </div>

          <Button
            type="button"
            onClick={handleAddLink}
            disabled={!newLink.platform || !newLink.url.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Social Account
          </Button>
        </div>

        {/* Social Links Display */}
        {form.socialLinks.length > 0 ? (
          <div className="space-y-3">
            {form.socialLinks.map((link, index) => {
              const platform = SOCIAL_PLATFORMS.find(
                (p) => p.value === link.platform
              );
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-secondary/30 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant="secondary" className="capitalize shrink-0">
                      {platform?.label || link.platform}
                    </Badge>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p
                        className="text-sm font-medium truncate"
                        title={link.url}
                      >
                        {link.url}
                      </p>
                      {link.handle && (
                        <p
                          className="text-xs text-muted-foreground truncate"
                          title={link.handle}
                        >
                          {link.handle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(link.url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLink(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No social accounts added
          </p>
        )}
      </CardContent>
    </Card>
  );
}
