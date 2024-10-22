import React, {useEffect, useRef, useState} from 'react';

function ScreenCapture({ setCapturedFile }) {
  const videoRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    startScreenShare()
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

      // 3초마다 캡처
      const intervalId = setInterval(() => {
        captureScreen();
      }, 3000);

      stream.getTracks()[0].onended = () => {
        clearInterval(intervalId);
        setIsSharing(false);
      };
    } catch (err) {
      console.error("Error starting screen capture: ", err);
    }
  };

  const captureScreen = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'screenshot.png', { type: 'image/png' });
        setCapturedFile(file); // 캡처된 파일을 부모로 전달
        console.log(file);
      }, 'image/png');
    }
  };

  return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/*<button onClick={isSharing ? () => {} : startScreenShare}>*/}
        {/*  {isSharing ? "Sharing in Progress" : "Start Screen Share"}*/}
        {/*</button>*/}
        {/* 비디오 요소 크기를 부모 요소의 100%로 맞춤 */}
        <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', marginTop: '10px' }}
        />
      </div>
  );
}

export default ScreenCapture;
