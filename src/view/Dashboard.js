import React, {useContext, useEffect} from "react";
import ScreenShareContext             from "../contexts/ScreenShareContext";
import Swal                           from "sweetalert2";
import {DB_CONFIG}                    from "../constants";
import {useIndexedDB}                 from "../hook/useIndexedDB";
import VideoCard                      from "../components/dashboard/VideoCard";
import ImageCard                      from "../components/dashboard/ImageCard";

const Dashboard = () => {
  const {stream, videoRef, startScreenShare} = useContext(ScreenShareContext);

  const {
    image: canvasImage,
    isLoading: isLoadingCanvas,
    error: canvasError
  } = useIndexedDB(DB_CONFIG.CANVAS_DB);

  const {
    image: detectionImage,
    isLoading: isLoadingDetection,
    error: detectionError
  } = useIndexedDB(DB_CONFIG.DETECTION_DB);

  const handleImageClick = (image, title) => {
    if (!image) {
      return;
    }

    Swal.fire({
      imageUrl: image,
      imageAlt: title,
      title: title,
      width: '80%',
      padding: '1em',
      showConfirmButton: false,
      showCloseButton: true,
      backdrop: `rgba(0, 0, 0, 0.8)`,
      customClass: {
        image: 'max-h-[80vh] object-contain'
      }
    });
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      handleImageClick(canvas.toDataURL('image/png'), '실시간 화면 공유');
    }
  };

  useEffect(() => {
    if (!stream) {
      startScreenShare();
    }
  }, [stream, startScreenShare]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
      <div
          className="min-h-screen bg-gray-100 p-4 md:p-8 w-full flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <ImageCard
              title="캡쳐된 화면"
              image={canvasImage}
              isLoading={isLoadingCanvas}
              error={canvasError}
              onClick={handleImageClick}
          />
          <ImageCard
              title="선정성 검출 이미지"
              image={detectionImage}
              isLoading={isLoadingDetection}
              error={detectionError}
              onClick={handleImageClick}
          />
        </div>
        <VideoCard
            stream={stream}
            videoRef={videoRef}
            startScreenShare={startScreenShare}
            onVideoClick={handleVideoClick}
        />
      </div>
  );
};

export default Dashboard;