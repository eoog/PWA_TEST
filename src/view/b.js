import React, { useEffect, useState } from "react";
import YOLOv8ObjectDetection from "../YOLOv8ObjectDetection";

const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

const Br = () => {
    const [urlHistory, setUrlHistory] = useState([]);

    // 데이터 요청 함수
    const requestUrlsAndContent = () => {
        console.log("Requesting URL content...");
        window.postMessage({
            type: "REQUEST_URLS_AND_CONTENT",
            source: "PWA",
            identifier: EXTENSION_IDENTIFIER
        }, "*");
    };

    useEffect(() => {
        let mounted = true;
        // 메시지 리스너 설정
        const messageListener = (event) => {
            console.log("Received message in PWA:", event.data);
            if (mounted &&
                event.data.type === "URLS_AND_CONTENT_FROM_EXTENSION" &&
                event.data.source === EXTENSION_IDENTIFIER) {
                console.log("Setting URL history:", event.data.data);
                setUrlHistory(event.data.data);
            }
        };

        // 리스너를 먼저 추가
        window.addEventListener("message", messageListener);

        // 약간의 지연 후 초기 데이터 요청
        setTimeout(() => {
            if (mounted) {
                requestUrlsAndContent();
            }
        }, 100);

        // 주기적 요청 설정
        const intervalId = setInterval(() => {
            if (mounted) {
                requestUrlsAndContent();
            }
        }, 10000);

        // cleanup
        return () => {
            mounted = false;
            clearInterval(intervalId);
            window.removeEventListener("message", messageListener);
        };
    }, []);

  return (
      <div>
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
                          <details>
                              <summary>URL 텍스트 펼치기</summary>
                              <p className="content-preview">
                                  {item.content ? item.content + '@@@---끝---@@@@' : 'No content available'}
                              </p>
                          </details>
                      </li>
                  ))}
              </ul>
          </div>
      </div>
  )
};


export default Br;
