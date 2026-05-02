import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useElectionStore = create(
  persist(
    (set) => ({
      userType: 'resident',
      currentStep: 1,
      activeView: 'process',
      language: 'en',
      isDarkMode: false,
      riskAnalysis: {
        totalIncidents: 0,
        criticalAlerts: 0,
        recent: []
      },
      securityCache: {},
      submissions: [],

      addSubmission: (submission) => set((state) => ({
        submissions: [submission, ...state.submissions]
      })),

      setUserType: (type) => set({ userType: type }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setActiveView: (view) => set({ activeView: view }),
      setLanguage: (lang) => set({ language: lang }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      updateRiskAnalysis: (data) => set((state) => ({
        riskAnalysis: { ...state.riskAnalysis, ...data }
      })),
      cacheSecurityResult: (locationKey, result) => set((state) => ({
        securityCache: {
          ...state.securityCache,
          [locationKey]: { ...result, timestamp: Date.now() }
        }
      })),
    }),
    {
      name: 'matdan-mitra-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
