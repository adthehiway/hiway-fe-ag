import { api } from "@/services/api";
import { ICreateObject, IFinalizeObject, IObject } from "@/types";

export class ObjectService {
  private domain = "objects";

  async create(data: ICreateObject): Promise<IObject> {
    return api.post<IObject, ICreateObject>(`${this.domain}`, data);
  }

  async finalize(params: { id: string; data: IFinalizeObject }): Promise<any> {
    return api.post<any, IFinalizeObject>(
      `${this.domain}/${params.id}/finalize`,
      params.data
    );
  }
}

export default new ObjectService();
