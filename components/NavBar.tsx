"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import GlassSurface from "@/components/ui/GlassSurface";

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: "About", link: "#about" },
    { name: "Projects", link: "#projects" },
    { name: "Contact", link: "#contact" },
];

export const NavBar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-4 inset-x-0 z-50 mx-auto w-full max-w-2xl px-4">
            <GlassSurface
                width="100%"
                height={58}
                borderRadius={29}
                backgroundOpacity={scrolled ? 0.28 : 0.18}
                blur={12}
                opacity={0.9}
                distortionScale={-70}
                className="w-full transition-shadow duration-300"
            >
                <div className="flex w-full items-center justify-between gap-4 px-5">
                    <Link href="/" className="font-display text-lg font-medium tracking-tight text-foreground hover:opacity-70 transition-opacity">
                        Anirudh
                    </Link>
                    <div className="flex items-center gap-5">
                        <div className="hidden sm:flex gap-5">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.link}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </GlassSurface>
        </div>
    );
};
