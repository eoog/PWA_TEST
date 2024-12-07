import {Card} from "../components/common/Card";
import React, {useContext, useEffect, useState} from "react";
import {UrlHistoryContext} from "../contexts/UrlHistoryContext";
import { Trash2 } from 'lucide-react';
import ScreenShareContext from "../contexts/ScreenShareContext";
import Swal from "sweetalert2";
import {calculateGamblingPercent, hasGamblingContent, highlightGamblingContent} from "../utils/gamblingDetection";
import {deleteDetection, initDB} from "../utils/indexedDB/indexedDB";

const TextDetectView = () => {
  const urlHistory = useContext(UrlHistoryContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const { stream, videoRef } = useContext(ScreenShareContext);

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

  // 렌더링 시
  useEffect(() => {
    if (urlHistory.length > 0 && viewMode === 'all') {
      setSelectedItem(urlHistory[urlHistory.length - 1]);
    }
  }, [urlHistory]);

  // viewMode가 변경될 때마다 selectedItem 업데이트
  useEffect(() => {
    if (viewMode === 'detections') {
      setSelectedItem(detectionHistory[0]);
    } else {
      setSelectedItem(urlHistory[urlHistory.length - 1]);
    }
  }, [viewMode]);

  // 검출 기록 로드
  const loadDetectionHistory = async () => {
    const db = await initDB();
    const transaction = db.transaction(['detections'], 'readonly');
    const store = transaction.objectStore('detections');
    const request = store.getAll();

    request.onsuccess = () => {
      setDetectionHistory(request.result.sort((a, b) =>
          new Date(b.detectedAt) - new Date(a.detectedAt)
      ));
    };
  };

  useEffect(() => {
    if (urlHistory.length > 0 && !selectedItem) {
      setSelectedItem(urlHistory[0]);
    }
    loadDetectionHistory();
  }, [urlHistory]);

  // 검출 기록 삭제 핸들러
  const handleDelete = async (id, e) => {
    e.stopPropagation();

    try {
      await deleteDetection(id);
      loadDetectionHistory();
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // 선정성 비디오 관련
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
      <div className="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-8 w-full flex flex-col">
        <Card className="w-full mt-4 sm:mt-6 h-full">
          <div className="flex flex-col md:flex-row h-full">
            {/* 좌측 탭 메뉴 */}
            <div className="w-full md:w-1/2 p-2 sm:p-4 border-b md:border-b-0 md:border-r">
              <div className="flex mb-2 sm:mb-4 space-x-2">
                <button
                    onClick={() => setViewMode('all')}
                    className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded transition-colors ${
                        viewMode === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                  현재 URL
                </button>
                <button
                    onClick={() => setViewMode('detections')}
                    className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded transition-colors ${
                        viewMode === 'detections'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                  도박성 검출 ({detectionHistory.length})
                </button>
              </div>

              <div className="overflow-y-auto overflow-x-hidden max-h-[40vh] md:max-h-[calc(100vh-200px)] space-y-2">
                {viewMode === 'all' ? (
                    // 전체 URL 리스트
                    urlHistory.map((item, index) => (
                        <div
                            key={index}
                            className={`cursor-pointer p-2 sm:p-4 rounded transition-all hover:shadow-md ${
                                selectedItem === item
                                    ? 'bg-blue-100 border-l-4 border-blue-500'
                                    : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedItem(item)}
                        >
                          <h4 className="font-semibold text-sm sm:text-base">{item.title || 'No Title'}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">URL: {item.url}</p>
                          {hasGamblingContent(item.content) && (
                              <div className="mt-1 sm:mt-2 text-red-600 text-xs sm:text-sm flex items-center">
                                <span>⚠️ 도박성 컨텐츠 검출</span>
                              </div>
                          )}
                        </div>
                    ))
                ) : (
                    // 도박성 검출 리스트
                    detectionHistory.map((detection, index) => (
                        <div
                            key={index}
                            className={`cursor-pointer p-2 sm:p-4 rounded transition-all relative group ${
                                selectedItem === detection
                                    ? 'bg-blue-100 border-l-4 border-blue-500'
                                    : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              const originalItem = urlHistory.find(item => item.url === detection.url);
                              setSelectedItem(originalItem || detection);
                            }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-grow pr-8">
                              <h4 className="font-semibold text-sm sm:text-base">{detection.title || 'No Title'}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">URL: {detection.url}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                검출 시각: {new Date(detection.detectedAt).toLocaleString()}
                                {calculateGamblingPercent(detection.content) > 0 && (
                                    <span className="text-red-400 pl-4">
                              score :  {detection.score}
                            </span>
                                )}
                              </p>
                            </div>
                            <button
                                onClick={(e) => handleDelete(detection.id, e)}
                                className="absolute top-2 sm:top-4 right-2 sm:right-4 opacity-0 group-hover:opacity-100
                                 transition-opacity p-1 sm:p-2 hover:bg-red-100 rounded"
                                title="삭제"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                    ))
                )}
              </div>
            </div>

            {/* 우측 상세 내용 */}
            <div className="w-full md:w-1/2 p-2 sm:p-4 overflow-x-hidden overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-100px)]">
              {selectedItem ? (
                  <div className="space-y-2 sm:space-y-4">
                    <div className="bg-white p-2 sm:p-4 rounded">
                      <h2 className="text-lg sm:text-xl font-bold break-words">
                        {selectedItem.title}
                        {viewMode === 'detections' && (
                            <span className="text-red-400 pl-4">
                        score :  {selectedItem.score}
                      </span>
                        )}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">{selectedItem.url}</p>
                    </div>

                    {selectedItem.screenshot && (
                        <div className="mb-4 sm:mb-6">
                          <h4 className="font-semibold mb-2 text-sm sm:text-base">
                            {viewMode === 'detections' ? '검출 스크린샷' : '스크린샷'}
                          </h4>
                          <div className="relative w-full sm:flex sm:justify-center">
                            <div className="relative group cursor-pointer"
                                 onClick={() => handleImageClick(selectedItem.screenshot, selectedItem.title)}>
                              <img
                                  src={selectedItem.screenshot}
                                  alt={`${viewMode === 'detections' ? '검출' : ''} 스크린샷`}
                                  className="w-full sm:w-auto rounded-lg shadow-md object-contain max-h-[50vh]"
                              />
                              <div className="absolute bottom-2 right-2 text-sm text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
                                클릭하여 확대
                              </div>
                            </div>
                          </div>
                        </div>
                    )}

                    {hasGamblingContent(selectedItem.content) && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-2 sm:p-4 rounded">
                    <span className="text-red-700 font-semibold flex items-center gap-2 text-sm sm:text-base">
                      ⚠️ 도박성 컨텐츠 검출
                    </span>
                        </div>
                    )}

                    <details open={true}>
                      <summary className="cursor-pointer py-1 sm:py-2 font-semibold hover:text-blue-500 text-sm sm:text-base">
                        URL 텍스트 내용
                      </summary>
                      <div
                          className="mt-2 p-2 sm:p-4 bg-gray-50 rounded shadow-inner"
                          style={{
                            maxHeight: '300px',
                            overflowX: 'hidden',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#CBD5E0 #EDF2F7'
                          }}
                      >
                        <p
                            className="content-preview text-xs sm:text-sm break-words"
                            dangerouslySetInnerHTML={highlightGamblingContent(selectedItem.content)}
                        />
                      </div>
                    </details>
                  </div>
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
                    URL을 선택해주세요.
                  </div>
              )}
            </div>
          </div>
        </Card>
        <video ref={videoRef} hidden={true} autoPlay playsInline style={{width: '10%', height: 'auto'}}/>
      </div>
  );
};

export default TextDetectView;