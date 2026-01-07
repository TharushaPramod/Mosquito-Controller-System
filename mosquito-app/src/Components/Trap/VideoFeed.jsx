

import React from 'react';
import { cn } from '@/lib/utils';
import { Camera } from 'lucide-react';

export const VideoFeed = ({ className }) => {
    // Use the backend mock stream URL
    const streamUrl = "http://localhost:5000/video/feed";

    // Error handling for image load could be added here

    return (
        <div className={cn("relative rounded-xl overflow-hidden shadow-2xl bg-black border border-gray-800", className)}>
            <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                LIVE
            </div>
            {/* Container for aspect ratio or fixed height */}
            <div className="relative aspect-video w-full bg-gray-900 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={streamUrl}
                    alt="Live Mosquito Feed"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if stream fails
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('flex-col');
                    }}
                />
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Camera size={48} className="mb-2 opacity-50" />
                    <span className="text-sm">Signal Lost</span>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg">Camera Feed 1</h3>
                <p className="text-gray-300 text-xs">Main Trap Unit</p>
            </div>
        </div>
    );
};
