Plan de Mejora Detallado: Programming Training App
Transformación a Aplicación Portfolio-Ready

INSTRUCCIONES PARA EL AGENTE
Este documento guía la transformación completa de la Programming Training App. Cada fase debe completarse en orden. Al terminar cada fase:

Marca la fase como completada agregando ✅ al inicio del título
Documenta los cambios realizados en la sección "Cambios Implementados" de esa fase
Verifica que todos los checkpoints pasen antes de continuar
Commitea los cambios con un mensaje descriptivo referenciando la fase


✅ FASE 0: Preparación y Configuración Inicial
Objetivos

Configurar variables de entorno
Crear proyecto de demostración por defecto
Establecer estructura base para nuevas features

Tareas Específicas
0.1 Configuración de Variables de Entorno
bash# Crear archivo .env.local en la raíz del proyecto
Contenido del archivo .env.local:
env
VITE_GEMINI_API_KEY=tu_clave_aqui
VITE_SERPER_API_KEY=tu_clave_aqui
(solo usaremos gemini y serper para que funcione por ahora)
Modificar src/services/aiService.ts:

Agregar función getDefaultApiKey(provider: string) que retorne las claves desde import.meta.env.VITE_*
Modificar generateCode() para usar claves de entorno como fallback si no hay clave en config
Mantener la opción de que el usuario configure sus propias claves

Modificar src/services/searchService.ts:

Similar a aiService, usar import.meta.env.VITE_SERPER_API_KEY como fallback

0.2 Proyecto de Demostración por Defecto
Crear src/data/defaultProject.ts:
typescriptimport { Project } from '@/types';

export const DEFAULT_DEMO_PROJECT: Project = {
  id: 'demo-project-default',
  name: '🎯 Demo: React Component Practice',
  code: `// React Component: User Profile Card
import React, { useState } from 'react';

interface UserProps {
  name: string;
  email: string;
  avatar?: string;
}

const UserProfile: React.FC<UserProps> = ({ name, email, avatar }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="profile-card">
      <img src={avatar || '/default-avatar.png'} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      {isExpanded && (
        <div className="details">
          <button onClick={toggleExpand}>Show Less</button>
        </div>
      )}
      {!isExpanded && (
        <button onClick={toggleExpand}>Show More</button>
      )}
    </div>
  );
};

export default UserProfile;`,
  language: 'typescript',
  createdAt: new Date().toISOString(),
  folderId: null,
  description: 'Practice typing a complete React component with TypeScript. Perfect for beginners!',
  notes: [
    {
      line: 1,
      content: "Import statement brings in React and the useState hook for managing component state."
    },
    {
      line: 3,
      content: "TypeScript interface defines the shape of props this component expects."
    },
    {
      line: 9,
      content: "Functional component declaration with TypeScript type annotation for props."
    },
    {
      line: 10,
      content: "useState hook creates state variable for tracking expanded/collapsed state."
    },
    {
      line: 12,
      content: "Event handler function to toggle the expanded state."
    },
    {
      line: 16,
      content: "JSX return statement starts here - this is what gets rendered to the DOM."
    },
    {
      line: 18,
      content: "Conditional rendering using logical && operator - only shows if isExpanded is true."
    },
    {
      line: 23,
      content: "Alternative conditional rendering for the collapsed state."
    }
  ]
};
Modificar src/lib/storage.ts:

Agregar función initializeDefaultProject() que verifique si existen proyectos
Si no hay proyectos, crear el proyecto demo por defecto
Llamar esta función al cargar la app

Modificar src/pages/Index.tsx:

En el useEffect inicial, llamar a initializeDefaultProject() antes de cargar proyectos
Agregar un banner/tooltip que indique "👋 ¡Prueba el proyecto demo para comenzar!" si es la primera visita

0.3 Actualizar gitignore
gitignore# Agregar a .gitignore
.env.local
.env
Checkpoints de Validación

 Variables de entorno funcionan correctamente
 Al abrir la app por primera vez, aparece el proyecto demo
 El proyecto demo se puede abrir y practicar
 Las API keys de entorno funcionan sin configuración del usuario
 El usuario aún puede configurar sus propias claves en Settings

Cambios Implementados
Cambios Implementados
- Created `.env.local` for environment variables.
- Added `.env` to `.gitignore`.
- Updated `aiService.ts` and `searchService.ts` to use `VITE_*` env vars as fallback.
- Created `src/data/defaultProject.ts` with the "User Profile Card" demo.
- Updated `src/lib/storage.ts` with `initializeDefaultProject` logic.
- Updated `src/pages/Index.tsx` to auto-initialize the demo project on first load.
- Refined `Project` interface to support `notes` and `description`.

✅ FASE 1: Rediseño del Sistema de Precisión y Corrección
Objetivos

Permitir correcciones sin penalizar precisión permanentemente
Actualizar feedback visual en tiempo real
Mantener WPM afectado por correcciones (tiempo invertido)

