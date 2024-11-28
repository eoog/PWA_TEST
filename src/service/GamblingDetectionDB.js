export class GamblingDetectionDB {
  static async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GamblingDetectionDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('detections')) {
          const store = db.createObjectStore('detections',
              {keyPath: 'id', autoIncrement: true});
          store.createIndex('url', 'url', {unique: true});
          store.createIndex('timestamp', 'timestamp', {unique: false});
        }
      };
    });
  }

  static async checkUrlExists(url) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['detections'], 'readonly');
      const store = transaction.objectStore('detections');
      const request = store.index('url').get(url);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static async saveDetection(detection) {
    const urlExists = await this.checkUrlExists(detection.url);
    if (urlExists) {
      console.log('이미 저장된 URL입니다:', detection.url);
      return null;
    }

    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['detections'], 'readwrite');
      const store = transaction.objectStore('detections');
      const request = store.add({
        ...detection,
        timestamp: new Date().toISOString()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}