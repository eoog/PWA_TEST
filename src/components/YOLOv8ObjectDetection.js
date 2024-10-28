import React, {useEffect, useRef, useState} from 'react';
import * as ort from 'onnxruntime-web';

const YOLOv8ObjectDetection = ({capturedFile}) => {
  const [image, setImage] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const canvasRef = useRef(null);
  const [alertShown, setAlertShown] = useState(false); // 경고 표시 여부 관리
  const [num, setNum] = useState(0);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 IndexedDB를 초기화
    openDatabase();
    openDatabaseScreen()
  }, []); // 빈 배열로 한 번만 실행

  useEffect(() => {
    if (capturedFile) {
      handleFileChange(capturedFile);
    }
  }, [capturedFile]);

  const handleFileChange = async (file) => {
    setImage(file);
    const detectedBoxes = await detectObjectsOnImage(file);
    setBoxes(detectedBoxes);
  };

  // 스크린샷 캡쳐 이미지만 저장 > 검출 이미지 아님
  function openDatabaseScreen() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("canvasImage", 1);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.errorCode);
        reject(event.target.errorCode);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("images", {keyPath: "id", autoIncrement: true});
      };
    });
  }

  function saveScreenToIndexedDB(imageData) {
    return new Promise((resolve, reject) => {
      openDatabaseScreen().then((db) => {
        const transaction = db.transaction("images", "readwrite");
        const store = transaction.objectStore("images");

        // 모든 데이터를 삭제
        const deleteRequest = store.clear();

        deleteRequest.onsuccess = () => {
          // 모든 데이터 삭제가 완료된 후 새 이미지 추가
          const imageObject = {data: imageData}; // 이미지 데이터 객체 생성
          const addRequest = store.add(imageObject); // 이미지 추가

          addRequest.onsuccess = () => {
            resolve("Image saved successfully.");
          };

          addRequest.onerror = (event) => {
            console.error("Error saving image:", event.target.errorCode);
            reject(event.target.errorCode);
          };
        };

        deleteRequest.onerror = (event) => {
          console.error("Error clearing images:", event.target.errorCode);
          reject(event.target.errorCode);
        };
      });
    });
  }

  // IndexedDB 열기 및 데이터베이스 설정
  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("CanvasDB", 1);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.errorCode);
        reject(event.target.errorCode);
      };

      request.onsuccess = (event) => {
        console.log("IndexedDB opened successfully");
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("images", {keyPath: "id", autoIncrement: true});
      };
    });
  }

  function saveImageToIndexedDB(dataURL) {
    openDatabase().then((db) => {
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
      const image = {data: dataURL};

      const request = store.add(image);

      request.onsuccess = () => {
        console.log("Image saved to IndexedDB successfully.");
      };

      request.onerror = (event) => {
        console.error("Error saving image to IndexedDB:",
            event.target.errorCode);
      };
    });
  }

  const [lastAlertTime, setLastAlertTime] = useState(0); // 마지막 경고 시간 저장

  const drawImageAndBoxes = (file, boxes) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    const onLoadHandler = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 3;
      ctx.font = "18px serif";

      const dataURL = canvas.toDataURL('image/png');
      saveScreenToIndexedDB(dataURL);
      //localStorage.setItem('canvasImage', dataURL); // 로컬 스토리지에 저장

      let alertDisplayed = false;

      // 특정 클래스에 해당하는 박스만 그리기
      boxes.forEach(([x1, y1, x2, y2, label]) => {
        if (shouldDrawBox(label)) { // 특정 클래스 필터링
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
          ctx.fillStyle = "#00ff00";
          const width = ctx.measureText(label).width;
          ctx.fillRect(x1, y1, width + 10, 25);
          ctx.fillStyle = "#000000";
          ctx.fillText(label, x1, y1 + 18);
          alertDisplayed = true;
        }
      });

      // 6초 이내 중복 호출 방지
      const currentTime = Date.now();
      if (alertDisplayed && currentTime - lastAlertTime > 6000) {
        handleMessage();
        saveImageToIndexedDB(canvas.toDataURL('image/png'))
        setLastAlertTime(currentTime); // 마지막 경고 시간을 업데이트
      }

      img.onload = null; // onload 이벤트 리스너 제거
    };

    img.onload = onLoadHandler; // 이미지 로드 완료 후 onLoadHandler 실행
  };

  const sendNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("[선정성]", {
        body: `[선정성] - 선정성이 검출되었습니다.`,
        icon: '/meer.ico' // 알림 아이콘 경로
      });
    } else {
      alert("알림 권한이 없습니다.");
    }
  };


  const handleMessage = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
            '/service-worker.js');

        // 서비스 워커가 활성화된 경우에만 메시지 전송
        if (registration.active) {
          registration.active.postMessage({type: 'BACKGROUND_SYNC'});
        } else {
          // 서비스 워커가 아직 활성화되지 않은 경우 이벤트 리스너 추가
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('Received message from service worker:', event.data);
          });
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        sendNotification();
      }
    }
  };

  const shouldDrawBox = (label) => {
    const allowedClasses = [
      '여성 생식기 가리기',
      '여성 얼굴',
      '둔부 노출',
      '여성 유방 노출',
      '여성 생식기 노출',
      '남성 유방 노출',
      '항문 노출',
      '발 노출',
      '배 가리기',
      '발 가리기',
      '겨드랑이 가리기',
      '겨드랑이 노출',
      '남성 얼굴',
      '배 노출',
      '남성 생식기 노출',
      '항문 가리기',
      '여성 유방 가리기',
      '둔부 가리기'
      // 필터링할 클래스 추가
    ];
    return allowedClasses.includes(label);
  };

  const detectObjectsOnImage = async (file) => {
    const [input, imgWidth, imgHeight] = await prepareInput(file);
    const output = await runModel(input);
    return processOutput(output, imgWidth, imgHeight);
  };

  const prepareInput = (file) => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const [imgWidth, imgHeight] = [img.width, img.height];
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 320;
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, 320, 320);
        const imgData = context.getImageData(0, 0, 320, 320);
        const pixels = imgData.data;

        const red = [], green = [], blue = [];
        for (let index = 0; index < pixels.length; index += 4) {
          red.push(pixels[index] / 255.0);
          green.push(pixels[index + 1] / 255.0);
          blue.push(pixels[index + 2] / 255.0);
        }
        const input = [...red, ...green, ...blue];
        resolve([input, imgWidth, imgHeight]);
      };
    });
  };

  const runModel = async (input) => {
    const model = await ort.InferenceSession.create("nude.onnx");
    input = new ort.Tensor(Float32Array.from(input), [1, 3, 320, 320]);
    const outputs = await model.run({images: input});
    return outputs["output0"].data;
  };

  const processOutput = (output, imgWidth, imgHeight) => {
    let boxes = [];
    for (let index = 0; index < 2100; index++) {
      const [class_id, prob] = [...Array(80).keys()]
      .map(col => [col, output[2100 * (col + 4) + index]])
      .reduce((accum, item) => item[1] > accum[1] ? item : accum, [0, 0]);
      if (prob < 0.3) {
        continue;
      }

      // 로그를 통해 prob 값을 확인

      const label = yolo_classes[class_id];
      const xc = output[index];
      const yc = output[2100 + index];
      const w = output[2 * 2100 + index];
      const h = output[3 * 2100 + index];
      const x1 = (xc - w / 2) / 320 * imgWidth;
      const y1 = (yc - h / 2) / 320 * imgHeight;
      const x2 = (xc + w / 2) / 320 * imgWidth;
      const y2 = (yc + h / 2) / 320 * imgHeight;
      boxes.push([x1, y1, x2, y2, label, prob]);
    }

    boxes = boxes.sort((box1, box2) => box2[5] - box1[5]);
    const result = [];
    while (boxes.length > 0) {
      result.push(boxes[0]);
      boxes = boxes.filter(box => iou(boxes[0], box) < 0.7);
    }
    return result;
  };

  const iou = (box1, box2) => {
    return intersection(box1, box2) / union(box1, box2);
  };

  const union = (box1, box2) => {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const box1Area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1);
    const box2Area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1);
    return box1Area + box2Area - intersection(box1, box2);
  };

  const intersection = (box1, box2) => {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const x1 = Math.max(box1_x1, box2_x1);
    const y1 = Math.max(box1_y1, box2_y1);
    const x2 = Math.min(box1_x2, box2_x2);
    const y2 = Math.min(box1_y2, box2_y2);
    return (x2 - x1) * (y2 - y1);
  };

  const yolo_classes = [
    '여성 생식기 가리기',
    '여성 얼굴',
    '둔부 노출',
    '여성 유방 노출',
    '여성 생식기 노출',
    '남성 유방 노출',
    '항문 노출',
    '발 노출',
    '배 가리기',
    '발 가리기',
    '겨드랑이 가리기',
    '겨드랑이 노출',
    '남성 얼굴',
    '배 노출',
    '남성 생식기 노출',
    '항문 가리기',
    '여성 유방 가리기',
    '둔부 가리기'
  ];

  return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/*<input id="uploadInput" type="file" onChange={(e) => handleFileChange(e.target.files[0])} />*/}
        <canvas hidden={true} ref={canvasRef} style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          marginTop: '10px'
        }}/>
        {image && drawImageAndBoxes(image, boxes)}
      </div>
  );
};

export default YOLOv8ObjectDetection;
