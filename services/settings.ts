import { ISettings } from "@/types";
import { api } from "@/services/api";

export class SettingsService {
  private domain = "settings";

  async get(): Promise<ISettings> {
    return api.get<ISettings>(this.domain);
  }

  async update(data: Partial<ISettings>): Promise<ISettings> {
    return api.patch<ISettings, Partial<ISettings>>(this.domain, data);
  }
}

export default new SettingsService();
