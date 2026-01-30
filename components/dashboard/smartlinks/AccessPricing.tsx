import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
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

const AccessPricing = ({
  value,
  onChange,
  defaultCurrency,
  defaultPrice,
  setDefaultCurrency,
  setDefaultPrice,
  defaultRentalPrice,
  setDefaultRentalPrice,
  errors,
  regionalPriceErrors,
}: {
  value?: IRegionalPricing[];
  onChange: (val: IRegionalPricing[]) => void;
  defaultCurrency?: string;
  defaultPrice: number;
  setDefaultCurrency: (val: string) => void;
  setDefaultPrice: (val: number) => void;
  defaultRentalPrice?: number;
  setDefaultRentalPrice?: (val: number) => void;
  errors?: { [key: string]: string };
  regionalPriceErrors?: { [key: string]: { [key: string]: string } };
}) => {
  const [regional, setRegional] = useState<IRegionalPricing[]>(value || []);

  const handleRegionalChange = (
    idx: number,
    key: string,
    val: string | number
  ) => {
    setRegional((prev) => {
      const updated = prev.map((r, i) =>
        i === idx ? { ...r, [key]: val } : r
      );
      onChange(updated);
      return updated;
    });
  };
  const handleRemove = (idx: number) => {
    setRegional((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      onChange(updated);
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
        onChange(updated);
        return updated;
      }
      return prev;
    });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Access</CardTitle>
        <CardDescription>
          Set different prices for specific regions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="font-semibold mb-1">Default Pricing</div>
        <div className="flex gap-2 mb-6 items-start">
          <div className="w-36">
            <InputEnhanced
              value={defaultCurrency || undefined}
              onSelectChange={(value) => setDefaultCurrency(value)}
              select
              options={currencyOptions}
              placeholder="Select currency"
              error={errors?.currency}
            />
          </div>
          <div className="flex-1">
            <InputEnhanced
              type="number"
              className="w-full"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(Number(e.target.value))}
              placeholder="Purchase Price"
              error={errors?.price}
            />
          </div>
          {setDefaultRentalPrice && (
            <div className="flex-1">
              <InputEnhanced
                type="number"
                className="w-full"
                value={defaultRentalPrice || ""}
                onChange={(e) => setDefaultRentalPrice(Number(e.target.value))}
                placeholder="Rental Price"
                error={errors?.rentalPrice}
              />
            </div>
          )}
        </div>
        <div className="font-semibold  mb-1">Regional Pricing</div>
        <div className="text-muted-foreground text-sm mb-4">
          Set different prices for specific regions
        </div>
        {regional.map((r, idx) => {
          const regionObj = CONTINENTS.find((reg) => reg.code === r.continent);
          return (
            <div
              key={r.continent}
              className="flex gap-2 mb-2 items-start flex-col sm:flex-row"
            >
              <div
                className="flex-1 w-full min-w-[180px] bg-muted text-white rounded px-3 py-2 border flex
              items-center gap-2 font-medium"
              >
                {regionObj?.label || r.continent}
              </div>
              <div className="flex gap-2 items-start max-sm:w-full">
                <div className="w-24 sm:w-auto">
                  <InputEnhanced
                    select
                    value={r.currency}
                    className="w-full sm:w-24"
                    onSelectChange={(val) =>
                      handleRegionalChange(idx, "currency", val)
                    }
                    placeholder="Select currency"
                    error={regionalPriceErrors?.[r.continent]?.currency}
                    options={currencyOptions}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <InputEnhanced
                    type="number"
                    className="w-full sm:w-24"
                    value={r.price}
                    onChange={(e) =>
                      handleRegionalChange(idx, "price", Number(e.target.value))
                    }
                    placeholder="Purchase"
                    error={regionalPriceErrors?.[r.continent]?.price}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <InputEnhanced
                    type="number"
                    className="w-full sm:w-24"
                    value={r.rentalPrice}
                    onChange={(e) =>
                      handleRegionalChange(
                        idx,
                        "rentalPrice",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Rental"
                    error={regionalPriceErrors?.[r.continent]?.rentalPrice}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleRemove(idx)}
                  type="button"
                  className="shrink-0"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          );
        })}
        <div className="flex flex-col gap-2 mt-2 ">
          {CONTINENTS.filter(
            (reg) => !regional.some((r) => r.continent === reg.code)
          ).map((region) => (
            <button
              key={region.code}
              className="flex-1 min-w-[180px] bg-muted text-white rounded px-3 py-2 border  hover:bg-muted/80
              cursor-pointer flex items-center justify-center gap-2 font-medium"
              onClick={() => handleAdd(region)}
              type="button"
            >
              <Plus size={16} />
              <span className="text-sm">{region.label}</span>
            </button>
          ))}
        </div>
        <div className="text-muted-foreground text-sm mt-4">
          Regional pricing overrides default pricing for specific territories
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessPricing;
