import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Note {
    line: number;
    content: string;
}

interface NotesPanelProps {
    notes?: Note[];
    comments?: string[]; // Legacy support
    currentLine: number;
    isVisible: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
    notes = [],
    comments = [],
    currentLine,
    isVisible,
}) => {
    const activeNoteRef = useRef<HTMLDivElement>(null);

    // Normalize data to Note format
    const displayNotes: Note[] = notes.length > 0
        ? notes
        : comments.map((content, idx) => ({ line: idx + 1, content }));

    // Auto-scroll to active note
    useEffect(() => {
        if (isVisible && activeNoteRef.current) {
            activeNoteRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [currentLine, isVisible]);

    if (!isVisible) {
        return null;
    }

    // Find the note relevant to the current line (or the closest previous one)
    // Actually, standard behavior for "synchronized notes" is usually to highlight the note linked to the specific line or block.
    // If we want to show ALL notes and just highlight the current one:
    return (
        <Card className="flex-1 w-80 h-full border-l border-border bg-card/50 backdrop-blur-sm flex flex-col rounded-none border-y-0 border-r-0">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-2 bg-background/50">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-sm">Notas del Código</h3>
                <span className="ml-auto text-xs text-muted-foreground font-mono">
                    Línea {currentLine + 1}
                </span>
            </div>

            {/* Scrollable notes */}
            <ScrollArea className="flex-1 p-0">
                <div className="flex flex-col">
                    {displayNotes.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No hay notas para este proyecto.
                        </div>
                    ) : (
                        displayNotes.map((note, index) => {
                            const styles = note.line === currentLine + 1
                                ? "bg-primary/10 border-l-4 border-primary"
                                : "border-l-4 border-transparent hover:bg-muted/50";

                            return (
                                <div
                                    key={index}
                                    ref={note.line === currentLine + 1 ? activeNoteRef : null}
                                    className={cn(
                                        "p-4 text-sm transition-colors duration-200 border-b border-border/50",
                                        styles
                                    )}
                                >
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-mono text-muted-foreground shrink-0">
                                            L{note.line}
                                        </span>
                                    </div>
                                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
};
