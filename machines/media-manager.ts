import { MediaStatus } from "@/types";
import {
  assign,
  createActor,
  createMachine,
  fromPromise,
  sendParent,
  setup,
} from "xstate";
import axios from "axios";

export enum EParentMachineStates {
  idle = "idle",
  active = "active",
  done = "done",
}

export enum EParentMachinesEvents {
  TURN_ON = "turn_on",
  TURN_OFF = "turn_off",
  ADD_MACHINE = "add_machine",
  SEND_TO_MACHINE = "send_to_machine",
  REMOVE_MACHINES = "remove_machines",
  UPDATE_STATUS = "update_status",
}

export enum EChildMachineStates {
  idle = "idle",
  creating = "creating",
  uploading = "uploading",
  finalizing = "finalizing",
  checking = "checking",
  retrying = "retrying",
  ready = "ready",
  failure = "failure",
}

export enum EChildMachinesEvents {
  START_UPLOAD = "start_upload",
  START_CHECKING = "start_checking",
}

export const MediaManagerMachine = createMachine({
  id: "MediaManagerMachine",
  initial: EParentMachineStates.idle,
  context: {
    machines: [],
  },
  states: {
    [EParentMachineStates.idle]: {
      on: {
        [EParentMachinesEvents.TURN_ON]: EParentMachineStates.active,
      },
    },
    [EParentMachineStates.active]: {
      on: {
        [EParentMachinesEvents.TURN_OFF]: EParentMachineStates.done,
        [EParentMachinesEvents.ADD_MACHINE]: {
          actions: assign(({ context, event, self }) => {
            return {
              machines: [
                ...context.machines,
                {
                  id: event.payload.id,
                  status: event.payload.status,
                  ref: createActor(MediaMachine, {
                    id: event.payload.id,
                    parent: self,
                  }).start(),
                },
              ],
            };
          }),
        },
        [EParentMachinesEvents.SEND_TO_MACHINE]: {
          actions: ({ context, event }: any) => {
            const machine = context.machines.find(
              (machine: any) => machine.id === event.payload.id
            );
            if (machine?.ref) {
              machine.ref.send({ ...event, type: event.payload.eventName });
            }
          },
        },
        [EParentMachinesEvents.REMOVE_MACHINES]: {
          actions: assign({
            machines: [],
          }),
        },
        [EParentMachinesEvents.UPDATE_STATUS]: {
          actions: assign({
            machines: ({ context, event }: any) => {
              return context.machines.map((machine: any) => {
                machine.origin = event.payload.origin;
                if (machine.id === event.payload.machineId) {
                  machine.status = event.payload.status;
                  if (event.payload.errorMessage) {
                    machine.errorMessage = event.payload.errorMessage;
                  }
                }
                if (event.payload.mediaId) {
                  machine.mediaId = event.payload.mediaId;
                }
                return machine;
              });
            },
          }),
        },
      },
    },
    [EParentMachineStates.done]: {
      type: "final",
    },
  } as any,
});

