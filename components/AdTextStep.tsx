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
          <h2 className="text-2xl font-bold text-cyan-300">
            الخطوة الرابعة: كتابة نص الإعلان
          </h2>
          <p className="text-gray-400">
            اكتب نصاً جذاباً أو دع الذكاء الاصطناعي يقترح عليك.
          </p>
        </div>
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
          &rarr; العودة
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-gray-300 mb-2">العنوان الرئيسي</label>
          <input
            type="text"
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="مثال: الجودة التي تستحقها"
            required
            maxLength={50}
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-300 mb-2">النص الأساسي</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="صف منتجك بإيجاز هنا..."
            required
            maxLength={150}
          />
        </div>
        
        {error && (
            <div className="p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
                <p>{error}</p>
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
            <button
                type="button"
                onClick={handleGenerateText}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-teal-800 disabled:cursor-not-allowed"
            >
                {isLoading ? <><Spinner />&nbsp;جاري الإنشاء...</> : 'اقترح نصاً بالذكاء الاصطناعي'}
            </button>
            <button
                type="submit"
                disabled={!headline || !body}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-cyan-800 disabled:cursor-not-allowed"
            >
                المتابعة للتخصيص الإضافي &larr;
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdTextStep;