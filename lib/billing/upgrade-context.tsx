'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface UpgradeModalContextType {
  isOpen: boolean;
  featureKey: string | null;
  featureName: string | null;
  openUpgradeModal: (featureKey: string, featureName: string) => void;
  closeUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | undefined>(undefined);

export function UpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [featureKey, setFeatureKey] = useState<string | null>(null);
  const [featureName, setFeatureName] = useState<string | null>(null);

  const openUpgradeModal = useCallback((key: string, name: string) => {
    setFeatureKey(key);
    setFeatureName(name);
    setIsOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsOpen(false);
    setFeatureKey(null);
    setFeatureName(null);
  }, []);

  return (
    <UpgradeModalContext.Provider value={{ isOpen, featureKey, featureName, openUpgradeModal, closeUpgradeModal }}>
      {children}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error('useUpgradeModal must be used within UpgradeModalProvider');
  }
  return context;
}
