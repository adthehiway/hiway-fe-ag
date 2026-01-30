import InputEnhanced from "@/components/ui/input-enhanced";
import { MediaFormData } from "../hooks/useMediaForm";

interface FeatureDocumentaryFieldsProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function FeatureDocumentaryFields({
  form,
  onFieldChange,
}: FeatureDocumentaryFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputEnhanced
          placeholder="Edition"
          label="Edition"
          value={form.edition}
          onChange={(e) => onFieldChange("edition", e.target.value)}
        />
        <InputEnhanced
          placeholder="Cut"
          label="Cut"
          value={form.cut}
          onChange={(e) => onFieldChange("cut", e.target.value)}
        />
        <InputEnhanced
          placeholder="Awards"
          label="Awards"
          value={form.awards}
          onChange={(e) => onFieldChange("awards", e.target.value)}
        />
        <InputEnhanced
          placeholder="Franchise/Collection"
          label="Franchise/Collection"
          value={form.franchiseCollection}
          onChange={(e) => onFieldChange("franchiseCollection", e.target.value)}
        />
      </div>
    </div>
  );
}

