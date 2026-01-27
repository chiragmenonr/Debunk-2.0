import { useState } from 'react';
import { Settings, Moon, Sun, Timer, Swords, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';
import { LanguageTone } from '@/types/debate';

const toneOptions: { value: LanguageTone; label: string }[] = [
  { value: 'slang', label: 'Slang' },
  { value: 'highschool', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'adult', label: 'Adult' },
  { value: 'scholar', label: 'Scholar' },
  { value: 'coach', label: 'Coach' },
];

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const { 
    settings, 
    setDarkMode, 
    setEnableTimer, 
    setEnableCounterArguments,
    setDefaultTone 
  } = useSettings();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="dark-mode" className="cursor-pointer">
                Dark Mode
              </Label>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>

          {/* Timer Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="timer" className="cursor-pointer">
                Practice Timer
              </Label>
            </div>
            <Switch
              id="timer"
              checked={settings.enableTimer}
              onCheckedChange={setEnableTimer}
            />
          </div>

          {/* Counter-Arguments Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Swords className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="counter-args" className="cursor-pointer">
                Counter-Arguments
              </Label>
            </div>
            <Switch
              id="counter-args"
              checked={settings.enableCounterArguments}
              onCheckedChange={setEnableCounterArguments}
            />
          </div>

          {/* Default Tone Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <Label>Default Tone</Label>
            </div>
            <Select
              value={settings.defaultTone}
              onValueChange={(value) => setDefaultTone(value as LanguageTone)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Settings are saved automatically and will persist between sessions.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
