import InputEnhanced from "@/components/ui/input-enhanced";
import { MediaFormData } from "../hooks/useMediaForm";

interface EpisodeFieldsProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function EpisodeFields({
  form,
  onFieldChange,
}: EpisodeFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputEnhanced
          placeholder="Series Title"
          label="Series Title"
          value={form.seriesTitle}
          onChange={(e) => onFieldChange("seriesTitle", e.target.value)}
        />
        <InputEnhanced
          placeholder="Season/Episode Number"
          label="Season/Episode Number"
          value={`${form.seasonNumber}/${form.episodeNumber}`}
          onChange={(e) => {
            const parts = e.target.value.split("/");
            if (parts.length === 2) {
              onFieldChange("seasonNumber", parseInt(parts[0]) || 0);
              onFieldChange("episodeNumber", parseInt(parts[1]) || 0);
            }
          }}
        />
        <InputEnhanced
          placeholder="Episode Code"
          label="Episode Code"
          value={form.episodeCode}
          onChange={(e) => onFieldChange("episodeCode", e.target.value)}
        />
        <InputEnhanced
          placeholder="Show-runner"
          label="Show-runner"
          value={form.showRunner}
          onChange={(e) => onFieldChange("showRunner", e.target.value)}
        />
      </div>
    </div>
  );
}

