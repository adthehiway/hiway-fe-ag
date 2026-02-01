"use client";

import { api } from "./api";
import { IPackage, IPackagePurchase, IPackageGrouped } from "@/types";
import { MOCK_MODE, mockPackages } from "@/lib/mock-data";

export class PackageService {
  private domain = "packages";

  async getAll(): Promise<IPackageGrouped> {
    if (MOCK_MODE) {
      return Promise.resolve(mockPackages);
    }
    return api.get(`${this.domain}`);
  }

  async createCheckoutLink(parmas: {
    packageId: string;
  }): Promise<{ url: string }> {
    return api.post<{ url: string }>(
      `${this.domain}/${parmas.packageId}/checkout`,
      {}
    );
  }
  async createManageLink(): Promise<{ url: string }> {
    return api.get<{ url: string }>(`${this.domain}/manage`);
  }

  async checkCheckoutPayment(sid: string): Promise<IPackagePurchase> {
    return api.get(`${this.domain}/checkout/${sid}`);
  }
}

export default new PackageService();
