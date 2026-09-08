"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getProgress, resetStep, toggleTask } from "@/lib/progress";

type ProgressContextValue = {
  completed: Set<string>;
  done: number;
  reset: () => void;
  stepId: string;
  toggle: (taskId: string) => void;
  total: number;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  stepId,
  taskIds,
}: {
  children: ReactNode;
  stepId: string;
  taskIds: string[];
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCompleted(getProgress(stepId));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [stepId]);

  const validTaskIds = useMemo(() => new Set(taskIds), [taskIds]);
  const done = [...completed].filter((id) => validTaskIds.has(id)).length;

  const value: ProgressContextValue = {
    completed,
    done,
    reset: () => {
      resetStep(stepId);
      setCompleted(new Set());
    },
    stepId,
    toggle: (taskId) => {
      toggleTask(stepId, taskId);
      setCompleted((current) => {
        const next = new Set(current);
        if (next.has(taskId)) next.delete(taskId);
        else next.add(taskId);
        return next;
      });
    },
    total: taskIds.length,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useStepProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useStepProgress must be used within ProgressProvider.");
  }
  return context;
}
