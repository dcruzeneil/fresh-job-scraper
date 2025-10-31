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
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
                <Monitor className="w-3.5 h-3.5" />
                {board} Live View
            </a>
            <span className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Circle className={`w-1.5 h-1.5 ${isActive ? 'fill-emerald-500' : 'fill-slate-300'}`} />
                {isActive ? 'Active' : 'Idle'}
            </span>
        </div>
    );
}