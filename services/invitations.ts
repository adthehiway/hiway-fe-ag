import { api } from "@/services/api";
import {
  IInvitation,
  IInvitationPreview,
  ICreateInvitationRequest,
  ICompanyMember,
  ISuperAdminGrant,
  ICreateGrantRequest,
  IApproveGrantRequest,
  IPaginatedResponse,
  CompanyRole,
} from "@/types";

export class InvitationService {
  private domain = "companies";

  // Invitation methods
  async createInvitation(
    companyId: string,
    data: ICreateInvitationRequest
  ): Promise<IInvitation> {
    return api.post<IInvitation, ICreateInvitationRequest>(
      `${this.domain}/${companyId}/invitations`,
      {
        ...data,
        email: data.email.toLowerCase(),
      }
    );
  }

  async getInvitationPreview(token: string): Promise<IInvitationPreview> {
    // This is a public endpoint, so we use apiServer which doesn't require auth
    // Use regular api.get which will work with or without auth token
    return api.get<IInvitationPreview>(`invitations/${token}`);
  }

  async acceptInvitation(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }, {}>(
      `invitations/${token}/accept`,
      {}
    );
  }

  async revokeInvitation(invitationId: string): Promise<void> {
    return api.post<void, {}>(`invitations/${invitationId}/revoke`, {});
  }

  async getCompanyInvitations(
    companyId: string,
    params?: { page?: number; limit?: number }
  ): Promise<IPaginatedResponse<IInvitation>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return api.get<IPaginatedResponse<IInvitation>>(
      `${this.domain}/${companyId}/invitations${query ? `?${query}` : ""}`
    );
  }

  // Member methods
  async getCompanyMembers(
    companyId: string,
    params?: { page?: number; limit?: number; role?: CompanyRole }
  ): Promise<IPaginatedResponse<ICompanyMember>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.role) queryParams.append("role", params.role);

    const query = queryParams.toString();
    return api.get<IPaginatedResponse<ICompanyMember>>(
      `${this.domain}/${companyId}/members${query ? `?${query}` : ""}`
    );
  }

  async removeMember(companyId: string, memberId: string): Promise<void> {
    return api.delete<void>(`${this.domain}/${companyId}/members/${memberId}`);
  }

  async changeMemberRole(
    companyId: string,
    memberId: string,
    role: string
  ): Promise<ICompanyMember> {
    return api.patch<ICompanyMember, { role: string }>(
      `${this.domain}/${companyId}/members/${memberId}/role`,
      { role }
    );
  }

  async updateMemberPermissions(
    companyId: string,
    memberId: string,
    customPermissions: string[]
  ): Promise<void> {
    return api.patch<void, { customPermissions: string[] }>(
      `${this.domain}/${companyId}/members/${memberId}/permissions`,
      { customPermissions }
    );
  }

  // Super Admin Grant methods
  async requestGrant(
    companyId: string,
    data: ICreateGrantRequest
  ): Promise<ISuperAdminGrant> {
    return api.post<ISuperAdminGrant, ICreateGrantRequest>(
      `admin/${this.domain}/${companyId}/grants`,
      data
    );
  }

  async approveGrant(
    companyId: string,
    grantId: string,
    data?: IApproveGrantRequest
  ): Promise<ISuperAdminGrant> {
    return api.post<ISuperAdminGrant, IApproveGrantRequest>(
      `${this.domain}/${companyId}/grants/${grantId}/approve`,
      data || {}
    );
  }

  async listGrants(params?: {
    companyId?: string;
    superAdminUserId?: string;
  }): Promise<ISuperAdminGrant[]> {
    const queryParams = new URLSearchParams();
    if (params?.companyId) queryParams.append("companyId", params.companyId);
    if (params?.superAdminUserId)
      queryParams.append("superAdminUserId", params.superAdminUserId);

    const query = queryParams.toString();
    return api.get<ISuperAdminGrant[]>(
      `admin/grants${query ? `?${query}` : ""}`
    );
  }

  async revokeGrant(grantId: string): Promise<void> {
    return api.delete<void>(`admin/grants/${grantId}`);
  }
}

export default new InvitationService();