Tareas Específicas
1.1 Nueva Lógica de Precisión en Practice.tsx
Modificar el estado para tracking mejorado:
typescriptinterface CharacterState {
  index: number;
  status: 'correct' | 'incorrect' | 'pending';
  attempts: number; // nuevo: contar intentos
  corrected: boolean; // nuevo: si fue corregido
}

const [characterStates, setCharacterStates] = useState<CharacterState[]>([]);
Actualizar la función de manejo de teclas:
typescriptconst handleKeyPress = (e: KeyboardEvent) => {
  // Si es Backspace
  if (e.key === 'Backspace') {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // NO penalizar precisión, solo marcar como pendiente de nuevo
      setCharacterStates(prev => {
        const newStates = [...prev];
        newStates[currentIndex - 1] = {
          ...newStates[currentIndex - 1],
          status: 'pending'
        };
        return newStates;
      });
    }
    return;
  }

  // Si es caracter normal
  const expectedChar = code[currentIndex];
  const isCorrect = e.key === expectedChar;
  
  setCharacterStates(prev => {
    const newStates = [...prev];
    const currentState = newStates[currentIndex] || { attempts: 0, corrected: false };
    
    newStates[currentIndex] = {
      index: currentIndex,
      status: isCorrect ? 'correct' : 'incorrect',
      attempts: currentState.attempts + 1,
      corrected: currentState.attempts > 0 && isCorrect // fue corregido si hay intentos previos
    };
    
    return newStates;
  });

  if (isCorrect) {
    setCurrentIndex(prev => prev + 1);
  }
};
Nueva función de cálculo de precisión:
typescriptconst calculateAccuracy = () => {
  const totalTyped = characterStates.filter(cs => cs.status !== 'pending').length;
  if (totalTyped === 0) return 100;
  
  // Solo contar como error si el caracter está actualmente incorrecto
  const currentErrors = characterStates.filter(cs => cs.status === 'incorrect').length;
  
  return Math.round(((totalTyped - currentErrors) / totalTyped) * 100);
};
1.2 Actualizar Renderizado Visual
Modificar la función que renderiza el código con colores:
typescriptconst renderCodeWithHighlight = () => {
  return code.split('').map((char, index) => {
    const state = characterStates[index];
    let className = 'text-gray-400'; // pending/no escrito
    
    if (state) {
      if (state.status === 'correct') {
        className = state.corrected 
          ? 'text-green-400' // verde si fue corregido
          : 'text-white'; // blanco si fue correcto a la primera
      } else if (state.status === 'incorrect') {
        className = 'text-red-500 bg-red-500/20'; // rojo con fondo
      }
    }
    
    if (index === currentIndex) {
      className += ' bg-blue-500/30 animate-pulse'; // cursor actual
    }
    
    return (
      <span key={index} className={className}>
        {char === '\n' ? '↵\n' : char}
      </span>
    );
  });
};
1.3 Mejorar UI de Métricas
Agregar indicador visual de correcciones:
tsx<div className="stats-panel">
  <div className="stat">
    <span>WPM:</span>
    <span className="text-2xl font-bold">{wpm}</span>
  </div>
  <div className="stat">
    <span>Precisión:</span>
    <span className="text-2xl font-bold">{accuracy}%</span>
  </div>
  <div className="stat">
    <span>Correcciones:</span>
    <span className="text-xl text-yellow-400">
      {characterStates.filter(cs => cs.corrected).length}
    </span>
  </div>
</div>
Checkpoints de Validación

 Al escribir incorrectamente, la letra se marca en rojo
 Al borrar y corregir, la letra cambia a verde
 La precisión NO baja al corregir un error
 El WPM se mantiene realista (considera tiempo total)
 Las métricas se actualizan en tiempo real
 La letra actualmente siendo escrita tiene indicador visual claro

Cambios Implementados
- Implemented `CharacterState` and full 2D accuracy tracking in `Practice.tsx`.
- Updated visual feedback: Correct (Foreground), Corrected (Green), Incorrect (Red).
- Added "Corrections" counter to the metrics panel.
- Refactored `Practice.tsx` to normalize `project.code` array handling.
- Removed unused imports and fixed type errors.

FASE 2: Teclado Virtual con Guía de Dedos
Objetivos

Implementar teclado visual que muestre qué dedos usar
Animar teclas al presionarlas
Seguir estándares de touch typing

Tareas Específicas
2.1 Crear Componente VirtualKeyboard
Crear src/components/VirtualKeyboard.tsx:
typescriptimport React from 'react';
import { cn } from '@/lib/utils';

interface KeyboardKey {
  key: string;
  finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
  hand: 'left' | 'right';
  row: number;
  display?: string; // para teclas especiales
}

