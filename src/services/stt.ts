import { WordTiming } from '../types';

export interface STTResult {
  transcript: string;
  wordTimings: WordTiming[];
  confidence: number;
  provider: string;
}

export interface STTOptions {
  language?: string;
  enableWordTimeOffset?: boolean;
  enableAutomaticPunctuation?: boolean;
}

// STT Service for word timing analysis
export class STTService {
  private static async callGoogleCloudSTT(audioBlob: Blob, options: STTOptions = {}): Promise<STTResult> {
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('Google Cloud API key not configured');
    }

    // Convert audio blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS', // or 'MP3', 'WAV' depending on audio format
          sampleRateHertz: 48000,
          languageCode: options.language || 'en-US',
          enableWordTimeOffsets: options.enableWordTimeOffset !== false,
          enableAutomaticPunctuation: options.enableAutomaticPunctuation !== false,
          model: 'latest_long', // Best for longer audio
        },
        audio: {
          content: base64Audio,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Google Cloud STT error');
    }

    const result = data.results?.[0];
    if (!result) {
      throw new Error('No speech recognition results');
    }

    const alternative = result.alternatives?.[0];
    if (!alternative) {
      throw new Error('No speech recognition alternatives');
    }

    const transcript = alternative.transcript || '';
    const confidence = alternative.confidence || 0;

    // Extract word timings
    const wordTimings: WordTiming[] = (alternative.words || []).map((wordInfo: any, index: number) => ({
      word: wordInfo.word,
      startTime: parseFloat(wordInfo.startTime?.replace('s', '') || '0'),
      endTime: parseFloat(wordInfo.endTime?.replace('s', '') || '0'),
      index,
      confidence: wordInfo.confidence || confidence,
    }));

    return {
      transcript,
      wordTimings,
      confidence,
      provider: 'google-cloud',
    };
  }

  private static async callWebSpeechSTT(
    audioBlob: Blob,
    options: STTOptions = {}
  ): Promise<STTResult> {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = options.language || 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;

      // Create audio element to play the blob
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0.8;

        // Generate approximate word timings based on audio duration
        const words = transcript.split(/\s+/);
        const audioDuration = audio.duration || words.length * 0.6;
        const timePerWord = audioDuration / words.length;

        const wordTimings: WordTiming[] = words.map((word, index) => ({
          word: word.replace(/[^\w]/g, ''),
          startTime: index * timePerWord,
          endTime: (index + 1) * timePerWord,
          index,
          confidence,
        }));

        resolve({
          transcript,
          wordTimings,
          confidence,
          provider: 'web-speech',
        });
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        // If no results were captured, reject
        setTimeout(() => {
          reject(new Error('Speech recognition ended without results'));
        }, 1000);
      };

      // Start recognition
      recognition.start();

      // Play audio to trigger recognition
      audio.play().catch(reject);
    });
  }

  public static async analyzeAudio(
    audioBlob: Blob,
    provider: 'google-cloud' | 'web-speech' = 'google-cloud',
    options: STTOptions = {}
  ): Promise<STTResult> {
    const providers = [provider, 'google-cloud', 'web-speech']
      .filter((p, i, arr) => arr.indexOf(p) === i);

    let lastError: Error | null = null;

    for (const currentProvider of providers) {
      try {
        console.log(`Trying ${currentProvider} for STT...`);
        
        switch (currentProvider) {
          case 'google-cloud':
            return await this.callGoogleCloudSTT(audioBlob, options);
          case 'web-speech':
            return await this.callWebSpeechSTT(audioBlob, options);
          default:
            throw new Error(`Unknown STT provider: ${currentProvider}`);
        }
      } catch (error) {
        console.error(`${currentProvider} STT failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is the last provider, throw the error
        if (currentProvider === providers[providers.length - 1]) {
          break;
        }
        
        // Continue to next provider
        continue;
      }
    }

    throw lastError || new Error('All STT providers failed');
  }

  public static async analyzeTextForTimings(
    text: string,
    audioDuration: number
  ): Promise<WordTiming[]> {
    // Fallback method: generate approximate word timings based on text and duration
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const timePerWord = audioDuration / words.length;

    return words.map((word, index) => ({
      word: word.replace(/[^\w]/g, ''),
      startTime: index * timePerWord,
      endTime: (index + 1) * timePerWord,
      index,
      confidence: 0.7, // Lower confidence for estimated timings
    }));
  }

  public static isSTTSupported(): boolean {
    return (
      // Check for Google Cloud API key
      !!import.meta.env.VITE_GOOGLE_CLOUD_API_KEY ||
      // Check for Web Speech API
      ('webkitSpeechRecognition' in window) ||
      ('SpeechRecognition' in window)
    );
  }
}