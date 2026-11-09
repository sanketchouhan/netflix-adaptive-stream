export const TASK_QUEUE = "video-processing";

export const PROCESS_VIDEO_WORKFLOW = "processVideoWorkflow";

export interface ProcessVideoInput {
  videoId: string;
  inputRelativePath: string;
  outputRelativePath: string;
}

export interface Resolution {
  width: number; // 1920
  height: number; // 1080
  bitRate: number; // 1000000
  label: string; // 1080p
}

export type ProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export const RESOLUTIONS: Resolution[] = [
  { width: 1920, height: 1080, bitRate: 2000, label: "1080p" },
  { width: 1280, height: 720, bitRate: 1000, label: "720p" },
  { width: 960, height: 540, bitRate: 500, label: "480p" },
  { width: 640, height: 360, bitRate: 400, label: "360p" },
];
