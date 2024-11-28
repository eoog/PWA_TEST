export const NotificationService = {
  async requestPermission() {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  },

  show(title, body, icon) {
    if (Notification.permission === "granted") {
      new Notification(title, {body, icon});
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, {body, icon});
        }
      });
    }
  }
};
