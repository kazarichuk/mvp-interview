// src/lib/toast.ts
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '@/components/ui/toast';

export function showToast({ title, description, variant = 'default' }: { 
  title?: string; 
  description?: string; 
  variant?: 'default' | 'success' | 'error' 
}) {
  // Создаем контейнер для toast
  const toastContainer = document.createElement('div');
  document.body.appendChild(toastContainer);
  
  // Создаем React корень
  const root = createRoot(toastContainer);
  
  // Рендерим Toast
  root.render(
    createElement(Toast, {
      title,
      description,
      variant,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          // Удаляем элемент при закрытии
          setTimeout(() => {
            root.unmount();
            toastContainer.remove();
          }, 300);
        }
      },
    })
  );
  
  // Автоматически удаляем через 5 секунд
  setTimeout(() => {
    root.unmount();
    toastContainer.remove();
  }, 5000);
}