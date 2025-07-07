import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '@/services/api.service';
import { User, Firm } from '@/types/schema';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  firm: Firm | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          apiService.setToken(token);
          const response = await apiService.get('/auth/session');
          
          if (response.data.user) {
            setUser(response.data.user);
            setFirm(response.data.firm || null);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.post('/auth/login', { email, password });
      const { token, user, firm } = response.data;
      
      localStorage.setItem('token', token);
      apiService.setToken(token);
      
      setUser(user);
      setFirm(firm || null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('token');
      apiService.clearToken();
      setUser(null);
      setFirm(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        firm,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Onboarding context for admin flow
interface OnboardingContextType {
  currentStep: number;
  onboardingCode: string | null;
  stepData: Record<string, any>;
  setCurrentStep: (step: number) => void;
  setOnboardingCode: (code: string | null) => void;
  updateStepData: (data: Record<string, any>) => void;
  saveStep: (step: number, data: Record<string, any>) => Promise<void>;
  loading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [onboardingCode, setOnboardingCode] = useState<string | null>(null);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load onboarding data if code is available
    const loadOnboardingData = async () => {
      if (onboardingCode) {
        setLoading(true);
        try {
          const response = await apiService.getOnboardingProfile(onboardingCode);
          const profile = response.data;
          
          setStepData(profile.stepData || {});
          setCurrentStep(profile.totalStepsCompleted + 1);
        } catch (error) {
          console.error('Failed to load onboarding data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadOnboardingData();
  }, [onboardingCode]);

  const updateStepData = (data: Record<string, any>) => {
    setStepData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  const saveStep = async (step: number, data: Record<string, any>) => {
    if (!onboardingCode) {
      throw new Error('No onboarding code available');
    }
    
    setLoading(true);
    try {
      const updatedData = {
        ...stepData,
        ...data
      };
      
      await apiService.updateOnboardingStep(onboardingCode, step, updatedData);
      setStepData(updatedData);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save onboarding step:', error);
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        onboardingCode,
        stepData,
        setCurrentStep,
        setOnboardingCode,
        updateStepData,
        saveStep,
        loading
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
