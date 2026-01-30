import { api } from "@/services/api";
import { IUser, IUserReferral, IUserStats } from "@/types";

export class ObjectService {
  private domain = "users";

  async update(data: Partial<IUser>): Promise<IUser> {
    return api.put<IUser, Partial<IUser>>(`${this.domain}/me`, data);
  }

  async getMe(): Promise<IUser> {
    return api.get<IUser>(`${this.domain}/me`);
  }

  async getStats(): Promise<IUserStats> {
    return api.get<IUserStats>(`${this.domain}/me/stats`);
  }

  async getReferrals():Promise<IUserReferral[]> {
    return api.get<IUserReferral[]>(`${this.domain}/me/referrals`);
  }
}

export default new ObjectService();
