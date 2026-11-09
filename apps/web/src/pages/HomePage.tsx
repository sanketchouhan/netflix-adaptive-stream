import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listVideos, VideoSummary } from '../api/client';

export default function HomePage() {
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listVideos()
      .then(setVideos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container">
      <div className="card">
        <h1>Adaptive Streaming</h1>
        <p>HLS video processing powered by Temporal workers and FFmpeg.</p>
        <p>
          <Link to="/upload">Upload a new video</Link>
        </p>

        <h2>Videos</h2>
        {loading && <p>Loading...</p>}
        {!loading && videos.length === 0 && <p>No videos yet.</p>}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {videos.map((video) => (
            <li
              key={video.videoId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div>
                <strong>{video.originalFileName || 'Untitled video'}</strong>
                <div>
                  <Link to={`/stream/${video.videoId}`}>{video.videoId}</Link>
                </div>
                <div>
                  <span className={`status status-${video.processingStatus.toLowerCase()}`}>
                    {video.processingStatus}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
