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
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-gray-100 font-poppins">
            الخطوة الخامسة: إضافة لمسة خاصة (اختياري)
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            أضف تعليمات محددة لتخصيص الصورة النهائية بشكل أكبر.
          </p>
        </div>
        <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
          &rarr; العودة
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            تعليماتك الخاصة
          </label>
          <textarea
            id="custom-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF]"
            placeholder="مثال: أضف انعكاسًا خفيفًا على الأرضية وإضاءة دافئة من الجانب الأيمن."
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            className="w-full text-white font-cairo font-bold bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] hover:from-[#006ae0] hover:to-[#7925c7] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-3 px-6"
          >
            {prompt ? 'تطبيق التعليمات والمتابعة' : 'تخطي والمتابعة'} &larr;
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomPromptStep;