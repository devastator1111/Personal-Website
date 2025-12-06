"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
        <nav
            className={cn(
                "fixed top-4 inset-x-0 mx-auto max-w-2xl z-50 rounded-full border transition-all duration-300 px-6 py-3 flex items-center justify-between",
                scrolled
                    ? "bg-neutral-950/80 border-neutral-800 backdrop-blur-md shadow-lg"
                    : "bg-transparent border-transparent"
            )}
        >
            <Link href="/" className="text-lg font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
                Anirudh Ramesh
            </Link>
            <div className="flex gap-6">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.link}
                        className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </nav>
    );
};
