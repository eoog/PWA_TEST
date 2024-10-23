import React, { useEffect, useRef, useState } from 'react';

function ScreenCapture({ setCapturedFile }) {
  const videoRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);
  const [captureInterval, setCaptureInterval] = useState(3000); // 캡처 간격을 설정
  const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

  // 데이터 요청 함수
  const requestShareAndContent = () => {
    console.log("Requesting URL content...");
    window.postMessage({
      type: "SHARE",
      source: "SHARE",
      identifier: EXTENSION_IDENTIFIER
    }, "*");
  };

  useEffect(() => {
    startScreenShare();
  }, []);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsSharing(true);
      requestShareAndContent();

      // 캡처 간격에 맞춰 캡처 호출
      const intervalId = setInterval(() => {
        captureScreen();
      }, captureInterval);

      // 스트림 종료 시 처리
      stream.getTracks()[0].onended = () => {
        clearInterval(intervalId);
        setIsSharing(false);
      };
    } catch (err) {
      console.error("Error starting screen capture: ", err);
    }
  };

  const captureScreen = async () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL('image/jpg');
      localStorage.setItem('canvasImage1', dataURL); // 로컬 스토리지에 저장

      // Blob 변환이 비동기적으로 처리되므로 await를 사용
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpg');
      });

      const file = new File([blob], 'screenshot.png', { type: 'image/jpg' });
      setCapturedFile(file); // 캡처된 파일을 부모로 전달
    }
  };

  return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <video
            ref={videoRef}
            hidden={true}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', marginTop: '10px' }}
        />
      </div>
  );
}

export default ScreenCapture;
