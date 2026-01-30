import React, { useState, useRef, KeyboardEvent } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import { Badge } from "./badge";
import { X } from "lucide-react";

interface InputEnhancedProps extends React.ComponentProps<"input"> {
  label?: string;
  placeholder?: string;
  onChange?: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  error?: string;
  textarea?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  select?: boolean;
  options?: { label: string; value: string | string[] }[];
  onSelectChange?: (value: string) => void;
  chip?: boolean;
  chips?: string[];
  onChipsChange?: (chips: string[]) => void;
  chipValidation?: (chip: string) => boolean;
}

const InputEnhanced = ({
  label,
  placeholder,
  onChange,
  error,
  textarea,
  iconLeft,
  iconRight,
  select,
  options,
  onSelectChange,
  chip,
  chips = [],
  chipValidation,
  onChipsChange,

  ...props
}: InputEnhancedProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [chipError, setChipError] = useState<string | null>(null);
  const handleChipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChipError(null);
    const value = e.target.value;

    if (value.includes(",")) {
      const parts = value
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part);
      const remainingPart = parts.pop() || "";

      const newChipsToAdd = parts.filter(
        (part) => part && !chips.includes(part)
      );

      if (chipValidation) {
        const invalidChip = newChipsToAdd.find((part) => !chipValidation(part));
        if (invalidChip) {
          setChipError("Invalid email");
          setInputValue(value);
          return;
        }
      }

      if (newChipsToAdd.length > 0) {
        setChipError(null);
        const newChips = [...chips, ...newChipsToAdd];
        onChipsChange?.(newChips);
      }

      setInputValue(remainingPart);
    } else {
      setInputValue(value);
    }
  };

  const handleChipKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      const currentValue = inputValue.trim();

      if (currentValue) {
        const newChip = currentValue;

        if (chipValidation && !chipValidation(newChip)) {
          setChipError("Invalid email");
          return;
        }
        if (!chips.includes(newChip)) {
          setChipError(null);
          const newChips = [...chips, newChip];
          onChipsChange?.(newChips);
        }
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && chips.length > 0) {
      e.preventDefault();
      const newChips = chips.slice(0, -1);
      onChipsChange?.(newChips);
    }
  };

  const removeChip = (chipToRemove: string) => {
    const newChips = chips.filter((chip) => chip !== chipToRemove);
    onChipsChange?.(newChips);
    // Focus back to input after removing chip
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleChipInputFocus = () => {
    // Ensure input is focused and cursor is at the end
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 0);
  };

  const filteredChips = chips.filter((chip) => chip !== "");

  return (
    <div className="flex flex-col gap-2 w-full ">
      {label && <Label htmlFor={label}>{label}</Label>}
      {select ? (
        <Select
          value={props.value as string}
          onValueChange={onSelectChange}
          disabled={props.disabled}
        >
          <SelectTrigger id={label} className="capitalize min-w-32">
            <SelectValue
              placeholder={placeholder || "Select an option"}
              className="capitalize"
            />
          </SelectTrigger>
          <SelectContent className={cn(props.className)}>
            {options?.map((option) => (
              <SelectItem
                key={option.value as string}
                value={option.value as string}
                className="capitalize"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : textarea ? (
        <Textarea
          id={label}
          placeholder={placeholder}
          onChange={onChange}
          {...(props as React.ComponentProps<"textarea">)}
        />
      ) : chip ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 min-h-10 px-3 border border-input  rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            chipError && "border-destructive",
            props.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleChipInputFocus}
        >
          {filteredChips.map((chipValue, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-sm cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(chipValue);
              }}
            >
              {chipValue}
              <button type="button" className="ml-1  rounded-full p-0.5 ">
                <X size={12} />
              </button>
            </Badge>
          ))}
          <Input
            ref={inputRef}
            id={label}
            placeholder={filteredChips.length === 0 ? placeholder : ""}
            value={inputValue}
            onChange={handleChipInputChange}
            onKeyDown={handleChipKeyDown}
            className="flex-1 min-w-0 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            disabled={props.disabled}
            {...props}
          />
        </div>
      ) : (
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              {iconLeft}
            </div>
          )}
          <Input
            id={label}
            placeholder={placeholder}
            onChange={onChange}
            {...props}
            className={cn(
              props.className,
              iconLeft && "pl-8",
              iconRight && "pr-8"
            )}
          />
          {iconRight && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              {iconRight}
            </div>
          )}
        </div>
      )}
      {(props.maxLength || chip || error) && (
        <div className="flex justify-between items-center">
          {props.maxLength && !chip && (
            <p className="text-[10px] text-muted-foreground">
              {props.maxLength - (props.value as string)?.length} characters
              remaining
            </p>
          )}
          {chip && (
            <p className="text-[10px] text-muted-foreground">
              {filteredChips.length > 0
                ? `${filteredChips.length} item${
                    filteredChips.length !== 1 ? "s" : ""
                  } added`
                : "Press Enter to add items, Backspace to remove"}
            </p>
          )}
          {error && <p className="text-[10px] text-destructive">{error}</p>}
          {chipError && (
            <p className="text-[10px] text-destructive">{chipError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InputEnhanced;