const KEYBOARD_LAYOUT: KeyboardKey[] = [
  // Fila 1 (números)
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
  
  // Fila 2 (QWERTY)
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
  
  // Fila 3 (ASDF - Home row)
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
  
  // Fila 4 (ZXCV)
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
  
  // Espacio
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
    const baseStyle = 'relative px-3 py-2 rounded border-2 transition-all duration-100 font-mono text-sm';
    const fingerColor = showFingerGuide ? FINGER_COLORS[keyData.finger] : 'bg-gray-700 border-gray-600';
    
    let additionalStyle = '';
    
    // Tecla que debe presionarse
    if (keyData.key.toLowerCase() === nextKey.toLowerCase()) {
      additionalStyle = 'ring-2 ring-yellow-400 scale-110 shadow-lg shadow-yellow-400/50';
    }
    
    // Tecla siendo presionada
    if (keyData.key.toLowerCase() === pressedKey?.toLowerCase()) {
      additionalStyle = 'scale-95 brightness-150';
    }
    
    return cn(baseStyle, fingerColor, additionalStyle);
  };

  const renderKeyboard = () => {
    const rows: KeyboardKey[][] = [];
    for (let i = 1; i <= 5; i++) {
      rows.push(KEYBOARD_LAYOUT.filter(k => k.row === i));
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="flex gap-1 justify-center">
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
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-800/50 rounded-lg backdrop-blur">
      <div className="space-y-1">
        {renderKeyboard()}
      </div>
      
      {showFingerGuide && (
        <div className="mt-4 flex justify-center gap-4 text-xs">
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
2.2 Integrar Teclado en Practice.tsx
Modificar src/pages/Practice.tsx:
typescriptimport { VirtualKeyboard } from '@/components/VirtualKeyboard';

// Agregar estado para tecla presionada
const [pressedKey, setPressedKey] = useState<string | null>(null);

// Modificar handleKeyPress
const handleKeyPress = (e: KeyboardEvent) => {
  setPressedKey(e.key);
  
  // ... lógica existente ...
  
  // Limpiar después de 100ms
  setTimeout(() => setPressedKey(null), 100);
};

// En el JSX, agregar el teclado
return (
  <div className="practice-container">
    {/* ... código existente ... */}
    
    <VirtualKeyboard
      nextKey={code[currentIndex] || ''}
      pressedKey={pressedKey}
      showFingerGuide={true}
    />
  </div>
);
2.3 Agregar Toggle en Settings
Modificar src/components/SettingsModal.tsx:

Agregar opción "Show Virtual Keyboard" en configuración
Guardar preferencia en AppConfig
Usar preferencia en Practice.tsx

Checkpoints de Validación

 El teclado virtual se muestra correctamente
 Los colores de dedos son visibles y claros
 La tecla que debe presionarse se resalta (amarillo/brillante)
 Al presionar una tecla, se anima correctamente
 La leyenda de colores es clara
 El teclado se puede ocultar desde Settings
 El teclado es responsive

Cambios Implementados
<!-- El agente documentará aquí -->

FASE 3: Sistema de Notas Sincronizadas
Objetivos

Sincronizar panel de notas con línea actual de código
Auto-scroll del panel de notas
Mejorar UX de visualización

Tareas Específicas
3.1 Calcular Línea Actual
Modificar src/pages/Practice.tsx:
typescript// Nuevo estado para trackear línea actual
const [currentLine, setCurrentLine] = useState(1);

// Función para calcular línea actual basada en currentIndex
const calculateCurrentLine = (index: number, code: string) => {
  const textUpToCursor = code.substring(0, index);
  return textUpToCursor.split('\n').length;
};

// Actualizar en useEffect cuando cambia currentIndex
useEffect(() => {
  const line = calculateCurrentLine(currentIndex, code);
  setCurrentLine(line);
}, [currentIndex, code]);
3.2 Crear Componente NotesPanel Mejorado
Crear src/components/NotesPanel.tsx:
typescriptimport React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, ChevronDown } from 'lucide-react';

interface Note {
  line: number;
  content: string;
}

interface NotesPanelProps {
  notes: Note[];
  currentLine: number;
  isVisible: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  notes,
  currentLine,
  isVisible,
}) => {
  const activeNoteRef = useRef<HTMLDivElement>(null);

  // Auto-scroll a la nota activa
  useEffect(() => {
    if (activeNoteRef.current) {
      activeNoteRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentLine]);

  if (!isVisible || notes.length === 0) {
    return null;
  }

  // Encontrar nota más cercana a la línea actual
  const getCurrentNote = () => {
    const relevantNotes = notes.filter(n => n.line <= currentLine);
    if (relevantNotes.length === 0) return notes[0];
    return relevantNotes[relevantNotes.length - 1];
  };

  const currentNote = getCurrentNote();

  return (
    <Card className="w-80 h-full bg-gray-900/95 border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold">Code Notes</h3>
        <span className="ml-auto text-xs text-gray-400">
          Line {currentLine}
        </span>
      </div>

      {/* Scrollable notes */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {notes.map((note, index) => {
            const isActive = note.line === currentNote.line;
            const isPast = note.line < currentLine;
            const isFuture = note.line > currentLine;

            return (
              <div
                key={index}
                ref={isActive ? activeNoteRef : null}
                className={cn(
                  'p-3 rounded-lg border-l-4 transition-all duration-300',
                  isActive && 'bg-blue-500/10 border-blue-500 scale-105',
                  isPast && 'bg-green-500/5 border-green-500/30 opacity-50',
                  isFuture && 'bg-gray-800/30 border-gray-600 opacity-40'
                )}
              >
                {/* Line number badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full font-mono',
                      isActive && 'bg-blue-500 text-white',
                      isPast && 'bg-green-500/20 text-green-400',
                      isFuture && 'bg-gray-700 text-gray-400'
                    )}
                  >
                    Line {note.line}
                  </span>
                  {isActive && (
                    <ChevronDown className="w-4 h-4 text-blue-400 animate-bounce" />
                  )}
                </div>

                {/* Note content */}
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    isActive && 'text-white',
                    isPast && 'text-gray-400',
                    isFuture && 'text-gray-500'
                  )}
                >
                  {note.content}
                </p>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer con progreso */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>
            {notes.filter(n => n.line < currentLine).length} / {notes.length} notes
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(notes.filter(n => n.line < currentLine).length / notes.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </Card>
  );
};
3.3 Integrar NotesPanel en Practice
Modificar src/pages/Practice.tsx:
typescriptimport { NotesPanel } from '@/components/NotesPanel';

// Agregar estado para visibilidad
const [showNotes, setShowNotes] = useState(true);

// En el layout
return (
  <div className="practice-layout h-screen flex">
    {/* Panel principal de código (izquierda/centro) */}
    <div className="flex-1 flex flex-col">
      {/* ... código existente ... */}
    </div>

    {/* Panel de notas (derecha) */}
    {project.notes && project.notes.length > 0 && (
      <NotesPanel
        notes={project.notes}
        currentLine={currentLine}
        isVisible={showNotes}
      />
    )}
  </div>
);
3.4 Agregar Control de Visibilidad
Agregar botón toggle en la barra de herramientas:
tsx<Button
  variant="outline"
  size="sm"
  onClick={() => setShowNotes(!showNotes)}
  className="flex items-center gap-2"
>
  <BookOpen className="w-4 h-4" />
  {showNotes ? 'Hide Notes' : 'Show Notes'}
</Button>
Checkpoints de Validación

 El panel de notas se muestra a la derecha
 La nota activa corresponde a la línea actual de código
 El panel hace auto-scroll suavemente a la nota activa
 Las notas pasadas se ven atenuadas
 Las notas futuras se ven deshabilitadas
 El progreso visual funciona correctamente
 Se puede ocultar/mostrar el panel de notas
 El layout es responsive

Cambios Implementados
<!-- El agente documentará aquí -->

FASE 4: Mejora del Generador de Código AI
Objetivos

Generar código real sin comentarios inline excesivos
Separar código de explicaciones
Mejorar prompts para cada lenguaje

Tareas Específicas
4.1 Mejorar Prompts de Generación
Modificar src/services/aiService.ts:
typescriptconst buildCodeGenerationPrompt = (
  userPrompt: string,
  language: string,
  searchContext?: string
): string => {
  const basePrompt = `Generate REAL, PRODUCTION-QUALITY ${language} code based on this request: "${userPrompt}"

CRITICAL RULES:
1. Generate ONLY executable code - NO inline comments explaining the code
2. Code should be complete and functional
3. Use realistic variable names and structure
4. Include all necessary imports/includes
5. The code should be 30-100 lines long
6. Focus on practical, real-world patterns

After the code block, provide a separate JSON array called "notes" with educational explanations.

Format your response as JSON:
{
  "code": "// actual code here without explanatory comments",
  "language": "${language}",
  "description": "Brief one-line description",
"notes": [
{
"line": 1,
"content": "Explanation of what happens on this line"
},
{
"line": 5,
"content": "Another explanation"
}
]
}
${searchContext ? Context from web search:\n${searchContext}\n : ''}
Remember:

Code should have NO inline comments explaining logic
All explanations go in the "notes" array
Code should be realistic and follow best practices for ${language}
Include error handling where appropriate
Use modern syntax and patterns`;
return basePrompt;
};


#### 4.2 Ejemplos Específicos por Lenguaje

**Agregar templates de ejemplo:**
```typescript
const LANGUAGE_TEMPLATES = {
  typescript: {
    example: `import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading ? <Spinner /> : <UserList users={users} />}
    </div>
  );
};`,
    guidelines: [
      'Use TypeScript interfaces for type safety',
      'Include async/await for API calls',
      'Add proper error handling',
      'Use React hooks correctly',
    ],
  },
  python: {
    example: `from typing import List, Dict
import asyncio
import aiohttp

class DataFetcher:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_data(self, endpoint: str) -> Dict:
        async with self.session.get(f"{self.base_url}/{endpoint}") as response:
            return await response.json()
    
    async def batch_fetch(self, endpoints: List[str]) -> List[Dict]:
        tasks = [self.fetch_data(ep) for ep in endpoints]
        return await asyncio.gather(*tasks)`,
    guidelines: [
      'Use type hints throughout',
      'Implement async/await for I/O operations',
      'Use context managers appropriately',
      'Follow PEP 8 style guide',
    ],
  },
  javascript: {
    example: `class TaskQueue {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }

  async waitAll() {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}`,
    guidelines: [
      'Use modern ES6+ syntax',
      'Implement async/await correctly',
      'Add proper error handling',
      'Use classes for complex logic',
    ],
  },
};
```

#### 4.3 Validación Post-Generación

**Agregar función de validación:**
```typescript
const validateGeneratedCode = (code: string): boolean => {
  // Verificar que no haya demasiados comentarios inline
  const lines = code.split('\n');
  const commentLines = lines.filter(line => 
    line.trim().startsWith('//') || 
    line.trim().startsWith('*') ||
    line.trim().startsWith('#')
  );
  
  const commentRatio = commentLines.length / lines.length;
  
  if (commentRatio > 0.3) {
    console.warn('Generated code has too many comments');
    return false;
  }
  
  // Verificar que tenga contenido sustancial
  const codeLines = lines.filter(line => 
    line.trim() !== '' && 
    !line.trim().startsWith('//') &&
    !line.trim().startsWith('*')
  );
  
  if (codeLines.length < 10) {
    console.warn('Generated code is too short');
    return false;
  }
  
  return true;
};
```

#### 4.4 Regenerar si No Cumple Criterios

**Modificar la función generateCode:**
```typescript
export const generateCode = async (
  config: AppConfig,
  prompt: string,
  language: string,
  searchContext?: string,
  maxRetries = 2
): Promise<GeneratedCode> => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const result = await attemptGeneration(config, prompt, language, searchContext);
      
      if (validateGeneratedCode(result.code)) {
        return result;
      }
      
      console.log(`Attempt ${attempts + 1} failed validation, retrying...`);
      attempts++;
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) throw error;
    }
  }
  
  throw new Error('Failed to generate valid code after multiple attempts');
};
```

### Checkpoints de Validación
- [ ] El código generado no tiene comentarios inline excesivos
- [ ] Las explicaciones están separadas en el array de notas
- [ ] El código es ejecutable y realista
- [ ] La longitud del código es apropiada (30-100 líneas)
- [ ] Los prompts específicos por lenguaje funcionan
- [ ] La validación rechaza código inadecuado
- [ ] El sistema reintenta si la generación falla

### Cambios Implementados
<!-- El agente documentará aquí -->

---

## FASE 5: Rediseño Visual Completo (UI/UX)

### Objetivos
- Diseño moderno y profesional
- Animaciones fluidas
- Experiencia "wow factor"
- Responsive design

### Tareas Específicas

#### 5.1 Nueva Paleta de Colores y Tema

**Crear `src/styles/theme.ts`:**
```typescript
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    accent: {
      cyan: '#06b6d4',
      purple: '#a855f7',
      pink: '#ec4899',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: {
      primary: '#0a0a0f',
      secondary: '#13131a',
      tertiary: '#1a1a24',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      tertiary: '#71717a',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    success: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
  },
  shadows: {
    glow: '0 0 20px rgba(102, 126, 234, 0.4)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  },
};
```

#### 5.2 Rediseñar Dashboard (Index.tsx)

**Nuevo layout hero:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
  {/* Hero Section */}
  <div className="relative overflow-hidden">
    {/* Animated background */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
    <div className="absolute inset-0">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
    </div>

    {/* Content */}
    <div className="relative z-10 container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Code Typing Master
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Master touch typing for programming with AI-generated lessons
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatsCard
          icon={<Zap />}
          label="Average WPM"
          value={averageWPM}
          gradient="from-cyan-500 to-blue-500"
        />
        <StatsCard
          icon={<Target />}
          label="Accuracy"
          value={`${averageAccuracy}%`}
          gradient="from-green-500 to-emerald-500"
        />
        <StatsCard
          icon={<TrendingUp />}
          label="Projects Completed"
          value={completedProjects}
          gradient="from-purple-500 to-pink-500"
        />
      </div>
    </div>
  </div>

  {/* Projects Grid */}
  <div className="container mx-auto px-4 pb-16">
    <ProjectsGrid projects={projects} />
  </div>
</div>
```

**Agregar animaciones CSS en tailwind.config.js:**
```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'blob': 'blob 7s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        glow: {
          'from': {
            'box-shadow': '0 0 10px rgba(102, 126, 234, 0.5)',
          },
          'to': {
            'box-shadow': '0 0 20px rgba(102, 126, 234, 0.8)',
          },
        },
      },
    },
  },
};
```

#### 5.3 Rediseñar Practice Page

**Nuevo layout de práctica:**
```tsx
<div className="min-h-screen bg-gray-950 flex flex-col">
  {/* Top Bar con métricas */}
  <div className="bg-gray-900/95 border-b border-purple-500/20 backdrop-blur-sm sticky top-0 z-50">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        {/* Project info */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <p className="text-sm text-gray-400">{project.language}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex gap-6">
          <MetricDisplay
            label="WPM"
            value={wpm}
            icon={<Zap />}
            color="text-cyan-400"
          />
          <MetricDisplay
            label="Accuracy"
            value={`${accuracy}%`}
            icon={<Target />}
            color="text-green-400"
          />
          <MetricDisplay
            label="Time"
            value={formatTime(elapsedTime)}
            icon={<Clock />}
            color="text-purple-400"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={handlePause} variant="outline">
            {isPaused ? <Play /> : <Pause />}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw />
          </Button>
        </div>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-1 flex overflow-hidden">
    {/* Code Editor Panel */}
    <div className="flex-1 flex flex-col p-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentIndex / code.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(currentIndex / code.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Code display */}
      <Card className="flex-1 bg-gray-900/50 border-gray-800 backdrop-blur-sm overflow-hidden">
        <ScrollArea className="h-full p-6">
          <pre className="font-mono text-base leading-relaxed">
            {renderCodeWithHighlight()}
          </pre>
        </ScrollArea>
      </Card>

      {/* Virtual Keyboard */}
      <div className="mt-6">
        <VirtualKeyboard
          nextKey={code[currentIndex]}
          pressedKey={pressedKey}
          showFingerGuide={showKeyboard}
        />
      </div>
    </div>

    {/* Notes Panel */}
    {showNotes && (
      <div className="w-96 border-l border-gray-800">
        <NotesPanel
          notes={project.notes || []}
          currentLine={currentLine}
          isVisible={showNotes}
        />
      </div>
    )}
  </div>
</div>
```

#### 5.4 Crear Componentes de UI Mejorados

**StatsCard Component:**
```tsx
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, gradient }) => {
  return (
    <Card className="relative overflow-hidden bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
            {React.cloneElement(icon as React.ReactElement, {
              className: 'w-6 h-6 text-white',
            })}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
```

**ProjectCard Component con hover effects:**
```tsx
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Card className="group relative overflow-hidden bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300" />
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <Badge variant="secondary">{project.language}</Badge>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
          {project.name}
        </h3>
        
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-gray-400">
            <span>WPM: {project.wpm || 0}</span>
            <span>Accuracy: {project.accuracy || 0}%</span>
          </div>
          
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onClick={() => navigate(`/practice/${project.id}`)}
          >
            Practice
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### 5.5 Animaciones de Transición

**Agregar framer-motion para transiciones:**
```bash
npm install framer-motion
```
```tsx
import { motion } from 'framer-motion';

// Animar entrada de proyectos
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <ProjectCard project={project} />
</motion.div>

// Animar cambios de línea en práctica
<motion.div
  key={currentLine}
  initial={{ x: -10, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  {/* Contenido de la línea */}
</motion.div>
```

### Checkpoints de Validación
- [ ] El diseño se ve moderno y profesional
- [ ] Las animaciones son fluidas (60fps)
- [ ] Los gradientes y efectos de glow funcionan
- [ ] Las tarjetas tienen hover effects atractivos
- [ ] La paleta de colores es consistente
- [ ] El diseño es completamente responsive
- [ ] Las transiciones entre páginas son suaves
- [ ] El "wow factor" está presente

### Cambios Implementados
<!-- El agente documentará aquí -->

---

## FASE 6: Features Adicionales y Polish

### Objetivos
- Agregar features que eleven la experiencia
- Gamificación
- Achievements
- Estadísticas avanzadas

### Tareas Específicas

#### 6.1 Sistema de Achievements

**Crear `src/types/achievements.ts`:**
```typescript
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: (stats: UserStats) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-project',
    title: 'First Steps',
    description: 'Complete your first project',
    icon: '🎯',
    requirement: (stats) => stats.projectsCompleted >= 1,
    rarity: 'common',
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Achieve 80+ WPM',
    icon: '⚡',
    requirement: (stats) => stats.maxWPM >= 80,
    rarity: 'rare',
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete a project with 100% accuracy',
    icon: '💎',
    requirement: (stats) => stats.perfectProjects >= 1,
    rarity: 'epic',
  },
  {
    id: 'polyglot',
    title: 'Code Polyglot',
    description: 'Practice in 5 different languages',
    icon: '🌐',
    requirement: (stats) => stats.languagesPracticed >= 5,
    rarity: 'epic',
  },
  {
    id: 'marathon',
    title: 'Marathon Runner',
    description: 'Practice for 10 hours total',
    icon: '🏃',
    requirement: (stats) => stats.totalTime >= 36000000, // 10 hours in ms
    rarity: 'legendary',
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    description: 'Practice 7 days in a row',
    icon: '🔥',
    requirement: (stats) => stats.currentStreak >= 7,
    rarity: 'legendary',
  },
];
```

**Crear `src/components/AchievementsModal.tsx`:**
```tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-600',
};

export const AchievementsModal = ({ isOpen, onClose, achievements }) => {
  const [justUnlocked, setJustUnlocked] = useState<Achievement | null>(null);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">🏆 Achievements</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative p-4 rounded-lg border-2 ${
                  achievement.unlockedAt
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-700 bg-gray-800/50 opacity-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`text-4xl ${
                      achievement.unlockedAt ? 'grayscale-0' : 'grayscale'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <Badge
                        className={`bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]}`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {achievement.description}
                    </p>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unlock notification */}
      <AnimatePresence>
        {justUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-8 right-8 z-50 p-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{justUnlocked.icon}</div>
              <div>
                <p className="text-sm font-semibold text-white/80">
                  Achievement Unlocked!
                </p>
                <p className="text-xl font-bold text-white">
                  {justUnlocked.title}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
```

#### 6.2 Dashboard de Estadísticas Avanzadas

**Crear `src/components/StatsDetailboard.tsx`:**
```tsx
import { LineChart, BarChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const StatsDetailboard = ({ projects }) => {
  // Procesar datos para gráficos
  const wpmOverTime = projects.map((p, i) => ({
    session: i + 1,
    wpm: p.wpm || 0,
    accuracy: p.accuracy || 0,
  }));

  const languageBreakdown = Object.entries(
    projects.reduce((acc, p) => {
      acc[p.language] = (acc[p.language] || 0) + 1;
      return acc;
    }, {})
  ).map(([lang, count]) => ({ language: lang, count }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* WPM Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>WPM Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            width={500}
            height={300}
            data={wpmOverTime}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="session" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="wpm"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </CardContent>
      </Card>

      {/* Language Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Practice by Language</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={500} height={300} data={languageBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="language" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
              }}
            />
            <Bar dataKey="count" fill="#a855f7" />
          </BarChart>
        </CardContent>
      </Card>
    </div>
  );
};
```

#### 6.3 Daily Streak Tracker

**Crear `src/components/StreakTracker.tsx`:**
```tsx
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const StreakTracker = ({ streak, practiceHistory }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
date.setDate(date.getDate() - (6 - i));
return date;
});
const hasPracticed = (date: Date) => {
return practiceHistory.some(
(p) =>
new Date(p.createdAt).toDateString() === date.toDateString()
);
};
return (
<Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
<CardContent className="p-6">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2">
<div className="text-3xl">🔥</div>
<div>
<p className="text-sm text-gray-400">Current Streak</p>
<p className="text-3xl font-bold">{streak} days</p>
</div>
</div>
</div>
    <div className="flex justify-between gap-2">
      {last7Days.map((date, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              hasPracticed(date)
                ? 'bg-green-500'
                : 'bg-gray-700'
            }`}
          >
            {hasPracticed(date) ? '✓' : ''}
          </div>
          <span className="text-xs text-gray-400">
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
);
};

#### 6.4 Leaderboard (Opcional - Mock)

**Crear `src/components/Leaderboard.tsx`:**
````tsx
export const Leaderboard = () => {
  const mockLeaders = [
    { rank: 1, name: 'CodeMaster', wpm: 120, accuracy: 98 },
    { rank: 2, name: 'TypeNinja', wpm: 115, accuracy: 97 },
    { rank: 3, name: 'KeyboardWarrior', wpm: 110, accuracy: 96 },
    // ... more
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mockLeaders.map((leader) => (
            <div
              key={leader.rank}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    leader.rank === 1
                      ? 'bg-yellow-500 text-black'
                      : leader.rank === 2
                      ? 'bg-gray-400 text-black'
                      : leader.rank === 3
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700'
                  }`}
                >
                  {leader.rank}
                </div>
                <span className="font-semibold">{leader.name}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-cyan-400">{leader.wpm} WPM</span>
                <span className="text-green-400">{leader.accuracy}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
````

### Checkpoints de Validación
- [ ] El sistema de achievements funciona correctamente
- [ ] Las notificaciones de unlock aparecen
- [ ] Los gráficos de estadísticas se renderizan
- [ ] El streak tracker actualiza correctamente
- [ ] El leaderboard se muestra (mock)
- [ ] Todas las features son responsive

### Cambios Implementados
<!-- El agente documentará aquí -->

---

## FASE 7: Optimización y Pruebas Finales

### Objetivos
- Optimizar rendimiento
- Pruebas de usabilidad
- Pulir detalles
- Preparar para deploy

### Tareas Específicas

#### 7.1 Optimización de Rendimiento

**Implementar lazy loading:**
````tsx
// En App.tsx
import { lazy, Suspense } from 'react';

const Practice = lazy(() => import('./pages/Practice'));
const Index = lazy(() => import('./pages/Index'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/practice/:id" element={<Practice />} />
      </Routes>
    </Suspense>
  );
}
````

**Optimizar re-renders:**
````tsx
// Usar React.memo para componentes pesados
export const ProjectCard = React.memo(({ project }) => {
  // ...
});

// Usar useMemo para cálculos costosos
const filteredProjects = useMemo(() => {
  return projects.filter(/* ... */);
}, [projects, filters]);

// Usar useCallback para funciones que se pasan como props
const handleProjectClick = useCallback((id: string) => {
  navigate(`/practice/${id}`);
}, [navigate]);
````

#### 7.2 Error Boundaries

**Crear `src/components/ErrorBoundary.tsx`:**
````tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center p-8 max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Reload App
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
````

#### 7.3 Loading States

**Crear `src/components/LoadingScreen.tsx`:**
````tsx
export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Loading...
        </h2>
      </div>
    </div>
  );
};
````

#### 7.4 Toast Notifications Mejoradas

**Configurar sonner para notificaciones:**
````bash
npm install sonner
````
````tsx
// En main.tsx
import { Toaster } from 'sonner';

root.render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" theme="dark" />
  </React.StrictMode>
);

// Usar en la app
import { toast } from 'sonner';

toast.success('Project created successfully!', {
  description: 'Start practicing now',
  action: {
    label: 'Open',
    onClick: () => navigate(`/practice/${project.id}`),
  },
});
````

#### 7.5 README y Documentación

**Crear README.md completo:**
````markdown
# 🚀 Code Typing Master

An AI-powered application to master touch typing for programming.

## ✨ Features

- 🤖 AI-generated code lessons (GPT-4, Gemini, Grok)
- ⌨️ Virtual keyboard with finger guide
- 📊 Real-time metrics (WPM, accuracy)
- 📝 Synchronized code notes
- 🏆 Achievements system
- 📈 Advanced statistics
- 🔥 Daily streak tracking
- 🎨 Beautiful, modern UI

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite
- TailwindCSS
- Shadcn/UI
- Framer Motion
- Recharts

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` with your API keys
4. Run: `npm run dev`

## 🔑 Environment Variables
```env
VITE_GEMINI_API_KEY=your_key_here
VITE_SERPER_API_KEY=your_key_here
```

## 📸 Screenshots

[Add screenshots here]

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License
````

#### 7.6 Checklist Final

**Verificar antes de deployment:**

- [ ] Todas las API keys funcionan desde .env.local
- [ ] El proyecto demo aparece por defecto
- [ ] No hay errores en consola
- [ ] Performance (Lighthouse score > 90)
- [ ] Todas las animaciones son fluidas
- [ ] Responsive en mobile, tablet, desktop
- [ ] Pruebas en diferentes navegadores
- [ ] Manejo de errores implementado
- [ ] Loading states en todas las acciones async
- [ ] README completo
- [ ] Screenshots agregados
- [ ] Comentarios en código complejo

### Checkpoints de Validación
- [ ] La aplicación carga rápidamente
- [ ] No hay errores en consola del navegador
- [ ] Todos los errores están manejados gracefully
- [ ] Los loading states son claros
- [ ] Las notificaciones son informativas
- [ ] El README es claro y completo
- [ ] La app está lista para portfolio

### Cambios Implementados
<!-- El agente documentará aquí -->

---

## 🎉 FASE FINAL: Deploy y Pulido

### Objetivos
- Preparar para producción
- Deploy
- Documentación final

### Tareas Específicas

#### Deploy en Vercel/Netlify
````bash
# Build production
npm run build

# Verificar que build funciona
npm run preview

# Deploy
# Para Vercel: vercel
# Para Netlify: netlify deploy --prod
````

#### Últimos Detalles

- [ ] Favicon personalizado
- [ ] Meta tags para SEO
- [ ] Open Graph tags para compartir
- [ ] Analytics (opcional)
- [ ] Terms of Service (opcional)
- [ ] Privacy Policy (opcional)

#### Documentación Final

**Actualizar este README.md con:**
- ✅ Lista de todas las fases completadas
- 📝 Resumen de cambios principales
- 🔗 Link de la aplicación en producción
- 📊 Métricas finales (Lighthouse, etc.)
- 🎯 Objetivos cumplidos vs planificados

---

## 📋 Resumen de Progreso

<!-- El agente actualizará esta sección al final -->

**Fases Completadas:** 0/8

**Fecha de Inicio:** [Fecha]
**Fecha de Finalización:** [Fecha]

**Principales Logros:**
- [ ] Proyecto demo por defecto implementado
- [ ] Sistema de precisión corregible
- [ ] Teclado virtual con guía de dedos
- [ ] Notas sincronizadas con código
- [ ] Generador de código mejorado
- [ ] Diseño visual renovado
- [ ] Sistema de achievements
- [ ] Optimizaciones de rendimiento

**Notas Adicionales:**
<!-- Agregar cualquier nota importante durante el desarrollo -->

---

## 🤖 Nota para el Agente

Recuerda:
1. Completar cada fase EN ORDEN
2. Marcar checkpoints al terminar
3. Documentar cambios en cada fase
4. Probar exhaustivamente antes de continuar
5. Preguntar si algo no está claro