


import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { RedoIcon, DownloadIcon, ShareIcon, FacebookIcon, PencilIcon, VideoIcon } from './common/Icons';
import { PhotoEditor } from './PhotoEditor';
import { UserState } from '../types';

interface ResultsViewProps {
  media: string[];
  onStartOver: () => void;
  onGenerateMore: () => void;
  aspectRatio?: '1:1' | '16:9';
  fallbackMessage?: string | null;
  user: UserState;
}

const MediaRenderer: React.FC<{ 
    item: string;
    index: number;
    onDownload: (url: string, index: number) => void;
    onShare: (url: string) => void;
    onEdit: (url: string) => void;
    isImage: boolean;
    aspectRatio: '1:1' | '16:9';
}> = ({ item, index, onDownload, onShare, onEdit, isImage, aspectRatio }) => {
    
    if (!item) {
        return <div className={`aspect-square bg-gray-900 rounded-2xl animate-pulse`}></div>;
    }

    const mediaContainerClass = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square';

    return (
        <div className={`relative group ${mediaContainerClass} rounded-2xl overflow-hidden shadow-2xl shadow-fuchsia-900/20 bg-black`}>
            {isImage ? (
                <img src={item} alt={`Generated result ${index + 1}`} className="w-full h-full object-cover"/>
            ) : (
                <video src={item} controls autoPlay loop muted playsInline className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-4">
                <button onClick={() => onDownload(item, index)} className="p-3 bg-black/50 rounded-full hover:bg-fuchsia-500 transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400" aria-label={`Download media ${index + 1}`}>
                    <DownloadIcon className="h-6 w-6 text-white" />
                </button>
                 <button onClick={() => onShare(item)} className="p-3 bg-black/50 rounded-full hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400" aria-label={`Share media ${index + 1}`}>
                    <ShareIcon className="h-6 w-6 text-white" />
                </button>
                {isImage && (
                    <>
                        <button onClick={() => onEdit(item)} className="p-3 bg-black/50 rounded-full hover:bg-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400" aria-label={`Edit media ${index + 1}`}>
                            <PencilIcon className="h-6 w-6 text-white" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const ShareModal: React.FC<{ mediaUrl: string; onClose: () => void }> = ({ mediaUrl, onClose }) => {
    const caption = "Check out my new AI creation from Your Image Pro! 🔥 #AIcreation #YourImageProAI";
    const siteUrl = "https://yourimagepro.com";
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(caption)}`;
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8 max-w-lg w-full border border-gray-700 mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-4">Share Your New Creation</h3>
                <div className="flex gap-4 mb-6">
                    <img src={mediaUrl} alt="Share preview" className="w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm mb-2">Copy the caption and share on your favorite platform.</p>
                       <Button onClick={() => navigator.clipboard.writeText(caption)} className="w-full">Copy Caption</Button>
                    </div>
                </div>
                
                <div className="space-y-3">
                  <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-[#1877F2] text-white flex items-center justify-center px-6 py-3 font-semibold rounded-xl transition-all duration-300 hover:bg-[#166fe5]">
                      <FacebookIcon className="h-5 w-5 mr-2" /> Share on Facebook
                  </a>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-400">For Instagram: Download the content, then upload it in the app with the caption you copied!</p>
                  </div>
                </div>
                
                <button onClick={onClose} className="text-gray-400 hover:text-white mt-6 w-full text-center text-sm">Close</button>
            </div>
        </div>
    );
};

const ResultsView: React.FC<ResultsViewProps> = ({ media, onStartOver, onGenerateMore, aspectRatio = '1:1', fallbackMessage, user }) => {
    const [sharingUrl, setSharingUrl] = useState<string | null>(null);
    const [editingMedia, setEditingMedia] = useState<{url: string, index: number} | null>(null);
    const [currentMedia, setCurrentMedia] = useState(media);

    useEffect(() => {
        setCurrentMedia(media);
    }, [media]);

    const downloadMedia = (url: string, index: number) => {
        const link = document.createElement('a');
        link.href = url;
        const isImage = !url.startsWith('data:video');
        const extension = isImage ? 'png' : 'mp4';
        link.download = `creator-studio-${Date.now()}-${index + 1}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleShare = (url: string) => {
        setSharingUrl(url);
    };

    const handleEdit = (url: string, index: number) => {
        setEditingMedia({ url, index });
    };

    const handleEditComplete = (newImageUrl: string) => {
        if (editingMedia) {
            const updatedMedia = [...currentMedia];
            updatedMedia[editingMedia.index] = newImageUrl;
            setCurrentMedia(updatedMedia);
        }
        setEditingMedia(null);
    };

    return (
        <div className="container mx-auto px-6 py-12">
            {sharingUrl && <ShareModal mediaUrl={sharingUrl} onClose={() => setSharingUrl(null)} />}
            {editingMedia && (
                <PhotoEditor
                    imageUrl={editingMedia.url}
                    onClose={() => setEditingMedia(null)}
                    onComplete={handleEditComplete}
                    user={user}
                />
            )}
            <div className="text-center">
                <h2 className="text-4xl font-black text-white mb-2">Your New Creation is Ready!</h2>
                <p className="text-lg text-gray-400 mb-8">It has been saved to "My Creations". Download it, use the AI Toolkit, or generate more.</p>
            </div>

            {fallbackMessage && (
              <div className="max-w-2xl mx-auto mb-8 bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-6 py-4 rounded-lg text-center">
                <p className="font-bold text-lg">⚠️ System Notice</p>
                <p className="mt-2 text-sm">{fallbackMessage}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 mb-10 max-w-2xl mx-auto">
                {currentMedia?.map((item, index) => {
                    const isImage = !item.startsWith('data:video');
                    return (
                        <MediaRenderer 
                            key={index}
                            item={item} 
                            index={index} 
                            onDownload={downloadMedia} 
                            onShare={handleShare}
                            onEdit={(url) => handleEdit(url, index)}
                            isImage={isImage}
                            aspectRatio={isImage ? aspectRatio : '16:9'}
                        />
                    );
                })}
            </div>
            
            <div className="max-w-2xl mx-auto mt-10 mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Advertisement</p>
                  <div className="bg-gray-700 h-24 w-full flex items-center justify-center rounded">
                      <p className="text-gray-400">Your ad content here.</p>
                  </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Button onClick={onGenerateMore} variant="primary" className="w-full md:w-auto"><RedoIcon className="h-5 w-5 mr-2" />Generate More Styles</Button>
                <Button onClick={onStartOver} variant="secondary" className="w-full md:w-auto">Go to Homepage</Button>
            </div>
        </div>
    );
};

export default ResultsView;