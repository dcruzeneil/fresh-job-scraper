"use client";
import { useEffect, useState } from "react";
import { Monitor, Circle } from "lucide-react";
import { JobBoard } from "@/lib/types";

type Props = { board: JobBoard };

export default function KernelLiveView( { board } : Props) { 
    const [url, setUrl] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const storageKey = `kernelLiveViewUrl_${board.toLowerCase()}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) setUrl(saved);
    }, [board]);

    useEffect(() => {
        if (!url) return;
        const check = async () => {
            try {
                const res = await fetch(url, { method: 'HEAD' });
                setIsActive(res.ok);
            } catch {
                setIsActive(false);
            }
        };
        check();
        const id = setInterval(check, 60000);
        return () => clearInterval(id);
    }, [url]);

    if (!url) return null;

    return (
        <div className="flex items-center justify-between mt-4 border-t pt-3">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
                <Monitor className="size-4" />
                {board} Live View
            </a>
            <span className={`flex items-center gap-1 text-xs ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                <Circle className={`w-2 h-2 ${isActive ? 'fill-green-600' : 'fill-gray-400'}`} />
                {isActive ? 'Active' : 'Idle'}
            </span>
        </div>
    );
}