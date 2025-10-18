import { WordTiming } from '../types';

export interface TTSResult {
  audioUrl: string;
  wordTimings?: WordTiming[];
  provider: string;
  duration?: number;
}

export interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  language?: string;
}

// TTS Service Factory with intelligent fallback strategy
export class TTSService {
  private static async callGeminiTTS(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Note: Gemini 2.5 Flash TTS is still in development
    // For now, we'll simulate the API call structure
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-tts:generateAudio?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: options.voice || 'child-friendly',
        language: options.language || 'en-US',
        speed: options.speed || 1.0,
        pitch: options.pitch || 0,
        includeWordTimings: true,
      }),
    });

    if (!response.ok) {
      // If Gemini TTS is not available, throw error to trigger fallback
      throw new Error('Gemini TTS not available');
    }

    const data = await response.json();
    
    return {
      audioUrl: data.audioUrl,
      wordTimings: data.wordTimings,
      provider: 'gemini',
      duration: data.duration,
    };
  }

  private static async callGoogleCloudTTS(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('Google Cloud API key not configured');
    }

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: options.language || 'en-US',
          name: options.voice || 'en-US-Standard-H', // Child-friendly voice
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.speed || 0.9, // Slightly slower for children
          pitch: options.pitch || 2.0, // Higher pitch for child-friendly voice
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Google Cloud TTS error');
    }

    // Convert base64 audio to blob URL
    const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], {
      type: 'audio/mp3'
    });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Generate word timings (simplified - in real implementation, use Speech-to-Text for accurate timings)
    const words = text.split(/\s+/);
    const estimatedDuration = words.length * 0.6; // Rough estimate: 0.6 seconds per word
    const wordTimings: WordTiming[] = words.map((word, index) => ({
      word: word.replace(/[^\w]/g, ''),
      startTime: index * 0.6,
      endTime: (index + 1) * 0.6,
      index,
      confidence: 0.95,
    }));

    return {
      audioUrl,
      wordTimings,
      provider: 'google-cloud',
      duration: estimatedDuration,
    };
  }

  private static async callOpenAITTS(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: options.voice || 'nova', // Child-friendly voice
        speed: options.speed || 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI TTS error');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Generate word timings (simplified)
    const words = text.split(/\s+/);
    const estimatedDuration = words.length * 0.6;
    const wordTimings: WordTiming[] = words.map((word, index) => ({
      word: word.replace(/[^\w]/g, ''),
      startTime: index * 0.6,
      endTime: (index + 1) * 0.6,
      index,
      confidence: 0.9,
    }));

    return {
      audioUrl,
      wordTimings,
      provider: 'openai',
      duration: estimatedDuration,
    };
  }

  private static async callWebSpeechTTS(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language || 'en-US';
      utterance.rate = options.speed || 0.8;
      utterance.pitch = options.pitch || 1.2;

      // Try to find a child-friendly voice
      const voices = speechSynthesis.getVoices();
      const childVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Female') || voice.name.includes('Woman'))
      );
      
      if (childVoice) {
        utterance.voice = childVoice;
      }

      // Record audio using MediaRecorder (simplified approach)
      const chunks: BlobPart[] = [];
      let mediaRecorder: MediaRecorder;

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorder = new MediaRecorder(stream);
          
          mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Generate word timings
            const words = text.split(/\s+/);
            const estimatedDuration = words.length * 0.7;
            const wordTimings: WordTiming[] = this.generateSimpleWordTimings(text, estimatedDuration);

            resolve({
              audioUrl,
              wordTimings,
              provider: 'web-speech',
              duration: estimatedDuration,
            });
          };

          utterance.onstart = () => {
            mediaRecorder.start();
          };

          utterance.onend = () => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
          };

          utterance.onerror = (event) => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
            reject(new Error(`Speech synthesis error: ${event.error}`));
          };

          speechSynthesis.speak(utterance);
        })
        .catch(reject);
    });
  }

  public static async generateAudio(
    text: string,
    provider: 'gemini' | 'google-cloud' | 'openai' | 'web-speech' = 'gemini',
    options: TTSOptions = {}
  ): Promise<TTSResult> {
    // Define fallback order: Gemini → Google Cloud → OpenAI → Web Speech
    const providers = [provider, 'gemini', 'google-cloud', 'openai', 'web-speech']
      .filter((p, i, arr) => arr.indexOf(p) === i);

    let lastError: Error | null = null;

    for (const currentProvider of providers) {
      try {
        console.log(`Trying ${currentProvider} for TTS...`);
        
        switch (currentProvider) {
          case 'gemini':
            return await this.callGeminiTTS(text, options);
          case 'google-cloud':
            return await this.callGoogleCloudTTS(text, options);
          case 'openai':
            return await this.callOpenAITTS(text, options);
          case 'web-speech':
            return await this.callWebSpeechTTS(text, options);
          default:
            throw new Error(`Unknown TTS provider: ${currentProvider}`);
        }
      } catch (error) {
        console.error(`${currentProvider} TTS failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is the last provider, throw the error
        if (currentProvider === providers[providers.length - 1]) {
          break;
        }
        
        // Continue to next provider
        continue;
      }
    }

    throw lastError || new Error('All TTS providers failed');
  }

  public static async getAvailableVoices(provider: string): Promise<string[]> {
    switch (provider) {
      case 'google-cloud':
        return [
          'en-US-Standard-H', // Child-friendly female
          'en-US-Standard-F', // Female
          'en-US-Wavenet-H',  // High quality female
          'en-US-Wavenet-F',  // High quality female
        ];
      case 'openai':
        return ['nova', 'shimmer', 'echo', 'fable', 'onyx', 'alloy'];
      case 'web-speech':
        if ('speechSynthesis' in window) {
          return speechSynthesis.getVoices()
            .filter(voice => voice.lang.startsWith('en'))
            .map(voice => voice.name);
        }
        return [];
      default:
        return [];
    }
  }

  private static generateSimpleWordTimings(text: string, duration: number): WordTiming[] {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const avgWordDuration = duration / words.length;
    
    return words.map((word, index) => ({
      word: word.replace(/[^\w]/g, ''),
      startTime: index * avgWordDuration,
      endTime: (index + 1) * avgWordDuration,
      index,
      confidence: 0.8
    }));
  }
}