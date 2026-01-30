import InputEnhanced from "@/components/ui/input-enhanced";
import React, { useEffect, useState } from "react";

const AgeRatingselect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [selectedRatingCountry, setSelectedRatingCountry] = useState<
    "UK" | "USA"
  >("USA");

  const ratingOptions = {
    uk: [
      {
        label: "U",
        value: "U",
      },
      {
        label: "PG",
        value: "PG",
      },
      {
        label: "12A",
        value: "12A",
      },
      {
        label: "15",
        value: "15",
      },
      {
        label: "18",
        value: "18",
      },
      {
        label: "R18",
        value: "R18",
      },
    ],
    usa: [
      {
        label: "G",
        value: "G",
      },
      {
        label: "PG",
        value: "PG",
      },
      {
        label: "PG-13",
        value: "PG-13",
      },
      {
        label: "R",
        value: "R",
      },
      {
        label: "NC-17",
        value: "NC-17",
      },
    ],
  };

  useEffect(() => {
    if (value) {
      if (ratingOptions.uk.some((r) => r.value === value)) {
        setSelectedRatingCountry("UK");
      } else {
        setSelectedRatingCountry("USA");
      }
    }
  }, [value]);

  return (
    <div className="flex  gap-2 w-full">
      <div className="w-32">
        <InputEnhanced
          placeholder="Rating Country"
          label="Rating Country"
          value={selectedRatingCountry}
          onSelectChange={(v) => {
            setSelectedRatingCountry(v as "UK" | "USA");
            onChange(
              ratingOptions[v.toLowerCase() as keyof typeof ratingOptions][0]
                .value
            );
          }}
          select
          options={[
            { label: "UK", value: "UK" },
            { label: "USA", value: "USA" },
          ]}
        />
      </div>
      <InputEnhanced
        placeholder="Rating"
        label="Rating"
        value={value}
        onSelectChange={(v) => onChange(v)}
        select
        options={
          ratingOptions[
            selectedRatingCountry.toLowerCase() as keyof typeof ratingOptions
          ]
        }
      />
    </div>
  );
};

export default AgeRatingselect;
