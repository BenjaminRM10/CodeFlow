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

    // Find the note relevant to the current line (most recent previous note)
    const activeNote = displayNotes
        .filter(n => n.line <= currentLine + 1)
        .sort((a, b) => b.line - a.line)[0];

    // Find next note for "Up Next" context
    const nextNote = displayNotes
        .filter(n => n.line > currentLine + 1)
        .sort((a, b) => a.line - b.line)[0];

    return (
        <Card className="flex-1 h-full border-l border-border bg-card/50 backdrop-blur-sm flex flex-col rounded-none border-y-0 border-r-0">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-2 bg-background/50">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-sm">Contexto Educativo</h3>
            </div>

            {/* Active Note Content */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                {activeNote ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="text-xs font-mono bg-primary/10 px-2 py-1 rounded">
                                L{activeNote.line}
                            </span>
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Explicación Actual
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                            {activeNote.content}
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground text-sm py-10">
                        Comienza a escribir para ver las notas educativas...
                    </div>
                )}

                {/* Next Note Teaser */}
                {nextNote && (
                    <div className="mt-auto pt-6 border-t border-border/50 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                L{nextNote.line}
                            </span>
                            <span className="text-xs font-medium uppercase tracking-wider">
                                Siguiente
                            </span>
                        </div>
                        <p className="text-xs line-clamp-2 text-muted-foreground">
                            {nextNote.content}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};
