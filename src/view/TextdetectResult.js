import React, {useContext, useEffect, useState} from "react";
import {
  UrlHistoryContext
}                                               from "../contexts/UrlHistoryContext";
import ScreenShareContext
                                                from "../contexts/ScreenShareContext";
import {
  Card
}                                               from "../components/common/Card";
import Swal                                     from "sweetalert2";
import DetailView
                                                from "../components/text/DetailView";
import DetectionListItem
                                                from "../components/text/DetectionListItem";
import UrlListItem
                                                from "../components/text/UrlListItem";
import TabButton
                                                from "../components/text/TabButton";
import {VIEW_MODES}                             from "../constants";
import useDetectionHistory
                                                from "../hook/useDetectionHistory";

const TextDetectView = () => {
  const urlHistory = useContext(UrlHistoryContext);
  const {stream, videoRef} = useContext(ScreenShareContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODES.ALL);
  const {detectionHistory, handleDelete} = useDetectionHistory();

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

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  useEffect(() => {
    if (urlHistory.length > 0 && viewMode === VIEW_MODES.ALL) {
      setSelectedItem(urlHistory[urlHistory.length - 1]);
    }
  }, [urlHistory, viewMode]);

  useEffect(() => {
    if (viewMode === VIEW_MODES.DETECTIONS) {
      setSelectedItem(detectionHistory[0]);
    } else {
      setSelectedItem(urlHistory[urlHistory.length - 1]);
    }
  }, [viewMode, detectionHistory, urlHistory]);

  const handleDetectionClick = (detection) => {
    const originalItem = urlHistory.find(item => item.url === detection.url);
    setSelectedItem(originalItem || detection);
  };

  const handleDetectionDelete = async (id) => {
    try {
      await handleDelete(id);
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to delete detection:', error);
    }
  };

  return (
      <div
          className="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-8 w-full flex flex-col">
        <Card className="w-full mt-4 sm:mt-6 h-full">
          <div className="flex flex-col md:flex-row h-full">
            <div
                className="w-full md:w-1/2 p-2 sm:p-4 border-b md:border-b-0 md:border-r">
              <div className="flex mb-2 sm:mb-4 space-x-2">
                <TabButton
                    active={viewMode === VIEW_MODES.ALL}
                    onClick={() => setViewMode(VIEW_MODES.ALL)}
                >
                  현재 URL
                </TabButton>
                <TabButton
                    active={viewMode === VIEW_MODES.DETECTIONS}
                    onClick={() => setViewMode(VIEW_MODES.DETECTIONS)}
                >
                  도박성 검출 ({detectionHistory.length})
                </TabButton>
              </div>

              <div
                  className="overflow-y-auto overflow-x-hidden max-h-[40vh] md:max-h-[calc(100vh-200px)] space-y-2">
                {viewMode === VIEW_MODES.ALL ? (
                    urlHistory.map((item, index) => (
                        <UrlListItem
                            key={index}
                            item={item}
                            isSelected={selectedItem === item}
                            onClick={setSelectedItem}
                        />
                    ))
                ) : (
                    detectionHistory.map((detection, index) => (
                        <DetectionListItem
                            key={index}
                            detection={detection}
                            isSelected={selectedItem === detection}
                            onClick={() => handleDetectionClick(detection)}
                            onDelete={handleDetectionDelete}
                        />
                    ))
                )}
              </div>
            </div>

            <div
                className="w-full md:w-1/2 p-2 sm:p-4 overflow-x-hidden overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-100px)]">
              <DetailView
                  item={selectedItem}
                  viewMode={viewMode}
                  onImageClick={handleImageClick}
              />
            </div>
          </div>
        </Card>
        <video ref={videoRef} hidden={true} autoPlay playsInline
               style={{width: '10%', height: 'auto'}}/>
      </div>
  );
};

export default TextDetectView;