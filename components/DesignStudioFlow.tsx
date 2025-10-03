import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { UserState } from '../types';
import { Button } from './common/Button';
import { SparklesIcon, UploadIcon } from './common/Icons';

interface DesignStudioFlowProps {
  user: UserState;
  onNavigateToPricing: () => void;
  onGenerate: (options: {
    projectType: 'event_flyer',
    textContent: { [key: string]: string },
    styleDescription: string,
    logoFile?: File,
  }) => void;
}

const DESIGN_COST = 8;

const DesignStudioFlow: React.FC<DesignStudioFlowProps> = ({ user, onNavigateToPricing, onGenerate }) => {
  const [textContent, setTextContent] = useState({
    headline: '',
    details: '',
    date_time: '',
    location: '',
    call_to_action: '',
  });
  const [styleDescription, setStyleDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextContent({ ...textContent, [e.target.name]: e.target.value });
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/svg+xml': ['.svg'] },
    maxFiles: 1,
  });

  const canGenerate = useMemo(() => {
    return textContent.headline.trim() && styleDescription.trim();
  }, [textContent, styleDescription]);

  const handleGenerate = () => {
    if (!canGenerate) return;
    onGenerate({
      projectType: 'event_flyer',
      textContent,
      styleDescription,
      logoFile: logoFile || undefined,
    });
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-3">
          AI <span className="text-fuchsia-500">Design Studio</span>
        </h1>
        <p className="text-lg text-gray-400">Your personal graphic designer. Just fill out the brief.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Side: Form */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold border-b border-gray-700 pb-2 mb-4">Event Flyer Brief</h2>
          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-gray-300 mb-1">Headline</label>
            <input type="text" name="headline" id="headline" value={textContent.headline} onChange={handleTextChange} placeholder="e.g., Grand Opening Party" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
          </div>
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-300 mb-1">Event Details</label>
            <input type="text" name="details" id="details" value={textContent.details} onChange={handleTextChange} placeholder="e.g., Live Music, Free Food & Giveaways" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
          </div>
          <div>
            <label htmlFor="date_time" className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
            <input type="text" name="date_time" id="date_time" value={textContent.date_time} onChange={handleTextChange} placeholder="e.g., Saturday, June 5th @ 7 PM" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">Location / Address</label>
            <input type="text" name="location" id="location" value={textContent.location} onChange={handleTextChange} placeholder="e.g., 123 Main Street, Anytown" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
          </div>
           <div>
            <label htmlFor="call_to_action" className="block text-sm font-medium text-gray-300 mb-1">Contact / RSVP (Optional)</label>
            <input type="text" name="call_to_action" id="call_to_action" value={textContent.call_to_action} onChange={handleTextChange} placeholder="e.g., RSVP at yoursite.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
          </div>
        </div>

        {/* Right Side: Style & Logo */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Visual Style</h2>
            <textarea
              name="styleDescription"
              value={styleDescription}
              onChange={(e) => setStyleDescription(e.target.value)}
              placeholder="Describe the look and feel. E.g., 'Modern and minimalist with a gold and dark blue color scheme.' or 'Fun, energetic, and colorful for a kids party.'"
              className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>
           <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
             <h2 className="text-xl font-bold mb-4">Upload Logo (Optional)</h2>
             <div {...getRootProps()} className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-fuchsia-500 bg-fuchsia-900/20' : 'border-gray-700 hover:border-fuchsia-400'}`}>
                <input {...getInputProps()} />
                {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="h-16 mx-auto object-contain" />
                ) : (
                    <>
                        <UploadIcon className="h-8 w-8 text-gray-500 mx-auto" />
                        <p className="mt-1 text-sm text-gray-400">Drop your logo here</p>
                    </>
                )}
            </div>
           </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-20 mt-8">
          <div className="max-w-2xl mx-auto bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-2xl shadow-black/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                      <h3 className="text-lg font-bold">Ready to Generate?</h3>
                      <p className="text-gray-400 text-sm">Cost: {DESIGN_COST} credits. You have {user.credits}.</p>
                  </div>
                  <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full md:w-auto text-lg py-3">
                     <SparklesIcon className="w-5 h-5 mr-2" /> Generate Flyer
                  </Button>
              </div>
               {user.credits < DESIGN_COST && (
                  <div className="mt-4 text-center border-t border-gray-700 pt-4">
                       <p className="text-sm text-yellow-300 mb-3">You don't have enough credits for this generation.</p>
                       <Button onClick={onNavigateToPricing} variant="custom" className="bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 w-full sm:w-auto">
                          Buy Credit Packs
                       </Button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default DesignStudioFlow;
