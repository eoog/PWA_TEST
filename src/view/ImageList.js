import React, {useState, useEffect, useContext} from "react";
import ScreenShareContext from "../contexts/ScreenShareContext";
import DetectionModal from "../components/DetectionModal";
import {Card} from "../components/common/Card";

const ImageBoard = () => {
  const [images, setImages] = useState([]); // IndexedDB에서 불러온 이미지 리스트
  const [currentImage, setCurrentImage] = useState(null); // 현재 선택된 이미지
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [itemsPerPage] = useState(10); // 페이지당 항목 수
  const [selectedImageId, setSelectedImageId] = useState(null); // 선택된 이미지의 ID
  const {stream, videoRef, startScreenShare} = useContext(ScreenShareContext);
  const [isDetectionModalOpen, setDetectionModalOpen] = useState(false) // 이미지 모달
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // IndexedDB에서 이미지 데이터를 불러오는 함수
  function loadImagesFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("CanvasDB", 1);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.errorCode);
        reject(event.target.errorCode);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("images", "readonly");
        const store = transaction.objectStore("images");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = (event) => {
          console.error("Error loading images:", event.target.errorCode);
          reject(event.target.errorCode);
        };
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("images", {keyPath: "id", autoIncrement: true});
      };
    });
  }

  // 컴포넌트 마운트 시 IndexedDB에서 데이터 로드 및 5초마다 재조회
  useEffect(() => {
    const fetchImages = async () => {
      const loadedImages = await loadImagesFromIndexedDB();
      setImages(loadedImages);

      // 첫 번째 이미지를 자동 선택
      if (loadedImages.length > 0 && !selectedImageId) {
        setCurrentImage(loadedImages[0]);
        setSelectedImageId(loadedImages[0].id);
      }
    };

    // 처음 로드
    fetchImages();

    // 5초마다 데이터 재조회
    const intervalId = setInterval(fetchImages, 5000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, [selectedImageId]);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에서 보여줄 이미지 리스트
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = images.slice(indexOfFirstItem, indexOfLastItem);

  // 이미지 클릭 핸들러
  const handleClickImage = (image) => {
    setCurrentImage(image);
    setSelectedImageId(image.id); // 선택된 이미지의 ID 업데이트
  };

  // 페이지 버튼 생성
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(images.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }

    return pageNumbers.map((number) => (
        <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-2 py-1 m-1 ${
                number === currentPage ? "bg-blue-500 text-white"
                    : "bg-gray-300"
            }`}
        >
          {number}
        </button>
    ));
  };

  const handleOpenDetectionModal = () => {
    setDetectionModalOpen(true);
  };

  const handleCloseDetectionModal = () => {
    setDetectionModalOpen(false);
  };

  return (
      <div className="min-h-screen bg-gray-100 p-8 w-full flex flex-col">
        <Card className="w-full mt-6 h-full"
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                overflow: 'hidden',
                margin: 'auto'
              }}>
        <div className="flex min-h-screen w-full">

          {/* 왼쪽 이미지 리스트 */}
          <div
              className="w-1/2 p-4 border-r flex flex-col justify-center items-center">
            <h2 className="text-xl mb-4">검출된 이미지 리스트</h2>
            {currentItems.length > 0 ? (
                currentItems.map((image) => (
                    <div
                        key={image.id}
                        className={`cursor-pointer p-2 mb-2 w-full text-center ${
                            image.id === selectedImageId
                                ? "bg-blue-200" // 선택된 이미지에 백그라운드 효과
                                : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => handleClickImage(image)}
                    >
                      검출된 이미지 {image.id}
                    </div>
                ))
            ) : (
                <p className="text-gray-500">저장된 이미지가 없습니다.</p>
            )}

            {/* 페이지 버튼 */}
            {images.length > itemsPerPage && (
                <div className="mt-4">{renderPageNumbers()}</div>
            )}
          </div>

          {/* 오른쪽 이미지 미리보기 */}
          <div className="w-1/2 p-4 flex justify-center items-center">
            {currentImage ? (
                <div>
                  <h2 className="text-xl mb-4">선택된 이미지</h2>
                  <img
                      src={currentImage.data}
                      alt={`이미지 ${currentImage.id}`}
                      className="max-w-full h-auto"
                      onClick={handleOpenDetectionModal}
                      style={{
                        cursor:"pointer"
                      }}
                  />
                  <DetectionModal isOpen={isDetectionModalOpen}
                                  onClose={handleCloseDetectionModal}
                                  imageSrc={currentImage.data}/>
                </div>
            ) : (
                <p className="text-gray-500">이미지를 선택하세요.</p>
            )}
          </div>
          <video ref={videoRef} hidden={true} autoPlay playsInline
                 style={{width: '10%', height: 'auto'}}/>
        </div>
      </Card>
</div>
)
  ;
};

export default ImageBoard;
