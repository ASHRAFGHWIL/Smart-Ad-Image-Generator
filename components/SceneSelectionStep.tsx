import React, { useState, useEffect, useMemo } from 'react';

import { generateSceneDescriptions, generateSceneImage, categorizeSceneDescription } from '../services/geminiService';
import { adTemplates } from '../data/templates';
import type { AnalysisResult, Scene, UploadedImage, AdTemplate } from '../types';
import Spinner from './Spinner';
import SkeletonLoader from './SkeletonLoader';

interface SceneSelectionStepProps {
  analysisResult: AnalysisResult;
  uploadedImage: UploadedImage;
  onBack: () => void;
  onSceneSelect: (scene: Scene) => void;
  onTemplateSelect: (template: AdTemplate) => void;
}

const categories: { [key: string]: string } = {
  all: 'الكل',
  Outdoor: 'خارجي',
  Studio: 'استوديو',
  Minimalist: 'بسيط',
  Luxury: 'فاخر',
  Abstract: 'مجرد',
  Cozy: 'دافئ',
};

// Add font styles here for template display
const fontStylesForTemplates = [
  { key: 'Modern', label: 'حديث' },
  { key: 'Elegant', label: 'أنيق' },
  { key: 'Bold', label: 'عريض' },
  { key: 'Impactful', label: 'بارز' },
  { key: 'Playful', label: 'مرح' },
  { key: 'Cursive', label: 'مخطوطة' },
  { key: 'Serif', label: 'كلاسيكي' },
  { key: 'Handwritten', label: 'يدوي' },
  { key: 'Slab', label: 'كتلي' },
  { key: 'Gothic', label: 'قوطي' },
  { key: 'Brush', label: 'فرشاة' },
  { key: 'Stencil', label: 'ستنسل' },
];


