import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputEnhanced from "@/components/ui/input-enhanced";
import { MediaFormData } from "./hooks/useMediaForm";

interface AdditionalDetailsSectionProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function AdditionalDetailsSection({
  form,
  onFieldChange,
}: AdditionalDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputEnhanced
          placeholder="Enter copyright information, licensing details, and ownership rights"
          label="Copyright Details"
          value={form.copyrightDetails}
          onChange={(e) => onFieldChange("copyrightDetails", e.target.value)}
          textarea
        />

        <div className="space-y-2">
          <InputEnhanced
            placeholder="https://www.imdb.com/title/..."
            label="IMDB Link"
            value={form.imdbLink}
            onChange={(e) => onFieldChange("imdbLink", e.target.value)}
          />
        </div>

        <InputEnhanced
          placeholder="https://www.rottentomatoes.com/m/..."
          label="Rotten Tomatoes Link"
          value={form.rottenTomatoesLink}
          onChange={(e) => onFieldChange("rottenTomatoesLink", e.target.value)}
        />

        <InputEnhanced
          placeholder="10.5240/XXXX-XXXX-XXXX-XXXX-XXXX-X"
          label="EIDR Code"
          value={form.eidrCode}
          onChange={(e) => onFieldChange("eidrCode", e.target.value)}
        />

        <InputEnhanced
          placeholder="ISAN XXXX-XXXX-XXXX-XXXX-X-XXXX-XXXX-F"
          label="ISAN Code"
          value={form.isanCode}
          onChange={(e) => onFieldChange("isanCode", e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
