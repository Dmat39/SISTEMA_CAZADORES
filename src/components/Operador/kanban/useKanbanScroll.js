import { useState, useRef, useEffect } from 'react';
import { KANBAN_STATES } from './kanbanConfig';

export const useKanbanScroll = (incidencias) => {
  const [scrollStates, setScrollStates] = useState({});
  const scrollRefs = useRef({});

  const checkScrollable = (estado) => {
    const scrollElement = scrollRefs.current[estado];
    if (scrollElement) {
      const isScrollable = scrollElement.scrollHeight > scrollElement.clientHeight;
      const isAtBottom = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 10;

      setScrollStates(prev => {
        const currentState = prev[estado];
        if (!currentState || 
            currentState.isScrollable !== isScrollable || 
            currentState.isAtBottom !== isAtBottom) {
          return {
            ...prev,
            [estado]: {
              isScrollable,
              isAtBottom,
              showFade: isScrollable && !isAtBottom
            }
          };
        }
        return prev;
      });
    }
  };

  const handleScroll = (estado) => {
    requestAnimationFrame(() => checkScrollable(estado));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      Object.keys(KANBAN_STATES).forEach(estado => {
        checkScrollable(estado);
      });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [incidencias]);

  return {
    scrollStates,
    scrollRefs,
    handleScroll,
    checkScrollable
  };
};