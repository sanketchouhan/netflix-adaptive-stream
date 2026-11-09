const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface VideoSummary {
  videoId: string;
  originalFileName: string | null;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  streamUrl: string | null;
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    videoId: string;
    workflowId: string;
    status: string;
  };
}

export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch(`${API_URL}/api/v1/videos/upload`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

export async function listVideos(): Promise<VideoSummary[]> {
  const response = await fetch(`${API_URL}/api/v1/videos`);
  const json = await response.json();
  return json.data ?? [];
}

export async function getVideoStatus(videoId: string): Promise<VideoSummary | null> {
  const response = await fetch(`${API_URL}/api/v1/videos/${videoId}`);
  if (!response.ok) {
    return null;
  }
  const json = await response.json();
  return json.data ?? null;
}

export function getStreamUrl(streamPath: string | null): string | null {
  if (!streamPath) {
    return null;
  }
  return `${API_URL}${streamPath}`;
}
