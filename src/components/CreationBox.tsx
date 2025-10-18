import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { X, RotateCcw, Sparkles } from 'lucide-react';
import { Element } from '../types';

interface CreationBoxProps {
  selectedElements: Element[];
  onRemoveElement: (elementId: string) => void;
  onClearAll: () => void;
}

const CreationBox: React.FC<CreationBoxProps> = ({
  selectedElements,
  onRemoveElement,
  onClearAll,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'creation-box',
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white font-child flex items-center gap-2">
          <Sparkles className="text-secondary-yellow" />
          Your Rhyme Elements
        </h2>
        {selectedElements.length > 0 && (
          <motion.button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-child hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </motion.button>
        )}
      </div>

      {/* Drop Zone */}
      <motion.div
        ref={setNodeRef}
        className={`
          min-h-48 p-6 rounded-child border-4 border-dashed transition-all duration-300
          ${isOver
            ? 'border-secondary-yellow bg-secondary-yellow/20 scale-105'
            : selectedElements.length > 0
            ? 'border-white/50 bg-white/10'
            : 'border-white/30 bg-white/5'
          }
        `}
        animate={{
          scale: isOver ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {selectedElements.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-6xl mb-4"
            >
              🎯
            </motion.div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 font-child">
              Drag pictures here to create your rhyme!
            </h3>
            <p className="text-white/80 font-child">
              Choose your favorite animals, colors, or things from below
            </p>
          </div>
        ) : (
          /* Selected Elements */
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <AnimatePresence>
                {selectedElements.map((element) => (
                  <motion.div
                    key={element.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    <div className="bg-white rounded-child p-3 shadow-lg">
                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveElement(element.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Element Image */}
                      <div className="aspect-square mb-2 rounded-child overflow-hidden bg-gray-100">
                        <img
                          src={element.imageUrl}
                          alt={element.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/100x100/E5E7EB/6B7280?text=${encodeURIComponent(element.name)}`;
                          }}
                        />
                      </div>

                      {/* Element Name */}
                      <h4 className="text-center font-bold text-gray-800 text-xs font-child">
                        {element.name}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Element Count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-child">
                <span className="text-white font-child">
                  {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected
                </span>
                <span className="text-secondary-yellow">✨</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-secondary-yellow/20 rounded-child"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-white font-bold font-child">Drop here!</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tips */}
      {selectedElements.length > 0 && selectedElements.length < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-white/80 font-child">
            💡 Try adding {3 - selectedElements.length} more element{3 - selectedElements.length !== 1 ? 's' : ''} for a richer rhyme!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CreationBox;