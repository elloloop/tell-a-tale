'use client';

import { useState, useEffect } from 'react';
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
import { AlertCircle, Check } from 'lucide-react';
import { checkUsernameAvailability } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function UserProfileButton() {
  const { username, changeUsername, isAuthenticated, signIn, signOut } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setNewUsername(username);
  }, [username]);

  const handleCheckAvailability = async () => {
    if (!newUsername || newUsername.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsChecking(true);
    setError(null);
    
    try {
      const result = await checkUsernameAvailability(newUsername);
      setIsAvailable(result.available);
      
      if (!result.available) {
        setError('This username is already taken');
      }
    } catch (error) {
      setError('Error checking username availability');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!isAvailable) {
      setError('Please choose an available username');
      return;
    }

    try {
      await changeUsername(newUsername);
      setIsDialogOpen(false);
      toast({
        title: 'Username Updated',
        description: `Your username is now ${newUsername}`,
      });
    } catch (error) {
      setError('Could not update username');
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <span className="text-sm font-medium">@{username || 'Loading...'}</span>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">Sign in to continue</span>
        )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          {isAuthenticated ? 'Profile' : 'Sign In'}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Your Profile</DialogTitle>
            <DialogDescription>
              {isAuthenticated 
                ? 'Update your username or manage your account.' 
                : 'Sign in to keep your username and stories.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value);
                    setIsAvailable(null);
                    setError(null);
                  }}
                  placeholder="Choose a username"
                  className={error ? "border-destructive" : ""}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCheckAvailability}
                  disabled={isChecking || !newUsername || newUsername === username}
                >
                  Check
                </Button>
              </div>
              
              {isAvailable && (
                <p className="text-green-600 text-sm flex items-center mt-1">
                  <Check className="h-4 w-4 mr-1" /> Username available
                </p>
              )}
              
              {error && (
                <p className="text-destructive text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" /> {error}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="sm:mr-auto"
            >
              Cancel
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button onClick={handleSave} disabled={!isAvailable || newUsername === username}>
                  Update Username
                </Button>
                <Button variant="destructive" onClick={() => {
                  signOut();
                  setIsDialogOpen(false);
                }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => {
                signIn();
                setIsDialogOpen(false);
              }}>
                Sign In
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
