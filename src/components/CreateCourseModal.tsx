import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCourse: (data: {
    language: string;
    prompt: string;
  }) => Promise<void>;
}

export function CreateCourseModal({ open, onOpenChange, onCreateCourse }: CreateCourseModalProps) {
  const [language, setLanguage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!language || !prompt) return;

    setIsLoading(true);
    try {
      await onCreateCourse({ language, prompt });
      onOpenChange(false);
      setLanguage('');
      setPrompt('');
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Curso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Lenguaje/Herramienta</Label>
            <Input
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Pandas, PostgreSQL, Docker..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt para la IA</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Curso completo de básico a avanzado"
              className="min-h-[100px] resize-y"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Curso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
