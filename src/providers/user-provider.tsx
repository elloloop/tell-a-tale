'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { generateRandomUsername, validateUsername } from '@/lib/username-utils';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { signInAnonymously, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth, firestore } from '@/lib/firebase-client';

interface UserContextType {
  username: string;
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  changeUsername: (newUsername: string) => Promise<boolean>;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useLocalStorage<string>('tell-a-tale-username', '');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Generate a random username if none exists
    if (!username) {
      const newUsername = generateRandomUsername();
      setUsername(newUsername);
    }

    // Initialize Firebase Auth listener
    try {
      const unsubscribe = onAuthStateChanged(auth as Auth, (currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing auth state listener:", error);
      setIsLoading(false);
      return () => {};
    }
  }, [username, setUsername]);

  // Check if the user has a stored username in Firestore when they authenticate
  useEffect(() => {
    const fetchFirestoreUsername = async () => {
      if (user && user.uid) {
        try {
          const userRef = doc(firestore as Firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().username) {
            setUsername(userDoc.data().username);
          } else if (username) {
            // Save the current username to Firestore
            try {
              await setDoc(userRef, { 
                username, 
                createdAt: new Date() 
              }, { merge: true });
            } catch (error) {
              console.error("Error saving username to Firestore:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching username from Firestore:", error);
        }
      }
    };

    if (user) {
      fetchFirestoreUsername();
    }
  }, [user, username, setUsername]);

  const changeUsername = async (newUsername: string): Promise<boolean> => {
    const validation = validateUsername(newUsername);
    if (!validation.valid) {
      toast({
        title: 'Invalid Username',
        description: validation.error,
        variant: 'destructive',
      });
      return false;
    }

    // Save username to local storage
    setUsername(newUsername);
    
    // If user is authenticated, save to Firestore
    if (user && user.uid) {
      try {
        await setDoc(doc(firestore as Firestore, 'users', user.uid), { 
          username: newUsername,
          updatedAt: new Date()
        }, { merge: true });
        
        toast({
          title: 'Username Updated',
          description: `Your username is now ${newUsername}`,
        });
        return true;
      } catch (error) {
        console.error("Error updating username in Firestore:", error);
        toast({
          title: 'Error Updating Username',
          description: 'Could not update your username in the database',
          variant: 'destructive',
        });
        return false;
      }
    }
    
    toast({
      title: 'Username Updated',
      description: `Your username is now ${newUsername}`,
    });
    return true;
  };

  const signIn = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      await signInAnonymously(auth as Auth);
      return true;
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      toast({
        title: 'Authentication Error',
        description: 'Could not sign you in anonymously',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await (auth as Auth).signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been signed out',
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: 'Sign Out Error',
        description: 'Could not sign you out properly',
        variant: 'destructive',
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        username,
        isAuthenticated: !!user,
        user,
        isLoading,
        changeUsername,
        signIn,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
