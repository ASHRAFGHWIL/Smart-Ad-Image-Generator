import React, { useState } from 'react';

interface CustomPromptStepProps {
  onBack: () => void;
  onCustomPromptSubmit: (prompt: string) => void;
}

const CustomPromptStep: React.FC<CustomPromptStepProps> = ({ onBack, onCustomPromptSubmit }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCustomPromptSubmit(prompt);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300">
            الخطوة الخامسة: إضافة لمسة خاصة (اختياري)
          </h2>
          <p className="text-gray-400">
            أضف تعليمات محددة لتخصيص الصورة النهائية بشكل أكبر.
          </p>
        </div>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
          &rarr; العودة
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            تعليماتك الخاصة
          </label>
          <textarea
            id="custom-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="مثال: أضف انعكاسًا خفيفًا على الأرضية وإضاءة دافئة من الجانب الأيمن."
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            {prompt ? 'تطبيق التعليمات وإنشاء الصورة' : 'تخطي وإنشاء الصورة النهائية'} &larr;
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomPromptStep;
