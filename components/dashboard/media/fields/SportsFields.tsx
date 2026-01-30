import InputEnhanced from "@/components/ui/input-enhanced";
import { MediaFormData } from "../hooks/useMediaForm";

interface SportsFieldsProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function SportsFields({
  form,
  onFieldChange,
}: SportsFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="font-semibold text-lg">Sports Fields</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputEnhanced
          placeholder="Sport"
          label="Sport"
          value={form.sport}
          onChange={(e) => onFieldChange("sport", e.target.value)}
        />
        <InputEnhanced
          placeholder="Competition/League"
          label="Competition/League"
          value={form.competitionLeague}
          onChange={(e) => onFieldChange("competitionLeague", e.target.value)}
        />
        <InputEnhanced
          placeholder="Teams"
          label="Teams"
          value={form.teams}
          onChange={(e) => onFieldChange("teams", e.target.value)}
        />
        <InputEnhanced
          placeholder="Venue"
          label="Venue"
          value={form.venue}
          onChange={(e) => onFieldChange("venue", e.target.value)}
        />
        <InputEnhanced
          placeholder="Event Type"
          label="Event Type"
          value={form.eventType}
          onChange={(e) => onFieldChange("eventType", e.target.value)}
        />
      </div>
    </div>
  );
}

