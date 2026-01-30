import InputEnhanced from "@/components/ui/input-enhanced";
import { MediaFormData } from "../hooks/useMediaForm";

interface CommercialFieldsProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function CommercialFields({
  form,
  onFieldChange,
}: CommercialFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputEnhanced
          placeholder="Advertiser"
          label="Advertiser"
          value={form.advertiser}
          onChange={(e) => onFieldChange("advertiser", e.target.value)}
        />
        <InputEnhanced
          placeholder="Campaign Name"
          label="Campaign Name"
          value={form.campaignName}
          onChange={(e) => onFieldChange("campaignName", e.target.value)}
        />
        <InputEnhanced
          placeholder="Ad-ID/Clearcast Code"
          label="Ad-ID/Clearcast Code"
          value={form.adIdClearcastCode}
          onChange={(e) => onFieldChange("adIdClearcastCode", e.target.value)}
        />
        <InputEnhanced
          placeholder="Duration Cuts"
          label="Duration Cuts"
          value={form.durationCuts}
          onChange={(e) => onFieldChange("durationCuts", e.target.value)}
        />
        <InputEnhanced
          placeholder="Agency"
          label="Agency"
          value={form.agency}
          onChange={(e) => onFieldChange("agency", e.target.value)}
        />
      </div>
    </div>
  );
}

