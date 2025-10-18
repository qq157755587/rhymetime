import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Heart, Share2, Download, ArrowLeft, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

import { RhymeData, WordTiming, GenerateAudioRequest, FavoriteRhyme } from '../types';
import { RhymeStorage } from '../services/storage';
import { APIService } from '../services/api';

interface RhymeDisplayProps {
  rhymeId: string;
  onBack: () => void;
}

const RhymeDisplay: React.FC<RhymeDisplayProps> = ({ rhymeId, onBack }) => {
  const [rhymeData, setRhymeData] = useState<RhymeData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeUpdateRef = useRef<number>();

  useEffect(() => {
    // Load rhyme data
    const history = RhymeStorage.getHistory();
    const rhyme = history.find(r => r.id === rhymeId);
    
    if (rhyme) {
      setRhymeData(rhyme);
      
      // Check if it's favorited
      const favorites = RhymeStorage.getFavorites();
      setIsFavorite(favorites.some(f => f.id === rhymeId));
      
      // Generate audio if not exists
      if (!rhyme.audioUrl) {
        generateAudio(rhyme);
      } else {
        setAudioUrl(rhyme.audioUrl);
      }
    }
  }, [rhymeId]);

  const generateAudio = async (rhyme: RhymeData) => {
    setIsGeneratingAudio(true);
    
    try {
      const request: GenerateAudioRequest = {
        text: rhyme.content,
        ttsProvider: 'gemini', // Default to Gemini 2.5 Flash TTS
        language: 'en',
        voice: 'child-friendly'
      };

      const result = await APIService.generateAudio(request);

      if (result.success && result.data) {
        setAudioUrl(result.data.audioUrl);
        
        // Update rhyme data with audio info
        const updatedRhyme = {
          ...rhyme,
          audioUrl: result.data.audioUrl,
          wordTimings: result.data.wordTimings,
        };
        
        setRhymeData(updatedRhyme);
        
        // Update in storage
        RhymeStorage.updateRhymeInHistory(rhymeId, updatedRhyme);
        
        toast.success('Audio generated successfully!', {
          icon: '🎵',
          duration: 3000,
        });
      } else {
        throw new Error(result.error || 'Failed to generate audio');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Sorry, we couldn\'t create the audio. Please try again!', {
        icon: '😔',
        duration: 4000,
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      startWordTracking();
    }
  };

  const startWordTracking = () => {
    if (!audioRef.current || !rhymeData?.wordTimings) return;

    timeUpdateRef.current = window.setInterval(() => {
      if (!audioRef.current || !rhymeData.wordTimings) return;

      const currentTime = audioRef.current.currentTime;
      const currentWord = rhymeData.wordTimings.findIndex(
        (timing) => currentTime >= timing.startTime && currentTime <= timing.endTime
      );

      setCurrentWordIndex(currentWord);
    }, 100);
  };

  const handleWordClick = (wordIndex: number) => {
    if (!audioRef.current || !rhymeData?.wordTimings) return;

    const wordTiming = rhymeData.wordTimings[wordIndex];
    if (wordTiming) {
      audioRef.current.currentTime = wordTiming.startTime;
      setCurrentWordIndex(wordIndex);
      
      if (!isPlaying) {
        handlePlayPause();
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    if (timeUpdateRef.current) {
      clearInterval(timeUpdateRef.current);
    }
  };

  const handleFavorite = () => {
    if (!rhymeData) return;
    
    if (isFavorite) {
      RhymeStorage.removeFavorite(rhymeData.id);
      toast.success('Removed from favorites!');
    } else {
      const favoriteRhyme: FavoriteRhyme = {
        ...rhymeData,
        favoritedAt: new Date().toISOString()
      };
      RhymeStorage.addFavorite(favoriteRhyme);
      toast.success('Added to favorites!');
    }
    setIsFavorite(!isFavorite);
  };

  const shareRhyme = async () => {
    if (!rhymeData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: rhymeData.title,
          text: rhymeData.content,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(rhymeData.content);
      toast.success('Rhyme copied to clipboard!', {
        icon: '📋',
        duration: 2000,
      });
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${rhymeData?.title || 'rhyme'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Audio download started!', {
      icon: '⬇️',
      duration: 2000,
    });
  };

  if (!rhymeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-child-blue via-child-lavender to-child-pink flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-2xl font-bold font-child mb-4">Rhyme not found</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-primary-orange text-white rounded-child font-bold hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-child-blue via-child-lavender to-child-pink p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-child hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-child">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleFavorite}
              className={`p-3 rounded-child transition-colors ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              onClick={shareRhyme}
              className="p-3 bg-white/20 text-white rounded-child hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>

            {audioUrl && (
              <motion.button
                onClick={downloadAudio}
                className="p-3 bg-white/20 text-white rounded-child hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Rhyme Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-child p-8 mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6 font-child">
            {rhymeData.title}
          </h1>

          {/* Interactive Text */}
          <div className="text-xl md:text-2xl leading-relaxed text-white font-child text-center space-y-4">
            {rhymeData.content.split('\n').map((line, lineIndex) => (
              <div key={lineIndex} className="flex flex-wrap justify-center gap-2">
                {line.split(/\s+/).map((word, wordIndex) => {
                  const globalWordIndex = rhymeData.content
                    .split('\n')
                    .slice(0, lineIndex)
                    .join(' ')
                    .split(/\s+/)
                    .filter(w => w.length > 0).length + wordIndex;

                  const isCurrentWord = currentWordIndex === globalWordIndex;
                  const hasWordTiming = rhymeData.wordTimings && rhymeData.wordTimings[globalWordIndex];

                  return (
                    <motion.span
                      key={`${lineIndex}-${wordIndex}`}
                      className={`
                        cursor-pointer px-2 py-1 rounded-child transition-all duration-300
                        ${isCurrentWord
                          ? 'bg-secondary-yellow text-gray-800 scale-110 shadow-lg'
                          : hasWordTiming
                          ? 'hover:bg-white/20 hover:scale-105'
                          : 'opacity-80'
                        }
                      `}
                      onClick={() => hasWordTiming && handleWordClick(globalWordIndex)}
                      whileHover={hasWordTiming ? { scale: 1.05 } : {}}
                      whileTap={hasWordTiming ? { scale: 0.95 } : {}}
                      animate={isCurrentWord ? {
                        scale: [1, 1.1, 1],
                        transition: { duration: 0.5 }
                      } : {}}
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Audio Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {isGeneratingAudio ? (
            <div className="flex items-center justify-center gap-3 text-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Volume2 className="w-8 h-8" />
              </motion.div>
              <span className="text-xl font-child">Creating audio magic...</span>
            </div>
          ) : audioUrl ? (
            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={handlePlayPause}
                className="flex items-center gap-3 px-8 py-4 bg-primary-orange text-white rounded-child text-xl font-bold shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Play Rhyme
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setCurrentWordIndex(-1);
                  }
                }}
                className="p-3 bg-white/20 text-white rounded-child hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => generateAudio(rhymeData)}
              className="px-8 py-4 bg-primary-orange text-white rounded-child text-xl font-bold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Volume2 className="w-6 h-6 inline mr-2" />
              Generate Audio
            </motion.button>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-child p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 font-child">
              How to Learn
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/90">
              <div className="text-center">
                <div className="text-2xl mb-2">🎵</div>
                <p className="font-child">Click play to hear the rhyme</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">👆</div>
                <p className="font-child">Click any word to hear it again</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            onLoadStart={() => console.log('Audio loading started')}
            onCanPlay={() => console.log('Audio can play')}
            onError={(e) => {
              console.error('Audio error:', e);
              toast.error('Audio playback error', { duration: 3000 });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RhymeDisplay;