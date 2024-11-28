import React, {useContext, useEffect} from 'react';
import ScreenShareContext             from "../../contexts/ScreenShareContext";
import useScreenCapture               from "../../hook/useScreenCapture";

const ScreenCapture = ({setCapturedFile}) => {
  const {stream, videoRef} = useContext(ScreenShareContext);
  const {startCapturing} = useScreenCapture(stream, videoRef, setCapturedFile);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      const intervalId = startCapturing();

      // 임시로 주석 처리된 기능
      // requestShareAndContent();

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [stream, videoRef, startCapturing]);

  return (
      <div className="w-full h-full flex flex-col items-center">
        <video
            ref={videoRef}
            hidden
            autoPlay
            playsInline
            className="w-full h-full object-contain mt-2.5"
        />
      </div>
  );
};

export default ScreenCapture;