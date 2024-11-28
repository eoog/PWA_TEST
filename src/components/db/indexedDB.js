export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('GamblingDetectionDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('detections')) {
                const store = db.createObjectStore('detections', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('url', 'url', { unique: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

export const deleteDetection = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['detections'], 'readwrite');
        const store = transaction.objectStore('detections');
        const request = store.delete(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const loadDetections = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['detections'], 'readonly');
        const store = transaction.objectStore('detections');
        const request = store.getAll();

        request.onsuccess = () => {
            const results = request.result.sort((a, b) =>
                new Date(b.detectedAt) - new Date(a.detectedAt)
            );
            resolve(results);
        };
        request.onerror = () => reject(request.error);
    });
};