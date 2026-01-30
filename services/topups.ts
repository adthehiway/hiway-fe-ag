"use client";

import { api } from "./api";

export class TopUpService {
  private domain = "topups";

  async createCheckoutLink(params: {
    hours: number;
  }): Promise<{ url: string }> {
    return api.post<{ url: string }>(`${this.domain}/checkout`, {
      hours: params.hours,
    });
  }

  async checkCheckoutPayment(sid: string): Promise<any> {
    return api.get(`${this.domain}/checkout/${sid}`);
  }
}

export default new TopUpService();
