"use client";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import AssetsTab from "@/components/dashboard/media/AssetsTab";
import { ContentDetailsSection } from "@/components/dashboard/media/ContentDetailsSection";
import { MetadataSection } from "@/components/dashboard/media/MetadataSection";
import { TechnicalInfoSection } from "@/components/dashboard/media/TechnicalInfoSection";
import { ThumbnailSection } from "@/components/dashboard/media/ThumbnailSection";
import { TagsSection } from "@/components/dashboard/media/TagsSection";
import { AdditionalDetailsSection } from "@/components/dashboard/media/AdditionalDetailsSection";
import { CastManagementSection } from "@/components/dashboard/media/CastManagementSection";
import { SocialMediaLinksSection } from "@/components/dashboard/media/SocialMediaLinksSection";
import { useMediaForm } from "@/components/dashboard/media/hooks/useMediaForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMedia, useUpdateMedia } from "@/hooks/useMedia";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { SliceTab } from "@/components/dashboard/media/SliceTab";

export default function EditMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: media, isLoading, isError, error } = useMedia(id, true);
  const updateMedia = useUpdateMedia();
  const [tab, setTab] = useState("metadata");
  const router = useRouter();

  const { form, handleChange, buildUpdatePayload } = useMediaForm(media);

  const handleSave = () => {
    updateMedia.mutate({
      id,
      data: buildUpdatePayload(),
    });
  };

  const handleThumbnailChange = (src: string) => {
    handleChange("thumbnail", src);
  };

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        {error?.message || "Failed to load media."}
      </div>
    );

  return (
    <>
      <PageTitle
        title={"Edit Film"}
        description="Manage file versions and edit metadata"
        content={
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={updateMedia.status === "pending"}
            >
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => router.push("./")}>
              Back to Film
            </Button>
          </div>
        }
      />
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="versions">Version Management</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="slices">Slices</TabsTrigger>
        </TabsList>
        <TabsContent value="metadata" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-3">
              <ContentDetailsSection form={form} onFieldChange={handleChange} />
              <MetadataSection form={form} onFieldChange={handleChange} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-3">
              <ThumbnailSection
                media={media}
                form={form}
                onThumbnailChange={handleThumbnailChange}
              />
              <TagsSection form={form} onFieldChange={handleChange} />
              <AdditionalDetailsSection
                form={form}
                onFieldChange={handleChange}
              />
            </div>
          </div>

          {/* Full Width Sections */}
          <CastManagementSection form={form} onFieldChange={handleChange} />
          <SocialMediaLinksSection form={form} onFieldChange={handleChange} />
          <TechnicalInfoSection media={media} />
        </TabsContent>
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Version Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                Version management UI coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assets">
          <AssetsTab mediaId={id} />
        </TabsContent>
        <TabsContent value="slices">
          {isLoading ? (
            <Loader />
          ) : media ? (
            <SliceTab media={media} />
          ) : (
            <div className="text-muted-foreground">No media found.</div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
