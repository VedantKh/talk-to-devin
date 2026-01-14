import { useState, useRef, useEffect } from 'react';
import './VoiceInterface.css';

interface VoiceInterfaceProps {
  sessionId: string;
  repoUrl: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function VoiceInterface({ sessionId, repoUrl }: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('sessionId', sessionId);

      const response = await fetch('http://localhost:3001/api/voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();

      // Add both user transcript and AI response to messages
      setMessages(prev => [
        ...prev,
        { role: 'user', content: data.transcript },
        { role: 'assistant', content: data.response },
      ]);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="voice-interface">
      <div className="voice-interface-header">
        <div className="repo-info">
          <span className="repo-label">Repository:</span>
          <span className="repo-url">{repoUrl}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && !isRecording && !isProcessing && (
          <div className="empty-state">
            <p>Click the microphone to start planning</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-role">{message.role === 'user' ? 'You' : 'AI'}</div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}

        {isRecording && (
          <div className="message user recording">
            <div className="message-role">You</div>
            <div className="message-content">Recording... 🎤</div>
          </div>
        )}

        {isProcessing && (
          <div className="message assistant processing">
            <div className="message-role">AI</div>
            <div className="message-content">Transcribing and thinking...</div>
          </div>
        )}
      </div>

      <div className="voice-controls">
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          <div className="record-icon">
            {isRecording ? '⏹' : '🎤'}
          </div>
          <div className="record-label">
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </div>
        </button>
      </div>
    </div>
  );
}

export default VoiceInterface;
