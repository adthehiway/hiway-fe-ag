import { api } from "./api";
import {
  BillingPlanAndPaymentMethods,
  IBillingInvoice,
  IUsage,
  IFeatureUsage,
} from "@/types";

class BillingService {
  private domain = "billing";

  async getPlanDetails(): Promise<BillingPlanAndPaymentMethods> {
    return api.get<BillingPlanAndPaymentMethods>(`/${this.domain}/plan`);
  }
  async getInvoices(): Promise<IBillingInvoice[]> {
    return api.get<IBillingInvoice[]>(`/${this.domain}/invoices`);
  }

  async getStreamHoursUsage(): Promise<IUsage> {
    return api.get<IUsage>(`/${this.domain}/stream-hours-usage`);
  }

  async changePlan(
    packageId: string
  ): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(
      `/${this.domain}/change-plan`,
      {
        packageId,
      }
    );
  }

  async switchBillingType(
    billingType: "MONTHLY" | "ANNUAL"
  ): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(
      `/${this.domain}/switch-billing-type`,
      {
        billingType,
      }
    );
  }

  async getStorageUsage(): Promise<{
    videoStorage: IFeatureUsage;
    assetStorage: IFeatureUsage;
  }> {
    return api.get<{
      videoStorage: IFeatureUsage;
      assetStorage: IFeatureUsage;
    }>(`/${this.domain}/storage-usage`);
  }
}

export default new BillingService();
