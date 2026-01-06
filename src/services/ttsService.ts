// FPT.AI Text to Speech Service
const API_KEY = '0Lfd8k2Gi81BGcyP6JzqOcuHkK41';
const API_URL = 'https://api.fpt.ai/hmi/tts/v5';

export type VoiceType =
  | 'banmai_north'
  | 'leminh_south'
  | 'thuminh_north'
  | 'myan_central'
  | 'giahuy_central'
  | 'ngoclam_central'
  | 'minhquang_south'
  | 'linhsan_south';

export interface VoiceOption {
  label: string;
  apiValue: string;
}

export interface TTSOptions {
  text: string;
  voice?: VoiceType;
  speed?: number; // API expects -3 to 3, 0 = default
}

export const VOICE_OPTIONS: Record<VoiceType, VoiceOption> = {
  banmai_north: {
    label: 'Ban Mai (Nữ miền Bắc)',
    apiValue: 'banmai',
  },
  leminh_south: {
    label: 'Lê Minh (Nữ miền Nam)',
    apiValue: 'leminh',
  },
  thuminh_north: {
    label: 'Thu Minh (Nữ miền Bắc)',
    apiValue: 'thuminh',
  },
  myan_central: {
    label: 'Mỹ Ân (Nữ miền Trung)',
    apiValue: 'myan',
  },
  giahuy_central: {
    label: 'Gia Huy (Nam miền Trung)',
    apiValue: 'giahuy',
  },
  ngoclam_central: {
    label: 'Ngọc Lam (Nữ miền Trung)',
    apiValue: 'ngoclam',
  },
  minhquang_south: {
    label: 'Minh Quang (Nam miền Nam)',
    apiValue: 'minhquang',
  },
  linhsan_south: {
    label: 'Linh San (Nữ miền Nam)',
    apiValue: 'linhsan',
  },
};

const getVoiceCode = (voice: VoiceType): string => VOICE_OPTIONS[voice]?.apiValue || VOICE_OPTIONS.banmai_north.apiValue;

const clampSpeed = (speed: number): number => {
  if (Number.isNaN(speed)) return 0;
  if (speed > 3) return 3;
  if (speed < -3) return -3;
  return Math.round(speed);
};

export class TTSService {
  private static isLoading = false;

  static async synthesizeToUrl(options: TTSOptions): Promise<{ url: string; error: string | null }> {
    const { text, voice = 'banmai_north', speed = 0 } = options;

    if (!text || !text.trim()) {
      return { url: '', error: 'Vui lòng nhập văn bản cần chuyển đổi' };
    }

    if (text.length > 5000) {
      return { url: '', error: 'Văn bản vượt quá 5000 ký tự cho phép' };
    }

    try {
      this.isLoading = true;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'api-key': API_KEY,
          voice: getVoiceCode(voice),
          speed: clampSpeed(speed).toString(),
          'Content-Type': 'text/plain; charset=utf-8',
        },
        body: text,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ message: 'Không nhận được phản hồi hợp lệ' }));
        return {
          url: '',
          error: errorPayload?.message || `API trả về lỗi ${response.status}`,
        };
      }

      const payload = await response.json();
      if (payload.error !== 0 || !payload.async) {
        return {
          url: '',
          error: payload.message || 'Không nhận được đường dẫn âm thanh từ API',
        };
      }

      const audioResponse = await fetch(payload.async);
      if (!audioResponse.ok) {
        return {
          url: '',
          error: 'Không tải được tệp âm thanh từ máy chủ FPT.AI',
        };
      }

      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return { url: audioUrl, error: null };
    } catch (err: any) {
      return {
        url: '',
        error: err?.message || 'Không thể kết nối tới FPT.AI',
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
      throw new Error('Không tạo được âm thanh');
    }

    const audio = new Audio(url);
    await audio.play();
  }

  static getIsLoading(): boolean {
    return this.isLoading;
  }
}
