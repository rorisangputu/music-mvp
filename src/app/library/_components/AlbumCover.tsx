import Image from "next/image";
import { useState } from "react";

interface CoverProps {
    url: string | undefined;
}

export default function AlbumCover({ url }: CoverProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Always encode the URL for the query parameter
    //const proxyUrl = `/api/images/image-proxy?url=${encodeURIComponent(url)}`;

    if (url === null) {
        return (
            <div className="w-[300px] h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="text-sm">Image unavailable</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 w-[300px] h-[300px] bg-gray-100 rounded-lg animate-pulse" />
            )}
            {url && <Image
                src={url}
                alt="Album cover"
                width={300}
                height={300}
                className="rounded-lg object-cover"
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
                onLoad={() => setLoading(false)}
            />}
        </div>
    );
}