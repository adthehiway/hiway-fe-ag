"use client";

import { api } from "./api";
import { IPackage, IPackagePurchase, IPackageGrouped } from "@/types";

export class PackageService {
  private domain = "packages";

  async getAll(): Promise<IPackageGrouped> {
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
