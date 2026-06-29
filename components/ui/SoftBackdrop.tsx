"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A calm, pastel background: a few large blurred colour washes that drift slowly.
 * Replaces the old glowing WebGL light pillar with something soft and human.
 * Works in both light and dark mode (opacity tuned low so it stays subtle).
 */
export default function SoftBackdrop({ className = "" }: { className?: string }) {
    // The blobs animate forever, which keeps the compositor (and any
    // backdrop-filter sampling them, e.g. the glass navbar) busy every frame.
    // Pause the drift whenever this backdrop is scrolled out of view — it's
    // invisible then, so there's no visual change, only saved work.
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(
            ([entry]) => setActive(entry.isIntersecting),
            { rootMargin: "120px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} className={`pointer-events-none overflow-hidden ${active ? "" : "soft-backdrop--paused"} ${className}`} aria-hidden="true">
            <div className="soft-blob soft-blob--lilac" />
            <div className="soft-blob soft-blob--mint" />
            <div className="soft-blob soft-blob--pink" />

            <style jsx>{`
                .soft-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(70px);
                    opacity: 0.55;
                    will-change: transform;
                }
                :global(.dark) .soft-blob {
                    opacity: 0.32;
                    filter: blur(80px);
                }
                .soft-blob--lilac {
                    width: 38vw;
                    height: 38vw;
                    top: -6%;
                    left: 8%;
                    background: #cdbcf0;
                    animation: drift1 22s ease-in-out infinite alternate;
                }
                .soft-blob--mint {
                    width: 34vw;
                    height: 34vw;
                    bottom: -8%;
                    right: 10%;
                    background: #b6e3cd;
                    animation: drift2 26s ease-in-out infinite alternate;
                }
                .soft-blob--pink {
                    width: 30vw;
                    height: 30vw;
                    top: 28%;
                    right: 26%;
                    background: #f6c3d6;
                    animation: drift3 30s ease-in-out infinite alternate;
                }
                @keyframes drift1 {
                    from { transform: translate(0, 0) scale(1); }
                    to   { transform: translate(4vw, 5vh) scale(1.08); }
                }
                @keyframes drift2 {
                    from { transform: translate(0, 0) scale(1); }
                    to   { transform: translate(-5vw, -4vh) scale(1.1); }
                }
                @keyframes drift3 {
                    from { transform: translate(0, 0) scale(1); }
                    to   { transform: translate(-3vw, 4vh) scale(0.95); }
                }
                .soft-backdrop--paused .soft-blob {
                    animation-play-state: paused;
                }
                @media (prefers-reduced-motion: reduce) {
                    .soft-blob { animation: none; }
                }
            `}</style>
        </div>
    );
}
