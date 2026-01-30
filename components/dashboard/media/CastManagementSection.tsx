import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputEnhanced from "@/components/ui/input-enhanced";
import DragAndDropUploader from "@/components/ui/drag-and-drop-uploader";
import { MediaFormData, MediaCastMember } from "./hooks/useMediaForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useUpload } from "@/contexts/upload";
import { slugifyFilename } from "@/lib/utils";
import { toast } from "react-toastify";

interface CastManagementSectionProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function CastManagementSection({
  form,
  onFieldChange,
}: CastManagementSectionProps) {
  const { uploadS3 } = useUpload();
  const [newCastMember, setNewCastMember] = useState<MediaCastMember>({
    name: "",
    characterName: "",
    image: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleAddCastMember = async () => {
    if (!newCastMember.name.trim()) return;

    // If there's a preview image but no S3 URL, we need to upload it first
    const imageUrl = newCastMember.image;

    if (previewImage && imageUrl && !imageUrl.startsWith("http")) {
      // This means we have a local file that needs to be uploaded
      // The image should already be uploaded via handlePhotoUpload
      // But if it's still a data URL, we need to handle it
      if (imageUrl.startsWith("data:")) {
        toast.error("Please wait for image upload to complete");
        return;
      }
    }

    const castMember: MediaCastMember = {
      name: newCastMember.name.trim(),
      characterName: newCastMember.characterName?.trim() || undefined,
      image: imageUrl || undefined,
    };

    onFieldChange("castMembers", [...form.castMembers, castMember]);
    setNewCastMember({
      name: "",
      characterName: "",
      image: "",
    });
    setPreviewImage(null);
  };

  const handleRemoveCastMember = (index: number) => {
    onFieldChange(
      "castMembers",
      form.castMembers.filter((_, i) => i !== index)
    );
  };

  const handlePhotoUpload = async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, or WebP files.");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to S3
      const slugifiedFilename = slugifyFilename(file.name);
      const renamedFile = Object.defineProperty(file, "name", {
        writable: true,
        value: slugifiedFilename,
      });

      const s3Url = await uploadS3(renamedFile);
      if (!s3Url) {
        throw new Error("Failed to upload file to S3");
      }

      // Update the cast member with S3 URL
      setNewCastMember((prev) => ({
        ...prev,
        image: s3Url,
      }));

      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error?.message || "Failed to upload image");
      setPreviewImage(null);
      setNewCastMember((prev) => ({
        ...prev,
        image: "",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Add cast members with photos or import from IMDB link above
        </p>

        {/* Two Column Layout: Add Form on Left, Cast & Crew on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Add New Cast Member Form */}
          <div className="space-y-4 ">
            <h4 className="font-medium text-sm">Add New Cast Member</h4>

            <DragAndDropUploader
              value={previewImage || newCastMember.image}
              onDrop={handlePhotoUpload}
              allowedFormats={["png", "jpg", "jpeg", "webp"]}
              maxFileSize={5}
              height="h-32"
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading image...
              </div>
            )}

            <InputEnhanced
              placeholder="Enter cast member name"
              label="Cast Member Name *"
              value={newCastMember.name}
              onChange={(e) =>
                setNewCastMember((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <InputEnhanced
              placeholder="e.g. Neo, Trinity, Morpheus"
              label="Character Name"
              value={newCastMember.characterName}
              onChange={(e) =>
                setNewCastMember((prev) => ({
                  ...prev,
                  characterName: e.target.value,
                }))
              }
            />

            <Button
              type="button"
              onClick={handleAddCastMember}
              disabled={!newCastMember.name.trim() || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cast Member
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Cast & Crew Display */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Cast & Crew</h4>
            {form.castMembers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ">
                {form.castMembers.map((member, index) => (
                  <div
                    key={index}
                    className="relative group flex flex-col items-center p-4 border rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors "
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveCastMember(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/90 hover:bg-destructive text-white shadow-md transition-all hover:scale-110 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                      title="Remove cast member"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <Avatar className="w-16 h-16 mb-2">
                      <AvatarImage
                        src={member.image}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-sm text-center">
                      {member.name}
                    </p>
                    {member.characterName && (
                      <p className="text-xs text-muted-foreground text-center">
                        {member.characterName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full ">
                <p className="text-sm text-muted-foreground">
                  No cast members added yet
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
