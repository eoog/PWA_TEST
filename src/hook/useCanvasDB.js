import {useEffect, useState} from 'react';
import {DB_CANVAS_DB_CONFIG} from "../constants";

export const useCanvasDB = () => {
  const [images, setImages] = useState([]);

  const loadImages = async () => {
    try {
      const request = indexedDB.open(DB_CANVAS_DB_CONFIG.name,
          DB_CANVAS_DB_CONFIG.version);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.errorCode);
        throw new Error(event.target.errorCode);
      };

      const handleDBSuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(DB_CANVAS_DB_CONFIG.store,
            "readonly");
        const store = transaction.objectStore(DB_CANVAS_DB_CONFIG.store);
        return store.getAll();
      };

      const db = await new Promise((resolve, reject) => {
        request.onsuccess = (event) => resolve(handleDBSuccess(event));
        request.onerror = (event) => reject(event.target.error);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(DB_CANVAS_DB_CONFIG.store)) {
            db.createObjectStore(DB_CANVAS_DB_CONFIG.store,
                {keyPath: "id", autoIncrement: true});
          }
        };
      });

      const result = await new Promise((resolve, reject) => {
        db.onsuccess = (event) => resolve(event.target.result);
        db.onerror = (event) => reject(event.target.error);
      });

      setImages(result);
      return result;
    } catch (error) {
      console.error("Error loading images:", error);
      return [];
    }
  };

  useEffect(() => {
    loadImages();
    const intervalId = setInterval(loadImages,
        DB_CANVAS_DB_CONFIG.refreshInterval);
    return () => clearInterval(intervalId);
  }, []);

  return {images, refreshImages: loadImages};
};