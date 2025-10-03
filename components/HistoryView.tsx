import React, { useEffect, useState, useCallback } from 'react';
import { Button } from './common/Button';
import { DownloadIcon } from './common/Icons';
import { MediaItem, UserState } from '../types';
import { getMediaPaginated } from '../services/dbService';

interface HistoryViewProps {
  user: UserState;
  onStartOver: () => void;
}

const PAGE_SIZE = 15;

const MediaCard: React.FC<{ item: MediaItem }> = ({ item }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        if (item.type === 'video' && item.content instanceof Blob) {
            objectUrl = URL.createObjectURL(item.content);
            setUrl(objectUrl);
        } else if (item.type === 'image') {
            setUrl(item.content as string);
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [item]);

    const downloadMedia = () => {
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        const extension = item.type === 'video' ? 'mp4' : 'png';
        link.download = `your-image-pro-history-${item.id}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!url) {
        return (
            <div className="aspect-square rounded-2xl bg-gray-800 flex items-center justify-center">
                 <div className="animate-pulse w-1/2 h-1/2 bg-gray-700 rounded-lg"></div>
            </div>
        )
    }

    return (
        <div className="relative group aspect-square rounded-2xl overflow-hidden shadow-lg shadow-fuchsia-900/10 bg-black">
            {item.type === 'image' ? (
                 <img src={url} alt={`Generated result ${item.id}`} className="w-full h-full object-cover"/>
            ) : (
                <video src={url} muted loop playsInline className="w-full h-full object-cover" onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()}/>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                    onClick={downloadMedia} 
                    className="p-3 bg-black/50 rounded-full hover:bg-fuchsia-500 transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                    aria-label={`Download media ${item.id}`}
                >
                    <DownloadIcon className="h-6 w-6 text-white" />
                </button>
            </div>
        </div>
    );
};

const HistoryView: React.FC<HistoryViewProps> = ({ user, onStartOver }) => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const loadMedia = useCallback(async (pageNum: number) => {
        if (isLoading || !hasMore || !user || user.email === 'guest') return;
        
        setIsLoading(true);
        try {
            const { media: newMedia, hasMore: newHasMore } = await getMediaPaginated(user.email, pageNum, PAGE_SIZE);
            setMedia(prev => pageNum === 1 ? newMedia : [...prev, ...newMedia]);
            setHasMore(newHasMore);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to load media history:", error);
            // Optionally, show an error message to the user
        } finally {
            setIsLoading(false);
        }
    }, [user, isLoading, hasMore]);

    useEffect(() => {
        loadMedia(1);
    }, [user.email]);

    const handleLoadMore = () => {
        loadMedia(page + 1);
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center">
                <h2 className="text-4xl font-black text-white mb-2">My Creations</h2>
                <p className="text-lg text-gray-400 mb-8">Here are all the images and videos you've generated.</p>
            </div>
            
            {media.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10 max-w-7xl mx-auto">
                        {media.map((item) => <MediaCard key={item.id} item={item} />)}
                    </div>
                    {hasMore && (
                        <div className="text-center">
                            <Button onClick={handleLoadMore} disabled={isLoading} variant="secondary">
                                {isLoading ? 'Loading...' : 'Load More'}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                !isLoading && (
                    <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <h3 className="text-2xl font-bold text-white">Your gallery is empty</h3>
                        <p className="text-gray-400 mt-2 mb-6">Start generating images or videos to see them here!</p>
                        <Button onClick={onStartOver}>Start Generating</Button>
                    </div>
                )
            )}
            
            <div className="text-center mt-8">
                 <Button onClick={onStartOver} variant="secondary">Back to Homepage</Button>
            </div>
        </div>
    );
};

export default HistoryView;
