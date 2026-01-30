import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import InvitationService from "@/services/invitations";
import {
  IInvitation,
  IInvitationPreview,
  ICreateInvitationRequest,
  ICompanyMember,
  CompanyRole,
  IPaginatedResponse,
} from "@/types";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/lib/utils";

// Hook for fetching company invitations with pagination
export function useCompanyInvitations(
  companyId: string | undefined,
  page?: number,
  limit?: number
) {
  return useQuery({
    queryKey: ["company-invitations", companyId, page, limit],
    queryFn: () =>
      InvitationService.getCompanyInvitations(companyId!, { page, limit }),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for infinite scrolling company invitations
export function useCompanyInvitationsInfinite(
  companyId: string | undefined,
  limit: number = 20
) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<IPaginatedResponse<IInvitation>, Error>({
    queryKey: ["company-invitations-infinite", companyId, limit],
    queryFn: ({ pageParam }) =>
      InvitationService.getCompanyInvitations(companyId!, {
        page: pageParam as number,
        limit,
      }),
    enabled: !!companyId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single array and deduplicate by id
  const allItems = data?.pages.flatMap((page) => page.items || []) || [];
  const itemsMap = new Map<string, IInvitation>();
  allItems.forEach((item) => {
    if (item.id && !itemsMap.has(item.id)) {
      itemsMap.set(item.id, item);
    }
  });
  const items = Array.from(itemsMap.values());

  return {
    items,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}

// Hook for fetching invitation preview
export function useInvitationPreview(token: string | undefined) {
  return useQuery({
    queryKey: ["invitation-preview", token],
    queryFn: () => InvitationService.getInvitationPreview(token!),
    enabled: !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for creating an invitation
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: ICreateInvitationRequest;
    }) => InvitationService.createInvitation(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-invitations", variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["company-invitations-infinite", variables.companyId],
      });
      toast.success("Invitation sent successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook for accepting an invitation
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => InvitationService.acceptInvitation(token),
    onSuccess: () => {
      // Clean up pending invitation token from localStorage
      localStorage.removeItem("pendingInvitationToken");
      // Invalidate user and company queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Invitation accepted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook for revoking an invitation
export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      InvitationService.revokeInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company-invitations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["company-invitations-infinite"],
      });
      toast.success("Invitation revoked successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook for fetching company members with pagination
export function useCompanyMembers(
  companyId: string | undefined,
  params?: { page?: number; limit?: number; role?: CompanyRole }
) {
  return useQuery({
    queryKey: ["company-members", companyId, params],
    queryFn: () => InvitationService.getCompanyMembers(companyId!, params),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for infinite scrolling company members
export function useCompanyMembersInfinite(
  companyId: string | undefined,
  params?: { limit?: number; role?: CompanyRole }
) {
  const limit = params?.limit || 20;
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<IPaginatedResponse<ICompanyMember>, Error>({
    queryKey: ["company-members-infinite", companyId, limit, params?.role],
    queryFn: ({ pageParam }) =>
      InvitationService.getCompanyMembers(companyId!, {
        page: pageParam as number,
        limit,
        role: params?.role,
      }),
    enabled: !!companyId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single array and deduplicate by id
  const allItems = data?.pages.flatMap((page) => page.items || []) || [];
  const itemsMap = new Map<string, ICompanyMember>();
  allItems.forEach((item) => {
    if (item.id && !itemsMap.has(item.id)) {
      itemsMap.set(item.id, item);
    }
  });
  const items = Array.from(itemsMap.values());

  return {
    items,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}

// Hook for removing a member
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      memberId,
    }: {
      companyId: string;
      memberId: string;
    }) => InvitationService.removeMember(companyId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-members", variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["company-members-infinite", variables.companyId],
      });
      toast.success("Member removed successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook for changing member role
export function useChangeMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      memberId,
      role,
    }: {
      companyId: string;
      memberId: string;
      role: CompanyRole;
    }) => InvitationService.changeMemberRole(companyId, memberId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-members", variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["company-members-infinite", variables.companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Member role updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Hook for updating member permissions
export function useUpdateMemberPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      memberId,
      customPermissions,
    }: {
      companyId: string;
      memberId: string;
      customPermissions: string[];
    }) =>
      InvitationService.updateMemberPermissions(
        companyId,
        memberId,
        customPermissions
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-members", variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["company-members-infinite", variables.companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Member permissions updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
