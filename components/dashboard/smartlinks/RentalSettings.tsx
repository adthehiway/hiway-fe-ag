import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSmartLinks";
import { ISmartLink } from "@/types";

interface RentalSettingsProps {
  smartLink: Partial<ISmartLink>;
  onChange: (updates: Partial<ISmartLink>) => void;
  errors?: { [key: string]: string };
}

const RENTAL_PERIOD_OPTIONS = [1, 3, 7, 14, 30, 90];

const RENTAL_MAX_VIEWS_OPTIONS = ["unlimited", 1, 3, 5, 10, 25, 50];

const RENTAL_VIEWING_WINDOW_OPTIONS = [1, 6, 12, 24, 48, 72, 168];

const RentalSettings: React.FC<RentalSettingsProps> = ({
  smartLink,
  onChange,
  errors = {},
}) => {
  const { data: globalSettings } = useSettings();

  // Use the globalSettingsOverride field from the database
  const overrideEnabled = smartLink.globalSettingsOverride || false;

  const handleOverrideToggle = (enabled: boolean) => {
    // Update the override flag
    onChange({
      globalSettingsOverride: enabled,
    });

    if (!enabled && globalSettings) {
      // When disabling override, set rental fields to global settings
      onChange({
        globalSettingsOverride: false,
        rentalPeriodDays: globalSettings.defaultRentalPeriodDays,
        rentalMaxViews: globalSettings.defaultRentalMaxViews ?? undefined,
        rentalViewingWindowHours:
          globalSettings.defaultRentalViewingWindowHours,
      });
    } else if (enabled && globalSettings) {
      // When enabling override, initialize with current values or global defaults
      onChange({
        globalSettingsOverride: true,
        rentalPeriodDays:
          smartLink.rentalPeriodDays || globalSettings.defaultRentalPeriodDays,
        rentalMaxViews:
          smartLink.rentalMaxViews ??
          globalSettings.defaultRentalMaxViews ??
          undefined,
        rentalViewingWindowHours:
          smartLink.rentalViewingWindowHours ||
          globalSettings.defaultRentalViewingWindowHours,
      });
    }
  };

  // Get current values for display (use global settings when override is disabled)
  const getCurrentValues = () => {
    if (!overrideEnabled && globalSettings) {
      return {
        rentalPeriodDays: globalSettings.defaultRentalPeriodDays,
        rentalMaxViews: globalSettings.defaultRentalMaxViews,
        rentalViewingWindowHours:
          globalSettings.defaultRentalViewingWindowHours,
      };
    }
    return {
      rentalPeriodDays: smartLink.rentalPeriodDays,
      rentalMaxViews: smartLink.rentalMaxViews,
      rentalViewingWindowHours: smartLink.rentalViewingWindowHours,
    };
  };

  const currentValues = getCurrentValues();

  const formatRentalPeriod = (days: number) => {
    if (days === 1) return "1 Day";
    return `${days} Days`;
  };

  const formatMaxViews = (views: number | null | undefined | "unlimited") => {
    if (views === null || views === undefined || views === "unlimited")
      return "Unlimited";
    if (views === 1) return "1 View";
    return `${views} Views`;
  };

  const formatViewingWindow = (hours: number) => {
    if (hours === 1) return "1 Hour";
    if (hours < 24) return `${hours} Hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days} Day${days > 1 ? "s" : ""}`;
    return `${days} Day${days > 1 ? "s" : ""} ${remainingHours} Hour${
      remainingHours > 1 ? "s" : ""
    }`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental Settings</CardTitle>
        <p className="text-muted-foreground text-sm">
          Global rental settings from monetisation tab
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!overrideEnabled && (
          <>
            {/* Global Settings Display */}
            <div className="bg-muted/40 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">
                Global Settings (from Monetisation)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Period:</span>
                  <span className="text-white">
                    {formatRentalPeriod(currentValues.rentalPeriodDays || 7)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maximum Views:</span>
                  <span className="text-white">
                    {formatMaxViews(currentValues.rentalMaxViews)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Viewing Window:</span>
                  <span className="text-white">
                    {formatViewingWindow(
                      currentValues.rentalViewingWindowHours || 48
                    )}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Override Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">
                Override for this SmartLink
              </h4>
              <p className="text-muted-foreground text-sm">
                Customize rental terms for this specific link
              </p>
            </div>
            <Switch
              checked={overrideEnabled}
              onCheckedChange={handleOverrideToggle}
            />
          </div>

          {/* Override Settings */}
          {overrideEnabled && (
            <div className="bg-muted/20 rounded-lg p-4 border border-muted">
              <h5 className="font-semibold text-accent mb-4">
                SmartLink Override Settings
              </h5>

              <div className="space-y-4">
                {/* Rental Period */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Rental Period
                  </label>
                  <Select
                    value={currentValues.rentalPeriodDays?.toString() || "7"}
                    onValueChange={(value) =>
                      onChange({ rentalPeriodDays: parseInt(value) })
                    }
                    disabled={!overrideEnabled}
                  >
                    <SelectTrigger className="w-full bg-muted border-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RENTAL_PERIOD_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {formatRentalPeriod(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rentalPeriodDays && (
                    <p className="text-destructive text-xs">
                      {errors.rentalPeriodDays}
                    </p>
                  )}
                </div>

                {/* Maximum Views */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Maximum Views
                  </label>
                  <Select
                    value={
                      currentValues.rentalMaxViews?.toString() || "unlimited"
                    }
                    onValueChange={(value) =>
                      onChange({
                        rentalMaxViews:
                          value === "unlimited" ? undefined : parseInt(value),
                      })
                    }
                    disabled={!overrideEnabled}
                  >
                    <SelectTrigger className="w-full bg-muted border-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RENTAL_MAX_VIEWS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option?.toString()}>
                          {formatMaxViews(option as number | "unlimited")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rentalMaxViews && (
                    <p className="text-destructive text-xs">
                      {errors.rentalMaxViews}
                    </p>
                  )}
                </div>

                {/* Viewing Window */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Viewing Window
                  </label>
                  <Select
                    value={
                      currentValues.rentalViewingWindowHours?.toString() || "48"
                    }
                    onValueChange={(value) =>
                      onChange({ rentalViewingWindowHours: parseInt(value) })
                    }
                    disabled={!overrideEnabled}
                  >
                    <SelectTrigger className="w-full bg-muted border-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RENTAL_VIEWING_WINDOW_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {formatViewingWindow(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rentalViewingWindowHours && (
                    <p className="text-destructive text-xs">
                      {errors.rentalViewingWindowHours}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalSettings;
