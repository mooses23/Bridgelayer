import { useState, useEffect, useCallback } from 'react';
import { UnifiedOnboardingData } from '../components/onboarding/OnboardingWizard';

interface AutoSaveOptions {
  interval?: number; // Auto-save interval in milliseconds (default: 30 seconds)
  enabled?: boolean; // Enable/disable auto-save
}

interface AutoSaveState {
  isSaving: boolean;
  saveError: string | null;
  lastSaved: Date | null;
}

export function useAutoSave(
  data: UnifiedOnboardingData,
  saveCallback: (data: UnifiedOnboardingData) => Promise<void>,
  options: AutoSaveOptions = {}
) {
  const { interval = 30000, enabled = true } = options;
  
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isSaving: false,
    saveError: null,
    lastSaved: null
  });

  const performSave = useCallback(async () => {
    if (!enabled || autoSaveState.isSaving) return;

    setAutoSaveState(prev => ({ ...prev, isSaving: true, saveError: null }));
    
    try {
      await saveCallback(data);
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        saveError: null,
        lastSaved: new Date()
      }));
    } catch (error) {
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Auto-save failed'
      }));
    }
  }, [data, saveCallback, enabled, autoSaveState.isSaving]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (autoSaveState.isSaving) return;
    await performSave();
  }, [performSave, autoSaveState.isSaving]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(performSave, interval);
    return () => clearInterval(intervalId);
  }, [performSave, interval, enabled]);

  // Save on data changes (debounced)
  useEffect(() => {
    if (!enabled) return;

    const debounceTimer = setTimeout(performSave, 5000); // Save 5 seconds after data change
    return () => clearTimeout(debounceTimer);
  }, [data, performSave, enabled]);

  return {
    ...autoSaveState,
    manualSave
  };
}

// Backend API integration for progress persistence
export const onboardingAPI = {
  saveProgress: async (data: UnifiedOnboardingData, currentStep: number): Promise<void> => {
    const sessionId = sessionStorage.getItem('firmsync_session_id') || 
                     crypto.randomUUID();
    sessionStorage.setItem('firmsync_session_id', sessionId);

    const response = await fetch('/api/onboarding/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        data,
        currentStep
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save progress: ${response.statusText}`);
    }

    return response.json();
  },

  loadProgress: async (): Promise<{ data: UnifiedOnboardingData | null; currentStep: number }> => {
    const sessionId = sessionStorage.getItem('firmsync_session_id');
    if (!sessionId) {
      return { data: null, currentStep: 0 };
    }

    try {
      const response = await fetch(`/api/onboarding/progress/${sessionId}`);
      if (!response.ok) {
        return { data: null, currentStep: 0 };
      }

      const result = await response.json();
      return {
        data: result.data,
        currentStep: result.currentStep || 0
      };
    } catch (error) {
      console.error('Failed to load progress from backend:', error);
      return { data: null, currentStep: 0 };
    }
  }
};

// Session storage utilities for onboarding data
export const onboardingStorage = {
  save: (data: UnifiedOnboardingData) => {
    try {
      sessionStorage.setItem('firmsync_onboarding', JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      }));
    } catch (error) {
      console.error('Failed to save onboarding data to session storage:', error);
    }
  },

  load: (): UnifiedOnboardingData | null => {
    try {
      const stored = sessionStorage.getItem('firmsync_onboarding');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const ageInHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
      
      // Expire sessions older than 24 hours
      if (ageInHours > 24) {
        onboardingStorage.clear();
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to load onboarding data from session storage:', error);
      return null;
    }
  },

  clear: () => {
    try {
      sessionStorage.removeItem('firmsync_onboarding');
    } catch (error) {
      console.error('Failed to clear onboarding data from session storage:', error);
    }
  }
};
