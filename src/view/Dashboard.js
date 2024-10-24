import {Card, CardContent, CardHeader} from "../components/ui/card";
import ScreenShareContext from "../components/ScreenShareProvider";
import React, {useContext, useEffect, useState} from "react";

const Dashboard = () => {
  const { stream, videoRef } = useContext(ScreenShareContext);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const [canvasImage, setCanvasImage] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const getImageFromLocalStorage = () => {
      const image = localStorage.getItem('canvasImage');
      if (image) {
        setCanvasImage(image);
      }
    };

    // 현재 날짜와 시간을 설정하는 함수
    const updateCurrentDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString(); // 날짜 형식: YYYY/MM/DD
      const time = now.toLocaleTimeString(); // 시간 형식: HH:MM:SS
      setCurrentDateTime(`${date} ${time}`); // 날짜와 시간 결합
    };

    getImageFromLocalStorage();
    const intervalId = setInterval(getImageFromLocalStorage, 1000);
    updateCurrentDateTime(); // 컴포넌트가 마운트될 때 날짜와 시간을 초기화
    const dateTimeIntervalId = setInterval(updateCurrentDateTime, 1000); // 매 초마다 날짜와 시간 업데이트

    return () => {
      clearInterval(intervalId);
      clearInterval(dateTimeIntervalId); // 클린업: 날짜와 시간 업데이트 인터벌 제거
    };
  }, []);


  const [images, setImages] = useState([]); // IndexedDB에서 불러온 이미지 목록
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 현재 선택된 이미지 인덱스

  // 컴포넌트가 마운트될 때 IndexedDB에서 이미지 불러오기
  useEffect(() => {
    const loadImages = () => {
      loadImagesFromIndexedDB().then((loadedImages) => {
        setImages(loadedImages); // 불러온 이미지 목록을 상태에 저장
      });
    };

    loadImages(); // 처음 한 번 이미지를 불러옴

    // 10초마다 이미지를 다시 불러옴
    const intervalId = setInterval(loadImages, 5000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, []);

  // IndexedDB에서 저장된 모든 이미지를 불러오는 함수
  function loadImagesFromIndexedDB() {
    return new Promise((resolve, reject) => {
      openDatabase().then((db) => {
        const transaction = db.transaction("images", "readonly");
        const store = transaction.objectStore("images");
        const request = store.getAll(); // 모든 이미지 불러오기

        request.onsuccess = (event) => {
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

  return (
      <>
        <div className="min-h-screen bg-gray-100 p-8 w-full flex flex-col">
          {/* Top three cards */}
          <div className="grid grid-cols-3 gap-6" style={{flex: '0 0 40%'}}>
            <Card className="h-full">
              <CardHeader className="text-neutral-500 text-2xl">실시간 화면 공유 현황</CardHeader>
              <CardContent>
                <div style={{width: '100%', height: '100%'}}>
                  <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader className="text-neutral-500 text-2xl">3초간 화면 캡쳐 현황</CardHeader>
              <CardContent>
                {canvasImage ? (
                    <>
                      <img src={canvasImage} alt="Canvas" />
                      <p className="flex justify-center mt-2 text-xl">{currentDateTime}</p> {/* 현재 날짜와 시간 표시 */}
                    </>
                ) : (
                    <p>No image found</p>
                )}
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader className="text-neutral-500 text-2xl">실시간 선정성 검출 현황</CardHeader>
              <CardContent>
                {images.length > 0 ? (
                    <div >
                      <img
                          src={images[images.length - 1]?.data}
                          alt="Selected"

                      />
                    </div>
                ) : (
                    <div >
                      <p>검출된 이미지가 없습니다.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Large card below */}
          <Card className="w-full mt-6" style={{flex: '0 0 55%'}}>
            <CardHeader>Large Card</CardHeader>
            <CardContent>

            </CardContent>
          </Card>
        </div>
      </>
  );
};

export default Dashboard;
