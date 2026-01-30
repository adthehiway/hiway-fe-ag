"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { ContentType, IContentFabricFile, MediaStatus } from "@/types";
import { useMachine } from "@xstate/react";
import {
  EParentMachinesEvents,
  EChildMachinesEvents,
  MediaManagerMachine,
} from "@/machines/media-manager";
import { useDla } from "./dla";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";

export type ProcessingItem = {
  id: string;
  name: string;
  status: string;
  mediaId?: string;
  errorMessage?: string;
  uploadProgress?: {
    uploaded: number;
    total: number;
    percentage: number;
    speed: number; // bytes per second
    remainingTime: number; // seconds
  };
};

type MediaManagerProviderProps = {
  children: ReactNode;
};

export type MediaFile = {
  video: IContentFabricFile;
  contentType?: ContentType;
  title?: string;
  description?: string;
};

type MediaManagerContext = {
  clear: () => void;
  upload: (files: MediaFile[]) => void;
  monitorStatus: (items: ProcessingItem[]) => void;
  processingList: ProcessingItem[];
  removeFromProcessingList: (id: string) => void;
  updateUploadProgress: (
    id: string,
    progress: {
      uploaded: number;
      total: number;
      percentage: number;
      speed: number;
      remainingTime: number;
    }
  ) => void;
};

export function MediaManagerProvider({ children }: MediaManagerProviderProps) {
  const [processingList, setProcessingList] = useState<ProcessingItem[]>([]);
  const [state, send, service] = useMachine(MediaManagerMachine);
  const { MediaService } = useDla();
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (service) {
      service.send({
        type: EParentMachinesEvents.TURN_ON,
      });
    }
  }, [service]);

  useEffect(() => {
    updateStatus(state.context.machines);
  }, [state.context]);

  function addMachine(id: string, status: string) {
    service.send({
      type: EParentMachinesEvents.ADD_MACHINE,
      payload: {
        id,
        status,
      },
    });
  }

  function sendToMachine(event: any, id: string, data?: any) {
    service.send({
      type: EParentMachinesEvents.SEND_TO_MACHINE,
      payload: {
        id: id,
        eventName: event,
        ...(data && {
          data: { ...data },
        }),
      },
    });
  }

  async function upload(files: MediaFile[]): Promise<void> {
    const newProcessingList = [...processingList];
    for (const media of files) {
      const item: ProcessingItem = {
        id: uuidv4(),
        name: media.video.path,
        status: MediaStatus.UPLOAD_IN_PROGRESS,
      };
      newProcessingList.push(item);
      addMachine(item.id, MediaStatus.UPLOAD_IN_PROGRESS);
      sendToMachine(EChildMachinesEvents.START_UPLOAD, item.id, {
        files: {
          ...media,
          name: media.video.path,
          title: media.title,
          contentType: media.contentType,
          description: media.description,
        },
        status: item.status,
        mediaService: MediaService,
        companyId: user?.company?.id,
        updateUploadProgress: updateUploadProgress,
      });
    }
    setProcessingList(newProcessingList);
  }

  function monitorStatus(items: ProcessingItem[]): void {
    setProcessingList((currentList) => {
      const existingIds = new Set(currentList.map((item) => item.id));
      const existingMediaIds = new Set(
        currentList.filter((item) => item.mediaId).map((item) => item.mediaId!)
      );

      // Filter out items that already exist (by id or mediaId)
      const newItems = items.filter(
        (item) =>
          !existingIds.has(item.id) &&
          (!item.mediaId || !existingMediaIds.has(item.mediaId))
      );

      // Add new items
      const updatedList = [...currentList, ...newItems];

      // Start monitoring for new items
      newItems.forEach((item) => {
        addMachine(item.id, item.status);
        sendToMachine(EChildMachinesEvents.START_CHECKING, item.id, {
          mediaService: MediaService,
          object: {
            id: item.id,
          },
        });
      });

      return updatedList;
    });
  }

  function updateStatus(machines: any[]): void {
    const updatedprocessingList = processingList.map((item: ProcessingItem) => {
      const machine = machines.find((machine) => machine.id === item.id);
      const previousStatus = item.status;

      item.status = machine?.status || MediaStatus.ERROR;
      item.mediaId = machine?.mediaId;
      if (machine?.errorMessage) {
        item.errorMessage = machine.errorMessage;
      }

      // Check if status changed to READY and invalidate queries
      if (
        previousStatus !== MediaStatus.READY &&
        machine?.status === MediaStatus.READY
      ) {
        // Invalidate all overview queries to refetch fresh data
        // This will invalidate all queries that start with these keys
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              (Array.isArray(queryKey) &&
                queryKey[0] === "dashboard-overview") ||
              (Array.isArray(queryKey) &&
                queryKey[0] === "content-library-overview") ||
              (Array.isArray(queryKey) && queryKey[0] === "overview") ||
              (Array.isArray(queryKey) && queryKey[0] === "smartlinks") ||
              (Array.isArray(queryKey) &&
                queryKey[0] === "smartlinks-analytics")
            );
          },
        });
      }

      return item;
    });
    setProcessingList(updatedprocessingList);
  }

  function clear(): void {
    service.send({
      type: EParentMachinesEvents.REMOVE_MACHINES,
    });
    setProcessingList([]);
  }

  function removeFromProcessingList(id: string): void {
    setProcessingList((list) => list.filter((item) => item.id !== id));
  }

  function updateUploadProgress(
    id: string,
    progress: {
      uploaded: number;
      total: number;
      percentage: number;
      speed: number;
      remainingTime: number;
    }
  ): void {
    setProcessingList((list) =>
      list.map((item) =>
        item.id === id ? { ...item, uploadProgress: progress } : item
      )
    );
  }

  return (
    <MediaManagerContext.Provider
      value={{
        upload,
        clear,
        monitorStatus,
        processingList,
        removeFromProcessingList,
        updateUploadProgress,
      }}
    >
      {children}
    </MediaManagerContext.Provider>
  );
}

export const MediaManagerContext = createContext({} as MediaManagerContext);

export function useMediaManager() {
  return useContext(MediaManagerContext);
}
