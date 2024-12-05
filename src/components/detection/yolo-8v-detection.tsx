"use client"
import React, {useCallback, useEffect, useRef} from 'react';
import * as ort from 'onnxruntime-web';
import {useScreenShare} from "@/lib/provider/screen-share-context";

// 타입 정의
type DetectionBox = [number, number, number, number, string, number];
type NotificationType = 'adult' | 'inappropriate' | 'spam';

interface PreprocessedData {
  tensor: number[];
  originalSize: {
    width: number;
    height: number;
  };
}

interface NotificationOptions {
  title: string;
  icon: string;
}

// 상수 정의
const CONSTANTS = {
  MODEL_PATH: '/nude.onnx',
  CONF_THRESHOLD: 0.3,
  IOU_THRESHOLD: 0.7,
  INPUT_SIZE: 320,
  ALERT_COOLDOWN: 6000,
  DB_VERSION: 1,
  NUM_BOXES: 2100
};

const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// YOLO 클래스 정의
const YOLO_CLASSES = [
  '여성 생식기 가리기', '여성 얼굴', '둔부 노출', '여성 유방 노출',
  '여성 생식기 노출', '남성 유방 노출', '항문 노출', '발 노출',
  '배 가리기', '발 가리기', '겨드랑이 가리기', '겨드랑이 노출',
  '남성 얼굴', '배 노출', '남성 생식기 노출', '항문 가리기',
  '여성 유방 가리기', '둔부 가���기'
];

const YOLOv8 = () => {
  const {capturedFile} = useScreenShare();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelSessionRef = useRef<ort.InferenceSession | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  

  // 알림 전송
  const sendNotification = async (type: NotificationType, message: string) => {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const notificationOptions: Record<NotificationType, NotificationOptions> = {
        adult: {
          title: "🚨 성인 콘텐츠 감지",
          icon: '/meer.ico'
        },
        inappropriate: {
          title: "⚠️ 부적절 콘텐츠",
          icon: '/meer.ico'
        },
        spam: {
          title: "🚫 스팸 감지",
          icon: '/meer.ico'
        }
      };

      const options = {
        body: message,
        ...notificationOptions[type],
        tag: type,
        requireInteraction: false,
        icon: '/meer.ico'
      };

      try {
        const notification = new Notification(options.title, options);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('알림 생성 실패:', error);
        showFallbackAlert(message);
      }
    } else {
      showFallbackAlert(message);
    }
  };

  // 대체 알림 표시
  const showFallbackAlert = (message: string) => {
    const alert = document.createElement('div');
    alert.className = 'alert-message';
    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 3000);
  };

  // DB 초기화
  const initializeDB = useCallback(async (dbName: string) => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, CONSTANTS.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", {keyPath: "id", autoIncrement: true});
        }
      };
    });
  }, []);

  // DB에 이미지 저장
  const saveImageToDB = async (dbName: string, imageData: string) => {
    try {
      const db = await initializeDB(dbName);
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");

      await store.add({data: imageData});
      console.log(`Image saved to ${dbName} successfully`);
    } catch (error) {
      console.error(`Failed to save image to ${dbName}:`, error);
    }
  };

  // 모델 초기화
  const initializeModel = useCallback(async () => {
    try {
      const options: ort.InferenceSession.SessionOptions = {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
        enableCpuMemArena: true,
        enableMemPattern: true,
        executionMode: 'sequential'
      };

      const session = await ort.InferenceSession.create(CONSTANTS.MODEL_PATH, options);
      modelSessionRef.current = session;
    } catch (error) {
      console.error('Model initialization failed:', error);
    }
  }, []);

  // 이미지 전처리
  const preprocessImage = useCallback(async (file: File): Promise<PreprocessedData> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = CONSTANTS.INPUT_SIZE;
        canvas.height = CONSTANTS.INPUT_SIZE;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, CONSTANTS.INPUT_SIZE, CONSTANTS.INPUT_SIZE);
          const imageData = ctx.getImageData(0, 0, CONSTANTS.INPUT_SIZE, CONSTANTS.INPUT_SIZE);
          const {data} = imageData;
          const [red, green, blue] = [new Array<number>(), new Array<number>(), new Array<number>()];

          for (let i = 0; i < data.length; i += 4) {
            red.push(data[i] / 255.0);
            green.push(data[i + 1] / 255.0);
            blue.push(data[i + 2] / 255.0);
          }

          URL.revokeObjectURL(url);
          resolve({
            tensor: [...red, ...green, ...blue],
            originalSize: {width: img.width, height: img.height}
          });
        }
      };

      img.src = url;
    });
  }, []);

  // 출력 처리
  const processOutputs = (output: Float32Array, imgWidth: number, imgHeight: number): DetectionBox[] => {
    const boxes: DetectionBox[] = [];
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
  const nonMaxSuppression = (boxes: DetectionBox[], iouThreshold: number): DetectionBox[] => {
    boxes.sort((a, b) => b[5] - a[5]);

    const selected: DetectionBox[] = [];
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
  const calculateIoU = (box1: DetectionBox, box2: DetectionBox): number => {
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
  const runDetection = useCallback(async (preprocessedData: PreprocessedData): Promise<DetectionBox[]> => {
    if (!modelSessionRef.current) return [];

    try {
      const inputTensor = new ort.Tensor(
          'float32',
          Float32Array.from(preprocessedData.tensor),
          [1, 3, CONSTANTS.INPUT_SIZE, CONSTANTS.INPUT_SIZE]
      );

      const outputs = await modelSessionRef.current.run({images: inputTensor});
      return processOutputs(
          outputs.output0.data as Float32Array,
          preprocessedData.originalSize.width,
          preprocessedData.originalSize.height
      );
    } catch (error) {
      console.error('Detection failed:', error);
      return [];
    }
  }, []);

  // 결과 처리 및 박스 그리기
  const drawDetections = useCallback(async (canvas: HTMLCanvasElement, image: File, boxes: DetectionBox[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

        // 감지 시 알림, 저장 및 창 최소화
        if (detectionFound && Date.now() - lastAlertTimeRef.current > CONSTANTS.ALERT_COOLDOWN) {
            const newImageData = canvas.toDataURL('image/png');
            saveImageToDB('DetectionImageDB', newImageData);
            handleMessage();
            lastAlertTimeRef.current = Date.now();
            
            // 창 최소화 메시지 전송
            window.postMessage({
                type: "SHARE",
                source: "SHARE",
                identifier: EXTENSION_IDENTIFIER
            }, "*");
        }

        URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(image);
  }, []);

  // 메시지 처리
  const handleMessage = async () => {
    sendNotification('adult', '성인 콘텐츠가 감지되었습니다.');
  };

  // 새 이미지 처리
  const handleNewImage = async (file: File) => {
    try {
      const preprocessedData = await preprocessImage(file);
      const detections = await runDetection(preprocessedData);

      if (canvasRef.current) {
        await drawDetections(canvasRef.current as HTMLCanvasElement, file, detections);
      }
    } catch (error) {
      console.error('Image processing failed:', error);
    }
  };

  // 초기화
  useEffect(() => {
    initializeModel();
    initializeDB('DetectionImageDB');
  }, [initializeModel, initializeDB]);

  // 파일 변경 감지
  useEffect(() => {
    if (capturedFile) {
      handleNewImage(capturedFile);
    }
  }, [capturedFile, handleNewImage]);

  return (
      <>
        <div className="w-full h-full flex flex-col items-center">
          <canvas
              ref={canvasRef}
              hidden
              className="w-full h-full object-contain mt-2.5"
          />
        </div>
      </>
  );
};

export default YOLOv8