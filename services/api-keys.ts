import { api } from "@/services/api";
import {
  ApiKeyResponseDto,
  CreateApiKeyDto,
  CreateApiKeyResponseDto,
  RevokeApiKeyResponse,
} from "@/types";

export class ApiKeysService {
  private domain = "companies";

  async createApiKey(
    companyId: string,
    dto: CreateApiKeyDto
  ): Promise<CreateApiKeyResponseDto> {
    return api.post<CreateApiKeyResponseDto, CreateApiKeyDto>(
      `/${this.domain}/${companyId}/api-keys`,
      dto
    );
  }

  async listApiKeys(companyId: string): Promise<ApiKeyResponseDto[]> {
    return api.get<ApiKeyResponseDto[]>(
      `/${this.domain}/${companyId}/api-keys`
    );
  }

  async revokeApiKey(
    companyId: string,
    keyId: string
  ): Promise<RevokeApiKeyResponse> {
    return api.delete<RevokeApiKeyResponse>(
      `/${this.domain}/${companyId}/api-keys/${keyId}`
    );
  }
}

export default new ApiKeysService();
