// API Service for handling requests in development environment
import { 
  GenerateRhymeRequest, 
  GenerateRhymeResponse,
  GenerateAudioRequest,
  GenerateAudioResponse,
  AnalyzeSpeechRequest,
  AnalyzeSpeechResponse 
} from '../types';
import { mockApiResponses } from '../api';

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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { text } = request;
    
    // Generate word timings
    const words = text.split(/\s+/);
    const wordTimings = words.map((word, index) => ({
      word: word.replace(/[^\w]/g, ''),
      startTime: index * 0.6,
      endTime: (index + 1) * 0.6,
      index,
      confidence: 0.95,
    }));

    // Create a simple audio blob (silence)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = words.length * 0.6;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    
    // Create a simple tone for demonstration
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
    }

    // Convert to blob
    const audioBlob = new Blob([buffer], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      success: true,
      data: {
        audioUrl,
        wordTimings,
        provider: 'mock',
        duration,
      }
    };
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