import React, { useState, useRef, useEffect } from 'react';
import { TTSService, VOICE_OPTIONS, VoiceType, TTSOptions } from '../services/ttsService';
import '../styles/TextToSpeechPanel.css';

interface TextToSpeechPanelProps {
  defaultText?: string;
  onTextChange?: (text: string) => void;
}

export const TextToSpeechPanel: React.FC<TextToSpeechPanelProps> = ({ 
  defaultText = '', 
  onTextChange 
}) => {
  const [text, setText] = useState(defaultText);
  const [voice, setVoice] = useState<VoiceType>('banmai_north');
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (defaultText) {
      setText(defaultText);
    }
  }, [defaultText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange?.(newText);
    setError(null);
  };

  const handleSynthesize = async () => {
    setError(null);
    setSuccess(null);

    if (!text.trim()) {
      setError('Vui lòng nhập văn bản');
      return;
    }

    if (text.length > 5000) {
      setError('Văn bản không được vượt quá 5000 ký tự');
      return;
    }

    setLoading(true);

    try {
      const options: TTSOptions = {
        text,
        voice,
        speed,
      };

      const { url, error: ttsError } = await TTSService.synthesizeToUrl(options);

      if (ttsError) {
        setError(ttsError);
      } else if (url) {
        setAudioUrl(url);
        setSuccess('✓ Đã tạo âm thanh thành công');
        
        if (audioRef.current) {
          audioRef.current.src = url;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo âm thanh');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `audio-${Date.now()}.wav`;
      link.click();
    }
  };

  const charCount = text.length;
  const maxChars = 5000;

  return (
    <div className="tts-panel">
      <div className="tts-container">
        <h2>🎤 Text to Speech</h2>

        <div className="tts-section">
          <label>Văn bản cần chuyển đổi:</label>
          <textarea
            className="tts-textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="Nhập hoặc dán văn bản tại đây..."
            disabled={loading}
          />
          <div className="tts-char-count">
            {charCount} / {maxChars} ký tự
            {charCount > maxChars * 0.8 && charCount <= maxChars && (
              <span className="warning"> ⚠️ gần đến giới hạn</span>
            )}
            {charCount > maxChars && (
              <span className="error"> ❌ vượt giới hạn</span>
            )}
          </div>
        </div>

        <div className="tts-controls-grid">
          <div className="tts-section">
            <label>Giọng nói:</label>
            <select
              className="tts-select"
              value={voice}
              onChange={(e) => setVoice(e.target.value as VoiceType)}
              disabled={loading}
            >
              {Object.entries(VOICE_OPTIONS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="tts-section">
            <label>Tốc độ: {speed.toFixed(1)}x</label>
            <input
              type="range"
              className="tts-slider"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="tts-error">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="tts-success">
            {success}
          </div>
        )}

        {audioUrl && (
          <div className="tts-audio-section">
            <label>Âm thanh:</label>
            <audio ref={audioRef} controls className="tts-audio-player">
              <source src={audioUrl} type="audio/wav" />
              Trình duyệt của bạn không hỗ trợ phát âm thanh.
            </audio>
            <div className="tts-audio-buttons">
              <button
                onClick={handlePlay}
                className="btn btn-secondary"
                disabled={loading}
              >
                ▶️ Phát
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-secondary"
                disabled={loading}
              >
                ⬇️ Tải Xuống
              </button>
            </div>
          </div>
        )}

        <div className="tts-action-section">
          <button
            onClick={handleSynthesize}
            disabled={loading || !text.trim() || charCount > maxChars}
            className="btn btn-primary btn-lg"
          >
            {loading ? '⏳ Đang tạo...' : '🎵 Tạo Âm Thanh'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPanel;
