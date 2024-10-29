import React, { useState, useEffect } from 'react';
import './App.css';
import YOLOv8ObjectDetection from "./YOLOv8ObjectDetection";

const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// 도박 관련 키워드 목록
const GAMBLING_KEYWORDS = [
  '도박', '베팅', '카지노', '슬롯', '포커', '바카라', '룰렛',
  'betting', 'casino', 'slot', 'poker', 'baccarat', 'roulette',
  '토토', '배팅', 'gambling', 'bet', '잭팟', 'jackpot','페이백','홀덤'
  ,'충전규정','첫충','매충','배당','충횟수','충금액',
];

// 텍스트에서 도박 관련 내용 하이라이트 처리 함수
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

// 텍스트에 도박 관련 내용이 있는지 확인하는 함수
const hasGamblingContent = (text) => {
  if (!text) return false;
  return GAMBLING_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};

function App() {
  const [urlHistory, setUrlHistory] = useState([]);

  useEffect(() => {
    let mounted = true;

    const messageListener = (event) => {
      console.log("Received message in PWA:", event.data);
      if (mounted && 
          event.data.type === "URLS_AND_CONTENT_FROM_EXTENSION" && 
          event.data.source === EXTENSION_IDENTIFIER) {
        console.log("Setting URL history:", event.data.data);
        setUrlHistory(event.data.data);
      }
    };

    window.addEventListener("message", messageListener);

    setTimeout(() => {
      if (mounted) {
        requestUrlsAndContent();
      }
    }, 100);

    const intervalId = setInterval(() => {
      if (mounted) {
        requestUrlsAndContent();
      }
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      window.removeEventListener("message", messageListener);
    };
  }, []);

  const requestUrlsAndContent = () => {
    console.log("Requesting URL content...");
    window.postMessage({ 
      type: "REQUEST_URLS_AND_CONTENT",
      source: "PWA",
      identifier: EXTENSION_IDENTIFIER
    }, "*");
  };

  return (
    <div className="App">
      <YOLOv8ObjectDetection />
      <button onClick={requestUrlsAndContent}>
        새로고침
      </button>
      <div>
        <h3>URL History ({urlHistory.length})</h3>
        <ul>
          {urlHistory.map((item, index) => (
            <li key={index} className="url-history-item">
              <h4>{item.title || 'No Title'}</h4>
              <p className="url-text">URL : {item.url}</p>
              {hasGamblingContent(item.content) && (
                <div style={{
                  color: 'red',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  ⚠️ 도박성 컨텐츠 검출
                </div>
              )}
              <details>
                <summary>URL 텍스트 펼치기</summary>
                <p 
                  className="content-preview"
                  dangerouslySetInnerHTML={highlightGamblingContent(item.content)}
                />
              </details>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;