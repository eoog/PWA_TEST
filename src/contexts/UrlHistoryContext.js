// UrlHistoryContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UrlHistoryContext = createContext();
const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// Provider 컴포넌트 정의
export const UrlHistoryProvider = ({ children }) => {
  const [urlHistory, setUrlHistory] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [lastReceivedMessage, setLastReceivedMessage] = useState(null);
  const [processedUrls] = useState(new Set());

 
  // 데이터 요청 함수
  const requestUrlsAndContent = () => {
    window.postMessage(
        {
          type: "HHH",
          source: "HHH",
          identifier: EXTENSION_IDENTIFIER,
        },
        "*"
    );
  };


  const GAMBLING_KEYWORDS = [
    '도박', '베팅', '카지노', '슬롯', '포커', '바카라', '룰렛',
    'betting', 'casino', 'slot', 'poker', 'baccarat', 'roulette',
    '토토', '배팅', 'gambling',  '잭팟', 'jackpot','페이백','홀덤',
    '충전규정','첫충','매충','배당','충횟수','충금액',"출금왕","PragmaticPlay","Booongo","롤링왕"
    ,"콤프","롤링"
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


  // 알림 기능 단순화
  const showNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("도박성 컨텐츠 감지", {
        body: "도박 관련 컨텐츠가 검출되었습니다.",
        icon: "/meer.ico",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("도박성 컨텐츠 감지", {
            body: "도박 관련 컨텐츠가 검출되었습니다.",
            icon: "/meer.ico",
          });
        }
      });
    }
  };

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

  useEffect(() => {
    const messageListener = async (event) => {
      if (
        event.data.type === "HHH" &&
        event.data.source === EXTENSION_IDENTIFIER
      ) {
        const currentData = event.data.data.data;
        const title = currentData[0]?.title;
      
        if (title === "PWA") {
          setIsPaused(true);
        } else {
          setIsPaused(false);
          setUrlHistory(currentData);
          
          const currentUrl = currentData[0]?.url;
          if (!currentUrl || processedUrls.has(currentUrl)) {
            return;
          }

          const content = currentData[0]?.content;
          
          if (content && highlightGamblingContent(content).__html.includes('color: red')) {
            try {
              const urlExists = await checkUrlExists(currentUrl);
              if (!urlExists) {
                // 저장
                await saveDetection({
                  url: currentData[0].url,
                  title: currentData[0].title,
                  screenshot: currentData[0].screenshot,
                  content: currentData[0].content,
                  detectedAt: new Date()
                });
                
                console.log('도박성 컨텐츠 저장 성공:', currentUrl);
                
                // 저장 성공 후 바로 알림 표시
                showNotification();
              } else {
                console.log('이미 저장된 URL입니다:', currentUrl);
              }
            } catch (error) {
              console.error('저장 실패:', error);
            }
          }

          processedUrls.add(currentUrl);
        }
      }
    };

    // 초기 알림 권한 요청
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    window.addEventListener("message", messageListener);
    requestUrlsAndContent();
    const intervalId = setInterval(requestUrlsAndContent, 1000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("message", messageListener);
    };
  }, [isPaused, lastReceivedMessage, processedUrls]);

  return (
    <UrlHistoryContext.Provider value={urlHistory}>
      {children}
    </UrlHistoryContext.Provider>
  );
};
