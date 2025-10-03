
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { Button } from './common/Button';
import { UserState, StyleOption } from '../types';
import { STYLE_OPTIONS } from '../constants';
// FIX: Removed unused and non-existent FilmIcon, and added CameraIcon which is used. This fixes both errors.
import { UploadIcon, CheckCircleIcon, LockIcon, SparklesIcon, BriefcaseIcon, PaintBrushIcon, ZapIcon, UsersIcon, CameraIcon, PencilIcon } from './common/Icons';
import { PhotoEditor } from './PhotoEditor';

interface UploadFlowProps {
  user: UserState;
  onGenerate: (files: File[], style: StyleOption, keepLikeness: boolean, aspectRatio: '1:1' | '16:9') => void;
  onGenerateRandom: (files: File[], keepLikeness: boolean, aspectRatio: '1:1' | '16:9') => void;
  onNavigateToPricing: () => void;
  initialRequest?: { files: File[], style?: StyleOption, prompt?: string, keepLikeness: boolean, aspectRatio?: '1:1' | '16:9' } | null;
  generationCost: number;
  onWatchAd: () => void;
  onNavigateToCustomPrompt: (files: File[]) => void;
}

type Category = 'professional_headshots' | 'branding_marketing' | 'lifestyle_editorial' | 'creative_portraits' | 'model_photoshoots' | 'urban_hip' | 'holiday_events' | 'couples_family_portraits';

