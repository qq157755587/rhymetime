import React from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { Element } from '../types';

interface DraggableElementProps {
  element: Element;
  isDragging?: boolean;
}

const DraggableElement: React.FC<DraggableElementProps> = ({ element, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isCurrentlyDragging,
  } = useDraggable({
    id: element.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative cursor-grab active:cursor-grabbing
        ${isCurrentlyDragging || isDragging ? 'z-50' : 'z-10'}
        ${isCurrentlyDragging ? 'opacity-50' : 'opacity-100'}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white rounded-child p-4 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Element Image */}
        <div className="aspect-square mb-3 rounded-child overflow-hidden bg-gray-100">
          <img
            src={element.imageUrl}
            alt={element.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/150x150/E5E7EB/6B7280?text=${encodeURIComponent(element.name)}`;
            }}
          />
        </div>

        {/* Element Name */}
        <div className="text-center">
          <h3 className="font-bold text-gray-800 text-sm md:text-base font-child">
            {element.name}
          </h3>
          {element.description && (
            <p className="text-gray-600 text-xs mt-1 font-child">
              {element.description}
            </p>
          )}
        </div>

        {/* Drag Indicator */}
        <div className="absolute top-2 right-2 opacity-60">
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-gray-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-primary-orange/10 rounded-child opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default DraggableElement;