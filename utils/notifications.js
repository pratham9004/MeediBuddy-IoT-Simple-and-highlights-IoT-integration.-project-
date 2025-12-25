// utils/notifications.js
import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  } catch (error) {
    console.warn('Notifications not supported in this environment:', error.message);
    return 'denied';
  }
}

export async function notificationsShow(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null // immediate
  });
}