import { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from 'react';

interface PageTitle {
  title: string;
  subtitle?: string;
  live?: boolean;
}

interface CtxValue {
  state: PageTitle;
  set: (v: PageTitle) => void;
}

const Ctx = createContext<CtxValue>({ state: { title: '' }, set: () => {} });

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageTitle>({ title: '' });
  const set = useCallback((v: PageTitle) => setState(v), []);
  return <Ctx.Provider value={{ state, set }}>{children}</Ctx.Provider>;
}

export function usePageTitle() {
  return useContext(Ctx).state;
}

export function useSetPageTitle(title: string, subtitle?: string, live?: boolean) {
  const { set } = useContext(Ctx);
  useEffect(() => {
    set({ title, subtitle, live });
    return () => set({ title: '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, live, set]);
}
