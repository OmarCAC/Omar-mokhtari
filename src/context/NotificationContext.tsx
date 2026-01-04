
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  addNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {notifications.map(n => (
          <div 
            key={n.id}
            onClick={() => removeNotification(n.id)}
            className={`
              min-w-[300px] p-4 rounded-xl shadow-lg border-l-4 cursor-pointer transform transition-all duration-300 animate-slide-in
              flex items-center gap-3 bg-white dark:bg-slate-800
              ${n.type === 'success' ? 'border-green-500' : 
                n.type === 'error' ? 'border-red-500' : 
                n.type === 'warning' ? 'border-amber-500' : 'border-blue-500'}
            `}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${n.type === 'success' ? 'bg-green-100 text-green-600' : 
                n.type === 'error' ? 'bg-red-100 text-red-600' : 
                n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}
            `}>
              <span className="material-symbols-outlined text-sm font-bold">
                {n.type === 'success' ? 'check' : 
                 n.type === 'error' ? 'error' : 
                 n.type === 'warning' ? 'warning' : 'info'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-white">{n.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
