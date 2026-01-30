import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { IRegionalPricing } from "@/types";
import { CONTINENTS } from "@/config/dashboard/smartlink";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Button } from "@/components/ui/button";
import { currencyOptions } from "@/config";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { countries as countriesRaw } from "countries-list";

const countries: Record<string, any> = countriesRaw as any;

const CONTINENT_COUNTRY_GROUPS = [
  { code: "NA", label: "North America", countries: ["US", "CA", "MX"] },
  { code: "UK", label: "UK & Ireland", countries: ["GB", "IE"] },
  {
    code: "WE",
    label: "Western Europe",
    countries: [
      "FR",
      "DE",
      "AT",
      "BE",
      "CH",
      "LI",
      "LU",
      "MC",
      "NL",
      "AD",
      "SM",
    ],
  },
  {
    code: "SN",
    label: "Scandinavia & Nordic",
    countries: ["DK", "FI", "IS", "NO", "SE"],
  },
  {
    code: "EE",
    label: "Eastern Europe",
    countries: [
      "BG",
      "BY",
      "CZ",
      "EE",
      "HU",
      "LT",
      "LV",
      "MD",
      "PL",
      "RO",
      "RU",
      "SK",
      "UA",
      "AL",
      "BA",
      "HR",
      "ME",
    ],
  },
  {
    code: "MENA",
    label: "MENA (Middle East & North Africa)",
    countries: [
      "DZ",
      "EG",
      "IR",
      "IQ",
      "IL",
      "JO",
      "KW",
      "LB",
      "LY",
      "MA",
      "OM",
      "PS",
      "QA",
      "SA",
      "SY",
      "TN",
      "TR",
      "AE",
      "YE",
    ],
  },
  {
    code: "SSA",
    label: "Sub-Saharan Africa",
    countries: [
      "AO",
      "BJ",
      "BW",
      "BF",
      "BI",
      "CM",
      "CV",
      "CF",
      "TD",
      "KM",
      "CG",
      "CD",
      "DJ",
      "GQ",
      "ER",
      "SZ",
      "ET",
      "GA",
      "GM",
      "GH",
      "GN",
      "GW",
      "CI",
      "KE",
      "LS",
      "LR",
      "MG",
      "MW",
      "ML",
      "MR",
      "MU",
      "YT",
      "MZ",
      "NA",
      "NE",
      "NG",
      "RE",
      "RW",
      "ST",
      "SN",
      "SC",
      "SL",
      "SO",
      "ZA",
      "SS",
      "SD",
      "TZ",
      "TG",
      "UG",
      "ZM",
      "ZW",
    ],
  },
  {
    code: "AS",
    label: "Asia Pacific",
    countries: [
      "AU",
      "NZ",
      "FJ",
      "PG",
      "SB",
      "VU",
      "NC",
      "PF",
      "WS",
      "TO",
      "TV",
      "KI",
      "NR",
      "MH",
      "FM",
      "PW",
    ],
  },
  {
    code: "SA",
    label: "South Asia",
    countries: ["AF", "BD", "BT", "IN", "MV", "NP", "PK", "LK"],
  },
  {
    code: "LA",
    label: "Latin America",
    countries: [
      "AR",
      "BO",
      "BR",
      "CL",
      "CO",
      "EC",
      "GF",
      "GY",
      "PY",
      "PE",
      "SR",
      "UY",
      "VE",
    ],
  },
  {
    code: "CA",
    label: "Caribbean & Central America",
    countries: [
      "AG",
      "BS",
      "BB",
      "BZ",
      "CR",
      "CU",
      "DM",
      "DO",
      "SV",
      "GD",
      "GT",
      "HT",
      "HN",
      "JM",
      "KN",
      "LC",
      "MS",
      "NI",
      "PA",
      "PR",
      "BL",
      "VC",
      "SX",
      "TT",
      "TC",
      "VG",
      "VI",
    ],
  },
  {
    code: "RU",
    label: "Russia & CIS",
    countries: [
      "RU",
      "AM",
      "AZ",
      "BY",
      "GE",
      "KZ",
      "KG",
      "MD",
      "TJ",
      "TM",
      "UA",
      "UZ",
    ],
  },
  {
    code: "CN",
    label: "China & Greater China",
    countries: ["CN", "HK", "MO", "TW"],
  },
];

interface GeographicPricingProps {
  allowedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  regionalPricing?: IRegionalPricing[];
  onRegionalPricingChange: (pricing: IRegionalPricing[]) => void;
  defaultCurrency?: string;
  defaultPrice: number;
  setDefaultCurrency: (val: string) => void;
  setDefaultPrice: (val: number) => void;
  defaultRentalPrice?: number;
  setDefaultRentalPrice?: (val: number) => void;
  errors?: { [key: string]: string };
  regionalPriceErrors?: { [key: string]: { [key: string]: string } };
  isRecurring?: boolean;
  onRecurringChange?: (val: boolean) => void;
  subscriptionInterval?: "month" | "year";
  onSubscriptionIntervalChange?: (val: "month" | "year") => void;
}

