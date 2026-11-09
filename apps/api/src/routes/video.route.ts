import { Router } from "express";
import {
  getVideoStatusController,
  listVideosController,
  uploadVideoController,
} from "../controllers/video.controller";
import { uploadMiddleware } from "../middlewares/upload.middleware";

const videoRouter = Router();

videoRouter.get("/", listVideosController);
videoRouter.post(
  "/upload",
  uploadMiddleware.single("video"),
  uploadVideoController,
);
videoRouter.get("/:videoId", getVideoStatusController);

export default videoRouter;
