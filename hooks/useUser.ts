import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UserService from "@/services/user";
import { IUser } from "@/types";
import { toast } from "react-toastify";
import { MOCK_MODE, mockUser } from "@/lib/mock-data";

// Fetch current user
export function useUser() {
  const { data, isLoading, isError, error, refetch } = useQuery<IUser, Error>({
    queryKey: ["user", "me"],
    queryFn: () => MOCK_MODE ? Promise.resolve(mockUser) : UserService.getMe(),
    staleTime: MOCK_MODE ? Infinity : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: !MOCK_MODE,
    refetchOnMount: !MOCK_MODE,
    retry: MOCK_MODE ? false : 1,
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
