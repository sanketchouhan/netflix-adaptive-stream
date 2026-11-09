import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const config = {
  mediaRoot: process.env.MEDIA_ROOT || "/data/adaptive-streaming-media",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@postgres:5432/adaptive_streaming",
  temporalAddress: process.env.TEMPORAL_ADDRESS || "temporal:7233",
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE || "video-processing",
  ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg",
  ffprobePath: process.env.FFPROBE_PATH || "ffprobe",
};
