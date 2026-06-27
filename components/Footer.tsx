import { Github, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="w-full py-12 mt-12 border-t border-border bg-background flex flex-col items-center justify-center gap-6">
            <div className="flex gap-3">
                <a href="https://github.com/devastator1111" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Github size={18} />
                </a>
                <a href="https://www.linkedin.com/in/anirudh-ramesh-407445206/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Linkedin size={18} />
                </a>
                <a href="mailto:rameshanirudh11@gmail.com" aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Mail size={18} />
                </a>
            </div>
            <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} Anirudh Ramesh.
            </p>
        </footer>
    );
};
