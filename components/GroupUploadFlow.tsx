
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { Button } from './common/Button';
import { UserState, StyleOption, GenerationRequest } from '../types';
import { STYLE_OPTIONS } from '../constants';
import { UploadIcon, CheckCircleIcon, SparklesIcon, BriefcaseIcon, PaintBrushIcon, ZapIcon, UsersIcon, CameraIcon } from './common/Icons';

interface GroupUploadFlowProps {
  user: UserState;
  onGenerate: (data: { files: File[], style?: StyleOption, prompt?: string, keepLikeness: boolean, aspectRatio: '1:1' | '16:9' }) => void;
  onNavigateToPricing: () => void;
  generationCost: number;
  customGenerationCost: number;
  initialRequest?: Extract<GenerationRequest, { type: 'group' }> | null;
}

type Category = 'couples_family_portraits' | 'lifestyle_editorial' | 'creative_portraits' | 'urban_hip' | 'holiday_events';

const PersonUploader: React.FC<{ index: number, file: File | null, onFileChange: (file: File | null, index: number) => void }> = ({ index, file, onFileChange }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            if (preview) URL.revokeObjectURL(preview);
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileChange(acceptedFiles[0], index);
        }
    }, [index, onFileChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        maxFiles: 1,
    });
    
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileChange(null, index);
    };

    return (
        <div {...getRootProps()} className={`relative aspect-square w-full border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors flex flex-col items-center justify-center p-2 ${isDragActive ? 'border-fuchsia-500 bg-fuchsia-900/20' : 'border-gray-700 hover:border-fuchsia-400'}`}>
            <input {...getInputProps()} />
            {preview ? (
                <>
                    <img src={preview} alt={`Person ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    <button onClick={handleRemove} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0 h-6 w-6 flex items-center justify-center font-bold text-lg leading-none">&times;</button>
                </>
            ) : (
                <>
                    <UploadIcon className="h-8 w-8 text-gray-500 mb-2" />
                    <p className="text-sm font-semibold text-gray-300">Person {index + 1}</p>
                    <p className="text-xs text-gray-500">Click or Drop</p>
                </>
            )}
        </div>
    );
};

const GroupUploadFlow: React.FC<GroupUploadFlowProps> = ({ user, onGenerate, onNavigateToPricing, generationCost, customGenerationCost, initialRequest }) => {
  const [files, setFiles] = useState<(File | null)[]>(() => {
    const initialFiles = initialRequest?.files || [];
    const numSlots = Math.max(2, initialFiles.length); // Start with at least 2 slots
    const filledSlots = initialFiles.slice(0, 3);
    const placeholders = Array(numSlots - filledSlots.length).fill(null);
    return [...filledSlots, ...placeholders];
  });
  
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(initialRequest?.style || null);
  const [prompt, setPrompt] = useState(initialRequest?.prompt || '');
  const [inputMode, setInputMode] = useState<'style' | 'custom'>(initialRequest?.prompt ? 'custom' : 'style');
  const [keepLikeness, setKeepLikeness] = useState(initialRequest?.keepLikeness ?? true);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9'>(initialRequest?.aspectRatio || '1:1');
  const [activeCategory, setActiveCategory] = useState<Category>('couples_family_portraits');

  const handleFileChange = useCallback((file: File | null, index: number) => {
      setFiles(currentFiles => {
          const newFiles = [...currentFiles];
          newFiles[index] = file;
          return newFiles;
      });
  }, []);

  const uploadedFiles = useMemo(() => files.filter((f): f is File => f !== null), [files]);
  const canGenerate = uploadedFiles.length >= 2 && (inputMode === 'style' ? selectedStyle !== null : prompt.trim().length > 0);
  const currentCost = inputMode === 'custom' ? customGenerationCost : generationCost;

  const categories = useMemo(() => {
    return STYLE_OPTIONS.reduce((acc, style) => {
        if (style.category === 'couples_family_portraits' || style.category === 'lifestyle_editorial' || style.category === 'creative_portraits' || style.category === 'urban_hip' || style.category === 'holiday_events') {
            (acc[style.category] = acc[style.category] || []).push(style);
        }
        return acc;
    }, {} as Record<Category, StyleOption[]>);
  }, []);

  const handleStyleClick = (style: StyleOption) => {
    setSelectedStyle(style);
  };
  
  const handleGenerateClick = () => {
    if (!canGenerate) return;
    if (inputMode === 'style' && selectedStyle) {
        onGenerate({ files: uploadedFiles, style: selectedStyle, keepLikeness, aspectRatio });
    } else if (inputMode === 'custom' && prompt.trim()) {
        onGenerate({ files: uploadedFiles, prompt: prompt.trim(), keepLikeness, aspectRatio });
    }
  };

  const categoryDisplayNames: Record<Category, string> = {
    couples_family_portraits: 'Group Portraits',
    lifestyle_editorial: 'Lifestyle',
    creative_portraits: 'Creative',
    urban_hip: 'Urban & Hip',
    holiday_events: 'Holiday & Events',
  };

  const getCategoryIcon = (category: Category) => {
    const props = { className: "h-5 w-5 mr-2" };
    switch (category) {
        case 'couples_family_portraits': return <UsersIcon {...props} />;
        case 'lifestyle_editorial': return <CameraIcon {...props} />;
        case 'creative_portraits': return <PaintBrushIcon {...props} />;
        case 'urban_hip': return <ZapIcon {...props} />;
        case 'holiday_events': return <SparklesIcon {...props} />;
        default: return null;
    }
  };
  
  return (
    <div>
        <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
                <span className="text-fuchsia-400">Step 1:</span> Create Your Group Photo
            </h2>
            <p className="text-gray-400 text-center mb-6">Add 2 or 3 photos below. Perfect for couples, friends, or family!</p>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto items-start">
                {files.map((file, index) => (
                    <PersonUploader key={index} index={index} file={file} onFileChange={handleFileChange} />
                ))}
                {files.length < 3 && (
                    <button 
                        onClick={() => setFiles(f => [...f, null])}
                        className="aspect-square w-full border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors border-gray-700 hover:border-fuchsia-400 flex flex-col items-center justify-center p-2"
                        aria-label="Add another person"
                    >
                        <span className="text-3xl font-light text-gray-500">+</span>
                        <p className="text-sm font-semibold text-gray-300">Add Person</p>
                    </button>
                )}
            </div>
        </div>

        {uploadedFiles.length >= 2 && (
            <div className="mb-8 animate-fade-in">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                    <span className="text-fuchsia-400">Step 2:</span> Define Your Style
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                    <Button onClick={() => setInputMode('custom')} className={`w-full text-lg py-4 flex items-center justify-center ${inputMode === 'custom' ? 'bg-fuchsia-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <PaintBrushIcon className="h-6 w-6 mr-2" /> Describe Your Own ({customGenerationCost} Cr)
                    </Button>
                    <Button onClick={() => setInputMode('style')} className={`w-full text-lg py-4 flex items-center justify-center ${inputMode === 'style' ? 'bg-fuchsia-600' : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600'}`}>
                        <SparklesIcon className="h-6 w-6 mr-2" /> Select a Style ({generationCost} Cr)
                    </Button>
                </div>
                
                {inputMode === 'custom' ? (
                    <div className="max-w-2xl mx-auto">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A happy couple having a picnic in a sunny park, cinematic style..."
                            className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition"
                            aria-label="Custom prompt for group photo"
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 border-b border-gray-700 mb-6">
                            {(Object.keys(categories) as Category[]).map(cat => {
                                if (!categories[cat]) return null;
                                return (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex items-center capitalize px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg border-b-2 ${activeCategory === cat ? 'text-fuchsia-400 border-fuchsia-400' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                    {getCategoryIcon(cat)} {categoryDisplayNames[cat]}
                                </button>
                                )
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
                    </>
                )}
            </div>
        )}

        {uploadedFiles.length >= 2 && (
            <div className="sticky bottom-4 z-20 mt-8 animate-fade-in">
                <div className="max-w-4xl mx-auto bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-2xl shadow-black/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <label htmlFor="likeness-toggle" className="flex items-center cursor-pointer justify-between bg-gray-800 p-3 rounded-lg">
                            <span className="text-white font-medium text-sm">Keep likeness strict <span className="text-gray-400 block sm:inline text-xs">(Recommended)</span></span>
                            <div className="relative"><input type="checkbox" id="likeness-toggle" className="sr-only" checked={keepLikeness} onChange={() => setKeepLikeness(!keepLikeness)} /><div className="block bg-gray-600 w-14 h-8 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${keepLikeness ? 'transform translate-x-full bg-fuchsia-400' : ''}`}></div></div>
                        </label>
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <span className="text-white font-medium text-sm block mb-1 text-center sm:text-left">Aspect Ratio</span>
                          <div className="flex bg-gray-700 rounded-lg p-1">
                            <button onClick={() => setAspectRatio('1:1')} className={`flex-1 px-2 py-1 text-xs font-semibold rounded-md transition ${aspectRatio === '1:1' ? 'bg-fuchsia-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                              Portrait (1:1)
                            </button>
                            <button onClick={() => setAspectRatio('16:9')} className={`flex-1 px-2 py-1 text-xs font-semibold rounded-md transition ${aspectRatio === '16:9' ? 'bg-fuchsia-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                              Landscape (16:9)
                            </button>
                          </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold">{ (inputMode === 'style' ? selectedStyle?.name : 'Custom Prompt') || "Select a Style or Describe"}</h3>
                            <p className="text-gray-400 text-sm">Cost: {currentCost} credits. You have {user.credits}.</p>
                        </div>
                        <Button onClick={handleGenerateClick} disabled={!canGenerate} className="w-full md:w-auto text-lg py-3">
                           <SparklesIcon className="w-5 h-5 mr-2" /> Generate Group Photo
                        </Button>
                    </div>

                    {user.credits < currentCost && (
                        <div className="mt-4 text-center border-t border-gray-700 pt-4">
                             <p className="text-sm text-yellow-300 mb-3">You don't have enough credits for this generation.</p>
                             <Button onClick={onNavigateToPricing} variant="custom" className="bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 w-full sm:w-auto">
                                Buy Credit Packs
                             </Button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default GroupUploadFlow;