export const MediaMachine = setup({
  delays: {
    checking_timeout: ({ context }: any) => context.delayInMilliseconds,
  },
}).createMachine({
  id: "MediaMachine",
  initial: EChildMachineStates.idle,
  context: {},
  states: {
    [EChildMachineStates.idle]: {
      on: {
        [EChildMachinesEvents.START_UPLOAD]: {
          target: EChildMachineStates.creating,
          actions: assign({
            files: ({ event }) => event.payload.data?.files || {},
            status: ({ event }) => event.payload.data?.status || {},
            mediaService: ({ event }) => event.payload.data?.mediaService || {},
            companyId: ({ event }) => event.payload.data?.companyId || {},
            updateUploadProgress: ({ event }) =>
              event.payload.data?.updateUploadProgress || {},
            machineId: ({ self }) => self.id,
            uploadStartTime: () => Date.now(),
          }),
        },
        [EChildMachinesEvents.START_CHECKING]: {
          target: EChildMachineStates.checking,
          actions: assign({
            mediaService: ({ event }) => event.payload.data?.mediaService || {},
            object: ({ event }) => event.payload.data?.object || {},
          }),
        },
      },
    },
    [EChildMachineStates.creating]: {
      invoke: {
        id: "creating",
        src: fromPromise(({ input: { files, mediaService, companyId } }: any) =>
          mediaService.create(
            files.video.path,
            companyId,
            files.title,
            files.contentType,
            files.description,
            files.video.size,
            {
              video: {
                path: files.video.path,
                mime_type: files.video.mime_type,
                size: files.video.size,
              },
            }
          )
        ),
        input: ({ context }: any) => ({
          files: context.files,
          mediaService: context.mediaService,
          companyId: context.companyId,
        }),
        onDone: {
          target: EChildMachineStates.uploading,
          actions: [
            sendParent(({ context, self, event }: any) => ({
              type: EParentMachinesEvents.UPDATE_STATUS,
              payload: {
                status: context.status,
                machineId: self.id,
                origin: EChildMachineStates.creating,
                mediaId: event.output.id,
              },
            })),
            assign({
              object: ({ event }) => event.output,
            }),
          ],
        },
        onError: {
          target: EChildMachineStates.failure,
          actions: assign({
            errorMessage: ({ event }) => {
              if (event.error?.response?.data?.message) {
                return event.error.response.data.message;
              }
              return event.error?.message || "Unknown error occurred";
            },
          }),
        },
      },
    },
    [EChildMachineStates.uploading]: {
      invoke: {
        id: "uploading",
        src: fromPromise(
          async ({
            input: {
              files,
              object,
              updateUploadProgress,
              machineId,
              uploadStartTime,
              mediaService,
            },
          }: any) => {
            const uploadWithProgress = async (
              presignedUrl: string,
              file: File,
              onProgress: (loaded: number, total: number) => void,
              retryCount = 0,
              maxRetries = 3
            ) => {
              return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let lastProgressTime = Date.now();
                let progressStalled = false;

                // Dynamic timeout based on file size
                const timeoutDuration = Math.min(
                  Math.max(
                    5 * 60 * 1000,
                    (file.size / 1024 / 1024) * 60 * 1000
                  ),
                  180 * 60 * 1000
                );

                xhr.upload.addEventListener("progress", (event) => {
                  if (event.lengthComputable) {
                    lastProgressTime = Date.now();
                    progressStalled = false;
                    onProgress(event.loaded, event.total);
                  }
                });

                // Monitor for stalled uploads
                const stallCheckInterval = setInterval(() => {
                  const timeSinceProgress = Date.now() - lastProgressTime;
                  if (timeSinceProgress > 60000) {
                    progressStalled = true;
                    clearInterval(stallCheckInterval);
                    xhr.abort();
                  }
                }, 10000);

                xhr.addEventListener("load", () => {
                  clearInterval(stallCheckInterval);
                  if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                  } else {
                    reject(
                      new Error(
                        `Upload failed: HTTP ${xhr.status} ${xhr.statusText}`
                      )
                    );
                  }
                });

                const handleRetry = async (errorMsg: string) => {
                  clearInterval(stallCheckInterval);
                  if (retryCount < maxRetries) {
                    const backoffDelay = Math.min(
                      1000 * Math.pow(2, retryCount),
                      10000
                    );
                    console.log(
                      `Retrying upload (attempt ${
                        retryCount + 1
                      }/${maxRetries}) after ${backoffDelay}ms`
                    );
                    await new Promise((r) => setTimeout(r, backoffDelay));
                    try {
                      const result = await uploadWithProgress(
                        presignedUrl,
                        file,
                        onProgress,
                        retryCount + 1,
                        maxRetries
                      );
                      resolve(result);
                    } catch (retryError) {
                      reject(retryError);
                    }
                  } else {
                    reject(new Error(`${errorMsg} (Max retries exceeded)`));
                  }
                };

                xhr.addEventListener("error", () => {
                  handleRetry("Network error during upload");
                });

                xhr.addEventListener("timeout", () => {
                  handleRetry("Upload timeout");
                });

                xhr.addEventListener("abort", () => {
                  if (progressStalled) {
                    handleRetry("Upload stalled - no progress detected");
                  } else {
                    clearInterval(stallCheckInterval);
                    reject(new Error("Upload was aborted"));
                  }
                });

                xhr.timeout = timeoutDuration;

                xhr.open("PUT", presignedUrl);
                xhr.setRequestHeader("Content-Type", file.type);
                xhr.send(file);
              });
            };

            const uploadPartWithProgress = async (
              presignedUrl: string,
              partData: Blob,
              partNumber: number,
              onProgress: (loaded: number, total: number) => void,
              retryCount = 0,
              maxRetries = 3
            ): Promise<string> => {
              return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let lastProgressTime = Date.now();
                let progressStalled = false;

                // Dynamic timeout based on part size (min 5min, max 2hrs)
                const timeoutDuration = Math.min(
                  Math.max(
                    5 * 60 * 1000,
                    (partData.size / 1024 / 1024) * 60 * 1000
                  ),
                  180 * 60 * 1000
                );

                xhr.upload.addEventListener("progress", (event) => {
                  if (event.lengthComputable) {
                    lastProgressTime = Date.now();
                    progressStalled = false;
                    onProgress(event.loaded, event.total);
                  }
                });

                // Monitor for stalled uploads
                const stallCheckInterval = setInterval(() => {
                  const timeSinceProgress = Date.now() - lastProgressTime;
                  if (timeSinceProgress > 60000) {
                    // 60 seconds no progress
                    progressStalled = true;
                    clearInterval(stallCheckInterval);
                    xhr.abort();
                  }
                }, 10000);

                xhr.addEventListener("load", () => {
                  clearInterval(stallCheckInterval);
                  if (xhr.status >= 200 && xhr.status < 300) {
                    const etag = xhr
                      .getResponseHeader("ETag")
                      ?.replace(/"/g, "");

                    if (!etag) {
                      reject(
                        new Error(
                          `ETag not found for part ${partNumber}. Response: ${
                            xhr.responseText || "No response body"
                          }`
                        )
                      );
                      return;
                    }

                    const formattedEtag = etag.startsWith('"')
                      ? etag
                      : `"${etag}"`;
                    resolve(formattedEtag as string);
                  } else {
                    reject(new Error(`Upload failed, please try again`));
                  }
                });

                const handleRetry = async (errorMsg: string) => {
                  clearInterval(stallCheckInterval);
                  if (retryCount < maxRetries) {
                    const backoffDelay = Math.min(
                      1000 * Math.pow(2, retryCount),
                      10000
                    );
                    console.log(
                      `Retrying part ${partNumber} (attempt ${
                        retryCount + 1
                      }/${maxRetries}) after ${backoffDelay}ms`
                    );
                    await new Promise((r) => setTimeout(r, backoffDelay));
                    try {
                      const result = await uploadPartWithProgress(
                        presignedUrl,
                        partData,
                        partNumber,
                        onProgress,
                        retryCount + 1,
                        maxRetries
                      );
                      resolve(result);
                    } catch (retryError) {
                      reject(retryError);
                    }
                  } else {
                    reject(
                      new Error(
                        `${errorMsg} (Max retries exceeded for part ${partNumber})`
                      )
                    );
                  }
                };

                xhr.addEventListener("error", () => {
                  handleRetry("Network error during upload");
                });

                xhr.addEventListener("timeout", () => {
                  handleRetry("Upload timeout");
                });

                xhr.addEventListener("abort", () => {
                  if (progressStalled) {
                    handleRetry("Upload stalled - no progress detected");
                  } else {
                    clearInterval(stallCheckInterval);
                    reject(new Error(`Upload was aborted, please try again`));
                  }
                });

                xhr.timeout = timeoutDuration;

                xhr.open("PUT", presignedUrl);
                xhr.setRequestHeader(
                  "Content-Type",
                  partData.type || "application/octet-stream"
                );
                xhr.send(partData);
              });
            };

            const videoSize = files.video.data.size;

            const totalSize = videoSize;

            const progressTracker = {
              videoPartsProgress: new Map<number, number>(),
              lastUpdateTime: Date.now(),
              lastUploadedBytes: 0,
              smoothedSpeed: 0,
              speedSamples: [] as number[],
              maxSpeedSamples: 5,
              lastReportedSpeed: 0,
              lastReportedTime: 0,
            };

            const updateProgress = () => {
              const currentTime = Date.now();
              const timeElapsed = (currentTime - uploadStartTime) / 1000;

              const videoUploadedBytes = Array.from(
                progressTracker.videoPartsProgress.values()
              ).reduce((sum, bytes) => sum + bytes, 0);

              const totalUploadedBytes =
                videoUploadedBytes;

              const timeSinceLastUpdate =
                (currentTime - progressTracker.lastUpdateTime) / 1000;
              if (timeSinceLastUpdate > 0.5) {
                const bytesSinceLastUpdate =
                  totalUploadedBytes - progressTracker.lastUploadedBytes;
                const instantSpeed =
                  timeSinceLastUpdate > 0
                    ? bytesSinceLastUpdate / timeSinceLastUpdate
                    : 0;

                if (
                  instantSpeed > 0 ||
                  progressTracker.speedSamples.length === 0
                ) {
                  progressTracker.speedSamples.push(instantSpeed);
                  if (
                    progressTracker.speedSamples.length >
                    progressTracker.maxSpeedSamples
                  ) {
                    progressTracker.speedSamples.shift();
                  }

                  progressTracker.smoothedSpeed =
                    progressTracker.speedSamples.reduce((a, b) => a + b, 0) /
                    progressTracker.speedSamples.length;
                }

                progressTracker.lastUpdateTime = currentTime;
                progressTracker.lastUploadedBytes = totalUploadedBytes;
              }

              if (progressTracker.smoothedSpeed < 1000 && timeElapsed > 2) {
                progressTracker.smoothedSpeed =
                  totalUploadedBytes / timeElapsed;
              }

              const remainingBytes = Math.max(
                0,
                totalSize - totalUploadedBytes
              );
              const remainingTime =
                progressTracker.smoothedSpeed > 1000
                  ? remainingBytes / progressTracker.smoothedSpeed
                  : 0;
              const totalPercentage = Math.min(
                100,
                Math.round((totalUploadedBytes / totalSize) * 100)
              );

              const timeSinceLastReport =
                (currentTime - progressTracker.lastReportedTime) / 1000;
              const speedChange =
                Math.abs(
                  progressTracker.smoothedSpeed -
                    progressTracker.lastReportedSpeed
                ) / Math.max(progressTracker.lastReportedSpeed, 1);

              if (
                updateUploadProgress &&
                (timeSinceLastReport > 2 || speedChange > 0.3)
              ) {
                updateUploadProgress(machineId, {
                  uploaded: Math.round(totalUploadedBytes),
                  total: totalSize,
                  percentage: totalPercentage,
                  speed: Math.round(progressTracker.smoothedSpeed),
                  remainingTime: Math.round(remainingTime),
                });

                progressTracker.lastReportedSpeed =
                  progressTracker.smoothedSpeed;
                progressTracker.lastReportedTime = currentTime;
              }
            };

            const PART_SIZE = 1000 * 1024 * 1024;
            const videoFile = files.video.data;
            const totalParts = Math.ceil(videoFile.size / PART_SIZE);
            console.log({ PART_SIZE, totalParts });
            const videoParts: Array<{ ETag: string; PartNumber: number }> = [];

            for (let i = 1; i <= totalParts; i++) {
              progressTracker.videoPartsProgress.set(i, 0);
            }

            // Concurrent upload limiter
            const uploadWithConcurrencyLimit = async (
              tasks: Array<() => Promise<any>>,
              limit: number = 3
            ) => {
              const results: any[] = [];
              const executing: Promise<any>[] = [];

              for (const task of tasks) {
                const promise = task().then((result) => {
                  executing.splice(executing.indexOf(promise), 1);
                  return result;
                });

                results.push(promise);
                executing.push(promise);

                if (executing.length >= limit) {
                  await Promise.race(executing);
                }
              }

              return Promise.all(results);
            };

            const videoUploadTasks = [];
            for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
              const start = (partNumber - 1) * PART_SIZE;
              const end = Math.min(start + PART_SIZE, videoFile.size);
              const partData = videoFile.slice(start, end);

              videoUploadTasks.push(async () => {
                try {
                  const { url } = await mediaService.getPresignedUrlForPart(
                    object.video.key,
                    object.video.uploadId,
                    partNumber
                  );

                  const updatePartProgress = (
                    loaded: number,
                    total: number
                  ) => {
                    progressTracker.videoPartsProgress.set(partNumber, loaded);
                    updateProgress();
                  };

                  const etag = await uploadPartWithProgress(
                    url,
                    partData,
                    partNumber,
                    updatePartProgress
                  );

                  progressTracker.videoPartsProgress.set(
                    partNumber,
                    partData.size
                  );
                  updateProgress();

                  return { ETag: etag, PartNumber: partNumber };
                } catch (error) {
                  throw new Error(`Upload failed, please try again`);
                }
              });
            }

            try {
              updateProgress();

              // Upload video parts with concurrency limit (3 at a time)
              const [videoPartsResults] = await Promise.all([
                uploadWithConcurrencyLimit(videoUploadTasks, 3),
              ]);

              videoParts.push(
                ...videoPartsResults.sort((a, b) => a.PartNumber - b.PartNumber)
              );

              updateProgress();

              return {
                videoParts,
                videoKey: object.video.key,
                videoUploadId: object.video.uploadId,
              };
            } catch (error) {
              let errorMessage = "";
              const errorObj =
                error instanceof Error ? error : new Error(String(error));
              console.error("Upload error:", errorObj);

              // More specific error categorization
              if (errorObj.message.includes("stalled")) {
                errorMessage =
                  "Upload stalled due to network instability. Please check your connection and try again.";
              } else if (errorObj.message.includes("Max retries exceeded")) {
                errorMessage =
                  "Upload failed after multiple retry attempts. This may be due to an unstable connection or server issues.";
              } else if (errorObj.message.includes("Network error")) {
                errorMessage =
                  "Network connection lost during upload. Please check your internet connection and try again.";
              } else if (errorObj.message.toLowerCase().includes("timeout")) {
                errorMessage =
                  "Upload timed out. This may be due to a slow connection, large file size, or network congestion. Try again or use a faster connection.";
              } else if (errorObj.message.includes("abort")) {
                errorMessage = "Upload was cancelled by user or system.";
              } else if (errorObj.message.includes("Part ")) {
                errorMessage = `Upload error: ${errorObj.message}`;
              } else {
                errorMessage =
                  errorObj.message ||
                  "Unknown upload error occurred. Please try again.";
              }

              if (errorObj.cause && errorObj.cause instanceof Error) {
                console.error("Error cause:", errorObj.cause);
              }

              const enhancedError = new Error(errorMessage);
              enhancedError.cause = error;
              throw enhancedError;
            }
          }
        ),
        input: ({ context }: any) => ({
          files: context.files,
          object: context.object,
          updateUploadProgress: context.updateUploadProgress,
          machineId: context.machineId,
          uploadStartTime: context.uploadStartTime,
          mediaService: context.mediaService,
        }),
        onDone: {
          target: EChildMachineStates.finalizing,
          actions: [
            assign({
              multipartData: ({ event }) => event.output,
            }),
            sendParent(({ context, self }: any) => ({
              type: EParentMachinesEvents.UPDATE_STATUS,
              payload: {
                status: context.status,
                machineId: self.id,
                origin: EChildMachineStates.uploading,
              },
            })),
          ],
        },
        onError: {
          target: EChildMachineStates.failure,
          actions: assign({
            errorMessage: ({ event }) => {
              if (event.error?.response?.data?.message) {
                return event.error.response.data.message;
              }
              return event.error?.message || "Upload failed";
            },
          }),
        },
      },
    },
    [EChildMachineStates.finalizing]: {
      invoke: {
        id: "finalizing",
        src: fromPromise(
          ({ input: { id, mediaService, multipartData } }: any) => {
            const finalizeData = multipartData
              ? {
                  key: multipartData.videoKey,
                  uploadId: multipartData.videoUploadId,
                  parts: multipartData.videoParts,
                }
              : undefined;

            return mediaService.finalize(id, finalizeData);
          }
        ),
        input: ({ context }: any) => ({
          id: context.object.id,
          mediaService: context.mediaService,
          multipartData: context.multipartData,
        }),
        onDone: {
          target: EChildMachineStates.checking,
          actions: [
            assign({
              status: ({ event }) => MediaStatus.WAITING_TRANSCODING_START,
            }),
            sendParent(({ context, self }: any) => ({
              type: EParentMachinesEvents.UPDATE_STATUS,
              payload: {
                status: context.status,
                machineId: self.id,
                origin: EChildMachineStates.finalizing,
              },
            })),
          ],
        },
        onError: {
          target: EChildMachineStates.failure,
          actions: assign({
            errorMessage: ({ event }) => {
              if (event.error?.response?.data?.message) {
                return event.error.response.data.message;
              }
              return event.error?.message || "Finalization failed";
            },
          }),
        },
      },
    },
    [EChildMachineStates.checking]: {
      invoke: {
        id: "checking",
        src: fromPromise(({ input: { id, mediaService } }: any) =>
          mediaService.getById(id)
        ),
        input: ({ context, event }: any) => ({
          id: context.object.id,
          mediaService: context.mediaService,
        }),
        onDone: [
          {
            target: EChildMachineStates.ready,
            guard: ({ event }: any) => {
              return event.output.status === MediaStatus.READY;
            },
          },
          {
            target: EChildMachineStates.failure,
            guard: ({ event }: any) =>
              event.output.status === MediaStatus.ERROR,
            actions: assign({
              status: ({ event }) => event.output.status,
              errorMessage: ({ event }) =>
                event.output?.error?.message ||
                event.output?.error?.reason ||
                "Media processing failed",
            }),
          },
          {
            target: EChildMachineStates.retrying,
            guard: ({ event }: any) =>
              event.output.timeLeftInSeconds !== 0 ||
              (event.output.timeLeftInSeconds === 0 &&
                event.output.status !== MediaStatus.READY &&
                event.output.status !== MediaStatus.ERROR),
            actions: [
              assign({
                status: ({ event }) => event.output.status,
                delayInMilliseconds: ({ event }) => {
                  return event.output.timeLeftInSeconds <= 0
                    ? 30000
                    : event.output.timeLeftInSeconds * 1000;
                },
              }),
              sendParent(({ context, self }: any) => ({
                type: EParentMachinesEvents.UPDATE_STATUS,
                payload: {
                  status: context.status,
                  machineId: self.id,
                  origin: EChildMachineStates.checking,
                  mediaId: context.object.id,
                },
              })),
            ],
          },
        ],
        onError: {
          target: EChildMachineStates.failure,
          actions: assign({
            errorMessage: ({ event }) => {
              if (event.error?.response?.data?.message) {
                return event.error.response.data.message;
              }
              return event.error?.message || "Status check failed";
            },
          }),
        },
      },
    },
    [EChildMachineStates.retrying]: {
      after: {
        checking_timeout: {
          target: EChildMachineStates.checking,
        },
      },
    },
    [EChildMachineStates.failure]: {
      type: "final",
      entry: [
        assign({
          status: ({ context }) => MediaStatus.ERROR,
        }),
        sendParent(({ context, self }: any) => ({
          type: EParentMachinesEvents.UPDATE_STATUS,
          payload: {
            status: context.status,
            machineId: self.id,
            origin: EChildMachineStates.failure,
            errorMessage: context.errorMessage,
          },
        })),
      ],
    },
    [EChildMachineStates.ready]: {
      type: "final",
      entry: [
        assign({
          status: ({ context }) => MediaStatus.READY,
        }),
        sendParent(({ context, self }: any) => ({
          type: EParentMachinesEvents.UPDATE_STATUS,
          payload: {
            status: context.status,
            machineId: self.id,
            origin: EChildMachineStates.ready,
          },
        })),
      ],
    },
  } as any,
});
