import { useState } from 'react';
import './RepoInput.css';

interface RepoInputProps {
  onRepoAdded: (sessionId: string, repoUrl: string) => void;
}

function RepoInput({ onRepoAdded }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to add repository');
      }

      const data = await response.json();
      onRepoAdded(data.sessionId, repoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="repo-input">
      <div className="repo-input-card">
        <h2>Add Repository</h2>
        <p className="repo-input-description">
          Enter the URL of the repository you want to work with
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={loading}
            className="repo-input-field"
          />

          {error && <div className="repo-input-error">{error}</div>}

          <button type="submit" disabled={loading || !repoUrl} className="repo-input-button">
            {loading ? 'Adding...' : 'Start Planning'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RepoInput;
