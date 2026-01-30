"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPresignedUrl } from "@/lib/api";
import { useDla } from "@/contexts/dla";
import { useUpload } from "@/contexts/upload";
import { ICompany } from "@/types";
import { BoxWidget } from "./box.widget";
import { Loader } from "../ui/loader";
import InputEnhanced from "../ui/input-enhanced";
import { Button } from "../ui/button";
import { InputFile } from "../ui/input-file.component";
import { toast } from "react-toastify";
import { useUser } from "@/hooks/useUser";
import { getErrorMessage } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import Image from "next/image";

const getFlagUrl = (countryCode: string) => {
  const code = countryCode.toLowerCase();
  return `https://flagcdn.com/w20/${code}.png`;
};

// Stripe-supported countries
const STRIPE_COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "CA", name: "Canada" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong SAR China" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "LV", name: "Latvia" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

export function CreateCompanyWidget() {
  const { CompanyService } = useDla();
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState<string>("");
  const [logo, setLogo] = useState<File>();
  const router = useRouter();
  const { refetch } = useUser();

  function submit() {
    if (name.length < 3 || website.length < 3 || !country) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    console.log({
      name,
      website,
      country,
      logo,
    });

    CompanyService.create({ name, website, country })
      .then(async (data: ICompany) => {
        await refetch();
        await uploadCompanyLogo(data);
        router.push("/auth/signup/stripe", { scroll: false });
      })
      .catch((error: Error) => {
        setLoading(false);
        toast.error(getErrorMessage(error));
      });
  }

  async function uploadCompanyLogo(data: ICompany) {
    if (logo) {
      const res = await getPresignedUrl({
        filename: logo.name,
        type: logo.type,
      });
      console.log(res);
      if (res.uploadUrl) {
        // upload image to presign url res.data.uploadUrl
        const uploadRes = await fetch(res.uploadUrl, {
          method: "PUT",
          body: logo,
          headers: {
            "Content-Type": logo.type,
          },
        });

        if (uploadRes.ok) {
          await CompanyService.update({
            ...data,
            logo: res.fileUrl,
          });
        }
      }
    }
  }

  useEffect(() => {
    if (name.length > 3 && website.length > 3 && country) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [name, website, country]);

  return (
    <>
      <BoxWidget title="Create your Company">
        {loading && <Loader />}
        <InputFile
          id="company-img"
          border={false}
          accept="image/*, image/gif, image/jpeg"
          onChange={(file: File) => {
            console.log("file", file);
            setLogo(file);
          }}
          remove={() => setLogo(undefined)}
        />
        <div className="p-2" />
        <InputEnhanced
          name="company"
          label="Company Name *"
          placeholder="Your company name"
          onChange={(e) => setName(e.target.value)}
        />
        <div className="p-2" />
        <InputEnhanced
          name="website"
          label="Company Website *"
          placeholder="yourcompanydomain.com"
          onChange={(e) => setWebsite(e.target.value)}
        />
        <div className="p-2" />
        <div className="space-y-2 w-full">
          <Label htmlFor="country">Country *</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country" className="w-full">
              {country ? (
                <div className="flex items-center gap-2">
                  <Image
                    src={getFlagUrl(country)}
                    alt=""
                    width={20}
                    height={15}
                    className=" object-cover shrink-0"
                    unoptimized
                  />
                  <span className="truncate">
                    {STRIPE_COUNTRIES.find((c) => c.code === country)?.name}
                  </span>
                </div>
              ) : (
                <SelectValue placeholder="Select a country" />
              )}
            </SelectTrigger>
            <SelectContent>
              {STRIPE_COUNTRIES.map((countryOption) => (
                <SelectItem key={countryOption.code} value={countryOption.code}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={getFlagUrl(countryOption.code)}
                      alt=""
                      width={20}
                      height={15}
                      className=" object-cover shrink-0"
                      unoptimized
                    />
                    <span>{countryOption.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="p-2" />
        <Button disabled={disabled} className="w-full" onClick={submit}>
          Continue
        </Button>
      </BoxWidget>
    </>
  );
}
