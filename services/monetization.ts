import { api } from "@/services/api";
import {
  ICreateObject,
  IFinalizeObject,
  IObject,
  MonetizationStats,
  PayoutSchedule,
  UpdatePayoutScheduleDto,
  PayoutScheduleResponse,
  GetPayoutScheduleResponse,
  CreateCouponDto,
  UpdateCouponDto,
  CouponResponse,
  PayoutHistoryResponse,
  TransactionHistoryResponse,
  RefundTransactionRequest,
  RefundTransactionResponse,
} from "@/types";

export class MonetizationService {
  private domain = "monetization";

  async stats(): Promise<MonetizationStats> {
    return api.get<MonetizationStats>(`${this.domain}/stats`);
  }

  async getPayoutSchedule(): Promise<GetPayoutScheduleResponse> {
    return api.get<GetPayoutScheduleResponse>(`${this.domain}/payout-schedule`);
  }

  async updatePayoutSchedule(
    dto: UpdatePayoutScheduleDto
  ): Promise<PayoutScheduleResponse> {
    return api.patch<PayoutScheduleResponse, UpdatePayoutScheduleDto>(
      `${this.domain}/payout-schedule`,
      dto
    );
  }

  async createCoupon(dto: CreateCouponDto): Promise<CouponResponse> {
    return api.post<CouponResponse, CreateCouponDto>(
      `${this.domain}/coupons`,
      dto
    );
  }

  async getCoupons(): Promise<CouponResponse[]> {
    return api.get<CouponResponse[]>(`${this.domain}/coupons`);
  }

  async getCouponById(id: string): Promise<CouponResponse> {
    return api.get<CouponResponse>(`${this.domain}/coupons/${id}`);
  }

  async updateCoupon(
    id: string,
    dto: UpdateCouponDto
  ): Promise<CouponResponse> {
    return api.patch<CouponResponse, UpdateCouponDto>(
      `${this.domain}/coupons/${id}`,
      dto
    );
  }

  async deleteCoupon(id: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`${this.domain}/coupons/${id}`);
  }

  async getPayoutHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<PayoutHistoryResponse> {
    return api.get<PayoutHistoryResponse>(
      `${this.domain}/payouts?page=${page}&limit=${limit}`
    );
  }

  async getTransactionHistory(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string,
    type?: string
  ): Promise<TransactionHistoryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (type) params.append("type", type);

    return api.get<TransactionHistoryResponse>(
      `${this.domain}/transactions?${params.toString()}`
    );
  }

  async refundTransaction(
    id: string,
    dto?: RefundTransactionRequest
  ): Promise<RefundTransactionResponse> {
    return api.post<RefundTransactionResponse, RefundTransactionRequest>(
      `${this.domain}/transactions/${id}/refund`,
      dto || {}
    );
  }
}

export default new MonetizationService();
