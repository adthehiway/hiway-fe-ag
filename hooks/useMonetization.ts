import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MonetizationService from "@/services/monetization";
import {
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
import { toast } from "react-toastify";

export function useMonetizationStats() {
  return useQuery<MonetizationStats>({
    queryKey: ["monetization", "stats"],
    queryFn: () => MonetizationService.stats(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePayoutSchedule() {
  return useQuery<GetPayoutScheduleResponse>({
    queryKey: ["monetization", "payout-schedule"],
    queryFn: () => MonetizationService.getPayoutSchedule(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePayoutSchedule() {
  const queryClient = useQueryClient();

  return useMutation<PayoutScheduleResponse, Error, UpdatePayoutScheduleDto>({
    mutationFn: (dto) => MonetizationService.updatePayoutSchedule(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["monetization", "payout-schedule"],
      });
      toast.success(data.message || "Payout schedule updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update payout schedule"
      );
    },
  });
}

export function useCoupons() {
  return useQuery<CouponResponse[]>({
    queryKey: ["monetization", "coupons"],
    queryFn: () => MonetizationService.getCoupons(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCoupon(id: string) {
  return useQuery<CouponResponse>({
    queryKey: ["monetization", "coupons", id],
    queryFn: () => MonetizationService.getCouponById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation<CouponResponse, Error, CreateCouponDto>({
    mutationFn: (dto) => MonetizationService.createCoupon(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["monetization", "coupons"],
      });
      toast.success("Coupon created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create coupon");
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation<
    CouponResponse,
    Error,
    { id: string; dto: UpdateCouponDto }
  >({
    mutationFn: ({ id, dto }) => MonetizationService.updateCoupon(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["monetization", "coupons"],
      });
      queryClient.invalidateQueries({
        queryKey: ["monetization", "coupons", variables.id],
      });
      toast.success("Coupon updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update coupon");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id) => MonetizationService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["monetization", "coupons"],
      });
      toast.success("Coupon deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete coupon");
    },
  });
}

interface UsePayoutHistoryOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function usePayoutHistory({
  page = 1,
  limit = 20,
  enabled = true,
}: UsePayoutHistoryOptions = {}) {
  return useQuery<PayoutHistoryResponse>({
    queryKey: ["monetization", "payout-history", page, limit],
    queryFn: () => MonetizationService.getPayoutHistory(page, limit),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

interface UseTransactionHistoryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  enabled?: boolean;
}

export function useTransactionHistory({
  page = 1,
  limit = 20,
  search,
  status,
  type,
  enabled = true,
}: UseTransactionHistoryOptions = {}) {
  return useQuery<TransactionHistoryResponse>({
    queryKey: [
      "monetization",
      "transaction-history",
      page,
      limit,
      search,
      status,
      type,
    ],
    queryFn: () =>
      MonetizationService.getTransactionHistory(
        page,
        limit,
        search,
        status,
        type
      ),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRefundTransaction() {
  const queryClient = useQueryClient();

  return useMutation<
    RefundTransactionResponse,
    Error,
    { id: string; dto?: RefundTransactionRequest }
  >({
    mutationFn: ({ id, dto }) => MonetizationService.refundTransaction(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["monetization", "transaction-history"],
      });
      toast.success(data.message || "Transaction refunded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to refund transaction"
      );
    },
  });
}
