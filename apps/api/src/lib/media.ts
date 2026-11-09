import fs from "fs";
import path from "path";
import { config } from "../config";

export function ensureMediaDirectories() {
  const dirs = [
    config.mediaRoot,
    path.join(config.mediaRoot, "uploads"),
    path.join(config.mediaRoot, "output"),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export function getUploadDirectory() {
  return path.join(config.mediaRoot, "uploads");
}

export function getOutputDirectory(videoId: string) {
  return path.join(config.mediaRoot, "output", videoId);
}

export function getOutputRelativePath(videoId: string) {
  return `output/${videoId}`;
}

export function getUploadRelativePath(absolutePath: string) {
  const relative = path.relative(
    path.resolve(config.mediaRoot),
    path.resolve(absolutePath),
  );
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid path");
  }
  return relative.split(path.sep).join("/");
}
