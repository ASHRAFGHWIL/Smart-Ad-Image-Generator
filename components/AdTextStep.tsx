import React, { useState } from 'react';
import { generateAdText } from '../services/geminiService';
import Spinner from './Spinner';

interface AdTextStepProps {
  productAnalysis: string;
  sceneDescription: string;
  onBack: () => void;
  onAdTextSubmit: (text: { headline: string; body: string }) => void;
}

const AdTextStep: React.FC<AdTextStepProps> = ({ productAnalysis, sceneDescription, onBack, onAdTextSubmit }) => {
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateText = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { headline: generatedHeadline, body: generatedBody } = await generateAdText(productAnalysis, sceneDescription);
      setHeadline(generatedHeadline);
      setBody(generatedBody);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'فشل إنشاء النص.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headline && body) {
      onAdTextSubmit({ headline, body });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-gray-100 font-poppins">
            الخطوة الرابعة: كتابة نص الإعلان
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            اكتب نصاً جذاباً أو دع الذكاء الاصطناعي يقترح عليك.
          </p>
        </div>
        <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
          &rarr; العودة
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العنوان الرئيسي</label>
          <input
            type="text"
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF]"
            placeholder="مثال: الجودة التي تستحقها"
            required
            maxLength={50}
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">النص الأساسي</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF]"
            placeholder="صف منتجك بإيجاز هنا..."
            required
            maxLength={150}
          />
        </div>
        
        {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                <p>{error}</p>
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
            <button
                type="button"
                onClick={handleGenerateText}
                disabled={isLoading}
                className="w-full text-[#FFB200] dark:text-amber-400 font-cairo font-bold bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? <><Spinner />&nbsp;جاري الإنشاء...</> : 'اقترح نصاً بالذكاء الاصطناعي'}
            </button>
            <button
                type="submit"
                disabled={!headline || !body}
                className="w-full text-white font-cairo font-bold bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] hover:from-[#006ae0] hover:to-[#7925c7] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
            >
                المتابعة للتخصيص الإضافي &larr;
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdTextStep;