
import React, { useState } from 'react';

interface ColorPaletteProps {
  colors: string[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  if (!colors || colors.length === 0) {
    return null;
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">لوحة الألوان المستخرجة</h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color, index) => (
          <div
            key={index}
            className="group relative flex flex-col items-center cursor-pointer"
            onClick={() => copyToClipboard(color)}
          >
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
              style={{ backgroundColor: color }}
            />
            <span className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wider">{color}</span>
            <div 
              className={`absolute -top-8 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded py-1 px-2 transition-opacity duration-300 ${copiedColor === color ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              {copiedColor === color ? 'تم النسخ!' : 'نسخ'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;