import React, { useState } from 'react';
import { Toaster } from 'sonner';
import RhymeGenerator from './pages/RhymeGenerator';
import RhymeDisplay from './pages/RhymeDisplay';
import { ProviderTest } from './components/ProviderTest';

type AppState = 'generator' | 'display' | 'test';

export default function App() {
  const [currentView, setCurrentView] = useState<AppState>('generator');
  const [currentRhymeId, setCurrentRhymeId] = useState<string | null>(null);

  const handleRhymeGenerated = (rhymeId: string) => {
    setCurrentRhymeId(rhymeId);
    setCurrentView('display');
  };

  const handleBackToGenerator = () => {
    setCurrentView('generator');
    setCurrentRhymeId(null);
  };

  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen">
      {/* Development Test Button */}
      {isDevelopment && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setCurrentView(currentView === 'test' ? 'generator' : 'test')}
            className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 shadow-lg"
          >
            {currentView === 'test' ? '返回应用' : 'Provider 测试'}
          </button>
        </div>
      )}

      {currentView === 'generator' && (
        <RhymeGenerator onRhymeGenerated={handleRhymeGenerated} />
      )}
      
      {currentView === 'display' && currentRhymeId && (
        <RhymeDisplay 
          rhymeId={currentRhymeId} 
          onBack={handleBackToGenerator} 
        />
      )}

      {currentView === 'test' && (
        <div className="min-h-screen bg-gray-100 py-8">
          <ProviderTest />
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            borderRadius: '16px',
            fontSize: '16px',
            fontFamily: 'Comic Sans MS, cursive',
          },
        }}
      />
    </div>
  );
}
