"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggle = () => {
        const root = document.documentElement;
        const next = !root.classList.contains("dark");

        // brief transition class so colors cross-fade
        root.classList.add("theme-transition");
        root.classList.toggle("dark", next);
        try {
            localStorage.setItem("theme", next ? "dark" : "light");
        } catch { }
        setIsDark(next);
        window.setTimeout(() => root.classList.remove("theme-transition"), 450);
    };

    return (
        <button
            onClick={toggle}
            aria-label="Toggle colour theme"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-foreground/70 transition-colors hover:text-foreground hover:bg-secondary cursor-pointer"
        >
            {mounted && (isDark ? <Moon size={17} /> : <Sun size={17} />)}
        </button>
    );
};
