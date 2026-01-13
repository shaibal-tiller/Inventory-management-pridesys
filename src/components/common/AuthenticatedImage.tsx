import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';

interface AuthenticatedImageProps {
    src: string;
    alt: string;
    className?: string;
    onError?: () => void;
}

/**
 * AuthenticatedImage Component
 * Loads images through authenticated fetch to bypass CORS issues
 */
export function AuthenticatedImage({ src, alt, className, onError }: AuthenticatedImageProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;

        const loadImage = async () => {
            try {
                // Extract the API path from the URL (everything after /api)
                const apiMatch = src.match(/\/api(\/.+)/);
                if (!apiMatch) {
                    throw new Error('Invalid image URL format');
                }
                const path = apiMatch[1];

                // Fetch image as blob using apiClient (bypasses CORS)
                const response = await apiClient.get(path, {
                    responseType: 'blob',
                });

                // Create object URL from blob
                objectUrl = URL.createObjectURL(response.data);
                setImageSrc(objectUrl);
                setError(false);
            } catch (err) {
                console.error('Failed to load image:', src, err);
                setError(true);
                onError?.();
            }
        };

        loadImage();

        // Cleanup: revoke object URL when component unmounts
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src, onError]);

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
            </div>
        );
    }

    if (!imageSrc) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    return <img src={imageSrc} alt={alt} className={className} />;
}
