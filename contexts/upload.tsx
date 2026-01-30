"use client";

import { IContentFabricFile, ICreateObject } from "@/types";
import { createContext, ReactNode, useContext } from "react";
import { useDla } from "./dla";
import { getPresignedUrl } from "@/lib/api";
import { slugifyFilename } from "@/lib/utils";
import axios from "axios";

interface IUploadFile extends IContentFabricFile {
  name: string;
}

type UploadProviderProps = {
  children: ReactNode;
};

type UploadContext = {
  save: (params: {
    data: ICreateObject;
    asset: string;
    files: IUploadFile[];
  }) => Promise<{ index: number; assets: any }>;
  uploadS3: (file: File) => Promise<string | null>;
};

export function UploadProvider({ children }: UploadProviderProps) {
  const { ContentFabricService, ObjectService } = useDla();

  async function save(params: {
    data: ICreateObject;
    asset: string;
    files: IUploadFile[];
  }): Promise<{ index: number; assets: any }> {
    const object = await ObjectService.create(params.data);

    await ContentFabricService.createInstance({
      node: object.node,
      token: object.authorizationToken,
    });

    await ContentFabricService.upload({
      files: params.files,
      objectId: object.id,
      libraryId: object.libraryId,
      writeToken: object.writeToken,
    });

    const assets = await ObjectService.finalize({
      id: object.id,
      data: {
        ...params.data,
        libraryId: object.libraryId,
        node: object.node,
        writeToken: object.writeToken,
        asset: params.asset,
        files: params.files.map((file) => file.name),
      },
    });

    const index: number =
      Object.keys(assets)
        .map((key) => Number(key))
        .filter((key) => !isNaN(Number(key)))
        .sort((a, b) => a - b)
        .pop() || 1;

    return { index, assets };
  }

  async function uploadS3(file: File): Promise<string | null> {
    // Convert filename to slug-friendly format
    const slugifiedFilename = slugifyFilename(file.name);
    
    try {

      // Create a new File object with the slugified filename
      // This ensures the filename matches what we use for the presigned URL
      const fileToUpload =
        slugifiedFilename !== file.name
          ? new File([file], slugifiedFilename, {
              type: file.type,
              lastModified: file.lastModified,
            })
          : file;

      const res = await getPresignedUrl({
        filename: slugifiedFilename,
        type: file.type,
      });

      if (!res) {
        console.error("[uploadS3] Failed to get presigned URL", {
          filename: slugifiedFilename,
          originalFilename: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
        return null;
      }

      await axios.put(res.uploadUrl, fileToUpload, {
        headers: {
          "Content-Type": file.type,
        },
      });

      return res.fileUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[uploadS3] Upload failed", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          filename: slugifiedFilename,
          originalFilename: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadUrl: error.config?.url,
          errorMessage: error.message,
          errorResponse: error.response?.data,
          errorHeaders: error.response?.headers,
        });
      } else {
        console.error("[uploadS3] Unexpected error during upload", {
          error,
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        });
      }
      return null;
    }
  }

  return (
    <UploadContext.Provider
      value={{
        save,
        uploadS3,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export const UploadContext = createContext({} as UploadContext);

export function useUpload() {
  return useContext(UploadContext);
}
