import React, { useState } from 'react';
import { TTSService } from '../services/tts';
import { STTService } from '../services/stt';

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
}

export const ProviderTest: React.FC = () => {
  const [ttsResult, setTtsResult] = useState<TestResult | null>(null);
  const [sttResult, setSttResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState({ tts: false, stt: false });

  const testTTS = async () => {
    setTesting(prev => ({ ...prev, tts: true }));
    setTtsResult(null);

    try {
      const provider = import.meta.env.VITE_TTS_PROVIDER || 'gemini';
      const testText = "Hello, this is a test of the text-to-speech service.";
      
      console.log('Testing TTS with provider:', provider);
      console.log('Available env vars:', {
        gemini: !!import.meta.env.VITE_GEMINI_API_KEY,
        googleCloud: !!import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
        openai: !!import.meta.env.VITE_OPENAI_API_KEY
      });

      const result = await TTSService.generateAudio(
        testText, 
        provider as 'gemini' | 'google-cloud' | 'openai' | 'web-speech'
      );

      setTtsResult({
        success: true,
        message: `TTS test successful with ${result.provider}`,
        details: `Audio URL generated, duration: ${result.duration}s, word timings: ${result.wordTimings?.length || 0}`
      });

      // Play the audio to test
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audio.play().catch(err => console.warn('Audio playback failed:', err));
      }

    } catch (error) {
      console.error('TTS test failed:', error);
      setTtsResult({
        success: false,
        message: 'TTS test failed',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setTesting(prev => ({ ...prev, tts: false }));
    }
  };

  const testSTT = async () => {
    setTesting(prev => ({ ...prev, stt: true }));
    setSttResult(null);

    try {
      const provider = import.meta.env.VITE_STT_PROVIDER || 'google-cloud';
      
      console.log('Testing STT with provider:', provider);
      console.log('STT supported:', STTService.isSTTSupported());

      if (!STTService.isSTTSupported()) {
        throw new Error('STT not supported - no API key or Web Speech API available');
      }

      // For testing, we'll create a simple audio blob
      // In a real scenario, this would be actual recorded audio
      const testAudio = await createTestAudioBlob();

      const result = await STTService.analyzeAudio(
        testAudio,
        provider as 'google-cloud' | 'web-speech'
      );

      setSttResult({
        success: true,
        message: `STT test successful with ${result.provider}`,
        details: `Transcript: "${result.transcript}", confidence: ${result.confidence}, word timings: ${result.wordTimings.length}`
      });

    } catch (error) {
      console.error('STT test failed:', error);
      setSttResult({
        success: false,
        message: 'STT test failed',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setTesting(prev => ({ ...prev, stt: false }));
    }
  };

  const createTestAudioBlob = async (): Promise<Blob> => {
    // Create a simple audio blob for testing
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate a simple tone
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / audioContext.sampleRate) * 0.1;
    }

    // Convert to WAV blob (simplified)
    const arrayBuffer = new ArrayBuffer(44 + data.length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + data.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, audioContext.sampleRate, true);
    view.setUint32(28, audioContext.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, data.length * 2, true);
    
    // Convert float32 to int16
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const getConfigStatus = () => {
    const config = {
      ttsProvider: import.meta.env.VITE_TTS_PROVIDER || 'not set',
      sttProvider: import.meta.env.VITE_STT_PROVIDER || 'not set',
      geminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
      googleCloudKey: !!import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
      openaiKey: !!import.meta.env.VITE_OPENAI_API_KEY,
    };

    return config;
  };

  const config = getConfigStatus();

  return (
    <div className="provider-test p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Provider 测试工具</h2>
      
      {/* Configuration Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">当前配置状态</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">TTS Provider:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${config.ttsProvider !== 'not set' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {config.ttsProvider}
            </span>
          </div>
          <div>
            <span className="font-medium">STT Provider:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${config.sttProvider !== 'not set' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {config.sttProvider}
            </span>
          </div>
          <div>
            <span className="font-medium">Gemini API:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${config.geminiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {config.geminiKey ? '已配置' : '未配置'}
            </span>
          </div>
          <div>
            <span className="font-medium">Google Cloud API:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${config.googleCloudKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {config.googleCloudKey ? '已配置' : '未配置'}
            </span>
          </div>
          <div>
            <span className="font-medium">OpenAI API:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${config.openaiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {config.openaiKey ? '已配置' : '未配置'}
            </span>
          </div>
        </div>
      </div>

      {/* TTS Test */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-700">TTS (文本转语音) 测试</h3>
          <button
            onClick={testTTS}
            disabled={testing.tts}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing.tts ? '测试中...' : '测试 TTS'}
          </button>
        </div>
        
        {ttsResult && (
          <div className={`p-3 rounded-lg ${ttsResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-medium ${ttsResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {ttsResult.message}
            </div>
            {ttsResult.details && (
              <div className={`text-sm mt-1 ${ttsResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {ttsResult.details}
              </div>
            )}
          </div>
        )}
      </div>

      {/* STT Test */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-700">STT (语音转文本) 测试</h3>
          <button
            onClick={testSTT}
            disabled={testing.stt}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing.stt ? '测试中...' : '测试 STT'}
          </button>
        </div>
        
        {sttResult && (
          <div className={`p-3 rounded-lg ${sttResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-medium ${sttResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {sttResult.message}
            </div>
            {sttResult.details && (
              <div className={`text-sm mt-1 ${sttResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {sttResult.details}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Information */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">配置说明</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Gemini TTS:</strong> 需要 VITE_GEMINI_API_KEY</p>
          <p>• <strong>Google Cloud STT:</strong> 需要 VITE_GOOGLE_CLOUD_API_KEY</p>
          <p>• <strong>注意:</strong> Google Cloud STT 在浏览器环境中使用 API Key 认证，不需要服务账号文件</p>
          <p>• <strong>备选方案:</strong> 如果 API 不可用，系统会自动回退到 Web Speech API</p>
        </div>
      </div>
    </div>
  );
};