import React, { useState, useRef, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

const YOLOv8ObjectDetection = ({ capturedFile }) => {
  const [image, setImage] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const canvasRef = useRef(null);
  const [alertShown, setAlertShown] = useState(false); // 경고 표시 여부 관리

  useEffect(() => {
    if (capturedFile) {
      console.log("New captured file received: ", capturedFile);
      handleFileChange(capturedFile);
    }
  }, [capturedFile]);

  const handleFileChange = async (file) => {
    setImage(file);
    const detectedBoxes = await detectObjectsOnImage(file);
    setBoxes(detectedBoxes);
  };

  const drawImageAndBoxes = (file, boxes) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      console.log("안녕");

      // 1초 딜레이 후 이미지와 박스 그리기
      setTimeout(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 3;
        ctx.font = "18px serif";

        let alertDisplayed = false; // 경고 메시지가 표시되었는지 추적하는 변수

        // 특정 클래스에 해당하는 박스만 그리기
        boxes.forEach(([x1, y1, x2, y2, label]) => {
          if (shouldDrawBox(label)) { // 특정 클래스 필터링
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            ctx.fillStyle = "#00ff00";
            const width = ctx.measureText(label).width;
            ctx.fillRect(x1, y1, width + 10, 25);
            ctx.fillStyle = "#000000";
            ctx.fillText(label, x1, y1 + 18);

            // 경고 메시지를 한 번만 띄우기
            if (!alertDisplayed) {
              alertDisplayed = true; // 경고 메시지가 표시되었다고 설정
              handleMessage();
            }
          }
        });
      }, 1000); // 1초 딜레이
    };
  };

  const handleMessage = () => {
    console.log("하하하")
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered with scope:', registration.scope);

          // 서비스 워커에 메시지 보내기

          registration.active.postMessage({ type: 'BACKGROUND_SYNC' });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    }
  }


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
    const outputs = await model.run({ images: input });
    return outputs["output0"].data;
  };

  const processOutput = (output, imgWidth, imgHeight) => {
    console.log(output);
    let boxes = [];
    for (let index = 0; index < 2100; index++) {
      const [class_id, prob] = [...Array(80).keys()]
      .map(col => [col, output[2100 * (col + 4) + index]])
      .reduce((accum, item) => item[1] > accum[1] ? item : accum, [0, 0]);
      if (prob < 0.5) {
        continue;
      }
      const label = yoloClasses[class_id];
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

  const yoloClasses = [
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
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/*<input id="uploadInput" type="file" onChange={(e) => handleFileChange(e.target.files[0])} />*/}
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain', marginTop: '10px' }} />
        {image && drawImageAndBoxes(image, boxes)}
      </div>
  );
};

export default YOLOv8ObjectDetection;
