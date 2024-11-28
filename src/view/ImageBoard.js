import React, {useContext, useEffect, useState} from "react";
import ScreenShareContext
                                                from "../contexts/ScreenShareContext";
import {
  Card
}                                               from "../components/common/Card";
import {useCanvasDB}                            from "../hook/useCanvasDB";
import {usePagination}                          from "../hook/usePagination";
import ImageList
                                                from "../components/board/ImageList";
import Pagination
                                                from "../components/board/Pagination";
import ImagePreview
                                                from "../components/board/ImagePreview";
import {
  showImageModal
}                                               from "../components/dashboard/imageUtils";

const ITEMS_PER_PAGE = 10;

const ImageBoard = () => {
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const {stream, videoRef} = useContext(ScreenShareContext);
  const {images} = useCanvasDB();
  const {
    currentPage,
    setCurrentPage,
    paginatedItems,
    totalPages
  } = usePagination(images, ITEMS_PER_PAGE);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  useEffect(() => {
    if (images.length > 0 && !selectedImageId) {
      setCurrentImage(images[0]);
      setSelectedImageId(images[0].id);
    }
  }, [images, selectedImageId]);

  const handleImageSelect = (image) => {
    setCurrentImage(image);
    setSelectedImageId(image.id);
  };

  return (
      <div className="min-h-screen bg-gray-100 p-8 w-full flex flex-col">
        <Card
            className="w-full mt-6 h-full"
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              overflow: 'hidden',
              margin: 'auto'
            }}
        >
          <div className="flex min-h-screen w-full">
            <div
                className="w-1/2 p-4 border-r flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-4">검출된 이미지 리스트</h2>
              <ImageList
                  images={paginatedItems}
                  selectedId={selectedImageId}
                  onImageSelect={handleImageSelect}
              />
              <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
              />
            </div>

            <div
                className="w-1/2 p-4 flex flex-col justify-center items-center">
              <ImagePreview
                  image={currentImage}
                  onClick={showImageModal}
              />
            </div>

            <video
                ref={videoRef}
                hidden={true}
                autoPlay
                playsInline
                style={{width: '10%', height: 'auto'}}
            />
          </div>
        </Card>
      </div>
  );
};

export default ImageBoard;