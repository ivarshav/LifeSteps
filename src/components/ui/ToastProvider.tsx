"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Toast } from "./Toast";

type ToastOptions = {
  duration?: number;
  icon?: ReactNode;
};

type ToastItem = ToastOptions & {
  id: number;
  message: ReactNode;
};

type ToastContextValue = {
  showToast: (message: ReactNode, options?: ToastOptions) => number;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const nextId = useRef(1);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: ReactNode, options: ToastOptions = {}) => {
      const id = nextId.current++;
      setToasts((items) => [...items, { id, message, ...options }]);
      return id;
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[120] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map(({ duration, icon, id, message }) => (
          <Toast
            duration={duration}
            icon={icon}
            key={id}
            onDismiss={() => dismiss(id)}
          >
            {message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}
