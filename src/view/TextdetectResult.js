import {Card} from "../components/ui/card";
import React, {useContext, useEffect, useState, useRef} from "react";
import {UrlHistoryContext} from "../components/UrlHistoryContext";
import html2canvas from 'html2canvas';
import {Trash2} from 'lucide-react';

// 도박 관련 키워드 목록
const GAMBLING_KEYWORDS = [
  '도박', '베팅', '카지노', '슬롯', '포커', '바카라', '룰렛',
  'betting', 'casino', 'slot', 'poker', 'baccarat', 'roulette',
  '토토', '배팅', 'gambling', 'bet', '잭팟', 'jackpot','페이백','홀덤',
  '충전규정','첫충','매충','배당','충횟수','충금액',
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

// URL 존재 여부 확인 함수
const checkUrlExists = async (url) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['detections'], 'readonly');
    const store = transaction.objectStore('detections');
    const index = store.index('url');
    const request = index.get(url);
    
    request.onsuccess = () => {
      resolve(!!request.result);
    };
    request.onerror = () => reject(request.error);
  });
};

// 캡처 데이터 저장 함수
const saveDetection = async (detection) => {
  const urlExists = await checkUrlExists(detection.url);
  if (urlExists) {
    console.log('이미 저장된 URL입니다:', detection.url);
    return null;
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['detections'], 'readwrite');
    const store = transaction.objectStore('detections');
    const request = store.add({
      ...detection,
      timestamp: new Date().toISOString()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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

const TextDetectView = () => {
  const urlHistory = useContext(UrlHistoryContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const contentRef = useRef(null);

  // 캡처 및 저장 함수
  const captureAndSave = async (item) => {
    if (!contentRef.current) return;
    
    try {
      // URL 중복 체크 db에 두번이상 저장 x
      const urlExists = await checkUrlExists(item.url);
      if (urlExists) {
        console.log('이미 저장된 URL입니다:', item.url);
        return;
      }

      const canvas = await html2canvas(contentRef.current);
      const screenshot = canvas.toDataURL('image/png');
      
      await saveDetection({
        url: item.url,
        title: item.title,
        screenshot,
        content: item.content,
        detectedAt: new Date()
      });
      
      // 검출 기록 새로고침
      loadDetectionHistory();
    } catch (error) {
      console.error('캡처 및 저장 실패:', error);
    }
  };

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
    loadDetectionHistory();
  }, []);

  useEffect(() => {
    if (urlHistory.length > 0 && !selectedItem) {
      setSelectedItem(urlHistory[0]);
    }
  }, [urlHistory]);

  // 도박성 컨텐츠 검출 시 자동 캡처
  useEffect(() => {
    if (selectedItem && hasGamblingContent(selectedItem.content)) {
      captureAndSave(selectedItem);
    }
  }, [selectedItem]);



  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 w-full flex flex-col">
    <Card className="w-full mt-6 h-full">
      <div className="flex flex-col md:flex-row h-full">
        {/* 좌측 탭 메뉴 */}
        <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r">
          <div className="flex mb-4 space-x-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded transition-colors ${
                viewMode === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
             현재 URL
            </button>
            <button
              onClick={() => setViewMode('detections')}
              className={`px-4 py-2 rounded transition-colors ${
                viewMode === 'detections' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              도박성 검출 ({detectionHistory.length})
            </button>
          </div>

          <div className="overflow-auto max-h-[calc(100vh-200px)] space-y-2">
            {viewMode === 'all' ? (
              // 전체 URL 리스트
              urlHistory.map((item, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer p-4 rounded transition-all hover:shadow-md ${
                    selectedItem === item 
                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <h4 className="font-semibold">{item.title || 'No Title'}</h4>
                  <p className="text-sm text-gray-600 truncate">URL: {item.url}</p>
                  {hasGamblingContent(item.content) && (
                    <div className="mt-2 text-red-600 text-sm flex items-center">
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
                  className={`cursor-pointer p-4 rounded transition-all relative group ${
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
                      <h4 className="font-semibold">{detection.title || 'No Title'}</h4>
                      <p className="text-sm text-gray-600 truncate">URL: {detection.url}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        검출 시각: {new Date(detection.detectedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(detection.id, e);
                      }}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 
                               transition-opacity p-2 hover:bg-red-100 rounded"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 우측 상세 내용 */}
        <div 
          ref={contentRef}
          className="w-full md:w-1/2 p-4 overflow-auto max-h-[calc(100vh-100px)]"
        >
          {selectedItem ? (
            <div className="space-y-4">
              <div className="bg-white p-4">
                <h2 className="text-xl font-bold">{selectedItem.title}</h2>
                <p className="text-sm text-gray-600">{selectedItem.url}</p>
              </div>

              {selectedItem.screenshot && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">스크린샷</h4>
                  <img 
                    src={selectedItem.screenshot} 
                    alt="Page screenshot" 
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              {hasGamblingContent(selectedItem.content) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <span className="text-red-700 font-semibold flex items-center gap-2">
                    ⚠️ 도박성 컨텐츠 검출
                  </span>
                </div>
              )}

              <details open={true}>
                <summary className="cursor-pointer py-2 font-semibold hover:text-blue-500">
                  URL 텍스트 내용
                </summary>
                <div 
                  className="mt-2 p-4 bg-gray-50 rounded shadow-inner"
                  style={{
                    maxHeight: '400px',
                    overflow: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E0 #EDF2F7'
                  }}
                >
                  <p 
                    className="content-preview text-sm"
                    dangerouslySetInnerHTML={highlightGamblingContent(selectedItem.content)}
                  />
                </div>
              </details>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              URL을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </Card>
  </div>
);
}
export default TextDetectView;
