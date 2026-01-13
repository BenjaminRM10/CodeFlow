import React, { memo } from 'react';

export interface CharacterState {
    status: 'correct' | 'incorrect' | 'pending';
    attempts: number;
    corrected: boolean;
}

interface CodeLineProps {
    lineIndex: number;
    lineContent: string;
    typedLine: string;
    isActive: boolean;
    isPracticeActive: boolean;
    currentCol: number;
    charStates: Record<string, CharacterState>;
    // Visual config
    cursorStyle: 'block' | 'line' | 'underline';
    smoothCaret: boolean;
}

const CodeLineComponent = ({
    lineIndex,
    lineContent,
    typedLine,
    isActive,
    isPracticeActive,
    currentCol,
    charStates,
    cursorStyle,
    smoothCaret,
}: CodeLineProps) => {
    return (
        <div
            id={`line-${lineIndex}`}
            className="flex items-center min-h-[32px] scroll-mt-4"
            style={{ lineHeight: '32px' }}
        >
            <span className="text-muted-foreground mr-4 select-none w-8 text-right opacity-50">
                {lineIndex + 1}
            </span>
            <div className="flex-1 relative whitespace-pre">
                {lineContent.split('').map((char, charIdx) => {
                    const key = `${lineIndex}-${charIdx}`;
                    const state = charStates[key];
                    const isCurrent = isActive && charIdx === currentCol;

                    let charClass = 'text-muted-foreground/60 transition-colors duration-100';

                    if (state && state.status !== 'pending') {
                        if (state.status === 'correct') {
                            charClass = state.corrected
                                ? 'text-green-500' // Corrected later
                                : 'text-foreground font-medium'; // Correct on first go (or eventually correct)
                        } else if (state.status === 'incorrect') {
                            charClass = 'text-red-500 bg-red-500/10 rounded-sm';
                        }
                    }

                    // Cursor Styles
                    const cursorBaseClass = `absolute pointer-events-none border-primary shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse`;
                    let cursorClass = cursorBaseClass;

                    if (smoothCaret) cursorClass += ' transition-all duration-100 ease-out';

                    switch (cursorStyle) {
                        case 'block':
                            cursorClass += ' inset-0 bg-primary/30 border-none'; // Partial fill for block
                            break;
                        case 'underline':
                            cursorClass += ' bottom-0 left-0 right-0 h-[2px] border-none bg-primary';
                            break;
                        case 'line':
                        default:
                            cursorClass += ' inset-y-0 left-0 w-[2px] bg-primary border-none';
                            break;
                    }

                    return (
                        <span key={charIdx} className="relative inline-block">
                            {isCurrent && isPracticeActive && (
                                <span className={cursorClass} />
                            )}
                            <span className={charClass}>
                                {char}
                            </span>
                        </span>
                    );
                })}

                {/* Cursor at end of line */}
                {isActive && currentCol === lineContent.length && isPracticeActive && (
                    <span className={`inline-block border-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)] align-middle bg-primary
                        ${smoothCaret ? 'transition-all duration-100' : ''}
                        ${cursorStyle === 'line' ? 'w-[2px] h-5' : ''}
                        ${cursorStyle === 'block' ? 'w-[1ch] h-5 opacity-50' : ''}
                        ${cursorStyle === 'underline' ? 'w-[1ch] h-[2px] translate-y-[10px]' : ''}
                     `} />
                )}
            </div>
        </div>
    );
};

// Custom Comparator for Performance
// This is the magic sauce. We ONLY re-render if:
// 1. This specific line is active or was active.
// 2. The text typed on THIS line changed.
// 3. The practice active state changed (for cursor blinking).
const arePropsEqual = (prev: CodeLineProps, next: CodeLineProps) => {
    // Config changes
    if (prev.cursorStyle !== next.cursorStyle) return false;
    if (prev.smoothCaret !== next.smoothCaret) return false;

    // Always update if active practice state changes (pausing/resuming)
    if (prev.isPracticeActive !== next.isPracticeActive) return false;

    // Always update if this line IS or WAS active
    if (prev.isActive || next.isActive) {
        // If it's active, check if anything relevant changed
        if (prev.isActive !== next.isActive) return false;
        if (prev.currentCol !== next.currentCol) return false;
        if (prev.typedLine !== next.typedLine) return false;
        // If active, we might assume charStates changed if typedLine changed.
        return true;
    }

    // If NOT active (and wasn't), simplistic check:
    if (prev.typedLine !== next.typedLine) return false;

    // Otherwise, assume it's stable.
    // Note: charStates object reference changes globally, but for a non-active line,
    // the states inside shouldn't change unless typedLine changed.
    return true;
};

export const CodeLine = memo(CodeLineComponent, arePropsEqual);
