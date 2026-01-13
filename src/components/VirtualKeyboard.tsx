import React from 'react';
import { cn } from '@/lib/utils';

interface KeyboardKey {
    key: string;
    finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
    hand: 'left' | 'right';
    row: number;
    display?: string;
}

const KEYBOARD_LAYOUT: KeyboardKey[] = [
    // Row 1 (Numbers)
    { key: '`', finger: 'pinky', hand: 'left', row: 1 },
    { key: '1', finger: 'pinky', hand: 'left', row: 1 },
    { key: '2', finger: 'ring', hand: 'left', row: 1 },
    { key: '3', finger: 'middle', hand: 'left', row: 1 },
    { key: '4', finger: 'index', hand: 'left', row: 1 },
    { key: '5', finger: 'index', hand: 'left', row: 1 },
    { key: '6', finger: 'index', hand: 'right', row: 1 },
    { key: '7', finger: 'index', hand: 'right', row: 1 },
    { key: '8', finger: 'middle', hand: 'right', row: 1 },
    { key: '9', finger: 'ring', hand: 'right', row: 1 },
    { key: '0', finger: 'pinky', hand: 'right', row: 1 },
    { key: '-', finger: 'pinky', hand: 'right', row: 1 },
    { key: '=', finger: 'pinky', hand: 'right', row: 1 },

    // Row 2 (QWERTY)
    { key: 'q', finger: 'pinky', hand: 'left', row: 2 },
    { key: 'w', finger: 'ring', hand: 'left', row: 2 },
    { key: 'e', finger: 'middle', hand: 'left', row: 2 },
    { key: 'r', finger: 'index', hand: 'left', row: 2 },
    { key: 't', finger: 'index', hand: 'left', row: 2 },
    { key: 'y', finger: 'index', hand: 'right', row: 2 },
    { key: 'u', finger: 'index', hand: 'right', row: 2 },
    { key: 'i', finger: 'middle', hand: 'right', row: 2 },
    { key: 'o', finger: 'ring', hand: 'right', row: 2 },
    { key: 'p', finger: 'pinky', hand: 'right', row: 2 },
    { key: '[', finger: 'pinky', hand: 'right', row: 2 },
    { key: ']', finger: 'pinky', hand: 'right', row: 2 },
    { key: '\\', finger: 'pinky', hand: 'right', row: 2 },

    // Row 3 (ASDF - Home row)
    { key: 'a', finger: 'pinky', hand: 'left', row: 3 },
    { key: 's', finger: 'ring', hand: 'left', row: 3 },
    { key: 'd', finger: 'middle', hand: 'left', row: 3 },
    { key: 'f', finger: 'index', hand: 'left', row: 3 },
    { key: 'g', finger: 'index', hand: 'left', row: 3 },
    { key: 'h', finger: 'index', hand: 'right', row: 3 },
    { key: 'j', finger: 'index', hand: 'right', row: 3 },
    { key: 'k', finger: 'middle', hand: 'right', row: 3 },
    { key: 'l', finger: 'ring', hand: 'right', row: 3 },
    { key: ';', finger: 'pinky', hand: 'right', row: 3 },
    { key: "'", finger: 'pinky', hand: 'right', row: 3 },

    // Row 4 (ZXCV)
    { key: 'z', finger: 'pinky', hand: 'left', row: 4 },
    { key: 'x', finger: 'ring', hand: 'left', row: 4 },
    { key: 'c', finger: 'middle', hand: 'left', row: 4 },
    { key: 'v', finger: 'index', hand: 'left', row: 4 },
    { key: 'b', finger: 'index', hand: 'left', row: 4 },
    { key: 'n', finger: 'index', hand: 'right', row: 4 },
    { key: 'm', finger: 'index', hand: 'right', row: 4 },
    { key: ',', finger: 'middle', hand: 'right', row: 4 },
    { key: '.', finger: 'ring', hand: 'right', row: 4 },
    { key: '/', finger: 'pinky', hand: 'right', row: 4 },

    // Space
    { key: ' ', finger: 'thumb', hand: 'right', row: 5, display: 'Space' },
];

const FINGER_COLORS = {
    pinky: 'bg-pink-500/30 border-pink-500',
    ring: 'bg-purple-500/30 border-purple-500',
    middle: 'bg-blue-500/30 border-blue-500',
    index: 'bg-green-500/30 border-green-500',
    thumb: 'bg-gray-500/30 border-gray-500',
};

interface VirtualKeyboardProps {
    nextKey: string;
    pressedKey: string | null;
    showFingerGuide?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    nextKey,
    pressedKey,
    showFingerGuide = true,
}) => {
    const getKeyStyle = (keyData: KeyboardKey) => {
        const baseStyle = 'relative px-3 py-2 rounded border-2 transition-all duration-100 font-mono text-sm flex items-center justify-center min-w-[40px]';
        const fingerColor = showFingerGuide ? FINGER_COLORS[keyData.finger] : 'bg-gray-700 border-gray-600';

        let additionalStyle = '';

        // Check match case-insensitive for letters, but be careful with symbols
        const isNext = keyData.key.toLowerCase() === nextKey.toLowerCase();
        const isPressed = keyData.key.toLowerCase() === pressedKey?.toLowerCase();

        // Special handling for Space
        if (keyData.key === ' ') {
            // Spacebar specific styles if needed
            additionalStyle += ' w-[300px]';
        }

        // Tecla que debe presionarse
        if (isNext) {
            additionalStyle += ' ring-2 ring-yellow-400 scale-110 shadow-lg shadow-yellow-400/50 z-10';
        }

        // Tecla siendo presionada
        if (isPressed) {
            additionalStyle += ' scale-95 brightness-150';
        }

        return cn(baseStyle, fingerColor, additionalStyle);
    };

    const renderKeyboard = () => {
        const rows: KeyboardKey[][] = [];
        for (let i = 1; i <= 5; i++) {
            rows.push(KEYBOARD_LAYOUT.filter(k => k.row === i));
        }

        return rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center mb-1">
                {row.map((keyData) => (
                    <div
                        key={keyData.key}
                        className={getKeyStyle(keyData)}
                    >
                        {keyData.display || keyData.key.toUpperCase()}
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900/80 rounded-lg backdrop-blur border border-gray-700 mt-4">
            <div className="select-none">
                {renderKeyboard()}
            </div>

            {showFingerGuide && (
                <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-pink-500/30 border border-pink-500" />
                        <span>Pinky</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500/30 border border-purple-500" />
                        <span>Ring</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500" />
                        <span>Middle</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500" />
                        <span>Index</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-500/30 border border-gray-500" />
                        <span>Thumb</span>
                    </div>
                </div>
            )}
        </div>
    );
};
