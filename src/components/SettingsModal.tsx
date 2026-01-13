import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { storage } from '@/lib/storage';
import { AppConfig } from '@/types';
import { toast } from 'sonner';
import { Volume2, Monitor, Keyboard, Type, Globe, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [config, setConfig] = useState<AppConfig>(storage.getConfig());

  useEffect(() => {
    if (open) {
      setConfig(storage.getConfig());
    }
  }, [open]);

  const handleSave = () => {
    storage.setConfig(config);
    document.documentElement.classList.toggle('dark', config.theme === 'dark');
    toast.success('Configuración guardada', {
      description: 'Tus preferencias han sido actualizadas',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col bg-gray-950 border-gray-800 text-white p-0 gap-0">
        <DialogHeader className="p-6 border-b border-gray-800">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-500" />
            Configuración
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="experience" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-gray-900">
              <TabsTrigger value="experience">Experiencia</TabsTrigger>
              <TabsTrigger value="appearance">Apariencia</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <TabsContent value="experience" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Teclado Visual</Label>
                    <p className="text-sm text-gray-400">Mostrar el teclado con guía de dedos</p>
                  </div>
                  <Switch
                    checked={config.showKeyboard}
                    onCheckedChange={(checked) => setConfig({ ...config, showKeyboard: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Guía de Dedos</Label>
                    <p className="text-sm text-gray-400">Colorear teclas según el dedo correcto</p>
                  </div>
                  <Switch
                    checked={config.showFingerGuide}
                    onCheckedChange={(checked) => setConfig({ ...config, showFingerGuide: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ayudas IA</Label>
                    <p className="text-sm text-gray-400">Mostrar notas y explicaciones inteligentes</p>
                  </div>
                  <Switch
                    checked={config.showComments}
                    onCheckedChange={(checked) => setConfig({ ...config, showComments: checked })}
                  />
                </div>

                <Separator className="bg-gray-800" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <Label className="text-base">Sonido de Tecleo</Label>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-gray-400">Activar Sonidos</Label>
                    <Switch
                      checked={config.soundEnabled}
                      onCheckedChange={(checked) => setConfig({ ...config, soundEnabled: checked })}
                    />
                  </div>

                  {config.soundEnabled && (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="text-sm text-gray-400">Volumen</Label>
                          <span className="text-xs text-gray-500">{Math.round(config.soundVolume * 100)}%</span>
                        </div>
                        <Slider
                          value={[config.soundVolume]}
                          max={1}
                          step={0.1}
                          onValueChange={(vals) => setConfig({ ...config, soundVolume: vals[0] })}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-400">Tipo de Switch</Label>
                        <Select value={config.soundType} onValueChange={(v) => setConfig({ ...config, soundType: v as any })}>
                          <SelectTrigger className="bg-gray-900 border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            <SelectItem value="mechanical">Mecánico (Clicky)</SelectItem>
                            <SelectItem value="laptop">Laptop (Suave)</SelectItem>
                            <SelectItem value="bubble">Burbuja (Pop)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4 text-pink-400" />
                    <Label>Tamaño de Fuente</Label>
                  </div>
                  <Select value={config.fontSize} onValueChange={(v) => setConfig({ ...config, fontSize: v as any })}>
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                      <SelectItem value="small">Pequeño (Compacto)</SelectItem>
                      <SelectItem value="medium">Normal (Equilibrado)</SelectItem>
                      <SelectItem value="large">Grande (Legibilidad)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estilo del Cursor</Label>
                  <Select value={config.cursorStyle} onValueChange={(v) => setConfig({ ...config, cursorStyle: v as any })}>
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                      <SelectItem value="block">Bloque ▋</SelectItem>
                      <SelectItem value="line">Línea |</SelectItem>
                      <SelectItem value="underline">Subrayado _</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animación Suave</Label>
                    <p className="text-sm text-gray-400">El cursor se desliza suavemente</p>
                  </div>
                  <Switch
                    checked={config.smoothCaret}
                    onCheckedChange={(checked) => setConfig({ ...config, smoothCaret: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="general" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <Label>Idioma de la App</Label>
                  </div>
                  <Select value={config.appLanguage} onValueChange={(v) => setConfig({ ...config, appLanguage: v as any })}>
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Keyboard className="w-4 h-4 text-green-400" />
                    <Label>Distribución de Teclado</Label>
                  </div>
                  <Select value={config.keyboardLayout} onValueChange={(v) => setConfig({ ...config, keyboardLayout: v as any })}>
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                      <SelectItem value="es">Español (ISO)</SelectItem>
                      <SelectItem value="en">English (ANSI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <Label>Meta Diaria (Minutos)</Label>
                  </div>
                  <Input
                    type="number"
                    value={config.dailyGoalMinutes}
                    onChange={(e) => setConfig({ ...config, dailyGoalMinutes: parseInt(e.target.value) || 0 })}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t border-gray-800 bg-gray-950">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-gray-800 text-gray-400 hover:text-white">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
