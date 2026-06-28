interface BlurTextProps {
    text: string;
    delay?: number;
    className?: string;
}

/**
 * Hero heading that blurs each word into place on load. Pure CSS animation
 * (see `.blur-text` in globals.css) so the above-the-fold hero doesn't pull a
 * JS animation library into the critical path.
 */
export const BlurText = ({ text, delay = 0, className = "" }: BlurTextProps) => {
    const words = text.split(" ");

    return (
        <div className={`blur-text ${className}`}>
            {words.map((word, index) => (
                <span
                    key={index}
                    style={{ animationDelay: `${delay + index * 0.1}s` }}
                >
                    {word}
                </span>
            ))}
        </div>
    );
};
