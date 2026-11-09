import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Hls from 'hls.js';
import { getStreamUrl, getVideoStatus, VideoSummary } from '../api/client';

function isCompleted(status: VideoSummary['processingStatus'] | undefined) {
  return status === 'completed';
}

function isFailed(status: VideoSummary['processingStatus'] | undefined) {
  return status === 'failed';
}

export default function StreamPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [video, setVideo] = useState<VideoSummary | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;

    const fetchStatus = async () => {
      const status = await getVideoStatus(videoId);
      setVideo(status);
      return status;
    };

    fetchStatus().then((status) => {
      if (status && !isCompleted(status.processingStatus) && !isFailed(status.processingStatus)) {
        interval = setInterval(async () => {
          const latest = await fetchStatus();
          if (latest && (isCompleted(latest.processingStatus) || isFailed(latest.processingStatus))) {
            clearInterval(interval);
          }
        }, 3000);
      }
    });

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [videoId]);

  useEffect(() => {
    const streamUrl = getStreamUrl(video?.streamUrl ?? null);
    const videoElement = videoRef.current;

    if (!streamUrl || !videoElement || !isCompleted(video?.processingStatus)) {
      return;
    }

    setPlaybackError(null);

    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = streamUrl;
      return () => {
        videoElement.removeAttribute('src');
        videoElement.load();
      };
    }

    if (!Hls.isSupported()) {
      setPlaybackError('HLS playback is not supported in this browser.');
      return;
    }

    const hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(videoElement);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        setPlaybackError(`Playback failed: ${data.type} ${data.details}`);
      }
    });
    hlsRef.current = hls;

    return () => {
      hls.destroy();
      hlsRef.current = null;
      videoElement.removeAttribute('src');
      videoElement.load();
    };
  }, [video?.streamUrl, video?.processingStatus]);

  return (
    <main className="container">
      <div className="card">
        <h1>Stream Preview</h1>
        <p>
          Video ID: <code>{videoId}</code>
        </p>

        {video && (
          <p>
            Status:{' '}
            <span className={`status status-${video.processingStatus.toLowerCase()}`}>
              {video.processingStatus}
            </span>
          </p>
        )}

        {isCompleted(video?.processingStatus) ? (
          <>
            <video ref={videoRef} controls />
            {playbackError && <p style={{ color: '#991b1b' }}>{playbackError}</p>}
          </>
        ) : (
          <p>
            {isFailed(video?.processingStatus)
              ? 'Processing failed. Check worker logs.'
              : 'Waiting for Temporal workers to finish FFmpeg transcoding...'}
          </p>
        )}

        <p style={{ marginTop: '1rem' }}>
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </main>
  );
}
