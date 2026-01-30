import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import InputEnhanced from "@/components/ui/input-enhanced";
import CrewInput from "@/components/ui/crew-input.component";
import AgeRatingselect from "@/components/dashboard/common/age-rating-select";
import {
  contentTypeOptions,
  genreOptions,
  languageOptions,
} from "@/config/media";
import { MediaFormData } from "./hooks/useMediaForm";
import { FeatureDocumentaryFields } from "./fields/FeatureDocumentaryFields";
import { EpisodeFields } from "./fields/EpisodeFields";
import { TrailerPromoFields } from "./fields/TrailerPromoFields";
import { CommercialFields } from "./fields/CommercialFields";
import { SportsFields } from "./fields/SportsFields";
import { PodcastFields } from "./fields/PodcastFields";

interface MetadataSectionProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function MetadataSection({ form, onFieldChange }: MetadataSectionProps) {
  const contentType = form.contentType.toLowerCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputEnhanced
            placeholder="Content Type"
            label="Content Type"
            value={form.contentType}
            onSelectChange={(v) => onFieldChange("contentType", v)}
            select
            options={contentTypeOptions}
          />
          <AgeRatingselect
            value={form.rating}
            onChange={(v) => onFieldChange("rating", v)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputEnhanced
            placeholder="Episodic Content"
            label="Episodic Content"
            value={form.episodic ? "Episodic" : "Non-episodic"}
            onSelectChange={(v) => onFieldChange("episodic", v === "Episodic")}
            select
            options={[
              { label: "Episodic", value: "Episodic" },
              { label: "Non-episodic", value: "Non-episodic" },
            ]}
          />
          <InputEnhanced
            placeholder="Release Date"
            label="Release Date"
            value={form.releaseDate}
            onChange={(e) => onFieldChange("releaseDate", e.target.value)}
            type="date"
          />
        </div>

        {form.episodic && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputEnhanced
              placeholder="Season Number"
              label="Season Number"
              value={form.seasonNumber}
              onSelectChange={(v) => onFieldChange("seasonNumber", v)}
            />
            <InputEnhanced
              placeholder="Episode Number"
              label="Episode Number"
              value={form.episodeNumber}
              onSelectChange={(v) => onFieldChange("episodeNumber", v)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputEnhanced
            placeholder="Duration"
            label="Duration (seconds)"
            value={form.duration}
            onChange={(e) => onFieldChange("duration", e.target.value)}
          />
          <InputEnhanced
            placeholder="Genre"
            label="Genre"
            value={form.genre}
            onSelectChange={(v) => onFieldChange("genre", v)}
            select
            options={genreOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputEnhanced
            placeholder="Original Language"
            label="Original Language"
            value={form.language}
            onSelectChange={(v) => onFieldChange("language", v)}
            select
            options={languageOptions}
          />
        </div>

        {/* <InputEnhanced
          placeholder="Add cast members"
          label="Cast"
          chips={form.cast}
          onChipsChange={(chips) => onFieldChange("cast", chips)}
          chip
        /> */}

        <InputEnhanced
          placeholder="Production Company"
          label="Production Company"
          value={form.productionCompany}
          onChange={(e) => onFieldChange("productionCompany", e.target.value)}
        />

        <div>
          <CrewInput
            crew={form.crew}
            onCrewChange={(crew) => onFieldChange("crew", crew)}
          />
        </div>

        {/* Content Type Specific Fields */}
        {(contentType === "feature" || contentType === "documentary") && (
          <FeatureDocumentaryFields form={form} onFieldChange={onFieldChange} />
        )}

        {contentType === "episode" && (
          <EpisodeFields form={form} onFieldChange={onFieldChange} />
        )}

        {(contentType === "trailer" || contentType === "promo") && (
          <TrailerPromoFields form={form} onFieldChange={onFieldChange} />
        )}

        {contentType === "commercial" && (
          <CommercialFields form={form} onFieldChange={onFieldChange} />
        )}

        {contentType === "sports" && (
          <SportsFields form={form} onFieldChange={onFieldChange} />
        )}

        {contentType === "podcast" && (
          <PodcastFields form={form} onFieldChange={onFieldChange} />
        )}
      </CardContent>
    </Card>
  );
}
