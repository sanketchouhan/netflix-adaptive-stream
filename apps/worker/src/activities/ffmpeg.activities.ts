import path from "path";
import fs from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import { config } from "../config";
import { Resolution } from "@adaptive-streaming/shared";

ffmpeg.setFfmpegPath(config.ffmpegPath);
ffmpeg.setFfprobePath(config.ffprobePath);

function resolveMediaPath(relativePath: string): string {
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");
  const resolvedAbolutePath = path.resolve(
    config.mediaRoot,
    normalizedRelativePath,
  );

  const rootPath = path.resolve(config.mediaRoot);

  if (
    resolvedAbolutePath === rootPath ||
    !resolvedAbolutePath.startsWith(`${rootPath}${path.sep}`)
  ) {
    throw new Error(`Invalid media path: ${relativePath}`);
  }

  return resolvedAbolutePath;
}

export async function transcodeResolution(
  inputRelativePath: string,
  outputRelativePath: string,
  resolution: Resolution,
) {
  console.log(
    `[transcodeResolution] Starting ${resolution.label} for input=${inputRelativePath}, output=${outputRelativePath}`,
  );

  const inputPath = resolveMediaPath(inputRelativePath);
  const outputPath = resolveMediaPath(outputRelativePath);

  const variantOutput = `${outputPath}${path.sep}${resolution.label}`;
  const variantPlaylist = `${variantOutput}${path.sep}playlist.m3u8`;

  console.log(
    `[transcodeResolution] Resolved paths for ${resolution.label}: input=${inputPath}, output=${variantOutput}, playlist=${variantPlaylist}`,
  );

  await fs.mkdir(variantOutput, { recursive: true });
  console.log(`[transcodeResolution] Output directory ready: ${variantOutput}`);

  await new Promise((resolve, reject) => {
    console.log(
      `[transcodeResolution] Starting FFmpeg for ${resolution.label}`,
    );

    let lastLoggedPercent = -1;

    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=${resolution.width}:${resolution.height}`, // scale the video to the resolution
        `-b:v ${resolution.bitRate}k`, // set the video bitrate
        "-codec:v libx264", // use the x264 codec
        "-codec:a aac", // use the aac codec
        "-hls_time 10", // set the hls time to 10 seconds
        "-hls_playlist_type vod", // set the hls playlist type to vod
        `-hls_segment_filename ${path.join(variantOutput, "segment-%05d.ts")}`,
      ])
      .output(variantPlaylist)
      .on("progress", (progress) => {
        const percent = Math.floor(progress.percent ?? 0);
        if (percent >= lastLoggedPercent + 10) {
          lastLoggedPercent = percent;
          console.log(
            `[transcodeResolution] Progress ${resolution.label}: ${percent}%`,
          );
        }
      })
      .on("end", () => {
        console.log(
          `[transcodeResolution] Completed ${resolution.label}: ${inputPath} -> ${variantPlaylist}`,
        );
        resolve(true);
      })
      .on("error", (err) => {
        console.error(
          `[transcodeResolution] Failed ${resolution.label} for ${inputPath}:`,
          err,
        );
        reject(err);
      })
      .run();
  });

  return `#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitRate * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n${resolution.label}/playlist.m3u8`;
}

export async function writeMasterPlaylist(
  outputRelativePath: string,
  resolutionEntries: string[],
) {
  const outputPath = resolveMediaPath(outputRelativePath);
  const writeMasterPlaylist = `${outputPath}${path.sep}master.m3u8`;

  await fs.mkdir(outputPath, { recursive: true });

  await fs.writeFile(
    writeMasterPlaylist,
    `#EXTM3U\n${resolutionEntries.join("\n")}\n`,
  );

  return `${outputRelativePath}${path.sep}master.m3u8`;
}

export async function deleteSourceFile(inputRelativePath: string) {
  const inputPath = resolveMediaPath(inputRelativePath);
  const exists = await fs
    .access(inputPath)
    .then(() => true)
    .catch(() => false);
  if (exists) {
    await fs.unlink(inputPath);
  }
}

export async function ensureOutputDirectory(outputRelativePath: string) {
  const outputPath = resolveMediaPath(outputRelativePath);
  await fs.mkdir(outputPath, { recursive: true });
}
