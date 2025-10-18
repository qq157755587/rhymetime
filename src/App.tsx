import React, { useState } from 'react';
import { Toaster } from 'sonner';
import RhymeGenerator from './pages/RhymeGenerator';
import RhymeDisplay from './pages/RhymeDisplay';

type AppState = 'generator' | 'display';

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

  return (
    <div className="min-h-screen">
      {currentView === 'generator' && (
        <RhymeGenerator onRhymeGenerated={handleRhymeGenerated} />
      )}
      
      {currentView === 'display' && currentRhymeId && (
        <RhymeDisplay 
          rhymeId={currentRhymeId} 
          onBack={handleBackToGenerator} 
        />
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
