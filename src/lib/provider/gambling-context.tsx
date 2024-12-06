"use client";

import React, {createContext, ReactNode, useEffect, useRef, useState} from 'react';
import {useToast} from "@/hooks/use-toast";
import YOLOv8 from "@/components/detection/yolo-8v-detection";
import {useScreenShare} from "@/lib/provider/screen-share-context";

const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

interface GamblingContextValue {
  urlHistory: UrlHistoryItem[];
}

export interface DetectionResult {
  result: "통과" | "도박" | "차단";
  score: number;
  weight: number;
  word_list: string[];
}

export interface UrlHistoryItem {
  url: string;
  title: string;
  content: string;
  screenshot?: string;
  검출유무?: number;
}

export interface DetectionItem extends UrlHistoryItem {
  id?: number;
  detectedAt: Date;
  score: number;
  timestamp?: string;
}

const GamblingContext = createContext<GamblingContextValue>({urlHistory: []});

export function GamblingProvider({children}: { children: ReactNode }) {
  const [urlHistory, setUrlHistory] = useState<UrlHistoryItem[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const processedUrls = useRef<Set<string>>(new Set());
  const {toast} = useToast();
  const {setCapturedFile} = useScreenShare();

  class GamblingDetector {
    private cutline: number = 100;
    private wordGroupAScore: number = 90;
    private wordGroupBScore: number = 50;
    private wordGroupCScore: number = 20;

    private wordGroupA: string[] = [
      "첫충", "단폴", "다리다리", "매충", "꽁머니", "슈어맨",
      "다음드", "한폴낙", "두폴낙", "단폴", "프리벳"
    ];

    private wordGroupB: string[] = [
      "카지노", "슬롯", "바카라", "블랙잭", "잭팟", "포커",
      "섯다", "화투", "홀덤", "배팅", "베팅", "토토",
      "라이브카지노", "입금보너스", "멀티베팅", "승자예상"
    ];

    private wordGroupC: string[] = [
      "이벤트", "사다리", "스포츠", "충전", "지급", "도박",
      "포인트", "입출금", "게임", "토큰", "인플레이", "토너먼트"
    ];

    public gamble(content: string, url: string): DetectionResult {
      const [gambleScore, gambleWords] = this.score(content.trim().toLowerCase().replace(/\s+/g, ''));
      const gambleWeight = this.weight(url);

      return {
        result: gambleWeight === 0.0 ? "차단" :
            gambleScore >= this.cutline * gambleWeight ? "도박" : "통과",
        score: gambleScore,
        weight: gambleWeight,
        word_list: gambleWords
      };
    }

    private score(content: string): [number, string[]] {
      const gambleWords: string[] = [];
      let gambleScore = 0;

      this.wordGroupA.forEach(word => {
        if (content.includes(word)) {
          gambleScore += this.wordGroupAScore;
          gambleWords.push(word);
        }
      });

      this.wordGroupB.forEach(word => {
        if (content.includes(word)) {
          gambleScore += this.wordGroupBScore;
          gambleWords.push(word);
        }
      });

      this.wordGroupC.forEach(word => {
        if (content.includes(word)) {
          gambleScore += this.wordGroupCScore;
          gambleWords.push(word);
        }
      });

      return [gambleScore, gambleWords];
    }

    private weight(url: string): number {
      // 화이트리스트/블랙리스트 구현...
      return 1.0;
    }
  }

  const initDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GamblingDetectionDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('detections')) {
          const store = db.createObjectStore('detections', {keyPath: 'id', autoIncrement: true});
          store.createIndex('url', 'url', {unique: true});
          store.createIndex('timestamp', 'timestamp', {unique: false});
        }
      };
    });
  };
  type NotificationType = 'adult' | 'inappropriate' | 'spam';

  // 알림 전송
  const sendNotification = async (type: NotificationType, message: string) => {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const notificationOptions: {
        inappropriate: { icon: string; title: string };
        adult: { icon: string; title: string };
        spam: { icon: string; title: string }
      } = {
        adult: {
          title: "🚨 성인 콘텐츠 감지",
          icon: '/meer.ico'
        },
        inappropriate: {
          title: "⚠️ 부적절 콘텐츠",
          icon: '/meer.ico'
        },
        spam: {
          title: "🚫 스팸 감지",
          icon: '/meer.ico'
        }
      };

      const options = {
        body: message,
        ...notificationOptions[type],
        tag: type,
        requireInteraction: false,
        icon: '/meer.ico'
      };

      try {
        const notification = new Notification(options.title, options);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('알림 생성 실패:', error);
      }
    } else {
    }
  };


  const saveDetection = async (detection: Omit<DetectionItem, 'id'>): Promise<number> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('detections', 'readwrite');
      const store = transaction.objectStore('detections');
      const request = store.add({
        ...detection,
        timestamp: new Date().toISOString()
      });

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  };

  useEffect(() => {
    const messageListener = async (event: MessageEvent) => {
      if (event.data.type === "HHH" && event.data.source === EXTENSION_IDENTIFIER) {
        const currentData = event.data.data.data as UrlHistoryItem[];

        if (currentData[0]?.title.includes("PWA")) {
          setIsPaused(true);
          return;
        }

        setIsPaused(false);

        // 스크린샷 처리
        if (currentData[0]?.screenshot) {
          try {
            const response = await fetch(currentData[0].screenshot);
            const blob = await response.blob();
            const file = new File([blob], 'screenshot.png', {type: 'image/png'});
            setCapturedFile(file);
          } catch (error) {
            console.error('스크린샷 처리 오류:', error);
          }
        }

        // 도박 감지 처리
        const content = currentData[0]?.content;
        const currentUrl = currentData[0]?.url;

        if (content && currentUrl && !processedUrls.current.has(currentUrl)) {
          const detector = new GamblingDetector();
          const result = detector.gamble(content, currentUrl);
          if (result.result !== "통과") {
            await saveDetection({
              url: currentData[0].url,
              title: currentData[0].title,
              screenshot: currentData[0].screenshot,
              content: currentData[0].content,
              detectedAt: new Date(),
              score: result.score
            });
            
            currentData[0].검출유무 = 1;
            sendNotification('inappropriate', '도박성 콘텐츠가 감지되었습니다.');
            toast({
              title: "도박성 컨텐츠 감지",
              description: "도박 관련 컨텐츠가 검출되었습니다.",
              variant: "destructive",
            });

            // 창 최소화 메시지 전송 추가
            // window.postMessage({
            //   type: "SHARE",
            //   source: "SHARE",
            //   identifier: EXTENSION_IDENTIFIER
            // }, "*");

            // 탭 닫기 메시지 전송
            window.postMessage({
              type: "CLOSE_TAB",
              source: "CLOSE_TAB",
              identifier: EXTENSION_IDENTIFIER,
              url: currentUrl
            }, "*");
          }
        }

        if (currentUrl) {
          processedUrls.current.add(currentUrl);
        }
        setUrlHistory(currentData);
      }
    };

    window.addEventListener("message", messageListener);

    const requestData = () => {
      window.postMessage(
          {
            type: "HHH",
            source: "HHH",
            identifier: EXTENSION_IDENTIFIER,
          },
          "*"
      );
    };

    requestData();
    const intervalId = setInterval(requestData, 1000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("message", messageListener);
    };
  }, [isPaused, toast]);

  return (
      <GamblingContext.Provider value={{urlHistory}}>
        <YOLOv8/>
        {children}
      </GamblingContext.Provider>
  );
}

export const useGambling = () => {
  const context = React.useContext(GamblingContext);
  if (context === undefined) {
    throw new Error('useGambling must be used within a GamblingProvider');
  }
  return context;
};