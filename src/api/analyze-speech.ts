import { AnalyzeSpeechRequest, AnalyzeSpeechResponse } from '../types';
import { STTService, STTOptions } from '../services/stt';

// API Handler
export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const originalText = formData.get('originalText') as string;
    const sttProvider = (formData.get('sttProvider') as string) || 'google-cloud';
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return Response.json({
        success: false,
        error: 'No audio file provided'
      } as AnalyzeSpeechResponse, { status: 400 });
    }

    if (language !== 'en') {
      return Response.json({
        success: false,
        error: 'Only English language is supported'
      } as AnalyzeSpeechResponse, { status: 400 });
    }

    // Convert file to blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { 
      type: audioFile.type 
    });

    // Prepare STT options
    const options: STTOptions = {
      language: 'en-US',
      enableWordTimeOffset: true,
      enableAutomaticPunctuation: true,
    };

    try {
      // Analyze audio using STT service
      const result = await STTService.analyzeAudio(
        audioBlob, 
        sttProvider as 'google-cloud' | 'web-speech', 
        options
      );

      return Response.json({
        success: true,
        data: {
          transcript: result.transcript,
          wordTimings: result.wordTimings,
          confidence: result.confidence,
          provider: result.provider,
          originalText,
        }
      } as AnalyzeSpeechResponse);

    } catch (sttError) {
      console.warn('STT analysis failed, falling back to estimated timings:', sttError);
      
      // Fallback: generate estimated word timings
      if (originalText) {
        // Estimate audio duration (rough calculation)
        const estimatedDuration = originalText.split(/\s+/).length * 0.6;
        const wordTimings = await STTService.analyzeTextForTimings(originalText, estimatedDuration);

        return Response.json({
          success: true,
          data: {
            transcript: originalText,
            wordTimings,
            confidence: 0.7,
            provider: 'estimated',
            originalText,
          }
        } as AnalyzeSpeechResponse);
      }

      throw sttError;
    }

  } catch (error) {
    console.error('Error analyzing speech:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze speech'
    } as AnalyzeSpeechResponse, { status: 500 });
  }
}

// For development/testing - can be called directly
export async function analyzeSpeechHandler(request: AnalyzeSpeechRequest): Promise<AnalyzeSpeechResponse> {
  try {
    const { 
      audioBlob, 
      originalText, 
      sttProvider = 'google-cloud', 
      language = 'en' 
    } = request;

    if (!audioBlob) {
      return {
        success: false,
        error: 'No audio blob provided'
      };
    }

    if (language !== 'en') {
      return {
        success: false,
        error: 'Only English language is supported'
      };
    }

    const options: STTOptions = {
      language: 'en-US',
      enableWordTimeOffset: true,
      enableAutomaticPunctuation: true,
    };

    try {
      const result = await STTService.analyzeAudio(audioBlob, sttProvider, options);

      return {
        success: true,
        data: {
          transcript: result.transcript,
          wordTimings: result.wordTimings,
          confidence: result.confidence,
          provider: result.provider,
          originalText,
        }
      };

    } catch (sttError) {
      console.warn('STT analysis failed, falling back to estimated timings:', sttError);
      
      if (originalText) {
        const estimatedDuration = originalText.split(/\s+/).length * 0.6;
        const wordTimings = await STTService.analyzeTextForTimings(originalText, estimatedDuration);

        return {
          success: true,
          data: {
            transcript: originalText,
            wordTimings,
            confidence: 0.7,
            provider: 'estimated',
            originalText,
          }
        };
      }

      throw sttError;
    }

  } catch (error) {
    console.error('Error analyzing speech:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze speech'
    };
  }
}

// Check STT service availability
export async function GET(request: Request): Promise<Response> {
  try {
    const isSupported = STTService.isSTTSupported();
    
    return Response.json({
      success: true,
      data: {
        supported: isSupported,
        providers: isSupported ? ['google-cloud', 'web-speech'] : [],
        message: isSupported 
          ? 'STT services are available' 
          : 'No STT services configured. Please set up Google Cloud API key or use a browser with Web Speech API support.'
      }
    });

  } catch (error) {
    console.error('Error checking STT availability:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check STT availability'
    }, { status: 500 });
  }
}