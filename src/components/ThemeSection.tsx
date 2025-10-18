import React from 'react';
import { motion } from 'framer-motion';
import { ThemeCategory, Element } from '../types';
import DraggableElement from './DraggableElement';

interface ThemeSectionProps {
  category: ThemeCategory;
  elements: Element[];
}

const ThemeSection: React.FC<ThemeSectionProps> = ({ category, elements }) => {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-child p-6"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Category Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-child flex items-center justify-center text-3xl shadow-lg"
          style={{ backgroundColor: category.color }}
        >
          {category.icon}
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-child">
            {category.name}
          </h2>
          <p className="text-white/80 text-lg font-child">
            {category.description}
          </p>
        </div>
      </div>

      {/* Elements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {elements.map((element, index) => (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <DraggableElement element={element} />
          </motion.div>
        ))}
      </div>

      {/* Suggested Keywords */}
      <div className="mt-6">
        <p className="text-white/70 text-sm font-child mb-2">
          English words in this category:
        </p>
        <div className="flex flex-wrap gap-2">
          {category.suggestedKeywords.map((keyword) => (
            <span
              key={keyword}
              className="px-3 py-1 bg-white/20 rounded-full text-white/90 text-sm font-child"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ThemeSection;