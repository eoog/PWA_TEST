import {useState}       from 'react';
import {CAPTURE_CONFIG} from "../constants";

export const useScreenCapture = (stream, videoRef, setCapturedFile) => {
  const [isSharing, setIsSharing] = useState(false);

  const captureScreen = async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, CAPTURE_CONFIG.IMAGE_FORMAT);
      });

      const file = new File(
          [blob],
          CAPTURE_CONFIG.FILE_NAME,
          {type: CAPTURE_CONFIG.IMAGE_FORMAT}
      );

      setCapturedFile(file);
    } catch (error) {
      console.error('Error capturing screen:', error);
    }
  };

  const startCapturing = () => {
    if (!stream) {
      return;
    }

    setIsSharing(true);
    const intervalId = setInterval(captureScreen,
        CAPTURE_CONFIG.DEFAULT_INTERVAL);

    // Cleanup on stream end
    stream.getTracks()[0].onended = () => {
      clearInterval(intervalId);
      setIsSharing(false);
    };

    return intervalId;
  };

  return {
    isSharing,
    startCapturing,
    captureScreen
  };
};

export default useScreenCapture
