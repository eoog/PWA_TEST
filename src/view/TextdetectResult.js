import {Card} from "../components/common/Card";
import React, {useContext, useEffect, useState} from "react";
import {UrlHistoryContext} from "../contexts/UrlHistoryContext";
import { Trash2} from 'lucide-react';
import ScreenShareContext from "../contexts/ScreenShareContext";




// 도박 관련 키워드 목록
const GAMBLING_KEYWORDS = [
  '도박', '베팅', '카지노', '슬롯', '포커', '바카라', '룰렛',
  'betting', 'casino', 'slot', 'poker', 'baccarat', 'roulette',
  '토토', '배팅', 'gambling',  '잭팟', 'jackpot','페이백','홀덤',
  '충전규정','첫충','매충','배당','충횟수','충금액',"출금왕","PragmaticPlay","Booongo","롤링왕"
  ,"콤프","롤링",
];

const highlightGamblingContent = (text) => {
  if (!text) return { __html: '' };
  let processedText = text;
  GAMBLING_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    processedText = processedText.replace(
      regex,
      `<span style="color: red; font-weight: bold;">$&</span>`
    );
  });
  return { __html: processedText + '@@@---끝---@@@@' };
};

const hasGamblingContent = (text) => {
  if (!text) return false;
  return GAMBLING_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};

// IndexedDB 초기화 함수
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GamblingDetectionDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('detections')) {
        const store = db.createObjectStore('detections', { keyPath: 'id', autoIncrement: true });
        store.createIndex('url', 'url', { unique: true }); // URL을 unique로 설정
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};



// 검출 기록 삭제 함수
const deleteDetection = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['detections'], 'readwrite');
    const store = transaction.objectStore('detections');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 도박 관련 키워드 검출 및 퍼센트 계산 함수
const calculateGamblingPercent = (content) => {


  // 텍스트에서 도박 키워드 > detectedWords 배열에 저장
  const detectedWords = content.split(/\s+/).filter(word => 
    GAMBLING_KEYWORDS.some(keyword => word.toLowerCase().includes(keyword.toLowerCase()))
  );

  // 전체 단어 수 
  const totalWords = content.split(/\s+/).length;
  
  // 검출된 키워드 수가 특정 임계값을 넘으면 최대 95%로 제한
  const maxPercent = 95;
  //검출된 키워드 수를 전체 글자수로 나눠서 예시 퍼센티지 계산 / 실제 데이터는 다걸 이용 ㄱㄱ
  const basePercent = Math.min((detectedWords.length / totalWords) * 500, maxPercent);
  
  // 최소 검출 시 20%부터 시작
  const minPercent = 20;
  
  // 검출된 키워드가 있을 경우 최소 20%부터 시작하여 계산
  return detectedWords.length > 0 
    ? Math.max(Math.round(basePercent), minPercent)
    : 0;
};

