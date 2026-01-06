// FPT.AI Text to Speech Service
const API_KEY = '0Lfd8k2Gi81BGcyP6JzqOcuHkK41';
const API_URL = 'https://api.fpt.ai/hml/tts/v5';

export type VoiceType = 'leminh_north' | 'banmai_north' | 'thuminh_south' | 'myan_central' | 'giaHuy' | 'ngoclam_central' | 'minhQuang_south' | 'linh_south';

export interface TTSOptions {
  text: string;
  voice?: VoiceType;
  speed?: number;
}

export const VOICE_OPTIONS: Record<VoiceType, string> = {
  'leminh_north': 'Lê Minh (Nữ miền Nam)',
  'banmai_north': 'Bán Mai (Nữ miền Bắc)',
  'thuminh_south': 'Thu Minh (Nữ miền Bắc)',
  'myan_central': 'Mỹ Ân (Nữ miền Trung)',
  'giaHuy': 'Gia Huy (Nam miền Trung)',
  'ngoclam_central': 'Ngọc Lam (Nữ miền Trung)',
  'minhQuang_south': 'Minh Quang (Nam miền Nam)',
  'linh_south': 'Lình San Ace (Nữ miền Nam)',
};

export class TTSService {
  private static isLoading = false;

  static async synthesizeToUrl(options: TTSOptions): Promise<{ url: string; error: any }> {
    const { text, voice = 'banmai_north', speed = 1.0 } = options;

    if (!text || text.trim() === '') {
      return { url: '', error: 'Text cannot be empty' };
    }

    if (text.length > 5000) {
      return { url: '', error: 'Text exceeds 5000 characters limit' };
    }

    try {
      this.isLoading = true;

      const payload = {
        text,
        voice,
        speed,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          url: '', 
          error: error.message || `API Error: ${response.status}` 
        };
      }

      // Response is audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return { url: audioUrl, error: null };
    } catch (err: any) {
      return { 
        url: '', 
        error: err.message || 'Failed to synthesize speech' 
      };
    } finally {
      this.isLoading = false;
    }
  }

  static async synthesizeAndPlay(options: TTSOptions): Promise<void> {
    const { url, error } = await this.synthesizeToUrl(options);

    if (error) {
      throw new Error(error);
    }

    if (!url) {
      throw new Error('Failed to generate audio');
    }

    const audio = new Audio(url);
    await audio.play();
  }

  static getIsLoading(): boolean {
    return this.isLoading;
  }
}
