import { GenerateAudioRequest, GenerateAudioResponse } from '../types';
import { TTSService, TTSOptions } from '../services/tts';

// Map API provider names to TTS service provider names
function mapTTSProvider(provider: string): 'gemini' | 'google-cloud' | 'openai' | 'web-speech' {
  switch (provider) {
    case 'google':
      return 'google-cloud';
    case 'web':
      return 'web-speech';
    case 'gemini':
    case 'openai':
      return provider as 'gemini' | 'openai';
    default:
      return 'gemini'; // Default fallback
  }
}

// API Handler
export async function POST(request: Request): Promise<Response> {
  try {
    const body: GenerateAudioRequest = await request.json();
    const { 
      text, 
      ttsProvider = 'gemini', 
      language = 'en',
      voice = 'child-friendly',
      speed = 0.9,
      pitch = 1.2
    } = body;

    if (!text || text.trim().length === 0) {
      return Response.json({
        success: false,
        error: 'No text provided'
      } as GenerateAudioResponse, { status: 400 });
    }

    if (language !== 'en') {
      return Response.json({
        success: false,
        error: 'Only English language is supported'
      } as GenerateAudioResponse, { status: 400 });
    }

    // Prepare TTS options
    const options: TTSOptions = {
      voice,
      speed,
      pitch,
      language: 'en-US',
    };

    // Map and generate audio using TTS service with fallback strategy
    const mappedProvider = mapTTSProvider(ttsProvider);
    const result = await TTSService.generateAudio(text, mappedProvider, options);

    return Response.json({
      success: true,
      data: {
        audioUrl: result.audioUrl,
        wordTimings: result.wordTimings || [],
        provider: result.provider,
        duration: result.duration,
      }
    } as GenerateAudioResponse);

  } catch (error) {
    console.error('Error generating audio:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate audio'
    } as GenerateAudioResponse, { status: 500 });
  }
}

// For development/testing - can be called directly
export async function generateAudioHandler(request: GenerateAudioRequest): Promise<GenerateAudioResponse> {
  try {
    const { 
      text, 
      ttsProvider = 'gemini', 
      language = 'en',
      voice = 'child-friendly',
      speed = 0.9,
      pitch = 1.2
    } = request;

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'No text provided'
      };
    }

    if (language !== 'en') {
      return {
        success: false,
        error: 'Only English language is supported'
      };
    }

    const options: TTSOptions = {
      voice,
      speed,
      pitch,
      language: 'en-US',
    };

    const mappedProvider = mapTTSProvider(ttsProvider);
    const result = await TTSService.generateAudio(text, mappedProvider, options);

    return {
      success: true,
      data: {
        audioUrl: result.audioUrl,
        wordTimings: result.wordTimings || [],
        provider: result.provider,
        duration: result.duration,
      }
    };

  } catch (error) {
    console.error('Error generating audio:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate audio'
    };
  }
}

// Get available voices for a provider
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider') || 'google-cloud';

    const voices = await TTSService.getAvailableVoices(provider);

    return Response.json({
      success: true,
      data: {
        provider,
        voices,
      }
    });

  } catch (error) {
    console.error('Error getting voices:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get voices'
    }, { status: 500 });
  }
}