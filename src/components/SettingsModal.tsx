import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { storage } from '@/lib/storage';
import { AppConfig, AIProvider, SearchProvider } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [config, setConfig] = useState<AppConfig>(storage.getConfig());
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setConfig(storage.getConfig());
    }
  }, [open]);

  const handleSave = () => {
    storage.setConfig(config);
    document.documentElement.classList.toggle('dark', config.theme === 'dark');
    toast({
      title: 'Configuración guardada',
      description: 'Los cambios se han aplicado correctamente',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Proveedor de IA</h3>
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select value={config.aiProvider} onValueChange={(v) => setConfig({ ...config, aiProvider: v as AIProvider })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="grok">Grok (xAI)</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.aiProvider === 'openai' && (
              <>
                <div className="space-y-2">
                  <Label>API Key de OpenAI</Label>
                  <Input
                    type="password"
                    value={config.openaiKey}
                    onChange={(e) => setConfig({ ...config, openaiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    placeholder="gpt-4o"
                  />
                </div>
              </>
            )}

            {config.aiProvider === 'grok' && (
              <div className="space-y-2">
                <Label>API Key de Grok</Label>
                <Input
                  type="password"
                  value={config.grokKey}
                  onChange={(e) => setConfig({ ...config, grokKey: e.target.value })}
                  placeholder="xai-..."
                />
              </div>
            )}

            {config.aiProvider === 'gemini' && (
              <div className="space-y-2">
                <Label>API Key de Gemini</Label>
                <Input
                  type="password"
                  value={config.geminiKey}
                  onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })}
                  placeholder="..."
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Búsqueda Web</h3>
            <div className="space-y-2">
              <Label>Proveedor de Búsqueda</Label>
              <Select value={config.searchProvider} onValueChange={(v) => setConfig({ ...config, searchProvider: v as SearchProvider })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serper">Serper.dev</SelectItem>
                  <SelectItem value="bing">Bing</SelectItem>
                  <SelectItem value="google">Google CSE</SelectItem>
                  <SelectItem value="serpapi">SerpAPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={config.searchApiKey}
                onChange={(e) => setConfig({ ...config, searchApiKey: e.target.value })}
                placeholder="API Key del proveedor de búsqueda"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Funciones de Asistencia</h3>
            <div className="flex items-center justify-between">
              <Label>Mostrar Comentarios de IA</Label>
              <Switch
                checked={config.showComments}
                onCheckedChange={(checked) => setConfig({ ...config, showComments: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar Teclado Visual</Label>
              <Switch
                checked={config.showKeyboard}
                onCheckedChange={(checked) => setConfig({ ...config, showKeyboard: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Metas</h3>
            <div className="space-y-2">
              <Label>Meta Diaria (minutos)</Label>
              <Input
                type="number"
                min="1"
                value={config.dailyGoalMinutes}
                onChange={(e) => setConfig({ ...config, dailyGoalMinutes: parseInt(e.target.value) || 15 })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Internacionalización</h3>
            <div className="space-y-2">
              <Label>Idioma de la Aplicación</Label>
              <Select value={config.appLanguage} onValueChange={(v) => setConfig({ ...config, appLanguage: v as 'es' | 'en' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Distribución del Teclado</Label>
              <Select value={config.keyboardLayout} onValueChange={(v) => setConfig({ ...config, keyboardLayout: v as 'es' | 'en' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Tema</h3>
            <Select value={config.theme} onValueChange={(v) => setConfig({ ...config, theme: v as 'light' | 'dark' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
