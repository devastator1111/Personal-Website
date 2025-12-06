import { Github, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="w-full py-12 mt-12 border-t border-neutral-900 bg-neutral-950 flex flex-col items-center justify-center gap-6">
            <div className="flex gap-6">
                <a href="https://github.com/devastator1111" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                    <Github size={20} />
                </a>
                <a href="https://www.linkedin.com/in/anirudh-ramesh-407445206/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                    <Linkedin size={20} />
                </a>
                <a href="mailto:rameshanirudh11@gmail.com" className="text-neutral-500 hover:text-white transition-colors">
                    <Mail size={20} />
                </a>
            </div>
            <p className="text-neutral-600 text-sm">
                © {new Date().getFullYear()} Anirudh Ramesh.
            </p>
        </footer>
    );
};
