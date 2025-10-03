import React, { useState, useMemo } from 'react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { DownloadIcon } from './common/Icons';
import { enhanceImage } from '../services/geminiService';
import { UserState } from '../types';

interface PhotoEditorProps {
  imageUrl: string;
  onClose: () => void;
  onComplete: (newImageUrl: string) => void;
  user: UserState;
}

const dataUrlToBlob = async (dataUrl: string): Promise<{blob: Blob, mimeType: string}> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { blob, mimeType: blob.type };
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};


export const PhotoEditor: React.FC<PhotoEditorProps> = ({ imageUrl, onClose, onComplete, user }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [useSkinSoftener, setUseSkinSoftener] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);

  const imageStyle = useMemo(() => enhancedImageUrl ? {} : ({
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`
  }), [brightness, contrast, saturate, enhancedImageUrl]);
  
  const handleManualEnhance = async () => {
    setIsEnhancing(true);
    setError(null);
    try {
        const { blob, mimeType } = await dataUrlToBlob(imageUrl);
        const base64Data = await blobToBase64(blob);

        let prompt = "";
        const adjustments = [];
        if (brightness !== 100) adjustments.push(`brightness: ${brightness}%`);
        if (contrast !== 100) adjustments.push(`contrast: ${contrast}%`);
        if (saturate !== 100) adjustments.push(`saturation: ${saturate}%`);

        if (useSkinSoftener) {
            prompt += "Perform a high-end, professional skin retouching. Smooth skin texture, remove minor blemishes, and even out skin tone for a natural, healthy look. ";
        } else {
            prompt += "Perform a subtle, professional photo enhancement. ";
        }

        if (adjustments.length > 0) {
            prompt += `Apply the following adjustments: ${adjustments.join(', ')}. `;
        }
        
        prompt += "VERY HIGH PRIORITY: Preserve the subject's exact facial features and identity. Maintain all details in the hair, eyes, clothing, and background. This is a retouching task, not a regeneration task. The result should look like a real, professionally edited photograph.";

        const newImageUrl = await enhanceImage(base64Data, mimeType, prompt, user.email);
        setEnhancedImageUrl(newImageUrl);

    } catch (err) {
        console.error("Enhancement failed:", err);
        setError((err as Error).message || "An unknown error occurred during enhancement.");
    } finally {
        setIsEnhancing(false);
    }
  };

  const handleDownload = () => {
      if (!enhancedImageUrl) return;
      const link = document.createElement('a');
      link.href = enhancedImageUrl;
      link.download = `your-image-pro-enhanced-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const handleReEdit = () => {
      setEnhancedImageUrl(null);
      setError(null);
  };

  const handleUseImage = () => {
      if (enhancedImageUrl) {
          onComplete(enhancedImageUrl);
      }
  };

  const Slider: React.FC<{label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onReset: () => void, disabled: boolean}> = ({ label, value, onChange, onReset, disabled }) => (
      <div>
          <div className="flex justify-between items-center mb-1">
            <label className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{label}</label>
            <button onClick={onReset} onDoubleClick={onReset} className="text-xs text-cyan-400 hover:underline" disabled={disabled}>Reset</button>
          </div>
          <input type="range" min="0" max="200" value={value} onChange={onChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 disabled:opacity-50" disabled={disabled} />
      </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose}>
        <h2 className="text-2xl font-bold mb-4 text-center">AI Photographer's Toolkit</h2>
        <div className="relative aspect-square w-full max-w-sm mx-auto mb-6 rounded-lg overflow-hidden bg-gray-800">
            <img src={enhancedImageUrl || imageUrl} alt="Editing preview" style={imageStyle} className="w-full h-full object-contain" />
            {isEnhancing && (
                 <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
                    <p className="text-white mt-4">Applying AI magic...</p>
                 </div>
            )}
        </div>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        
        {!enhancedImageUrl ? (
            <>
                <div className="space-y-4 mb-4">
                    <Slider label="Brightness" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} onReset={() => setBrightness(100)} disabled={isEnhancing} />
                    <Slider label="Contrast" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} onReset={() => setContrast(100)} disabled={isEnhancing} />
                    <Slider label="Saturation" value={saturate} onChange={(e) => setSaturate(Number(e.target.value))} onReset={() => setSaturate(100)} disabled={isEnhancing} />
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg mb-6">
                    <label htmlFor="skin-softener-toggle" className="flex items-center cursor-pointer justify-between w-full">
                        <span className="text-white font-medium text-sm">AI Power Airbrush</span>
                        <div className="relative"><input type="checkbox" id="skin-softener-toggle" className="sr-only" checked={useSkinSoftener} onChange={() => setUseSkinSoftener(!useSkinSoftener)} disabled={isEnhancing} /><div className="block bg-gray-600 w-14 h-8 rounded-full"></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${useSkinSoftener ? 'transform translate-x-full bg-fuchsia-400' : ''}`}></div></div>
                    </label>
                </div>

                <Button onClick={handleManualEnhance} disabled={isEnhancing} variant="secondary" className="w-full">
                     {isEnhancing ? 'Applying...' : 'Apply AI Enhancements'}
                </Button>
                <button onClick={onClose} className="text-sm text-gray-400 hover:text-white mt-4 w-full text-center">Cancel</button>
            </>
        ) : (
            <div className="text-center">
                <p className="text-green-400 font-semibold mb-4">Enhancements Applied!</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleDownload} variant="secondary" className="w-full flex items-center justify-center">
                        <DownloadIcon className="h-5 w-5 mr-2" /> Download
                    </Button>
                    <Button onClick={handleUseImage} variant="primary" className="w-full">
                        Use This Image
                    </Button>
                </div>
                <button onClick={handleReEdit} className="text-sm text-cyan-400 hover:underline mt-4">Re-edit</button>
            </div>
        )}
    </Modal>
  );
};