const GeographicPricing: React.FC<GeographicPricingProps> = ({
  allowedCountries,
  onCountriesChange,
  regionalPricing = [],
  onRegionalPricingChange,
  defaultCurrency,
  defaultPrice,
  setDefaultCurrency,
  setDefaultPrice,
  defaultRentalPrice,
  setDefaultRentalPrice,
  errors,
  regionalPriceErrors,
  isRecurring = false,
  onRecurringChange,
  subscriptionInterval = "month",
  onSubscriptionIntervalChange,
}) => {
  const [regional, setRegional] = useState<IRegionalPricing[]>(
    regionalPricing || []
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const valueSet = React.useMemo(
    () => new Set(allowedCountries),
    [allowedCountries]
  );
  const totalSelected = allowedCountries.length;

  const handleRegionalChange = (
    idx: number,
    key: string,
    val: string | number
  ) => {
    setRegional((prev) => {
      const updated = prev.map((r, i) =>
        i === idx ? { ...r, [key]: val } : r
      );
      onRegionalPricingChange(updated);
      return updated;
    });
  };

  const handleRemove = (idx: number) => {
    setRegional((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      onRegionalPricingChange(updated);
      return updated;
    });
  };

  const handleAdd = (region: { code: string }) => {
    setRegional((prev) => {
      if (!prev.some((r) => r.continent === region.code)) {
        const updated = [
          ...prev,
          {
            continent: region.code,
            currency: currencyOptions[0].value,
            price: undefined,
            rentalPrice: undefined,
          },
        ];
        onRegionalPricingChange(updated);
        return updated;
      }
      return prev;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Availability & Pricing</CardTitle>
        <CardDescription>
          Choose countries and set pricing for each market
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recurring Payments Toggle */}
        {onRecurringChange && (
          <div className="border rounded-lg p-4 bg-secondary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={isRecurring}
                  onCheckedChange={onRecurringChange}
                />
                <Label className="text-sm font-medium">Recurring Payments</Label>
              </div>
              {isRecurring && onSubscriptionIntervalChange && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">
                    Billing Interval:
                  </Label>
                  <Select
                    value={subscriptionInterval}
                    onValueChange={(val: "month" | "year") =>
                      onSubscriptionIntervalChange(val)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Default Pricing Section */}
        <div>
          <div className="font-semibold mb-2">Default Pricing</div>
          <div className="text-muted-foreground text-sm mb-3">
            {isRecurring
              ? "This subscription price applies to all countries unless overridden below"
              : "This pricing applies to all countries unless overridden below"}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2 items-start">
              <div className="w-32">
                <label className="text-sm text-muted-foreground mb-1 block">
                  Currency
                </label>
                <InputEnhanced
                  value={defaultCurrency || undefined}
                  onSelectChange={(value) => setDefaultCurrency(value)}
                  select
                  options={currencyOptions}
                  placeholder="Currency"
                  error={errors?.currency}
                />
              </div>
              {isRecurring ? (
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Subscription Price
                  </label>
                  <InputEnhanced
                    type="number"
                    className="w-full"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    placeholder="9.99"
                    error={errors?.price}
                  />
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Rental Price
                    </label>
                    <InputEnhanced
                      type="number"
                      className="w-full"
                      value={defaultRentalPrice || ""}
                      onChange={(e) =>
                        setDefaultRentalPrice?.(Number(e.target.value))
                      }
                      placeholder="3.99"
                      error={errors?.rentalPrice}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Purchase Price
                    </label>
                    <InputEnhanced
                      type="number"
                      className="w-full"
                      value={defaultPrice}
                      onChange={(e) => setDefaultPrice(Number(e.target.value))}
                      placeholder="9.99"
                      error={errors?.price}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Available Countries Section */}
        <div>
          <div className="font-semibold mb-2">Available Countries</div>
          <div className="text-muted-foreground text-sm mb-3">
            Select countries and customize pricing per market
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {/* Select All Countries Option */}
            <div className="border rounded-lg px-4 py-2 bg-muted/20">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={totalSelected === Object.keys(countries).length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Select all countries
                      const allCountryCodes = Object.keys(countries);
                      onCountriesChange(allCountryCodes);
                    } else {
                      // Deselect all countries
                      onCountriesChange([]);
                    }
                  }}
                  className="accent-accent"
                />
                <span className="font-medium text-white">
                  Select All Countries
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {totalSelected}/{Object.keys(countries).length}
                </span>
              </div>
            </div>

            {CONTINENT_COUNTRY_GROUPS.map((group) => {
              const countriesInGroup = group.countries.map((code) => ({
                code,
                ...(countries[code] as any),
              }));
              const selectedCount = countriesInGroup.filter((c) =>
                valueSet.has(c.code)
              ).length;
              const isExpanded = expandedGroups[group.code];
              const hasCustomPricing = regional.some(
                (r) => r.continent === group.code
              );

              return (
                <div
                  key={group.code}
                  className={`border rounded-lg ${
                    hasCustomPricing ? "border-accent" : ""
                  }`}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted/20"
                    onClick={() =>
                      setExpandedGroups((e) => ({
                        ...e,
                        [group.code]: !e[group.code],
                      }))
                    }
                  >
                    <Checkbox
                      checked={selectedCount > 0}
                      onCheckedChange={(checked) => {
                        let newValue: string[];
                        if (checked) {
                          newValue = Array.from(
                            new Set([
                              ...allowedCountries,
                              ...countriesInGroup.map((c) => c.code),
                            ])
                          );
                        } else {
                          newValue = allowedCountries.filter(
                            (code) =>
                              !countriesInGroup.some((c) => c.code === code)
                          );
                        }
                        onCountriesChange(newValue);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-accent"
                    />
                    <span className="font-medium text-white flex-1">
                      {group.label}
                    </span>
                    <span className="text-xs text-muted-foreground mr-2">
                      {selectedCount}/{countriesInGroup.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-3">
                      {/* Custom Pricing for this region */}
                      {selectedCount > 0 && (
                        <div className="pt-2 border-t">
                          {regional.find((r) => r.continent === group.code) ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">
                                  Custom Pricing for {group.label}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemove(
                                      regional.findIndex(
                                        (r) => r.continent === group.code
                                      )
                                    )
                                  }
                                  className="h-6 text-xs"
                                >
                                  Remove
                                </Button>
                              </div>
                              {regional.map((r, idx) => {
                                if (r.continent === group.code) {
                                  return (
                                    <div
                                      key={r.continent}
                                      className="flex gap-2 items-start"
                                    >
                                      <div className="w-24">
                                        <label className="text-xs text-muted-foreground mb-1 block">
                                          Currency
                                        </label>
                                        <InputEnhanced
                                          select
                                          value={r.currency}
                                          className="w-full"
                                          onSelectChange={(val) =>
                                            handleRegionalChange(
                                              idx,
                                              "currency",
                                              val
                                            )
                                          }
                                          placeholder="Currency"
                                          error={
                                            regionalPriceErrors?.[r.continent]
                                              ?.currency
                                          }
                                          options={currencyOptions}
                                        />
                                      </div>
                                      {isRecurring ? (
                                        <div className="flex-1">
                                          <label className="text-xs text-muted-foreground mb-1 block">
                                            Subscription Price
                                          </label>
                                          <InputEnhanced
                                            type="number"
                                            className="w-full"
                                            value={r.price}
                                            onChange={(e) =>
                                              handleRegionalChange(
                                                idx,
                                                "price",
                                                Number(e.target.value)
                                              )
                                            }
                                            placeholder="9.99"
                                            error={
                                              regionalPriceErrors?.[r.continent]
                                                ?.price
                                            }
                                          />
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex-1">
                                            <label className="text-xs text-muted-foreground mb-1 block">
                                              Rental
                                            </label>
                                            <InputEnhanced
                                              type="number"
                                              className="w-full"
                                              value={r.rentalPrice}
                                              onChange={(e) =>
                                                handleRegionalChange(
                                                  idx,
                                                  "rentalPrice",
                                                  Number(e.target.value)
                                                )
                                              }
                                              placeholder="3.99"
                                              error={
                                                regionalPriceErrors?.[r.continent]
                                                  ?.rentalPrice
                                              }
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <label className="text-xs text-muted-foreground mb-1 block">
                                              Purchase
                                            </label>
                                            <InputEnhanced
                                              type="number"
                                              className="w-full"
                                              value={r.price}
                                              onChange={(e) =>
                                                handleRegionalChange(
                                                  idx,
                                                  "price",
                                                  Number(e.target.value)
                                                )
                                              }
                                              placeholder="9.99"
                                              error={
                                                regionalPriceErrors?.[r.continent]
                                                  ?.price
                                              }
                                            />
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdd(group)}
                              className="w-full text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Custom Pricing
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Country checkboxes */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {countriesInGroup.map((country) => (
                          <label
                            key={country.code}
                            className="flex items-center gap-2 min-w-[140px]"
                          >
                            <Checkbox
                              checked={valueSet.has(country.code)}
                              onCheckedChange={(checked) => {
                                let newValue: string[];
                                if (checked) {
                                  newValue = Array.from(
                                    new Set([...allowedCountries, country.code])
                                  );
                                } else {
                                  newValue = allowedCountries.filter(
                                    (code) => code !== country.code
                                  );
                                }
                                onCountriesChange(newValue);
                              }}
                              className="accent-accent"
                            />
                            <span className="text-white text-sm">
                              {country.code} {country.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <span className="text-muted-foreground">
            Total Selected Countries:
          </span>
          <span className="text-accent font-semibold">
            {totalSelected} countries
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicPricing;
