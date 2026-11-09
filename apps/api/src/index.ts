import express from "express";
import cors from "cors";
import { config } from "./config";
import apiRouter from "./routes";
import { ensureMediaDirectories } from "./lib/media";

const app = express();

ensureMediaDirectories();

app.use(
  cors({
    origin: config.corsOrigin,
  }),
);

app.use(express.json());

app.use("/api", apiRouter);

app.use(
  "/media",
  express.static(config.mediaRoot, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      } else if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
      }
    },
  }),
);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    mediaRoot: config.mediaRoot,
    implementation: "starter",
  });
});

app.listen(config.port, () => {
  console.log(`API server running on http://localhost:${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});
