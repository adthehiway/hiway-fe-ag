import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApiKeysService from "@/services/api-keys";
import {
  ApiKeyResponseDto,
  CreateApiKeyDto,
  CreateApiKeyResponseDto,
  RevokeApiKeyResponse,
} from "@/types";
import { toast } from "react-toastify";
import { MOCK_MODE, mockApiKeys } from "@/lib/mock-data";

export function useApiKeys(companyId: string | undefined) {
  return useQuery<ApiKeyResponseDto[]>({
    queryKey: ["api-keys", companyId],
    queryFn: () => MOCK_MODE ? Promise.resolve(mockApiKeys as ApiKeyResponseDto[]) : ApiKeysService.listApiKeys(companyId!),
    enabled: !!companyId,
    staleTime: MOCK_MODE ? Infinity : 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: !MOCK_MODE,
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
