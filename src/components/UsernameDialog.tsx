'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useUser } from '@/providers/user-provider';
import { validateUsername } from '@/lib/username-utils';
import { useToast } from '@/hooks/use-toast';

interface UsernameDialogProps {
  isOpen: boolean;
  onClose: (username?: string) => void;
  onSave: (username: string) => void;
  onLogin: () => void;
}

export function UsernameDialog({ isOpen, onClose, onSave, onLogin }: UsernameDialogProps) {
  const { username: currentUsername, changeUsername, isAuthenticated } = useUser();
  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSave = async () => {
    const validation = validateUsername(username);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const success = await changeUsername(username);
    if (success) {
      onSave(username);
    }
  };

  const handleContinue = async () => {
    if (username !== currentUsername) {
      await handleSave();
    }
    onLogin();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Your Username</DialogTitle>
          <DialogDescription>
            This is how other readers will see you when you publish your story.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right font-medium col-span-1">
              Username
            </label>
            <div className="col-span-3">
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your username"
                className={error ? "border-destructive" : ""}
              />
              {error && <p className="text-destructive text-sm mt-1">{error}</p>}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onClose()}
            className="sm:mr-auto"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Use This Username
          </Button>
          {!isAuthenticated && (
            <Button onClick={handleContinue} variant="default" className="w-full sm:w-auto">
              Continue & Sign In
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
