import { ProcessingStatus } from '@adaptive-streaming/shared';
import { prisma } from '../lib/prisma';


export async function createVideoRecord(videoId: string, originalFileName?: string) {
    return prisma.video.create({
        data: {
            videoId: videoId,
            originalFileName: originalFileName || '',
            processingStatus: 'pending',
        },
    });
}


export async function updateVideoStatus(videoId: string, processingStatus: ProcessingStatus) {
    return prisma.video.update({
        where: { videoId },
        data: { processingStatus },
    });
}

export async function listVideos() {
    return prisma.video.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export async function getVideoByVideoId(videoId: string) {
    return prisma.video.findUnique({
        where: { videoId },
    });
}