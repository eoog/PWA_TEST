import {Card, CardContent, CardHeader} from "../components/ui/card";
import ScreenShareContext from "../contexts/ScreenShareContext";
import React, {useContext, useEffect, useState} from "react";
import Modal from "../components/Modal";
import ImageModal from "../components/ImageModal";
import DetectionModal from "../components/DetectionModal";

const Dashboard = () => {
  const { stream, videoRef, startScreenShare } = useContext(ScreenShareContext);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태 관리
  const [isImageModalOpen , setImageModalOpen] = useState(false) // 이미지 모달
  const [isDetectionModalOpen , setDetectionModalOpen] = useState(false) // 이미지 모달



  const [canvasImage, setCanvasImage] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState("");

  const renderEmptyState = () => (
      <div className="flex flex-col">
        <img
            className="flex flex-col items-center justify-center m-auto w-24 h-24 mb-4"
            src={require('../meer.ico')}
            alt=""
        />
        <p className="text-xl font-semibold text-center text-neutral-500">저장된 이미지가 없습니다.</p>
      </div>
  );


  const renderVideoContent = () => {
    if (!stream) {
      return (
          <div onClick={() => startScreenShare()} className="flex flex-col items-center justify-center h-[50vh] text-neutral-500">
            <img
                className="w-24 h-24 mb-4"
                src={require('../meer.ico')}
                alt="Placeholder icon"
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
            onClick={handleOpenModal}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh'
            }}
        />
    );
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  useEffect(() => {
    const loadImages = () => {
      loadScreenFromIndexedDB().then((loadedImages) => {
        setCanvasImage(loadedImages); // 불러온 이미지 목록을 상태에 저장
      });
    };


    // 현재 날짜와 시간을 설정하는 함수
    const updateCurrentDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString(); // 날짜 형식: YYYY/MM/DD
      const time = now.toLocaleTimeString(); // 시간 형식: HH:MM:SS
      setCurrentDateTime(`${date} ${time}`); // 날짜와 시간 결합
    };

    loadImages();
    const intervalId = setInterval(loadImages, 3000);
    // 10초마다 이미지를 다시 불러옴
    updateCurrentDateTime(); // 컴포넌트가 마운트될 때 날짜와 시간을 초기화
    const dateTimeIntervalId = setInterval(updateCurrentDateTime, 1000); // 매 초마다 날짜와 시간 업데이트

    return () => {
      clearInterval(intervalId);
      clearInterval(dateTimeIntervalId); // 클린업: 날짜와 시간 업데이트 인터벌 제거
    };
  }, []);

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
        db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
      };
    });
  }

  function loadScreenFromIndexedDB() {
    return new Promise((resolve, reject) => {
      openDatabaseScreen().then((db) => {
        const transaction = db.transaction("images", "readonly");
        const store = transaction.objectStore("images");
        const request = store.getAll(); // 모든 이미지 가져오기

        request.onsuccess = (event) => {
          try {
          resolve(event.target.result[0].data); // 모든 이미지를 배열로 반환
          } catch (e) {
            resolve(null)
          }
        };

        request.onerror = (event) => {
          console.error("Error loading images from IndexedDB:", event.target.errorCode);
          reject(event.target.errorCode);
        };
      });
    });
  }


  const [images, setImages] = useState([]); // IndexedDB에서 불러온 이미지 목록
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 현재 선택된 이미지 인덱스

  // // 컴포넌트가 마운트될 때 IndexedDB에서 이미지 불러오기
  useEffect(() => {
    const loadImages = () => {
      loadImagesFromIndexedDB().then((loadedImages) => {
        setImages(loadedImages); // 불러온 이미지 목록을 상태에 저장
      });
    };

    loadImages(); // 처음 한 번 이미지를 불러옴

    // 10초마다 이미지를 다시 불러옴
    const intervalId = setInterval(loadImages, 3000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, []);

  // IndexedDB에서 저장된 모든 이미지를 불러오는 함수
  function loadImagesFromIndexedDB() {
    return new Promise((resolve, reject) => {
      openDatabase().then((db) => {
        const transaction = db.transaction("images", "readwrite");
        const store = transaction.objectStore("images");
        const request = store.getAll(); // 모든 이미지 불러오기

        request.onsuccess = (event) => {
          if (event.target.result.length > 1000) {
            store.clear();
          }
          resolve(event.target.result); // 모든 이미지를 배열로 반환
        };

        request.onerror = (event) => {
          console.error("Error loading images from IndexedDB:", event.target.errorCode);
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
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("images", {keyPath: "id", autoIncrement: true});
      };
    });
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenImageModal = () => {
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
  };

  const handleOpenDetectionModal = () => {
    setDetectionModalOpen(true);
  };

  const handleCloseDetectionModal = () => {
    setDetectionModalOpen(false);
  };



  return (
      <>
        <div className="min-h-screen bg-gray-100 p-8 w-full flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-6">
            <Card className="h-full">
              <CardContent
                  className="h-full items-center justify-center"
                  onClick={handleOpenImageModal}
                  style={{cursor: 'pointer'}}
              >
                <CardHeader className="text-neutral-500 font-bold text-2xl">
                  <div className="flex gap-6 items-center justify-center">
                    <div>3초간 화면 캡쳐 현황</div>
                  </div>
                </CardHeader>
                <div className="items-center flex justify-center">
                  {canvasImage ? (
                      <div>
                        <img src={canvasImage} alt="Canvas"/>
                      </div>
                  ) : renderEmptyState()}
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardContent
                  className="h-full items-center justify-center"
                  onClick={handleOpenDetectionModal}
                  style={{cursor: 'pointer'}}
              >
                <CardHeader className="text-neutral-500 font-bold text-2xl">
                  <div className="flex gap-6 items-center justify-center">
                    <div>실시간 선정성 검출 현황</div>
                  </div>
                </CardHeader>
                <div className="">
                  {images.length > 0 ? (
                      <div>
                        <img src={images[images.length - 1]?.data}
                             alt="Selected"/>
                      </div>
                  ) : renderEmptyState()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card
              className="w-full mt-6 h-full"
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                overflow: 'hidden',
                margin: 'auto'
              }}
          >
            <CardContent style={{cursor: 'pointer'}}>
              <CardHeader className="text-neutral-500 font-bold text-2xl">
                <div className="flex gap-6 items-center justify-center">
                  <div>실시간 화면 공유</div>
                </div>
              </CardHeader>
              {renderVideoContent()}
            </CardContent>
          </Card>

          <Modal isOpen={isModalOpen} onClose={handleCloseModal}
                 ref={videoRef}/>
          <ImageModal
              isOpen={isImageModalOpen}
              onClose={handleCloseImageModal}
              imageSrc={canvasImage}
          />
          <DetectionModal
              isOpen={isDetectionModalOpen}
              onClose={handleCloseDetectionModal}
              imageSrc={images[images.length - 1]?.data}
          />
        </div>
      </>
  );
};

export default Dashboard;
