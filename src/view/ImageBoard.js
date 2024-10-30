import React, {useState, useEffect, useContext} from "react";
import ScreenShareContext from "../contexts/ScreenShareContext";
import {Card} from "../components/common/Card";
import Swal from "sweetalert2";

const ImageBoard = () => {
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const {stream, videoRef, startScreenShare} = useContext(ScreenShareContext);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // 이미지 클릭 핸들러 - Sweetalert2 사용
  const handleImageClick = (image) => {
    Swal.fire({
      imageUrl: image.data,
      imageAlt: `검출된 이미지 ${image.id}`,
      title: `검출된 이미지 ${image.id}`,
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
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", {keyPath: "id", autoIncrement: true});
        }
      };
    });
  }

  useEffect(() => {
    const fetchImages = async () => {
      const loadedImages = await loadImagesFromIndexedDB();
      setImages(loadedImages);

      if (loadedImages.length > 0 && !selectedImageId) {
        setCurrentImage(loadedImages[0]);
        setSelectedImageId(loadedImages[0].id);
      }
    };

    fetchImages();
    const intervalId = setInterval(fetchImages, 5000);

    return () => clearInterval(intervalId);
  }, [selectedImageId]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = images.slice(indexOfFirstItem, indexOfLastItem);

  const handleClickImage = (image) => {
    setCurrentImage(image);
    setSelectedImageId(image.id);
  };

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
                number === currentPage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 hover:bg-gray-400 transition-colors"
            }`}
        >
          {number}
        </button>
    ));
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
            <div className="w-1/2 p-4 border-r flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-4">검출된 이미지 리스트</h2>
              {currentItems.length > 0 ? (
                  currentItems.map((image) => (
                      <div
                          key={image.id}
                          className={`cursor-pointer p-2 mb-2 w-full text-center transition-colors ${
                              image.id === selectedImageId
                                  ? "bg-blue-200"
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
            <div className="w-1/2 p-4 flex flex-col justify-center items-center">
              {currentImage ? (
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">선택된 이미지</h2>
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => handleImageClick(currentImage)}
                    >
                      <img
                          src={currentImage.data}
                          alt={`이미지 ${currentImage.id}`}
                          className="max-w-full h-auto rounded-lg shadow-lg"
                      />
                      <div className="absolute bottom-2 right-2 text-sm text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
                        클릭하여 확대
                      </div>
                    </div>
                  </div>
              ) : (
                  <p className="text-gray-500">이미지를 선택하세요.</p>
              )}
            </div>
            <video ref={videoRef} hidden={true} autoPlay playsInline style={{width: '10%', height: 'auto'}}/>
          </div>
        </Card>
      </div>
  );
};

export default ImageBoard;