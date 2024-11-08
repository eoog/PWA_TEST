import React, {useContext, useEffect, useRef, useState} from "react";
import ScreenShareContext from "../contexts/ScreenShareContext";
import Swal from "sweetalert2";
import {Card, CardContent, CardHeader} from "../components/common/Card";
import Spinner from "../components/common/LoadingSpinner";

const Dashboard = () => {
  const { stream, videoRef, startScreenShare } = useContext(ScreenShareContext);

  // States
  const [canvasImage, setCanvasImage] = useState(null);
  const [detectionImage, setDetectionImage] = useState(null);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(true);
  const [isLoadingDetection, setIsLoadingDetection] = useState(true);
  const [canvasError, setCanvasError] = useState(false);
  const [detectionError, setDetectionError] = useState(false);

  // 최적화용 Refs
  const prevDetectionImageRef = useRef(null);
  const prevCanvasImageRef = useRef(null);
  const isInitialDetectionLoadRef = useRef(true);
  const isInitialCanvasLoadRef = useRef(true);

  // indexedDB
  const openDatabase = (dbName) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.errorCode);
        reject(event.target.errorCode);
      };

      request.onsuccess = (event) => resolve(event.target.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
        }
      };
    });
  };

  // 이미지 로드 함수
  const loadImageFromDB = async (dbName, setError) => {
    try {
      const db = await openDatabase(dbName);
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const results = event.target.result;
          if (results.length > 1000) {
            store.clear();
          }
          const latestImage = results.length > 0 ? results[results.length - 1].data : null;
          setError(results.length === 0);
          resolve(latestImage);
        };

        request.onerror = (event) => {
          console.error(`Error loading images from ${dbName}:`, event.target.errorCode);
          setError(true);
          reject(event.target.errorCode);
        };
      });
    } catch (error) {
      console.error(`Database error in ${dbName}:`, error);
      setError(true);
      return null;
    }
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (image, title) => {
    if (!image) return;

    Swal.fire({
      imageUrl: image,
      imageAlt: title,
      title: title,
      width: '80%',
      padding: '1em',
      showConfirmButton: false,
      showCloseButton: true,
      backdrop: `rgba(0,0,0,0.8)`,
      customClass: {
        image: 'max-h-[80vh] object-contain'
      }
    });
  };

  // 이미지가 없는 경우
  const renderEmptyState = () => (
      <div className="flex flex-col items-center justify-center">
        <img
            className="w-24 h-24 mb-4"
            src={require('../meer.ico')}
            alt="Empty state"
        />
        <p className="text-xl font-semibold text-center text-neutral-500">
          저장된 이미지가 없습니다.
        </p>
      </div>
  );

  // 캔버스 이미지 업데이트
  useEffect(() => {
    const updateCanvasImage = async () => {
      try {
        const newImage = await loadImageFromDB("canvasImage", setCanvasError);

        if (isInitialCanvasLoadRef.current || newImage !== prevCanvasImageRef.current) {
          setCanvasImage(newImage);
          prevCanvasImageRef.current = newImage;

          if (isInitialCanvasLoadRef.current) {
            isInitialCanvasLoadRef.current = false;
            setIsLoadingCanvas(false);
          }
        }
      } catch (error) {
        console.error('Error loading canvas images:', error);
        setCanvasError(true);
        setIsLoadingCanvas(false);
      }
    };

    updateCanvasImage();
    const intervalId = setInterval(updateCanvasImage, 3000);

    return () => clearInterval(intervalId);
  }, []);

  // Effect for updating detection image
  useEffect(() => {
    const updateDetectionImage = async () => {
      try {
        const newImage = await loadImageFromDB("CanvasDB", setDetectionError);

        if (isInitialDetectionLoadRef.current || newImage !== prevDetectionImageRef.current) {
          setDetectionImage(newImage);
          prevDetectionImageRef.current = newImage;

          if (isInitialDetectionLoadRef.current) {
            isInitialDetectionLoadRef.current = false;
            setIsLoadingDetection(false);
          }
        }
      } catch (error) {
        console.error('Error loading detection images:', error);
        setDetectionError(true);
        setIsLoadingDetection(false);
      }
    };

    updateDetectionImage();
    const intervalId = setInterval(updateDetectionImage, 3000);

    return () => clearInterval(intervalId);
  }, []);

  // Video content renderer
  const renderVideoContent = () => {
    if (!stream) {
      return (
          <div
              onClick={() => startScreenShare()}
              className="flex flex-col items-center justify-center h-[50vh] text-neutral-500 cursor-pointer"
          >
            <img
                className="w-24 h-24 mb-4"
                src={require('../meer.ico')}
                alt="Start sharing"
            />
            <p className="text-xl font-semibold">화면 공유가 시작되지 않았습니다</p>
            <p className="mt-2">화면 공유를 시작하려면 클릭하세요</p>
          </div>
      );
    }

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            onClick={() => {
              if (videoRef.current) {
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoRef.current, 0, 0);
                handleImageClick(canvas.toDataURL('image/png'), '실시간 화면 공유');
              }
            }}
            style={{
              width: 'auto',
              height: 'auto',
              maxHeight: 'auto',
              cursor: 'pointer'
            }}
        />
    );
  };

  // Stream effect
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
      <div className="min-h-screen bg-gray-100 p-8 w-full flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-6">
          {/* 캔버스(캡쳐) 이미지 카드 */}
          <Card className="h-full">
            <CardContent
                className="h-full items-center justify-center"
                onClick={() => canvasImage && handleImageClick(canvasImage, '캡쳐된 화면')}
                style={{cursor: canvasImage ? 'pointer' : 'default'}}
            >
              <CardHeader className="text-neutral-500 font-bold text-2xl">
                <div className="flex gap-6 items-center justify-center">
                  <div>캡쳐된 화면</div>
                </div>
              </CardHeader>
              <div className="items-center flex justify-center min-h-[300px]">
                {isLoadingCanvas ? (
                    <Spinner />
                ) : canvasImage ? (
                    <div className="relative group">
                      <img
                          src={canvasImage}
                          alt="Canvas capture"
                          className="max-h-[500px] object-contain"
                      />
                      <div className="absolute bottom-2 right-2 text-sm text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
                        클릭하여 확대
                      </div>
                    </div>
                ) : canvasError ? (
                    renderEmptyState()
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* 선정성 검출 이미지 카드 */}
          <Card className="h-full">
            <CardContent
                className="h-full items-center justify-center"
                onClick={() => detectionImage && handleImageClick(detectionImage, '선정성 검출 이미지')}
                style={{cursor: detectionImage ? 'pointer' : 'default'}}
            >
              <CardHeader className="text-neutral-500 font-bold text-2xl">
                <div className="flex gap-6 items-center justify-center">
                  <div>선정성 검출 이미지</div>
                </div>
              </CardHeader>
              <div className="items-center flex justify-center min-h-[300px]">
                {isLoadingDetection ? (
                    <Spinner />
                ) : detectionImage ? (
                    <div className="relative group">
                      <img
                          src={detectionImage}
                          alt="Detection result"
                          className="max-h-[500px] object-contain"
                      />
                      <div className="absolute bottom-2 right-2 text-sm text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
                        클릭하여 확대
                      </div>
                    </div>
                ) : detectionError ? (
                    renderEmptyState()
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 실시간 화면 공유 카드 */}
        <Card
            className="w-full mt-6"
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              overflow: 'hidden',
              margin: 'auto'
            }}
        >
          <CardContent style={{cursor: stream ? 'pointer' : 'default'}}>
            <CardHeader className="text-neutral-500 font-bold text-2xl">
              <div className="flex gap-6 items-center justify-center">
                <div>실시간 화면 공유</div>
              </div>
            </CardHeader>
            {renderVideoContent()}
          </CardContent>
        </Card>
      </div>
  );
};

export default Dashboard;