// context/UrlHistoryContext.jsx
import React, {createContext, useEffect, useRef, useState} from 'react';
import YOLOv8ObjectDetection
                                                           from "../components/YOLOv8ObjectDetection";
import {
  NotificationService
}                                                          from "../service/notification";
import {
  GamblingDetectionDB
}                                                          from "../service/GamblingDetectionDB";
import {
  GamblingDetector
}                                                          from "../service/GamblingDetector";
import formConverter
                                                           from "../utils/formConverter";

export const UrlHistoryContext = createContext();
const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

export const UrlHistoryProvider = ({children}) => {
  const [urlHistory, setUrlHistory] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [processedUrls] = useState(new Set());
  const [capturedFile, setCapturedFile] = useState(null);
  const notifiedUrls = useRef(new Set());
  const lastNotificationTime = useRef(0);
  const NOTIFICATION_COOLDOWN = 5000; // 5초 쿨다운

  const requestUrlsAndContent = () => {
    window.postMessage({
      type: "HHH",
      source: "HHH",
      identifier: EXTENSION_IDENTIFIER,
    }, "*");
  };

  const processScreenshot = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'screenshot.png', {type: 'image/png'});
      setCapturedFile(file);
    } catch (error) {
      console.error('Screenshot processing failed:', error);
    }
  };

  const canShowNotification = (url) => {
    const currentTime = Date.now();
    if (notifiedUrls.current.has(url)) {
      return false;
    }
    if (currentTime - lastNotificationTime.current < NOTIFICATION_COOLDOWN) {
      return false;
    }
    return true;
  };

  const processGamblingContent = async (data) => {
    const {content, url} = data;
    if (!content) {
      return false;
    }

    try {
      const detector = new GamblingDetector();
      const result = detector.gamble(content, url);

      if (result.result !== "통과" && canShowNotification(url)) {
        const urlExists = await GamblingDetectionDB.checkUrlExists(url);
        if (!urlExists) {
          await GamblingDetectionDB.saveDetection({
            url: data.url,
            title: data.title,
            screenshot: data.screenshot,
            content: data.content,
            detectedAt: new Date(),
            score: result.score
          });

          notifiedUrls.current.add(url);
          lastNotificationTime.current = Date.now();

          NotificationService.show(
              "도박성 컨텐츠 감지",
              "도박 관련 컨텐츠가 검출되었습니다.",
              "/meer.ico"
          );

          return true;
        }
      }
    } catch (error) {
      console.error('Gambling detection failed:', error);
    }
    return false;
  };

  const cleanupNotifications = () => {
    // 30분 이상 된 알림 기록 제거
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    notifiedUrls.current.forEach(url => {
      if (url.timestamp < thirtyMinutesAgo) {
        notifiedUrls.current.delete(url);
      }
    });
  };

  useEffect(() => {
    const messageListener = async (event) => {
      if (event.data.type === "HHH" && event.data.source
          === EXTENSION_IDENTIFIER) {
        const currentData = formConverter(event.data.data.data);

        if (currentData[0]?.title === "PWA") {
          setIsPaused(true);
          return;
        }

        setIsPaused(false);

        const currentUrl = currentData[0]?.url;
        if (currentUrl && processedUrls.has(currentUrl)) {
          return;
        }

        if (currentData[0]?.screenshot) {
          await processScreenshot(currentData[0].screenshot);
        }

        if (currentData[0]) {
          const isGambling = await processGamblingContent(currentData[0]);
          if (isGambling) {
            currentData[0].검출유무 = 1;
          }
        }

        if (currentUrl) {
          processedUrls.add(currentUrl);
        }

        setUrlHistory(currentData);
      }
    };

    NotificationService.requestPermission();
    window.addEventListener("message", messageListener);
    requestUrlsAndContent();

    const intervalId = setInterval(() => {
      requestUrlsAndContent();
      cleanupNotifications(); // 주기적으로 오래된 알림 기록 정리
    }, 1000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("message", messageListener);
      notifiedUrls.current.clear();
    };
  }, [isPaused, processedUrls]);

  return (
      <UrlHistoryContext.Provider value={urlHistory}>
        <YOLOv8ObjectDetection capturedFile={capturedFile}/>
        {children}
      </UrlHistoryContext.Provider>
  );
};

export default UrlHistoryContext;