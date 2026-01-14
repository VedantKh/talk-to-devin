import { useState } from 'react';
import RepoInput from './components/RepoInput';
import VoiceInterface from './components/VoiceInterface';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>('');

  const handleRepoAdded = (newSessionId: string, url: string) => {
    setSessionId(newSessionId);
    setRepoUrl(url);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Talk to Devin</h1>
        <p>Voice-based planning with DeepWiki context</p>
      </header>

      <main className="app-main">
        {!sessionId ? (
          <RepoInput onRepoAdded={handleRepoAdded} />
        ) : (
          <VoiceInterface sessionId={sessionId} repoUrl={repoUrl} />
        )}
      </main>
    </div>
  );
}

export default App;