const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL for file conversion');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const UploadFlow: React.FC<UploadFlowProps> = ({ user, onGenerate, onGenerateRandom, onNavigateToPricing, initialRequest, generationCost, onWatchAd, onNavigateToCustomPrompt }) => {
  const [files, setFiles] = useState<File[]>(initialRequest?.files || []);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(initialRequest?.style || null);
  const [keepLikeness, setKeepLikeness] = useState(initialRequest?.keepLikeness ?? true);
  const [activeCategory, setActiveCategory] = useState<Category>('professional_headshots');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.slice(0, 1));
  }, []);

  useEffect(() => {
    if (!files.length) {
      setPreviews([]);
      return;
    }
    const objectUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    maxFiles: 1,
  });

  const categories = useMemo(() => {
    return STYLE_OPTIONS.reduce((acc, style) => {
        (acc[style.category] = acc[style.category] || []).push(style);
        return acc;
    }, {} as Record<Category, StyleOption[]>);
  }, []);

  const handleStyleClick = (style: StyleOption) => {
    // Logic for paid plans can be re-introduced here if needed
    setSelectedStyle(style);
  };

  const handleGenerateClick = () => {
    if (!files.length || !selectedStyle) return;
    onGenerate(files, selectedStyle, keepLikeness, '1:1');
  };

  const handleSurpriseMeClick = () => {
    if (!files.length) return;
    onGenerateRandom(files, keepLikeness, '1:1');
  };

  const handleWatchAdClick = () => {
    setIsAdLoading(true);
    // Simulate a 15-second ad
    setTimeout(() => {
        onWatchAd();
        setIsAdLoading(false);
    }, 15000);
  };

  const handleEditComplete = (newImageUrl: string) => {
      const originalFile = files[0];
      if (originalFile) {
        const newFilename = `enhanced_${originalFile.name.replace(/\.[^/.]+$/, "")}.png`;
        const newFile = dataURLtoFile(newImageUrl, newFilename);
        setFiles([newFile]);
      }
      setIsEditing(false);
  };
  
  const today = new Date().toISOString().split('T')[0];
  const adsWatched = user.lastAdWatchDate === today ? user.adsWatchedToday ?? 0 : 0;
  const adsRemaining = 6 - adsWatched;
  const canWatchAd = adsRemaining > 0 && !isAdLoading;
  
  const hasFile = files.length > 0;
  const hasStyle = selectedStyle !== null;

  const getCategoryIcon = (category: Category) => {
    const props = { className: "h-5 w-5 mr-2" };
    switch (category) {
        case 'professional_headshots': return <BriefcaseIcon {...props} />;
        case 'branding_marketing': return <ZapIcon {...props} />;
        case 'lifestyle_editorial': return <UsersIcon {...props} />;
        case 'creative_portraits': return <PaintBrushIcon {...props} />;
        case 'model_photoshoots': return <CameraIcon {...props} />;
        case 'urban_hip': return <ZapIcon {...props} />;
        case 'holiday_events': return <SparklesIcon {...props} />;
        case 'couples_family_portraits': return null; // Hide this category in single upload flow
        default: return null;
    }
  };
  
  return (
    <div>
        {isEditing && previews.length > 0 && (
            <PhotoEditor
                imageUrl={previews[0]}
                onClose={() => setIsEditing(false)}
                onComplete={handleEditComplete}
                user={user}
            />
        )}
        <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
                <span className="text-fuchsia-400">Step 1:</span> Upload Your Reference Photo
            </h2>
            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-fuchsia-500 bg-fuchsia-900/20' : 'border-gray-700 hover:border-fuchsia-400'}`}>
                <input {...getInputProps()} />
                <UploadIcon className="h-12 w-12 text-gray-500 mx-auto" />
                <p className="mt-2 text-gray-400">{isDragActive ? 'Drop it like it\'s hot!' : 'Drag & drop a photo, or click to select'}</p>
            </div>

            {previews.length > 0 && (
                <div className="mt-4 text-center">
                    <div className="inline-flex flex-col items-center gap-3 p-2 bg-gray-900/50 rounded-xl border border-gray-800">
                        <div className="relative w-32 h-32 border-2 border-fuchsia-500 rounded-lg overflow-hidden">
                            <img src={previews[0]} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setIsEditing(true)}
                            className="w-full py-2 text-sm flex items-center justify-center"
                        >
                           <PencilIcon className="h-4 w-4 mr-2" /> AI Toolkit
                        </Button>
                    </div>
                </div>
            )}
        </div>

        {hasFile && (
            <div className="mb-8 pb-32">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                    <span className="text-fuchsia-400">Step 2:</span> Define Your Style
                </h2>
                
                {user.credits > 0 && user.credits <= 10 && (
                    <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-6 py-4 rounded-lg max-w-4xl mx-auto text-sm mb-6 text-center">
                        <strong>Heads up!</strong> You're running low on credits. <button onClick={onNavigateToPricing} className="font-bold underline hover:text-yellow-200">Get more</button> to keep creating.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Button onClick={() => onNavigateToCustomPrompt(files)} variant="secondary" className="w-full text-lg py-4 flex items-center justify-center">
                        <PaintBrushIcon className="h-6 w-6 mr-2" /> Describe Your Own (5 Credits)
                    </Button>
                    <Button onClick={handleSurpriseMeClick} disabled={!hasFile} className="w-full text-lg py-4 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600">
                        <SparklesIcon className="h-6 w-6 mr-2" /> Random Style ({generationCost} Credits)
                    </Button>
                </div>
                
                <div className="text-center text-sm text-gray-400 mb-6 bg-gray-900/50 p-3 rounded-lg border border-gray-800 max-w-2xl mx-auto">
                    💡 <strong>Pro Tip:</strong> For more control, you can also pick a specific style from the categories below!
                </div>

                <div className="flex flex-wrap space-x-2 border-b border-gray-700 mb-6">
                    {(Object.keys(categories) as Category[]).map(cat => {
                        const icon = getCategoryIcon(cat);
                        if (!icon) return null; // Don't render tab if no icon (e.g., for couples)
                        return (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex items-center capitalize px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg border-b-2 ${activeCategory === cat ? 'text-fuchsia-400 border-fuchsia-400' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                {icon} {cat.replace(/_/g, ' ')}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {categories[activeCategory]?.map(style => {
                        const isSelected = selectedStyle?.id === style.id;
                        
                        return (
                            <div key={style.id} onClick={() => handleStyleClick(style)} className="cursor-pointer group relative aspect-square rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105">
                                <div className={`w-full h-full flex items-center justify-center text-center p-2 ${style.color} transition-all duration-300 group-hover:brightness-125`}>
                                    <span className="font-bold text-white text-sm break-words">{style.name}</span>
                                </div>
                                <div className={`absolute inset-0 rounded-xl border-4 transition-all ${isSelected ? 'border-fuchsia-500 shadow-2xl shadow-fuchsia-500/50' : 'border-transparent'} pointer-events-none`}></div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2"><CheckCircleIcon className="h-6 w-6" /></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {hasFile && (
            <div className="sticky bottom-4 z-20 mt-8">
                <div className="max-w-4xl mx-auto bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-2xl shadow-black/50">
                    <div className="bg-gray-800 p-3 rounded-lg mb-4 flex justify-center">
                        <label htmlFor="likeness-toggle" className="flex items-center cursor-pointer justify-between w-full max-w-xs">
                            <span className="text-white font-medium text-sm">Keep likeness strict <span className="text-gray-400 block sm:inline text-xs">(Recommended)</span></span>
                            <div className="relative"><input type="checkbox" id="likeness-toggle" className="sr-only" checked={keepLikeness} onChange={() => setKeepLikeness(!keepLikeness)} /><div className="block bg-gray-600 w-14 h-8 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${keepLikeness ? 'transform translate-x-full bg-fuchsia-400' : ''}`}></div></div>
                        </label>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold">{hasStyle ? selectedStyle.name : "Select a Style Above"}</h3>
                            <p className="text-gray-400 text-sm">Cost: {generationCost} credits. You have {user.credits}.</p>
                        </div>
                        <Button onClick={handleGenerateClick} disabled={!hasFile || !hasStyle} className="w-full md:w-auto text-lg py-3">
                            Generate with Style
                        </Button>
                    </div>

                    {user.credits < generationCost && (
                        <div className="mt-4 text-center border-t border-gray-700 pt-4">
                             <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button onClick={handleWatchAdClick} disabled={!canWatchAd} variant="secondary" className="w-full sm:w-auto">
                                    {isAdLoading ? 'Watching ad...' : `Watch Ad for 1 Credit (${adsRemaining} left)`}
                                </Button>
                                <Button onClick={onNavigateToPricing} variant="custom" className="bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 w-full sm:w-auto">
                                    Buy Credit Packs
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default UploadFlow;
