import React, { useState, useCallback } from 'react';

import { analyzeImageAndExtractColors } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import type { UploadedImage } from '../App';
import ColorPalette from './ColorPalette';
import Spinner from './Spinner';
import { UploadIcon } from './icons/UploadIcon';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

interface ImageUploadStepProps {
    onAnalysisComplete: (result: AnalysisResult, image: UploadedImage) => void;
}

const AnalysisDisplay: React.FC<{ analysis: AnalysisResult['analysis'] }> = ({ analysis }) => (
  <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-300 mb-3">تحليل الصورة</h3>
      <div className="space-y-2 text-gray-400">
          <p><strong className="font-semibold text-cyan-400">الخامات:</strong> {analysis.materials}</p>
          <p><strong className="font-semibold text-cyan-400">الإضاءة:</strong> {analysis.lighting}</p>
          <p><strong className="font-semibold text-cyan-400">الظلال:</strong> {analysis.shadows}</p>
      </div>
  </div>
);

const ImageUploadStep: React.FC<ImageUploadStepProps> = ({ onAnalysisComplete }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    // Revoke previous URL if it exists
    if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('يرجى رفع ملف بصيغة JPG أو PNG فقط.');
      setIsLoading(false);
      return;
    }

    let previewUrl: string | null = null;
    try {
      previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);

      const base64Data = await fileToBase64(file);
      const result = await analyzeImageAndExtractColors(base64Data, file.type);
      setAnalysisResult(result);
      // On success, notify the parent component to proceed to the next step
      onAnalysisComplete(result, { data: base64Data, mimeType: file.type });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setImageUrl(null); 
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  }, [imageUrl, onAnalysisComplete]);

  // This component will only show analysis results briefly before App component switches to Step 2
  // We keep this structure in case we want to show both steps on one page later.
  const showResults = imageUrl && !isLoading && analysisResult;

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-cyan-300 mb-2">
        الخطوة الأولى: رفع صورة المنتج وتحليلها
      </h2>
      <p className="text-center text-gray-400 mb-6">
        ارفع صورة منتجك ليقوم الذكاء الاصطناعي بتحليلها واستخراج لوحة الألوان الخاصة بها.
      </p>

      {!imageUrl && !isLoading && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-400 transition-colors duration-300">
          <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            <span>رفع صورة المنتج</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/jpeg, image/png"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">JPG, PNG</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          <Spinner />
          <p className="mt-4 text-cyan-400 animate-pulse">جاري تحليل الصورة...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-4 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center">
          <p className="font-semibold mb-2">حدث خطأ</p>
          <p>{error}</p>
          <button 
             onClick={() => { setError(null); setImageUrl(null); }} 
             className="mt-2 bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-3 rounded-lg"
           >
             حاول مرة أخرى
           </button>
        </div>
      )}
      
      {showResults && (
         <div className="text-center p-8">
            <Spinner />
            <p className="mt-4 text-cyan-400">اكتمل التحليل! جاري إعداد المشاهد...</p>
         </div>
      )}
    </div>
  );
};

export default ImageUploadStep;