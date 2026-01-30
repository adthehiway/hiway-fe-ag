"use client";

import { CompanyService } from "@/services/company";
import { ContentFabricService } from "@/services/content-fabric";
import { MediaService } from "@/services/media";
import { ObjectService } from "@/services/object";
import { PackageService } from "@/services/packages";
import { SmartLinkService } from "@/services/smartlinks";
import { WatchService } from "@/services/watch";
import { createContext, ReactNode, useContext, useState } from "react";

type DlaProviderProps = {
  children: ReactNode;
};

type DlaContext = {
  MediaService: MediaService;
  ContentFabricService: ContentFabricService;
  ObjectService: ObjectService;
  CompanyService: CompanyService;
  SmartLinkService: SmartLinkService;
  WatchService: WatchService;
  PackageService: PackageService;
};

export function DlaProvider({ children }: DlaProviderProps) {
  const [media, setMedia] = useState<MediaService>(new MediaService());
  const [contentFabric, setContentFabric] = useState<ContentFabricService>(
    new ContentFabricService()
  );
  const [object, setObject] = useState<ObjectService>(new ObjectService());
  const [company, setCompany] = useState<CompanyService>(new CompanyService());
  const [smartLink, setSmartLink] = useState<SmartLinkService>(
    new SmartLinkService()
  );
  const [watch, setWatch] = useState<WatchService>(new WatchService());
  const [packageService, setPackageService] = useState<PackageService>(
    new PackageService()
  );
  return (
    <DlaContext.Provider
      value={{
        MediaService: media,
        ContentFabricService: contentFabric,
        ObjectService: object,
        CompanyService: company,
        SmartLinkService: smartLink,
        WatchService: watch,
        PackageService: packageService,
      }}
    >
      {children}
    </DlaContext.Provider>
  );
}

export const DlaContext = createContext({} as DlaContext);

export function useDla() {
  return useContext(DlaContext);
}
