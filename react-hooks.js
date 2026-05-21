/**
 * CUSTOM HOOKS PARA SUPABASE INTEGRATION
 * Use esses hooks no seu React para sincronizar com Supabase de forma eficiente
 */

// Hook 1: Usar dados do Supabase com fallback para localStorage
function useSupabaseData(key, defaultValue, fetchFn) {
  const [data, setData] = React.useState(() => {
    // Primeiro tenta localStorage (rápido)
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : defaultValue;
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchFn();
        if (!cancelled) {
          setData(result || defaultValue);
          localStorage.setItem(key, JSON.stringify(result || defaultValue));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          // Mantém dados do localStorage mesmo com erro
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [key, fetchFn, defaultValue]);

  const updateData = React.useCallback(async (newData) => {
    setData(newData);
    localStorage.setItem(key, JSON.stringify(newData));
    return newData;
  }, [key]);

  return { data, loading, error, updateData };
}

// Hook 2: Debounce para buscas e inputs
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Hook 3: Lazy loading de imagens
function useLazyImage(src) {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [imageRef, setImageRef] = React.useState(null);

  React.useEffect(() => {
    let observer;

    if (imageRef && imageSrc === null) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(imageRef);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(imageRef);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, imageSrc, src]);

  return [imageSrc, setImageRef];
}

// Hook 4: Sincronizar dados com Supabase
function useSyncSupabase(key, initialData, supabaseTable) {
  const [data, setData] = React.useState(initialData);
  const [syncing, setSyncing] = React.useState(false);

  const sync = React.useCallback(async (newData) => {
    setSyncing(true);
    try {
      // Tenta salvar no Supabase
      const result = await window.supabase?.request(
        'PATCH',
        supabaseTable,
        newData
      );

      if (result) {
        setData(newData);
        localStorage.setItem(key, JSON.stringify(newData));
        return true;
      }
    } catch (err) {
      console.error('Sync error:', err);
      // Fallback: salva no localStorage mesmo que Supabase falhe
      localStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
    } finally {
      setSyncing(false);
    }
  }, [key, supabaseTable]);

  return { data, syncing, sync };
}

// Hook 5: Gerenciar estado de autenticação
function useAuth() {
  const [user, setUser] = React.useState(null);
  const [authenticating, setAuthenticating] = React.useState(false);

  const login = React.useCallback(async (email, password) => {
    setAuthenticating(true);
    try {
      const userData = await window.supabase?.getUser(email);
      if (userData && userData.password === password) {
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return userData;
      }
      throw new Error('Credenciais inválidas');
    } finally {
      setAuthenticating(false);
    }
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const updateUser = React.useCallback(async (updates) => {
    if (user) {
      const updated = { ...user, ...updates };
      await window.supabase?.updateUser(user.id, updates);
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      return updated;
    }
  }, [user]);

  return { user, authenticating, login, logout, updateUser };
}

// Hook 6: Cache com expiração
function useCache(fn, cacheTime = 5 * 60 * 1000) {
  const cacheRef = React.useRef({});
  const timeoutRef = React.useRef({});

  const getCachedData = React.useCallback(async (key) => {
    // Se existe em cache e não expirou
    if (cacheRef.current[key]) {
      return cacheRef.current[key];
    }

    // Buscar dados novos
    const data = await fn(key);
    cacheRef.current[key] = data;

    // Expirar depois de cacheTime
    if (timeoutRef.current[key]) {
      clearTimeout(timeoutRef.current[key]);
    }

    timeoutRef.current[key] = setTimeout(() => {
      delete cacheRef.current[key];
      delete timeoutRef.current[key];
    }, cacheTime);

    return data;
  }, [fn, cacheTime]);

  const clearCache = React.useCallback((key) => {
    if (key) {
      delete cacheRef.current[key];
      if (timeoutRef.current[key]) {
        clearTimeout(timeoutRef.current[key]);
        delete timeoutRef.current[key];
      }
    } else {
      cacheRef.current = {};
      Object.values(timeoutRef.current).forEach(clearTimeout);
      timeoutRef.current = {};
    }
  }, []);

  return { getCachedData, clearCache };
}

// Exportar todos os hooks
window.useSupabaseData = useSupabaseData;
window.useDebounce = useDebounce;
window.useLazyImage = useLazyImage;
window.useSyncSupabase = useSyncSupabase;
window.useAuth = useAuth;
window.useCache = useCache;
