export const useNotification = () => {

  const showNotification = async (
    title: string,
    options?: NotificationOptions,
    onClick?: () => void
  ) => {
    if (Notification.permission !== 'granted') {
      const permission = await askPermission();
      if (permission !== 'granted') return;
    }
    const notifyOption: NotificationOptions = {
      ...options,
      ...{
        icon: 'apps/frontend/public/assets/images/logo.svg',
        requireInteraction: true,
      },
    };
    const notification = new Notification(title, notifyOption);
    if (onClick) {
      notification.onclick = () => {
        onClick();
      };
    }
    return notification;
  };

  const askPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.log('Ask Notification permission error', error);
    }
  };

  return {
    showNotification,
  };
};
