import React, { useState, useCallback } from 'react';

import { analyzeImageAndExtractColors } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import type { UploadedImage } from '../types';
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

  const showResults = imageUrl && !isLoading && analysisResult;

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-[#1A1A1A] dark:text-gray-100 mb-2 font-poppins">
        الخطوة الأولى: رفع صورة المنتج وتحليلها
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        ارفع صورة منتجك ليقوم الذكاء الاصطناعي بتحليلها واستخراج لوحة الألوان الخاصة بها.
      </p>

      {!imageUrl && !isLoading && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#007BFF] transition-colors duration-300 bg-gray-50 dark:bg-gray-800/50">
          <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer text-white font-cairo font-bold bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] hover:from-[#006ae0] hover:to-[#7925c7] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-3 px-6"
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
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">JPG, PNG</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          <Spinner />
          <p className="mt-4 text-[#007BFF] animate-pulse">جاري تحليل الصورة...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-center">
          <p className="font-semibold mb-2">حدث خطأ</p>
          <p>{error}</p>
          <button 
             onClick={() => { setError(null); setImageUrl(null); }} 
             className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg"
           >
             حاول مرة أخرى
           </button>
        </div>
      )}
      
      {showResults && (
         <div className="text-center p-8">
            <Spinner />
            <p className="mt-4 text-[#007BFF]">اكتمل التحليل! جاري إعداد المشاهد...</p>
         </div>
      )}
    </div>
  );
};

export default ImageUploadStep;