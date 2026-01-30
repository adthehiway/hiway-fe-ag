import InputEnhanced from "@/components/ui/input-enhanced";
import { MediaFormData } from "../hooks/useMediaForm";

interface TrailerPromoFieldsProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function TrailerPromoFields({
  form,
  onFieldChange,
}: TrailerPromoFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputEnhanced
          placeholder="Parent Title ID"
          label="Parent Title ID"
          value={form.parentTitleId}
          onChange={(e) => onFieldChange("parentTitleId", e.target.value)}
        />
        <InputEnhanced
          placeholder="Cut Type"
          label="Cut Type"
          value={form.cutType}
          onChange={(e) => onFieldChange("cutType", e.target.value)}
        />
        <InputEnhanced
          placeholder="Rating Bureau Code"
          label="Rating Bureau Code"
          value={form.ratingBureauCode}
          onChange={(e) => onFieldChange("ratingBureauCode", e.target.value)}
        />
      </div>
    </div>
  );
}

