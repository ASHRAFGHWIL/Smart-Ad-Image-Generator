import React, { useState } from 'react';
import type { AdSize } from '../types';

const SIZES = [
  { id: '1080x1080', label: '1080×1080', description: 'منشور إنستغرام' },
  { id: '1080x1920', label: '1080×1920', description: 'قصة – Story' },
  { id: '1200x628', label: '1200×628', description: 'إعلان فيسبوك' },
  { id: '2000x2000', label: '2000×2000', description: 'جودة عالية للطباعة' },
] as const;

interface SizeSelectionStepProps {
  onBack: () => void;
  // onSizeSelect: (size: AdSize) => void; // Will be used in the next step
}

const SizeSelectionStep: React.FC<SizeSelectionStepProps> = ({ onBack }) => {
  const [selectedSize, setSelectedSize] = useState<AdSize | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300">
            الخطوة الثالثة: اختيار المقاس
          </h2>
          <p className="text-gray-400">
            اختر المقاس المناسب لتصميمك النهائي.
          </p>
        </div>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
          &rarr; العودة
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {SIZES.map((size) => (
          <button
            key={size.id}
            onClick={() => setSelectedSize(size.id)}
            className={`p-4 border-2 rounded-lg text-center transition-all duration-300 transform hover:scale-105 hover:border-cyan-400 focus:outline-none ${
              selectedSize === size.id
                ? 'bg-cyan-900/50 border-cyan-400 ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900 shadow-lg shadow-cyan-500/20'
                : 'bg-gray-700/50 border-gray-600'
            }`}
          >
            <p className="text-xl font-bold text-white">{size.label}</p>
            <p className="text-sm text-gray-400">{size.description}</p>
          </button>
        ))}
      </div>

      {/* A "Next" button will be added here in a future step */}
    </div>
  );
};

export default SizeSelectionStep;
