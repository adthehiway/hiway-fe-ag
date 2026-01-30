import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { countries as countriesRaw } from "countries-list";
import React from "react";
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

// value: string[] (country codes)
// onChange: (codes: string[]) => void
const CountriesSelect = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) => {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const valueSet = React.useMemo(() => new Set(value), [value]);
  const totalSelected = value.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>GEOGRAPHIC AVAILABILITY</CardTitle>
        <CardDescription>
          Choose regions and countries with access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {/* Select All Countries Option */}
          <div className="border rounded-lg px-4 py-2 bg-muted/20">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={totalSelected === Object.keys(countries).length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    // Select all countries
                    const allCountryCodes = Object.keys(countries);
                    onChange(allCountryCodes);
                  } else {
                    // Deselect all countries
                    onChange([]);
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
            return (
              <div key={group.code} className="border  rounded-lg px-4 py-2 ">
                <div
                  className="flex items-center gap-2 cursor-pointer justify-between"
                  onClick={() =>
                    setExpanded((e) => ({ ...e, [group.code]: !e[group.code] }))
                  }
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCount > 0}
                      onCheckedChange={(checked) => {
                        let newValue: string[];
                        if (checked) {
                          // Add all countries in group
                          newValue = Array.from(
                            new Set([
                              ...value,
                              ...countriesInGroup.map((c) => c.code),
                            ])
                          );
                        } else {
                          // Remove all countries in group
                          newValue = value.filter(
                            (code) =>
                              !countriesInGroup.some((c) => c.code === code)
                          );
                        }
                        onChange(newValue);
                      }}
                      className="accent-accent"
                    />
                    <span className="font-medium text-white">
                      {group.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {selectedCount}/{countriesInGroup.length}
                  </span>
                </div>
                {expanded[group.code] && (
                  <div className="flex flex-wrap gap-4 mt-2 pl-6">
                    {countriesInGroup.map((country) => (
                      <label
                        key={country.code}
                        className="flex items-center gap-2 min-w-[160px]"
                      >
                        <Checkbox
                          checked={valueSet.has(country.code)}
                          onCheckedChange={(checked) => {
                            let newValue: string[];
                            if (checked) {
                              newValue = Array.from(
                                new Set([...value, country.code])
                              );
                            } else {
                              newValue = value.filter(
                                (code) => code !== country.code
                              );
                            }
                            onChange(newValue);
                          }}
                          className="accent-accent"
                        />
                        <span className="text-white text-sm">
                          {country.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-sm mt-4">
          <span>Total Coverage:</span>
          <span className="text-accent">{totalSelected} countries</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountriesSelect;
