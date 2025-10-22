import type { AdTemplate } from '../types';

export const adTemplates: AdTemplate[] = [
  {
    id: 'template-1',
    name: 'تركيز بسيط',
    description: 'تصميم نظيف وعصري، مثالي لإبراز تفاصيل المنتج.',
    previewImageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f82d82?q=80&w=2400&auto=format&fit=crop',
    sceneDescription: 'خلفية استوديو بسيطة ونظيفة مع مصدر ضوء ناعم واحد من الجانب، مما يخلق تدرجًا لطيفًا على سطح بلون محايد.',
    fontStyle: 'Modern',
    textPromptInstruction: 'ضع العنوان بخط كبير ونظيف في أعلى المنتصف. ضع النص الأساسي بخط أصغر في أسفل المنتصف.',
    // FIX: Added category to align with the updated AdTemplate interface.
    category: 'Studio',
  },
  {
    id: 'template-2',
    name: 'حيوي وجذاب',
    description: 'ألوان جريئة وتصميم لافت للنظر لجذب الانتباه فورًا.',
    previewImageUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2400&auto=format&fit=crop',
    sceneDescription: 'خلفية ذات ألوان جريئة ونابضة بالحياة مع تدرج لوني من الأزرق إلى البنفسجي وظلال حادة لإضفاء عمق.',
    fontStyle: 'Impactful',
    textPromptInstruction: 'ضع العنوان بشكل كبير جداً ومائل قليلاً عبر الجزء العلوي من الصورة بخط عريض جدًا. ضع النص الأساسي في الزاوية اليمنى السفلية.',
    // FIX: Added category to align with the updated AdTemplate interface.
    category: 'Abstract',
  },
  {
    id: 'template-3',
    name: 'أناقة فاخرة',
    description: 'مظهر راقٍ ومتميز للمنتجات الفاخرة والراقية.',
    previewImageUrl: 'https://images.unsplash.com/photo-1581993192008-63e896f4f744?q=80&w=2400&auto=format&fit=crop',
    sceneDescription: 'سطح من الرخام الداكن مع إضاءة خافتة ودافئة تسلط الضوء على المنتج. أضف لمسة من قماش الساتان الحريري في الخلفية.',
    fontStyle: 'Elegant',
    textPromptInstruction: 'ضع العنوان بخط أنيق ورقيق في أسفل اليمين. ضع النص الأساسي فوقه مباشرة بخط أصغر قليلاً.',
    // FIX: Added category to align with the updated AdTemplate interface.
    category: 'Luxury',
  },
    {
    id: 'template-4',
    name: 'طبيعي وعضوي',
    description: 'أجواء ترابية وهادئة تناسب المنتجات الطبيعية والصديقة للبيئة.',
    previewImageUrl: 'https://images.unsplash.com/photo-1556821832-de78f73d4034?q=80&w=2400&auto=format&fit=crop',
    sceneDescription: 'خلفية من الخشب الفاتح مع أوراق شجر خضراء وظلال ناعمة وطبيعية من ضوء الشمس المرشح عبر نافذة.',
    fontStyle: 'Playful',
    textPromptInstruction: 'ضع العنوان في الجزء العلوي الأيسر بخط مرح. ضع النص الأساسي أسفله مباشرةً بمحاذاة لليسار.',
    // FIX: Added category to align with the updated AdTemplate interface.
    category: 'Cozy',
  },
  {
    id: 'template-5',
    name: 'تقنية ومستقبل',
    description: 'تصميم عصري وداكن، مثالي للأجهزة الإلكترونية والمنتجات التقنية.',
    previewImageUrl: 'https://images.unsplash.com/photo-1611141643241-698d2508d29c?q=80&w=2400&auto=format&fit=crop',
    sceneDescription: 'خلفية داكنة مع أنماط هندسية مضيئة وخطوط نيون زرقاء خافتة، مما يعطي إحساسًا بالعمق والتكنولوجيا الفائقة.',
    fontStyle: 'Bold',
    textPromptInstruction: 'ضع العنوان بخط عريض في الزاوية العلوية اليسرى. ضع النص الأساسي تحته مباشرة بحجم أصغر.',
    category: 'Abstract',
  },
  {
    id: 'template-6',
    name: 'شهي ولذيذ',
    description: 'أجواء دافئة وجذابة مثالية للإعلانات عن الأطعمة والمشروبات.',
    previewImageUrl: 'https://images.unsplash.com/photo-1478749485172-27618a08d223?q=80&w=2400&auto=format&fit=crop',
    sceneDescription: 'طاولة خشبية ريفية مع إضاءة دافئة وناعمة. يوجد في الخلفية مكونات طازجة غير واضحة مثل الأعشاب والطماطم لإضفاء جو من الأصالة.',
    fontStyle: 'Cursive',
    textPromptInstruction: 'ضع العنوان في المنتصف العلوي بخط جذاب ومخطوط. ضع النص الأساسي في الأسفل بأسلوب أبسط ولكنه متناسق.',
    category: 'Cozy',
  },
];