const SceneSelectionStep: React.FC<SceneSelectionStepProps> = ({ analysisResult, onBack, onSceneSelect, onTemplateSelect }) => {
  const [scenes, setScenes] = useState<(Scene | null)[]>(Array(10).fill(null));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'templates'>('ai');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [customSceneDescription, setCustomSceneDescription] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customSceneError, setCustomSceneError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'ai') return;

    const hasGeneratedScenes = scenes.some(s => s !== null);
    if (hasGeneratedScenes) {
        setIsLoading(false);
        return;
    }

    const generateScenes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const descriptionsWithCategories = await generateSceneDescriptions(analysisResult.analysis);
        
        const imagePromises = descriptionsWithCategories.map((desc, index) => 
            generateSceneImage(desc.description)
                .then(imageUrl => ({ ...desc, imageUrl, index }))
                .catch(err => {
                    console.error(`Failed to generate image for description: "${desc.description}"`, err);
                    return { ...desc, imageUrl: null, index }; 
                })
        );
        
        for (const promise of imagePromises) {
            promise.then(result => {
                if (result.imageUrl) {
                    setScenes(prevScenes => {
                        const newScenes = [...prevScenes];
                        newScenes[result.index] = { description: result.description, imageUrl: result.imageUrl, category: result.category };
                        return newScenes;
                    });
                }
            });
        }

      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    generateScenes();
  }, [analysisResult, activeTab, scenes]);

  const handleGenerateCustomScene = async () => {
      if (!customSceneDescription.trim()) return;

      setIsGeneratingCustom(true);
      setCustomSceneError(null);
      try {
        const imageUrl = await generateSceneImage(customSceneDescription);
        const category = await categorizeSceneDescription(customSceneDescription);
        const newScene: Scene = { description: customSceneDescription, imageUrl, category };
        
        setScenes(prevScenes => [newScene, ...prevScenes.filter(Boolean) as Scene[]]);
        setCustomSceneDescription(''); 
        setActiveTab('ai');
        setSelectedCategory(category);
      } catch (err) {
        console.error("Failed to generate custom scene:", err);
        const errorMessage = err instanceof Error ? err.message : 'فشل إنشاء المشهد المخصص.';
        setCustomSceneError(errorMessage);
      } finally {
        setIsGeneratingCustom(false);
      }
    };
    
    const TabButton: React.FC<{tabId: 'ai' | 'templates'; children: React.ReactNode}> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-6 py-3 font-bold rounded-t-lg transition-colors duration-300 text-lg ${
                activeTab === tabId 
                ? 'bg-white dark:bg-gray-800 text-[#007BFF] border-b-2 border-[#007BFF]' 
                : 'bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
            {children}
        </button>
    );

  const visibleScenes = useMemo(() => {
    return scenes.filter(s => s && (selectedCategory === 'all' || s.category === selectedCategory)) as Scene[];
  }, [scenes, selectedCategory]);

  return (
    <div className="animate-fade-in">
       <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-gray-100 font-poppins">
                    الخطوة الثانية: اختيار الخلفية
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    اختر من المشاهد التي أنشأها الذكاء الاصطناعي، أو ابدأ بقالب جاهز.
                </p>
            </div>
            <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
                &rarr; العودة
            </button>
        </div>

        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">أوصف مشهدك الخاص</h3>
            <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                value={customSceneDescription}
                onChange={(e) => setCustomSceneDescription(e.target.value)}
                placeholder="مثال: شاطئ استوائي عند غروب الشمس مع رمال بيضاء ناعمة وأمواج هادئة"
                className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] transition-colors"
                rows={2}
                disabled={isGeneratingCustom}
                />
                <button
                onClick={handleGenerateCustomScene}
                disabled={!customSceneDescription.trim() || isGeneratingCustom}
                className="w-full sm:w-auto text-white font-cairo font-bold bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] hover:from-[#006ae0] hover:to-[#7925c7] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex items-center justify-center"
                >
                {isGeneratingCustom ? <Spinner /> : 'إنشاء وتصنيف'}
                </button>
            </div>
            {customSceneError && <p className="text-red-500 text-sm mt-2">{customSceneError}</p>}
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <TabButton tabId="ai">✨ مشاهد منشأة بالذكاء الاصطناعي</TabButton>
                <TabButton tabId="templates">🎨 قوالب إعلانية جاهزة</TabButton>
            </nav>
        </div>
        
        <div className="py-6">
            {activeTab === 'ai' && (
                <>
                    <div className="mb-6 flex flex-wrap gap-2 items-center">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">تصفية حسب الفئة:</span>
                      {Object.entries(categories).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(key)}
                          className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-200 border-2 ${
                            selectedCategory === key
                              ? 'bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] text-white border-transparent shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-[#007BFF] hover:text-[#007BFF] dark:hover:border-[#007BFF] dark:hover:text-[#007BFF]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {isLoading && scenes.every(s => s === null) && (
                        <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
                        <Spinner />
                        <p className="mt-4 text-[#007BFF] animate-pulse">جاري إنشاء مشاهد إعلانية مبتكرة...</p>
                        </div>
                    )}

                    {error && (
                        <div className="my-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-center">
                        <p className="font-semibold mb-2">حدث خطأ</p>
                        <p>{error}</p>
                        </div>
                    )}

                    {!error && visibleScenes.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {visibleScenes.map((scene) => (
                            <div key={scene.imageUrl} className="group relative aspect-w-1 aspect-h-1 flex flex-col">
                                <img
                                    src={scene.imageUrl}
                                    alt={scene.description}
                                    className="w-full h-full object-cover rounded-lg shadow-md border-2 border-transparent group-hover:border-[#007BFF] transition-all duration-300"
                                />
                                <button 
                                    onClick={() => onSceneSelect(scene)}
                                    className="w-full mt-2 text-white font-cairo font-semibold bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] hover:from-[#006ae0] hover:to-[#7925c7] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-2 px-2 text-xs sm:text-sm">
                                    اختيار هذا المشهد
                                </button>
                            </div>
                        ))}
                        </div>
                    )}
                    
                    {!isLoading && !error && visibleScenes.length === 0 && scenes.some(s => s !== null) && (
                        <div className="text-center py-10">
                            <p className="text-gray-600 dark:text-gray-400 text-lg">لا توجد مشاهد في هذه الفئة حاليًا.</p>
                        </div>
                    )}

                    {!isLoading && !error && scenes.filter(Boolean).length === 0 && (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div key={index} className="group relative aspect-w-1 aspect-h-1 flex flex-col">
                                    <SkeletonLoader className="w-full h-full object-cover rounded-lg"/>
                                    <div className="w-full h-9 mt-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adTemplates.map(template => {
                        const templateCategory = categories[template.category] || template.category;
                        const templateFont = fontStylesForTemplates.find(f => f.key === template.fontStyle)?.label || template.fontStyle;
                        
                        return (
                            <div key={template.id} className="group flex flex-col bg-white dark:bg-gray-800/50 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <img src={template.previewImageUrl} alt={template.name} className="h-48 w-full object-cover" />
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold font-poppins text-gray-900 dark:text-gray-100">{template.name}</h3>
                                    <div className="flex flex-wrap gap-2 my-2">
                                        <span className="text-xs font-semibold inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            النمط: {templateCategory}
                                        </span>
                                        <span className="text-xs font-semibold inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                            الخط: {templateFont}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow">{template.description}</p>
                                    <button
                                        onClick={() => onTemplateSelect(template)}
                                        className="w-full mt-4 text-white font-cairo font-bold bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] hover:from-[#006ae0] hover:to-[#7925c7] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-0.5 py-2 px-4"
                                    >
                                        اختيار هذا القالب
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default SceneSelectionStep;