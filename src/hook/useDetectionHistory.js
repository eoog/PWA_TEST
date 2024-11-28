import {useEffect, useState}     from "react";
import {deleteDetection, initDB} from "../components/db/indexedDB";

const useDetectionHistory = () => {
  const [detectionHistory, setDetectionHistory] = useState([]);

  const loadDetectionHistory = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['detections'], 'readonly');
      const store = transaction.objectStore('detections');
      const request = store.getAll();

      request.onsuccess = () => {
        setDetectionHistory(request.result.sort((a, b) =>
            new Date(b.detectedAt) - new Date(a.detectedAt)
        ));
      };
    } catch (error) {
      console.error('Failed to load detection history:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDetection(id);
      await loadDetectionHistory();
    } catch (error) {
      console.error('Failed to delete detection:', error);
    }
  };

  useEffect(() => {
    loadDetectionHistory();
  }, []);

  return {detectionHistory, handleDelete, loadDetectionHistory};
};

export default useDetectionHistory