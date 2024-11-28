import {useEffect, useRef, useState} from 'react';
import {DB_CONFIG}                   from "../constants";

export const useIndexedDB = (dbName, initialLoadingState = true) => {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(initialLoadingState);
  const [error, setError] = useState(false);
  const prevImageRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const openDatabase = (dbName) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, DB_CONFIG.VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.errorCode);
        reject(event.target.errorCode);
      };

      request.onsuccess = (event) => resolve(event.target.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(DB_CONFIG.STORE_NAME)) {
          db.createObjectStore(DB_CONFIG.STORE_NAME,
              {keyPath: "id", autoIncrement: true});
        }
      };
    });
  };

  const loadImageFromDB = async () => {
    try {
      const db = await openDatabase(dbName);
      const transaction = db.transaction(DB_CONFIG.STORE_NAME, "readwrite");
      const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const results = event.target.result;
          if (results.length > DB_CONFIG.MAX_IMAGES) {
            store.clear();
          }
          const latestImage = results.length > 0 ? results[results.length
          - 1].data : null;
          setError(results.length === 0);
          resolve(latestImage);
        };

        request.onerror = (event) => {
          console.error(`Error loading images from ${dbName}:`,
              event.target.errorCode);
          setError(true);
          reject(event.target.errorCode);
        };
      });
    } catch (error) {
      console.error(`Database error in ${dbName}:`, error);
      setError(true);
      return null;
    }
  };

  useEffect(() => {
    const updateImage = async () => {
      try {
        const newImage = await loadImageFromDB();

        if (isInitialLoadRef.current || newImage !== prevImageRef.current) {
          setImage(newImage);
          prevImageRef.current = newImage;

          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error(`Error loading images from ${dbName}:`, error);
        setError(true);
        setIsLoading(false);
      }
    };

    updateImage();
    const intervalId = setInterval(updateImage, 3000);

    return () => clearInterval(intervalId);
  }, [dbName]);

  return {image, isLoading, error};
};