import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputEnhanced from "@/components/ui/input-enhanced";
import { MediaFormData } from "./hooks/useMediaForm";

interface ContentDetailsSectionProps {
  form: MediaFormData;
  onFieldChange: (field: keyof MediaFormData, value: any) => void;
}

export function ContentDetailsSection({
  form,
  onFieldChange,
}: ContentDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputEnhanced
          placeholder="Library Title"
          label="Library Title"
          value={form.title}
          maxLength={500}
          onChange={(e) => onFieldChange("title", e.target.value)}
        />
        <InputEnhanced
          placeholder="Video Description"
          label="Video Description"
          value={form.description}
          maxLength={10000}
          onChange={(e) => onFieldChange("description", e.target.value)}
          textarea
        />
      </CardContent>
    </Card>
  );
}

