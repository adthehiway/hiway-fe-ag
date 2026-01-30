import React, { useState } from "react";
import { Button } from "./button";
import InputEnhanced from "./input-enhanced";
import { X, Plus } from "lucide-react";
import { crewOptions } from "@/config/media";
import { Label } from "./label";

export interface CrewMember {
  position: string;
  name: string;
}

interface CrewInputProps {
  label?: string;
  crew: CrewMember[];
  onCrewChange: (crew: CrewMember[]) => void;
  positionOptions?: { label: string; value: string }[];
  disabled?: boolean;
}

const CrewInput: React.FC<CrewInputProps> = ({
  label = "Crew",
  crew,
  onCrewChange,
  disabled = false,
}) => {
  const [newCrew, setNewCrew] = useState<CrewMember>({
    position: crewOptions[0].value,
    name: "",
  });

  const handleAddCrew = () => {
    if (newCrew.position && newCrew.name.trim()) {
      const updatedCrew = [...crew, { ...newCrew, name: newCrew.name.trim() }];
      onCrewChange(updatedCrew);
      setNewCrew({ position: crewOptions[0].value, name: "" });
    }
  };

  const handleRemoveCrew = (index: number) => {
    const updatedCrew = crew.filter((_, i) => i !== index);
    onCrewChange(updatedCrew);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCrew();
    }
  };

  const canAdd = newCrew.position && newCrew.name.trim() && !disabled;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Existing crew members */}
      {crew.map((member, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="">
            <InputEnhanced
              placeholder="Select position"
              value={member.position}
              select
              options={crewOptions}
              disabled
            />
          </div>
          <div className="flex-1">
            <InputEnhanced placeholder="Name" value={member.name} disabled />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => handleRemoveCrew(index)}
            disabled={disabled}
            className="text-destructive hover:text-destructive/80"
          >
            <X size={16} />
          </Button>
        </div>
      ))}

      {/* Add new crew member */}
      <div className="flex items-center gap-3">
        <div>
          <InputEnhanced
            placeholder="Select position"
            value={newCrew.position}
            onSelectChange={(value) =>
              setNewCrew((prev) => ({ ...prev, position: value }))
            }
            select
            options={crewOptions}
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <InputEnhanced
            placeholder="Enter name"
            value={newCrew.name}
            onChange={(e) =>
              setNewCrew((prev) => ({ ...prev, name: e.target.value }))
            }
            onKeyPress={handleKeyPress}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleAddCrew}
          disabled={!canAdd}
          className="text-accent hover:text-accent/80"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        {crew.length > 0
          ? `${crew.length} crew member${crew.length !== 1 ? "s" : ""} added`
          : "Add crew members by selecting position and entering name"}
      </p>
    </div>
  );
};

export default CrewInput;
