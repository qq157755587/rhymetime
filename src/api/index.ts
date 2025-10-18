// API Router for development environment
// This handles API routes in the Vite dev server

import { generateRhymeHandler } from './generate-rhyme';
import { generateAudioHandler } from './generate-audio';
import { analyzeSpeechHandler } from './analyze-speech';

// Simple API router
export async function handleApiRequest(path: string, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;

  try {
    switch (path) {
      case '/api/generate-rhyme':
        if (method === 'POST') {
          const body = await request.json();
          const result = await generateRhymeHandler(body);
          return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
            status: result.success ? 200 : 500,
          });
        }
        break;

      case '/api/generate-audio':
        if (method === 'POST') {
          const body = await request.json();
          const result = await generateAudioHandler(body);
          return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
            status: result.success ? 200 : 500,
          });
        }
        break;

      case '/api/analyze-speech':
        if (method === 'POST') {
          const formData = await request.formData();
          const audioFile = formData.get('audio') as File;
          const originalText = formData.get('originalText') as string;
          const sttProvider = formData.get('sttProvider') as string;
          const language = formData.get('language') as string;

          if (audioFile) {
            const audioBlob = new Blob([await audioFile.arrayBuffer()], { 
              type: audioFile.type 
            });

            const result = await analyzeSpeechHandler({
              audioBlob,
              originalText,
              sttProvider: sttProvider as 'google-cloud' | 'web-speech',
              language,
            });

            return new Response(JSON.stringify(result), {
              headers: { 'Content-Type': 'application/json' },
              status: result.success ? 200 : 500,
            });
          }
        }
        break;

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'API endpoint not found'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404,
        });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

// Mock API for development when no backend is available
export const mockApiResponses = {
  '/api/generate-rhyme': {
    success: true,
    data: {
      id: `rhyme_${Date.now()}_mock`,
      title: 'A Rhyme About Cats and Dogs',
      content: `Little kitty loves to play,\nPuppy dancing all the day,\nFriends together, having fun,\nIn the bright and shining sun!`,
      elements: ['cat', 'dog'],
      createdAt: new Date().toISOString(),
      language: 'en',
      llmProvider: 'mock',
    }
  },
  '/api/generate-audio': {
    success: true,
    data: {
      audioUrl: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      wordTimings: [
        { word: 'Little', startTime: 0, endTime: 0.6, confidence: 0.95 },
        { word: 'kitty', startTime: 0.6, endTime: 1.2, confidence: 0.95 },
        { word: 'loves', startTime: 1.2, endTime: 1.8, confidence: 0.95 },
        { word: 'to', startTime: 1.8, endTime: 2.1, confidence: 0.95 },
        { word: 'play', startTime: 2.1, endTime: 2.7, confidence: 0.95 },
      ],
      provider: 'mock',
      duration: 8.5,
    }
  }
};