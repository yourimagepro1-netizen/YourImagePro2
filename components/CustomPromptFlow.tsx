
import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { UserState } from '../types';
import { SparklesIcon } from './common/Icons';

interface CustomPromptFlowProps {
  user: UserState;
  onGenerate: (prompt: string, negativePrompt: string, keepLikeness: boolean, aspectRatio: '1:1' | '16:9') => void;
  initialFiles: File[];
  generationCost: number;
  onNavigateToPricing: () => void;
  onBack: () => void;
  initialAspectRatio?: '1:1' | '16:9';
  onWatchAd: () => void;
}

const promptSuggestions = [
  "A professional business headshot, wearing a dark suit, in a modern office with a blurred background.",
  "Photo of a person as a superhero, dramatic lighting, cinematic style.",
  "A high-fashion photo, street style, in New York City.",
  "Painted portrait in the style of Van Gogh.",
  "Vector art cartoon character, vibrant colors.",
];

const FilePreview: React.FC<{ file: File }> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) return null;

  return (
    <div className="relative w-full aspect-square border border-gray-700 rounded-lg overflow-hidden">
      <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
    </div>
  );
};

const CustomPromptFlow: React.FC<CustomPromptFlowProps> = ({ user, onGenerate, initialFiles, generationCost, onNavigateToPricing, onBack, initialAspectRatio, onWatchAd }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [keepLikeness, setKeepLikeness] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9'>(initialAspectRatio || '1:1');
  const [isAdLoading, setIsAdLoading] = useState(false);


  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim(), negativePrompt.trim(), keepLikeness, aspectRatio);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerateClick();
    }
  };
  
  const handleWatchAdClick = () => {
    setIsAdLoading(true);
    // Simulate a 15-second ad
    setTimeout(() => {
        onWatchAd();
        setIsAdLoading(false);
    }, 15000);
  };

  const canGenerate = prompt.trim().length > 0;
  
  const today = new Date().toISOString().split('T')[0];
  const adsWatched = user.lastAdWatchDate === today ? user.adsWatchedToday ?? 0 : 0;
  const adsRemaining = 6 - adsWatched;
  const canWatchAd = adsRemaining > 0 && !isAdLoading;

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-2">Describe Your Image</h2>
        <p className="text-gray-400 text-center mb-8">Unleash your creativity. What do you want to see?</p>
        
        {user.credits > 0 && user.credits < generationCost && (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-6 py-4 rounded-lg text-sm mb-6 text-center">
                <strong>Heads up!</strong> You're running low on credits. <button onClick={onNavigateToPricing} className="font-bold underline hover:text-yellow-200">Get more</button> or watch an ad below to keep creating.
            </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-300 text-center">Your Photo</h3>
                <div className="max-w-sm mx-auto">
                   {initialFiles[0] && <FilePreview file={initialFiles[0]} />}
                </div>
            </div>
            <div>
                <div className="mb-4">
                    <label htmlFor="custom-prompt" className="block text-lg font-semibold mb-2 text-gray-300">Your Prompt:</label>
                    <textarea
                        id="custom-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., A professional headshot in a business suit..."
                        className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition"
                        aria-label="Image Description Prompt"
                    />
                </div>
                 <div className="mb-4">
                    <label htmlFor="negative-prompt" className="block text-sm font-semibold mb-1 text-gray-400">Negative Prompt (Optional):</label>
                    <textarea
                        id="negative-prompt"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g., text, watermarks, blurry, extra fingers..."
                        className="w-full h-16 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition"
                        aria-label="Negative Prompt"
                    />
                </div>
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Need inspiration? Try one of these:</h4>
                    <div className="flex flex-wrap gap-2">
                        {promptSuggestions.map(p => (
                            <button key={p} onClick={() => setPrompt(p)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors">
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label htmlFor="likeness-toggle-custom" className="flex items-center cursor-pointer justify-between">
                        <span className="text-white font-medium text-sm">Keep likeness strict</span>
                        <div className="relative"><input type="checkbox" id="likeness-toggle-custom" className="sr-only" checked={keepLikeness} onChange={() => setKeepLikeness(!keepLikeness)} /><div className="block bg-gray-600 w-14 h-8 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${keepLikeness ? 'transform translate-x-full bg-fuchsia-400' : ''}`}></div></div>
                    </label>
                     <div>
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
                <Button onClick={handleGenerateClick} disabled={!canGenerate} className="w-full text-lg">
                    <SparklesIcon className="h-5 w-5 mr-2"/> Generate ({generationCost} Credits)
                </Button>
                {user.credits < generationCost && (
                    <div className="mt-4 text-center border-t border-gray-700 pt-4">
                          <p className="text-sm text-gray-400 mb-3">You need {generationCost} credits. You have {user.credits}.</p>
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
        <div className="text-center mt-8">
            <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">
                &larr; Back to Style Selection
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPromptFlow;
