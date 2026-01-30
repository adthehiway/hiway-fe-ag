import { api } from "@/services/api";
import {
  IPaginationResult,
  IMediaPurchase,
  WalletSummary,
  PaginatedPurchasesResponse,
  IAccountRoomPurchase,
  PaginatedRoomPurchasesResponse,
} from "@/types";

export class AccountService {
  private domain = "account";

  async getWalletSummary(): Promise<WalletSummary> {
    return api.get<WalletSummary>(`${this.domain}/wallet/summary`);
  }

  async getPurchases(params: {
    perPage: number;
    continuationToken?: number;
    search?: string;
    filter?: "all" | "purchases" | "rentals";
    sortBy?: "newest" | "oldest" | "expiring-soon" | "title-asc" | "title-desc";
  }): Promise<PaginatedPurchasesResponse> {
    let url = `${this.domain}/purchases?perPage=${params.perPage}`;
    if (params.continuationToken) {
      url += `&continuationToken=${params.continuationToken}`;
    }
    if (params.search) {
      url += `&search=${encodeURIComponent(params.search)}`;
    }
    if (params.filter && params.filter !== "all") {
      url += `&filter=${params.filter}`;
    }
    if (params.sortBy) {
      url += `&sortBy=${params.sortBy}`;
    }
    return api.get<PaginatedPurchasesResponse>(url);
  }

  // Renew a rental
  async renewRental(purchaseId: string): Promise<{ url: string }> {
    return api.post<{ url: string }, {}>(
      `${this.domain}/purchases/${purchaseId}/renew`,
      {}
    );
  }

  // Buy to keep (convert rental to purchase)
  async buyToKeep(purchaseId: string): Promise<{ url: string }> {
    return api.post<{ url: string }, {}>(
      `${this.domain}/purchases/${purchaseId}/buy-to-keep`,
      {}
    );
  }

  // Get recommendations
  async getRecommendations(): Promise<any> {
    return api.get<any>(`${this.domain}/recommendations`);
  }

  // Get room purchases (collections)
  async getRoomPurchases(
    params: {
      perPage?: number;
      search?: string;
      sortBy?: "newest" | "oldest" | "title-asc" | "title-desc";
    } = {}
  ): Promise<PaginatedRoomPurchasesResponse> {
    const perPage = params.perPage || 10;
    let url = `${this.domain}/room-purchases?perPage=${perPage}`;

    if (params.search) {
      url += `&search=${encodeURIComponent(params.search)}`;
    }

    if (params.sortBy) {
      url += `&sortBy=${params.sortBy}`;
    }

    return api.get<PaginatedRoomPurchasesResponse>(url);
  }
}

export default new AccountService();
