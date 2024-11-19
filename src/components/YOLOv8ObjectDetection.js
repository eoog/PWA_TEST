import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as ort from 'onnxruntime-web';

// 상수 정의
const CONSTANTS = {
  MODEL_PATH: "nude.onnx",
  CONF_THRESHOLD: 0.3,
  IOU_THRESHOLD: 0.7,
  INPUT_SIZE: 320,
  ALERT_COOLDOWN: 6000,
  DB_VERSION: 1,
  NUM_BOXES: 2100
};

// YOLO 클래스 정의
const YOLO_CLASSES = [
  '여성 생식기 가리기', '여성 얼굴', '둔부 노출', '여성 유방 노출',
  '여성 생식기 노출', '남성 유방 노출', '항문 노출', '발 노출',
  '배 가리기', '발 가리기', '겨드랑이 가리기', '겨드랑이 노출',
  '남성 얼굴', '배 노출', '남성 생식기 노출', '항문 가리기',
  '여성 유방 가리기', '둔부 가리기'
];

const YOLOv8ObjectDetection = ({ capturedFile }) => {
  const [modelSession, setModelSession] = useState(null);
  const [lastAlertTime, setLastAlertTime] = useState(0);
  const [image, setImage] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const canvasRef = useRef(null);

  // 서비스 워커 알림 처리
  const sendNotification = async () => {
    const permission = await Notification.requestPermission();
    if (Notification.permission === "granted") {
      new Notification("[선정성]", {
        body: `[선정성] - 선정성이 검출되었습니다.`,
        icon: process.env.PUBLIC_URL + '/meer.ico'
      });
    } else {
      alert("알림 권한이 없습니다.");
    }
  };

  // IndexedDB 초기화
  const initializeDB = useCallback(async (dbName) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, CONSTANTS.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
        }
      };
    });
  }, []);

  // IndexedDB에 이미지 저장
  const saveImageToDB = async (dbName, imageData) => {
    try {
      const db = await initializeDB(dbName);
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");

      // 기존 데이터 삭제
      if (dbName === "canvasImage") {
      await store.clear();
      }

      // 새 이미지 저장
      await store.add({ data: imageData });
      console.log(`Image saved to ${dbName} successfully`);
    } catch (error) {
      console.error(`Failed to save image to ${dbName}:`, error);
    }
  };

  // 모델 초기화
  const initializeModel = useCallback(async () => {
    try {
      const options = {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
        enableCpuMemArena: true,
        enableMemPattern: true,
        executionMode: 'sequential'
      };

      const session = await ort.InferenceSession.create(CONSTANTS.MODEL_PATH, options);
      setModelSession(session);
    } catch (error) {
      console.error('Model initialization failed:', error);
    }
  }, []);

  // 이미지 전처리
  const preprocessImage = useCallback(async (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = CONSTANTS.INPUT_SIZE;
        canvas.height = CONSTANTS.INPUT_SIZE;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, CONSTANTS.INPUT_SIZE, CONSTANTS.INPUT_SIZE);
        const imageData = ctx.getImageData(0, 0, CONSTANTS.INPUT_SIZE, CONSTANTS.INPUT_SIZE);

        const { data } = imageData;
        const [red, green, blue] = [[], [], []];

        for (let i = 0; i < data.length; i += 4) {
          red.push(data[i] / 255.0);
          green.push(data[i + 1] / 255.0);
          blue.push(data[i + 2] / 255.0);
        }

        URL.revokeObjectURL(url);
        resolve({
          tensor: [...red, ...green, ...blue],
          originalSize: { width: img.width, height: img.height }
        });
      };

      img.src = url;
    });
  }, []);

  // 출력 처리
  const processOutputs = (output, imgWidth, imgHeight) => {
    const boxes = [];
    const numBoxes = CONSTANTS.NUM_BOXES;
    const numClasses = YOLO_CLASSES.length;

    for (let i = 0; i < numBoxes; i++) {
      let maxProb = 0;
      let classId = 0;

      for (let j = 0; j < numClasses; j++) {
        const prob = output[numBoxes * (j + 4) + i];
        if (prob > maxProb) {
          maxProb = prob;
          classId = j;
        }
      }

      if (maxProb < CONSTANTS.CONF_THRESHOLD) continue;

      const xc = output[i];
      const yc = output[numBoxes + i];
      const w = output[2 * numBoxes + i];
      const h = output[3 * numBoxes + i];

      const x1 = (xc - w / 2) / CONSTANTS.INPUT_SIZE * imgWidth;
      const y1 = (yc - h / 2) / CONSTANTS.INPUT_SIZE * imgHeight;
      const x2 = (xc + w / 2) / CONSTANTS.INPUT_SIZE * imgWidth;
      const y2 = (yc + h / 2) / CONSTANTS.INPUT_SIZE * imgHeight;

      boxes.push([x1, y1, x2, y2, YOLO_CLASSES[classId], maxProb]);
    }

    return nonMaxSuppression(boxes, CONSTANTS.IOU_THRESHOLD);
  };

  // NMS 구현
  const nonMaxSuppression = (boxes, iouThreshold) => {
    boxes.sort((a, b) => b[5] - a[5]);

    const selected = [];
    const indices = new Set(boxes.map((_, idx) => idx));

    while (indices.size > 0) {
      const boxIdx = Array.from(indices)[0];
      selected.push(boxes[boxIdx]);
      indices.delete(boxIdx);

      const rest = Array.from(indices);
      for (const idx of rest) {
        if (calculateIoU(boxes[boxIdx], boxes[idx]) >= iouThreshold) {
          indices.delete(idx);
        }
      }
    }

    return selected;
  };

  // IoU 계산
  const calculateIoU = (box1, box2) => {
    const [x1_1, y1_1, x2_1, y2_1] = box1;
    const [x1_2, y1_2, x2_2, y2_2] = box2;

    const x_left = Math.max(x1_1, x1_2);
    const y_top = Math.max(y1_1, y1_2);
    const x_right = Math.min(x2_1, x2_2);
    const y_bottom = Math.min(y2_1, y2_2);

    if (x_right < x_left || y_bottom < y_top) return 0;

    const intersection = (x_right - x_left) * (y_bottom - y_top);
    const area1 = (x2_1 - x1_1) * (y2_1 - y1_1);
    const area2 = (x2_2 - x1_2) * (y2_2 - y1_2);
    const union = area1 + area2 - intersection;

    return intersection / union;
  };

  // 객체 감지 실행
  const runDetection = useCallback(async (preprocessedData) => {
    if (!modelSession) return [];

    try {
      const inputTensor = new ort.Tensor(
          'float32',
          Float32Array.from(preprocessedData.tensor),
          [1, 3, CONSTANTS.INPUT_SIZE, CONSTANTS.INPUT_SIZE]
      );

      const outputs = await modelSession.run({ images: inputTensor });
      return processOutputs(
          outputs.output0.data,
          preprocessedData.originalSize.width,
          preprocessedData.originalSize.height
      );
    } catch (error) {
      console.error('Detection failed:', error);
      return [];
    }
  }, [modelSession]);

  // 결과 처리 및 박스 그리기
  const drawDetections = useCallback(async (canvas, image, boxes) => {
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      let detectionFound = false;

      boxes.forEach(box => {
        const [x1, y1, x2, y2, label, confidence] = box;

        if (YOLO_CLASSES.includes(label)) {
          // 박스 그리기
          ctx.strokeStyle = "#00FF00";
          ctx.lineWidth = 3;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          // 레이블 그리기
          ctx.fillStyle = "#00FF00";
          ctx.font = "18px serif";
          const text = `${label} ${Math.round(confidence * 100)}%`;
          const textWidth = ctx.measureText(text).width;

          ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);
          ctx.fillStyle = "#000000";
          ctx.fillText(text, x1 + 5, y1 - 5);

          detectionFound = true;
        }
      });

      // 감지 시 알림 및 저장
      if (detectionFound && Date.now() - lastAlertTime > CONSTANTS.ALERT_COOLDOWN) {
        const imageData = canvas.toDataURL('image/png');
        saveImageToDB('canvasImage', imageData);
        saveImageToDB('CanvasDB', imageData);
        handleMessage();
        setLastAlertTime(Date.now());
      }

      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(image);
  }, [lastAlertTime]);

  // 서비스 워커 메시지 처리
  const handleMessage = async () => {
    sendNotification();
    // if ('serviceWorker' in navigator) {
    //   try {
    //     const registration = await navigator.serviceWorker.register('/service-worker.js');
    //     if (registration.active) {
    //       registration.active.postMessage({type: 'BACKGROUND_SYNC'});
    //     }
    //   } catch (error) {
    //     console.error('Service Worker registration failed:', error);
    //     sendNotification();
    //   }
    // }
  };

  // 초기화
  useEffect(() => {
    initializeModel();
    initializeDB('canvasImage');
    initializeDB('CanvasDB');
  }, [initializeModel, initializeDB]);

  // 파일 변경 감지
  useEffect(() => {
    if (capturedFile) {
      setImage(capturedFile);
      handleNewImage(capturedFile);
    }
  }, [capturedFile]);

  // 새 이미지 처리
  const handleNewImage = async (file) => {
    try {
      const preprocessedData = await preprocessImage(file);
      const detections = await runDetection(preprocessedData);
      setBoxes(detections);

      if (canvasRef.current) {
        await drawDetections(canvasRef.current, file, detections);
      }
    } catch (error) {
      console.error('Image processing failed:', error);
    }
  };

  return (
      <div className="w-full h-full flex flex-col items-center">
        <canvas
            ref={canvasRef}
            hidden={true}
            className="w-full h-full object-contain mt-2.5"
        />
      </div>
  );
};

export default YOLOv8ObjectDetection;