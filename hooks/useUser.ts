import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UserService from "@/services/user";
import { IUser } from "@/types";
import { toast } from "react-toastify";
// Fetch current user
export function useUser() {
  const { data, isLoading, isError, error, refetch } = useQuery<IUser, Error>({
    queryKey: ["user", "me"],
    queryFn: () => UserService.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
  });

  const isEmpty = !isLoading && !isError && !data;

  return { data, isLoading, isError, isEmpty, error, refetch };
}

// Update current user
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<IUser>) => UserService.update(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });
}
