import React from 'react';
import type { AdSize } from '../types';

interface SizeSelectionStepProps {
  onBack: () => void;
  onSizeSelect: (size: AdSize) => void;
}

const adSizes: { size: AdSize; label: string; dimensions: string }[] = [
  { size: '1080x1080', label: 'مربع', dimensions: 'Instagram Post' },
  { size: '1080x1920', label: 'طولي', dimensions: 'Instagram Story' },
  { size: '1200x628', label: 'أفقي', dimensions: 'Facebook Ad' },
  { size: '2000x2000', label: 'عالي الجودة', dimensions: 'Square HD' },
];

const SizeSelectionStep: React.FC<SizeSelectionStepProps> = ({ onBack, onSizeSelect }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300">
            الخطوة الثالثة: اختيار حجم الإعلان
          </h2>
          <p className="text-gray-400">
            اختر الأبعاد المناسبة لحملتك الإعلانية.
          </p>
        </div>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
          &rarr; العودة
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {adSizes.map(({ size, label, dimensions }) => (
          <button
            key={size}
            onClick={() => onSizeSelect(size)}
            className="group p-6 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-cyan-400 hover:bg-gray-700/50 transition-all duration-300 flex flex-col items-center justify-center aspect-square"
          >
            <div className="text-2xl font-bold text-cyan-400 group-hover:scale-110 transition-transform">{label}</div>
            <div className="text-lg text-gray-300 mt-2">{size}</div>
            <div className="text-sm text-gray-500 mt-1">{dimensions}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelectionStep;
