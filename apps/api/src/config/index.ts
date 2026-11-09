import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const config = {
  port: Number(process.env.PORT) || 3000,
  mediaRoot: process.env.MEDIA_ROOT || "/data/adaptive-streaming-media",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/adaptive_streaming",
  temporalAddress: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE || "video-processing",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
