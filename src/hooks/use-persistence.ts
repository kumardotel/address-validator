import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';

export function usePersistence() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubHydrate = useAppStore.persist.onHydrate(() => {
      console.log('Store is hydrating...');
    });

    const unsubFinishHydration = useAppStore.persist.onFinishHydration(
      (state) => {
        setIsHydrated(true);
      }
    );

    if (useAppStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return isHydrated;
}

export function usePersistActions() {
  const rehydrate = () => {
    useAppStore.persist.rehydrate();
  };

  const clearStorage = () => {
    useAppStore.persist.clearStorage();
    window.location.reload();
  };

  return {
    rehydrate,
    clearStorage,
  };
}
