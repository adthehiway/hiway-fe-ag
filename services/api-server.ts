import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const apiServer = {
  get: async <TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const apiInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const res: AxiosResponse<TResponse> = await apiInstance.get(url, config);
    return res.data;
  },
  getResponse: async <TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> => {
    const apiInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return apiInstance.get<TResponse>(url, config);
  },

  post: async <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const apiInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const res: AxiosResponse<TResponse> = await apiInstance.post(
      url,
      body,
      config
    );
    return res.data;
  },
  postResponse: async <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> => {
    const apiInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return apiInstance.post<TResponse>(url, body, config);
  },
  put: async <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const apiInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const res: AxiosResponse<TResponse> = await apiInstance.put(
      url,
      body,
      config
    );
    return res.data;
  },
  patch: async <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const apiInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const res: AxiosResponse<TResponse> = await apiInstance.patch(
      url,
      body,
      config
    );
    return res.data;
  },
  delete: async <TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const apiInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const res: AxiosResponse<TResponse> = await apiInstance.delete(url, config);
    return res.data;
  },
};
