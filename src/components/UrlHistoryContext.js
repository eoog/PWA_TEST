// UrlHistoryContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UrlHistoryContext = createContext();
const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// Provider 컴포넌트 정의
export const UrlHistoryProvider = ({ children }) => {
  const [urlHistory, setUrlHistory] = useState([]);
  const [isPaused, setIsPaused] = useState(false); // 요청 일시 중지 상태
  const [lastReceivedMessage, setLastReceivedMessage] = useState(null); // 마지막 수신된 메시지 저장

  // 확장프로그램과 통신
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

  // 메시지 리스너 설정
  useEffect(() => {
    const messageListener = (event) => {
      if (
          event.data.type === "HHH" &&
          event.data.source === EXTENSION_IDENTIFIER
      ) {
        const currentData = event.data.data.data;
        const title = currentData[0]?.title; // 안전하게 접근
      
        // PWA 제목일 경우 요청 일시 중지
        if (title === "PWA") {
          setIsPaused(true);
        } else {
          setIsPaused(false); // PWA가 아닐 경우 요청 재개
          setUrlHistory(currentData); // URL 히스토리 업데이트
        }


      }
    };

    // 메시지 리스너 추가
    window.addEventListener("message", messageListener);

    // 초기 데이터 요청
    requestUrlsAndContent();

    // 주기적 요청 설정 (1초 간격)
    const intervalId = setInterval(requestUrlsAndContent, 1000);

    // cleanup 함수
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("message", messageListener);
    };
  }, [isPaused, lastReceivedMessage]); // isPaused와 lastReceivedMessage를 의존성으로 추가

  return (
      <UrlHistoryContext.Provider value={urlHistory}>
        {children}
      </UrlHistoryContext.Provider>
  );
};
