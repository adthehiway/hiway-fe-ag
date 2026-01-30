import { Checkbox } from "@/components/ui/checkbox";
import InputEnhanced from "@/components/ui/input-enhanced";
import { MediaFormData } from "../hooks/useMediaForm";

interface PodcastFieldsProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function PodcastFields({
  form,
  onFieldChange,
}: PodcastFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="font-semibold text-lg">Podcast Fields</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputEnhanced
          placeholder="Show ID"
          label="Show ID"
          value={form.showId}
          onChange={(e) => onFieldChange("showId", e.target.value)}
        />
        <InputEnhanced
          placeholder="Add hosts"
          label="Hosts"
          chips={form.hosts}
          onChipsChange={(chips) => onFieldChange("hosts", chips)}
          chip
        />
        <InputEnhanced
          placeholder="Add guests"
          label="Guests"
          chips={form.guests}
          onChipsChange={(chips) => onFieldChange("guests", chips)}
          chip
        />
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="audioOnlyFlag"
              checked={form.audioOnlyFlag}
              onCheckedChange={(checked) =>
                onFieldChange("audioOnlyFlag", checked === true)
              }
            />
            <label
              htmlFor="audioOnlyFlag"
              className="text-sm cursor-pointer"
            >
              Audio-only Flag
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="explicitFlag"
              checked={form.explicitFlag}
              onCheckedChange={(checked) =>
                onFieldChange("explicitFlag", checked === true)
              }
            />
            <label
              htmlFor="explicitFlag"
              className="text-sm cursor-pointer"
            >
              Explicit Flag
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

