import { ProcessingStatus } from "@adaptive-streaming/shared";
import { prisma } from "../lib/prisma";

export async function updateVideoStatus(
  videoId: string,
  processingStatus: ProcessingStatus,
) {
  await prisma.video.update({
    where: { videoId },
    data: { processingStatus },
  });
}
