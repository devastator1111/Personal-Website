"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink, Maximize2 } from "lucide-react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

export interface ProjectData {
    id: string | number;
    title: string;
    description: string;
    tags?: string[];
    images?: string[];
    link?: string;
    longDescription?: string;
}

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectData | null;
}

// Simple regex to detect URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function Linkify({ text }: { text: string }) {
    const parts = text.split(URL_REGEX);
    return (
        <>
            {parts.map((part, i) =>
                URL_REGEX.test(part) ? (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline break-all"
                    >
                        {part}
                    </a>
                ) : (
                    part
                )
            )}
        </>
    );
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        setCurrentImageIndex(0);
        setIsZoomed(false);
    }, [project]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isZoomed) {
                    setIsZoomed(false);
                } else {
                    onClose();
                }
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose, isZoomed]);

    if (!mounted) return null;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project?.images) {
            setCurrentImageIndex((prev) => (prev + 1) % project.images!.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project?.images) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? project.images!.length - 1 : prev - 1
            );
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && project && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col md:flex-row">
                            {/* Image Carousel Section */}
                            {project.images && project.images.length > 0 && (
                                <div className="w-full md:w-1/2 bg-neutral-950/50 relative group min-h-[300px] md:min-h-[500px]">
                                    <div className="w-full h-full relative aspect-video md:aspect-auto md:h-full group-hover:cursor-pointer" onClick={() => setIsZoomed(true)}>
                                        <Image
                                            src={project.images[currentImageIndex]}
                                            alt={`${project.title} - Image ${currentImageIndex + 1}`}
                                            fill
                                            className="object-contain object-center"
                                            priority
                                        />
                                    </div>

                                    {/* Zoom Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsZoomed(true);
                                        }}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="View Fullscreen"
                                    >
                                        <Maximize2 size={20} />
                                    </button>

                                    {project.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <ChevronRight size={24} />
                                            </button>

                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                                {project.images.map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Content Section */}
                            <div className={`w-full ${project.images && project.images.length > 0 ? 'md:w-1/2' : 'md:w-full'} p-6 md:p-8 flex flex-col`}>
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold text-white mb-2 pr-10">{project.title}</h2>
                                </div>

                                <div className="prose prose-invert max-w-none text-neutral-300 mb-8 space-y-4">
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        <Linkify text={project.longDescription || project.description} />
                                    </p>
                                </div>

                                {project.link && (
                                    <div className="mt-auto pt-6 border-t border-neutral-800">
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
                                        >
                                            View Live <ExternalLink size={16} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Full Screen Image Overlay */}
                    <AnimatePresence>
                        {isZoomed && project && project.images && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4"
                                onClick={() => setIsZoomed(false)}
                            >
                                <button
                                    onClick={() => setIsZoomed(false)}
                                    className="absolute top-4 right-4 p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors z-[120]"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                                    <Image
                                        src={project.images[currentImageIndex]}
                                        alt={`${project.title} - Fullscreen Image ${currentImageIndex + 1}`}
                                        fill
                                        className="object-contain" // Changed to contain for full visibility
                                        priority
                                    />

                                    {project.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-[120]"
                                            >
                                                <ChevronLeft size={32} />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-[120]"
                                            >
                                                <ChevronRight size={32} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
