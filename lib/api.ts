import { api } from "@/services/api";
import { OverviewType } from "@/types";

export const getPresignedUrl = async ({
  filename,
  type,
}: {
  filename: string;
  type: string;
}): Promise<{ uploadUrl: string; fileUrl: string }> => {
  const response = await api.post<{
    uploadUrl: string;
    fileUrl: string;
  }>(`media/presign`, {
    filename,
    type,
  });
  return response;
};

export const getOverview = async (): Promise<OverviewType> => {
  const response = await api.get<OverviewType>(`/overview`);
  return response;
};
