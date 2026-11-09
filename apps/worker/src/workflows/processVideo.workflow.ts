import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities";
import { ProcessVideoInput, RESOLUTIONS } from "@adaptive-streaming/shared";

const {
  transcodeResolution,
  writeMasterPlaylist,
  deleteSourceFile,
  updateVideoStatus,
  ensureOutputDirectory,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 hour",
  retry: {
    maximumAttempts: 3,
  },
});

export async function processVideoWorkflow(input: ProcessVideoInput) {
  const { videoId, inputRelativePath, outputRelativePath } = input;
  try {
    await updateVideoStatus(input.videoId, "processing");

    await ensureOutputDirectory(outputRelativePath);

    const resolutionEntries: string[] = [];
    for (const resolution of RESOLUTIONS) {
      resolutionEntries.push(
        await transcodeResolution(
          inputRelativePath,
          outputRelativePath,
          resolution,
        ),
      );
    }

    const masterPlaylistRelativePath = await writeMasterPlaylist(
      outputRelativePath,
      resolutionEntries,
    );

    await deleteSourceFile(inputRelativePath);

    await updateVideoStatus(videoId, "completed");

    return {
      videoId,
      masterPlaylistRelativePath,
    };
  } catch (error) {
    await updateVideoStatus(videoId, "failed");
    throw error;
  }
}
