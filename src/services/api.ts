// API Service for handling requests in development environment
import { 
  GenerateRhymeRequest, 
  GenerateRhymeResponse,
  GenerateAudioRequest,
  GenerateAudioResponse,
  AnalyzeSpeechRequest,
  AnalyzeSpeechResponse 
} from '../types';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Mock implementations for development
class MockAPIService {
  static async generateRhyme(request: GenerateRhymeRequest): Promise<GenerateRhymeResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { elements } = request;
    
    // Generate a simple rhyme based on elements
    const rhymeTemplates = [
      `Little {0} loves to play,\n{1} dancing all the day,\nFriends together, having fun,\nIn the bright and shining sun!`,
      `{0} and {1} are best friends,\nTheir friendship never ends,\nPlaying games and having fun,\nUntil the day is done!`,
      `See the {0} run and play,\nWith the {1} every day,\nHappy sounds and joyful cheer,\nFilling hearts with love so dear!`,
      `{0} jumps up high,\n{1} reaches for the sky,\nTogether they make quite a team,\nLiving life like in a dream!`
    ];
    
    const template = rhymeTemplates[Math.floor(Math.random() * rhymeTemplates.length)];
    const content = template
      .replace('{0}', elements[0] || 'friend')
      .replace('{1}', elements[1] || 'buddy');
    
    return {
      success: true,
      data: {
        id: `rhyme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `A Rhyme About ${elements.slice(0, 2).join(' and ')}${elements.length > 2 ? ' and More' : ''}`,
        content,
        elements,
        createdAt: new Date().toISOString(),
        language: 'en',
        llmProvider: 'mock',
      }
    };
  }

  static async generateAudio(request: GenerateAudioRequest): Promise<GenerateAudioResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { text } = request;
    
    // Generate word timings
    const words = text.split(/\s+/).filter(word => word.trim().length > 0);
    const wordTimings = words.map((word, index) => ({
      word: word.replace(/[^\w]/g, ''),
      startTime: index * 0.7,
      endTime: (index + 1) * 0.7,
      index,
      confidence: 0.95,
    }));

    try {
      // Use Web Speech API for development environment
      if ('speechSynthesis' in window) {
        const audioUrl = await this.generateWebSpeechAudio(text);
        const duration = words.length * 0.7;

        return {
          success: true,
          data: {
            audioUrl,
            wordTimings,
            provider: 'web-speech-mock',
            duration,
          }
        };
      } else {
        // Fallback: Create a simple beep audio for browsers without Web Speech API
        const audioUrl = await this.generateBeepAudio(words.length * 0.7);
        
        return {
          success: true,
          data: {
            audioUrl,
            wordTimings,
            provider: 'beep-mock',
            duration: words.length * 0.7,
          }
        };
      }
    } catch (err) {
      console.error('Mock audio generation failed:', err);
      return {
        success: false,
        error: 'Failed to generate mock audio'
      };
    }
  }

  private static async generateWebSpeechAudio(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slower for children
        utterance.pitch = 1.2; // Higher pitch for child-friendly voice
        
        // Try to find a female voice for child-friendly experience
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('woman') ||
           voice.name.toLowerCase().includes('samantha') ||
           voice.name.toLowerCase().includes('karen'))
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        // Create a MediaRecorder to capture the speech
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };

            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(chunks, { type: 'audio/wav' });
              const audioUrl = URL.createObjectURL(audioBlob);
              stream.getTracks().forEach(track => track.stop());
              resolve(audioUrl);
            };

            utterance.onstart = () => {
              mediaRecorder.start();
            };

            utterance.onend = () => {
              setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop();
                }
              }, 500);
            };

            utterance.onerror = (error) => {
              console.error('Speech synthesis error:', error);
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
              stream.getTracks().forEach(track => track.stop());
              reject(error);
            };

            speechSynthesis.speak(utterance);
          })
          .catch(() => {
             console.warn('Microphone access denied, using direct speech synthesis');
             // Fallback: Just use speech synthesis without recording
             utterance.onend = () => {
               // Create a simple placeholder audio URL
               this.generateBeepAudio(3).then(resolve).catch(reject);
             };
             
             utterance.onerror = reject;
             speechSynthesis.speak(utterance);
           });
      } catch (error) {
        reject(error);
      }
    });
  }

  private static async generateBeepAudio(duration: number): Promise<string> {
     const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
     const audioContext = new AudioContextClass();
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate a pleasant tone sequence instead of a single beep
    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      // Create a melody-like sequence
      const frequency = 440 + Math.sin(time * 2) * 100; // Varying frequency
      data[i] = Math.sin(2 * Math.PI * frequency * time) * 0.1 * Math.exp(-time * 0.5);
    }

    // Convert AudioBuffer to WAV blob
    const wavBlob = this.audioBufferToWav(buffer);
    return URL.createObjectURL(wavBlob);
  }

  private static audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  static async analyzeSpeech(request: AnalyzeSpeechRequest): Promise<AnalyzeSpeechResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { originalText } = request;
    
    if (!originalText) {
      return {
        success: false,
        error: 'No original text provided for mock analysis'
      };
    }

    // Generate mock word timings
    const words = originalText.split(/\s+/);
    const wordTimings = words.map((word, index) => ({
      word: word.replace(/[^\w]/g, ''),
      startTime: index * 0.6,
      endTime: (index + 1) * 0.6,
      index,
      confidence: 0.9,
    }));

    return {
      success: true,
      data: {
        transcript: originalText,
        wordTimings,
        confidence: 0.9,
        provider: 'mock',
        originalText,
      }
    };
  }
}

// API Service
export class APIService {
  private static baseUrl = isDevelopment ? '' : '/api';

  static async generateRhyme(request: GenerateRhymeRequest): Promise<GenerateRhymeResponse> {
    if (isDevelopment) {
      // Use mock service in development
      return MockAPIService.generateRhyme(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/generate-rhyme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  static async generateAudio(request: GenerateAudioRequest): Promise<GenerateAudioResponse> {
    if (isDevelopment) {
      // Use mock service in development
      return MockAPIService.generateAudio(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  static async analyzeSpeech(
    audioBlob: Blob,
    originalText: string,
    sttProvider: 'google-cloud' | 'web-speech' = 'google-cloud',
    language: string = 'en'
  ): Promise<AnalyzeSpeechResponse> {
    if (isDevelopment) {
      // Use mock service in development
      return MockAPIService.analyzeSpeech({
        audioBlob,
        originalText,
        sttProvider,
        language,
      });
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('originalText', originalText);
      formData.append('sttProvider', sttProvider);
      formData.append('language', language);

      const response = await fetch(`${this.baseUrl}/analyze-speech`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  static async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Health check failed');
    } catch (error) {
      return {
        status: isDevelopment ? 'development' : 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}