import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getUploadDirectory } from "../lib/media";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getUploadDirectory());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
  },
});
