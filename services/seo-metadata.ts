import { apiServer } from "./api-server";

export type SeoMetadata = {
  title: string;
  description: string;
  image: string;
  width: number;
  height: number;
};

export class SeoMetadataService {
  async getSmartLinkSeoMetadata(slug: string): Promise<SeoMetadata> {
    const data = await apiServer.get<SeoMetadata>(
      `/smartlinks/metadata/${slug}`
    );
    return data;
  }
}

export default new SeoMetadataService();
