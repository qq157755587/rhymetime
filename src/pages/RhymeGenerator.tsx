import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Heart, RotateCcw } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { toast } from 'sonner';

import { Element, GenerateRhymeRequest } from '../types';
import { ENGLISH_THEME_CATEGORIES, ENGLISH_THEME_ELEMENTS, getElementsByCategory } from '../data/themes';
import { RhymeStorage } from '../services/storage';
import { APIService } from '../services/api';
import ThemeSection from '../components/ThemeSection';
import CreationBox from '../components/CreationBox';
import DraggableElement from '../components/DraggableElement';

interface RhymeGeneratorProps {
  onRhymeGenerated: (rhymeId: string) => void;
}

const RhymeGenerator: React.FC<RhymeGeneratorProps> = ({ onRhymeGenerated }) => {
  const [selectedElements, setSelectedElements] = useState<Element[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeElement, setActiveElement] = useState<Element | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const element = ENGLISH_THEME_ELEMENTS.find(el => el.id === event.active.id);
    setActiveElement(element || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveElement(null);

    if (over && over.id === 'creation-box') {
      const element = ENGLISH_THEME_ELEMENTS.find(el => el.id === active.id);
      if (element && !selectedElements.find(el => el.id === element.id)) {
        setSelectedElements(prev => [...prev, element]);
        toast.success(`Added ${element.name} to your rhyme!`, {
          icon: '✨',
          duration: 2000,
        });
      }
    }
  };

  const removeElement = (elementId: string) => {
    setSelectedElements(prev => prev.filter(el => el.id !== elementId));
    toast.info('Element removed', { duration: 1500 });
  };

  const clearAll = () => {
    setSelectedElements([]);
    toast.info('All elements cleared', { duration: 1500 });
  };

  const generateRhyme = async () => {
    if (selectedElements.length === 0) {
      toast.error('Please select at least one element to create a rhyme!', {
        icon: '⚠️',
        duration: 3000,
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const request: GenerateRhymeRequest = {
        elements: selectedElements.map(el => el.name.toLowerCase()),
        llmProvider: (import.meta.env.VITE_LLM_PROVIDER as 'gemini' | 'openai' | 'claude') || 'gemini',
        language: 'en'
      };

      const result = await APIService.generateRhyme(request);

      if (result.success && result.data) {
        // Save to history
        RhymeStorage.saveToHistory(result.data);
        
        toast.success('Your English nursery rhyme is ready!', {
          icon: '🎵',
          duration: 3000,
        });

        // Navigate to rhyme display
        onRhymeGenerated(result.data.id);
      } else {
        throw new Error(result.error || 'Failed to generate rhyme');
      }
    } catch (error) {
      console.error('Error generating rhyme:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Sorry, we couldn\'t create your rhyme. Please try again!';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'API configuration issue. Please check your environment settings.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('Environment')) {
          errorMessage = 'Configuration error. Please check your API keys.';
        }
        
        // In development, show the actual error
        if (import.meta.env.DEV) {
          errorMessage += ` (${error.message})`;
        }
      }
      
      toast.error(errorMessage, {
        icon: '😔',
        duration: 6000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-child-blue via-child-lavender to-child-pink p-4">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-child">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="text-secondary-yellow" />
                RhymeTime AI
                <Sparkles className="text-secondary-yellow" />
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-child">
              Create magical English nursery rhymes by dragging your favorite things!
            </p>
          </motion.div>

          {/* Creation Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <CreationBox
              selectedElements={selectedElements}
              onRemoveElement={removeElement}
              onClearAll={clearAll}
            />
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.button
              onClick={generateRhyme}
              disabled={isGenerating || selectedElements.length === 0}
              className={`
                inline-flex items-center gap-3 px-8 py-4 rounded-child text-xl font-bold
                transition-all duration-300 transform hover:scale-105 active:scale-95
                ${selectedElements.length > 0 && !isGenerating
                  ? 'bg-primary-orange text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }
              `}
              whileHover={selectedElements.length > 0 ? { scale: 1.05 } : {}}
              whileTap={selectedElements.length > 0 ? { scale: 0.95 } : {}}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Wand2 className="w-6 h-6" />
                  </motion.div>
                  Creating Your Rhyme...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Create English Rhyme
                  <Heart className="w-6 h-6" />
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Theme Sections */}
          <div className="space-y-8">
            {ENGLISH_THEME_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ThemeSection
                  category={category}
                  elements={getElementsByCategory(category.id)}
                />
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-child p-6 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4 font-child">
                How to Create Your Rhyme
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-white/90">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="font-child">Drag pictures you like to the creation box</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="font-child">Click the magic button to create your rhyme</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎵</div>
                  <p className="font-child">Listen and learn English words!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeElement ? (
            <DraggableElement element={activeElement} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default RhymeGenerator;