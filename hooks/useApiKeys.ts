import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApiKeysService from "@/services/api-keys";
import {
  ApiKeyResponseDto,
  CreateApiKeyDto,
  CreateApiKeyResponseDto,
  RevokeApiKeyResponse,
} from "@/types";
import { toast } from "react-toastify";

export function useApiKeys(companyId: string | undefined) {
  return useQuery<ApiKeyResponseDto[]>({
    queryKey: ["api-keys", companyId],
    queryFn: () => ApiKeysService.listApiKeys(companyId!),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateApiKeyResponseDto,
    Error,
    { companyId: string; dto: CreateApiKeyDto }
  >({
    mutationFn: ({ companyId, dto }) =>
      ApiKeysService.createApiKey(companyId, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["api-keys", variables.companyId],
      });
      toast.success("API key created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create API key");
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation<
    RevokeApiKeyResponse,
    Error,
    { companyId: string; keyId: string }
  >({
    mutationFn: ({ companyId, keyId }) =>
      ApiKeysService.revokeApiKey(companyId, keyId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["api-keys", variables.companyId],
      });
      toast.success(data.message || "API key revoked successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to revoke API key");
    },
  });
}