const TextDetectView = () => {
  const urlHistory = useContext(UrlHistoryContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { stream, videoRef } = useContext(ScreenShareContext);

  // urlHistory가 변경될 때마다 자동선택
  useEffect(() => {
    if (urlHistory.length > 0&&viewMode==='all') {
      setSelectedItem(urlHistory[urlHistory.length - 1]);
    }
  }, [urlHistory,viewMode]); 


  // 캡처 및 저장 함수
  const captureAndSave = async (item) => {
    try {
      // 응답 대기 시간 설정
      const urlExists = await Promise.race([
        checkUrlExists(item.url),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);

      if (urlExists) {
        console.log('이미 저장된 URL입니다:', item.url);
        return;
      }

      await saveDetection({
        url: item.url,
        title: item.title,
        screenshot: item.screenshot,
        content: item.content,
        detectedAt: new Date()
      });
      
      console.log('저장 성공:', item.url);
      await loadDetectionHistory();
    } catch (error) {
      if (error.message === 'Timeout') {
        console.log('저장 시간 초과');
      } else {
        console.error('저장 실패:', error);
      }
    }
  };

  // 선정성
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // urlHistory 변경 시 도박성 컨텐츠 자동 감지 및 저장
  useEffect(() => {
    const detectAndSave = async () => {
      try {
        for (const item of urlHistory) {
          if (hasGamblingContent(item.content)) {
            console.log('도박성 컨텐츠 감지:', item.url);
            // 메시지 채널이 닫히기 전에 응답을 받을 수 있도록 timeout 설정
            await Promise.race([
              captureAndSave(item),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ]);
          }
        }
      } catch (error) {
        if (error.message === 'Timeout') {
          console.log('작업 시간 초과');
        } else {
          console.error('도박성 컨텐츠 감지 중 오류:', error);
        }
      }
    };

    if (urlHistory.length > 0) {
      detectAndSave();
    }
  }, [urlHistory]);

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
    e.stopPropagation(); // 부모 요소의 클릭 이벤트 전파 방지
    
    try {
      await deleteDetection(id);
      // 검출 기록 새로고침
      loadDetectionHistory();
      // 만약 현재 선택된 아이템이 삭제된 것이라면 선택 해제
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

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
              {/* <button className="pl-10" onClick={()=>loadDetectionHistory()}><LucideRefreshCw className="w-4 h-4 sm:w-5 sm:h-5"/></button> */}
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
                              도박성 {calculateGamblingPercent(detection.content)}%
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
          <div 
            className="w-full md:w-1/2 p-2 sm:p-4 overflow-x-hidden overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-100px)]"
          >
            {selectedItem ? (
              <div className="space-y-2 sm:space-y-4">

                {viewMode === 'detections' ? (
                  <>
                    <div className="bg-white p-2 sm:p-4 rounded">
                      <h2 className="text-lg sm:text-xl font-bold break-words">
                        {selectedItem.title}
                        <span className="text-red-400 pl-4">
                          도박성 {calculateGamblingPercent(selectedItem.content)}%
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">{selectedItem.url}</p>
                    </div>

                    {selectedItem.screenshot && (
                      <div className="mb-4 sm:mb-6">
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">검출 스크린샷</h4>
                        <div className="relative w-full sm:flex sm:justify-center">
                          <img 
                            src={selectedItem.screenshot} 
                            alt="Detection screenshot" 
                            className="w-full sm:w-auto rounded-lg shadow-md cursor-pointer object-contain max-h-[50vh]"
                            onClick={() => setIsImageModalOpen(true)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-red-50 border-l-4 border-red-500 p-2 sm:p-4 rounded">
                      <span className="text-red-700 font-semibold flex items-center gap-2 text-sm sm:text-base">
                        ⚠️ 도박성 컨텐츠 검출
                      </span>
                    </div>

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
                  </>
                ) : (
                  // all 모드일 때는 모든 내용 표시
                  <>
                     <div className="bg-white p-2 sm:p-4 rounded">
                  <h2 className="text-lg sm:text-xl font-bold break-words">{selectedItem.title} </h2>
                  {/* <span className="text-red-400 text-md pl-4">도박성 83%</span>  */}
                  <p className="text-xs sm:text-sm text-gray-600 break-words">{selectedItem.url}</p>
                </div>
                    {selectedItem.screenshot && (
                      
                      <div className="mb-4 sm:mb-6">
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">스크린샷</h4>
                        <div className="relative w-full">
                          <img 
                            src={selectedItem.screenshot} 
                            alt="Page screenshot" 
                            className="w-full h-auto rounded-lg shadow-md cursor-pointer object-contain max-h-[50vh]"
                            onClick={() => setIsImageModalOpen(true)}
                          />
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
                  </>
                )}
  
                {isImageModalOpen && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsImageModalOpen(false)}
                  >
                    <img 
                      src={selectedItem.screenshot} 
                      alt="Enlarged screenshot" 
                      className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
                URL을 선택해주세요.
              </div>
            )}
          </div>
        </div>
      </Card>
      {/*선정성 비디오 삭제 금지*/}
      <video ref={videoRef} hidden={true} autoPlay playsInline
             style={{width: '10%', height: 'auto'}}/>
    </div>
  )
};
export default TextDetectView;
