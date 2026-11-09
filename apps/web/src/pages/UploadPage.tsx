import { ChangeEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadVideo } from '../api/client';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setMessage(null);
    setVideoId(null);

    try {
      const response = await uploadVideo(file);
      if (response.success && response.data) {
        setVideoId(response.data.videoId);
        setMessage('Upload accepted. Video is being processed by Temporal workers.');
      } else {
        setMessage(response.message || 'Upload failed');
      }
    } catch {
      setMessage('Something went wrong during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="container">
      <div className="card">
        <h1>Upload Video</h1>
        <p>Select a video file to upload. Processing runs asynchronously in Temporal workers.</p>

        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ marginTop: '1rem', marginBottom: '1rem' }}
        />

        {uploading && <p>Uploading...</p>}
        {message && <p>{message}</p>}
        {videoId && (
          <p>
            Track processing on the{' '}
            <Link to={`/stream/${videoId}`}>stream page</Link>.
          </p>
        )}
      </div>
    </main>
  );
}
