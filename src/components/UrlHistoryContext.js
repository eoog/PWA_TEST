// UrlHistoryContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UrlHistoryContext = createContext();
const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// Provider 컴포넌트 정의
export const UrlHistoryProvider = ({ children }) => {
  const [urlHistory, setUrlHistory] = useState([]);

  // 데이터 요청 함수
  const requestUrlsAndContent = () => {
    // console.log("URL과 콘텐츠를 요청합니다...");
    window.postMessage(
        {
          type: "HHH",
          source: "HHH",
          identifier: EXTENSION_IDENTIFIER,
        },
        "*"
    );
  };

  // 메시지 리스너 설정
  useEffect(() => {
    const messageListener = (event) => {
      // console.log("Received message:", event.data);
      if (
          event.data.type === "HHH" &&
          event.data.source === EXTENSION_IDENTIFIER
      ) {
        console.log("HHH:", event.data.data.data[0].url);
        setUrlHistory(event.data.data.data);
      }
    };

    // 메시지 리스너 추가
    window.addEventListener("message", messageListener);

    // 초기 데이터 요청
    requestUrlsAndContent();

    // 주기적 요청 설정 (10초 간격)
    const intervalId = setInterval(requestUrlsAndContent, 1000);

    // cleanup 함수
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("message", messageListener);
    };
  }, []);

  return (
      <UrlHistoryContext.Provider value={urlHistory}>
        {children}
      </UrlHistoryContext.Provider>
  );
};
