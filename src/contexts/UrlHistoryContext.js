// UrlHistoryContext.js
import React, { createContext, useState, useEffect } from 'react';
import {GAMBLING_KEYWORDS} from "../constants/gamblingKeywords";
import formConverter from "../utils/formConverter";

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

    showNotification();
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

  class GamblingDetector {
    constructor() {
      this.cutline = 100;

      // Word groups and their scores
      this.wordGroupAScore = 90;
      this.wordGroupBScore = 50;
      this.wordGroupCScore = 20;

      this.wordGroupA = [
        "첫충", "단폴", "다리다리", "매충", "꽁머니", "슈어맨",
        "다음드", "한폴낙", "두폴낙", "단폴", "프리벳"
      ];

      this.wordGroupB = [
        "카지노", "슬롯", "바카라", "블랙잭", "잭팟", "포커",
        "섯다", "화투", "홀덤", "배팅", "베팅", "토토",
        "라이브카지노", "입금보너스", "멀티베팅", "승자예상"
      ];

      this.wordGroupC = [
        "이벤트", "사다리", "스포츠", "충전", "지급", "도박",
        "포인트", "입출금", "게임", "토큰", "인플레이", "토너먼트",
        "캐시", "적중", "텔레그램", "복권", "레이싱", "입출금",
        "가상화폐", "폴더", "페이벡", "환전", "추천인", "배당",
        "배당율", "미성년자", "가입", "청소년"
      ];

      this.urlBlacklist = [
        "www.bwzx",
        "www.bet16",
        "1bet1.bet",
        "10x10v2a.com"
      ];

      this.urlWhitelist = [
        "naver.com", "daum.net", "coupang.com", "ticketmonster.co.kr",
        "baedalMinjok.com", "gmarket.co.kr", "auction.co.kr", "nate.com",
        "aladin.co.kr", "interpark.com", "ridibooks.com", "zigbang.com",
        "kakaocorp.com", "melon.com", "tistory.com", "hani.co.kr",
        "mycelebs.com", "cgv.co.kr", "baedal.com", "hankyung.com",
        "news1.kr", "mnet.com", "onmap.co.kr", "friends.co.kr",
        "kgc.co.kr", "ehmart.com", "viralmarketing.co.kr", "kurly.com",
        "hankookilbo.com", "dcinside.com", "kofic.or.kr", "yna.co.kr",
        "incheonilbo.com", "seoul.co.kr", "donga.com", "chosun.com",
        "sisain.com", "sportsseoul.com", "kbs.co.kr", "jtbc.joins.com",
        "jtbc.com", "imbc.com", "tvchosun.com", "kukinews.com", "hani.co.kr",
        "inews24.com", "news1.kr"
      ];
    }

    gamble(content, url) {

      // Calculate scores
      const [gambleScore, gambleWords] = this.score(content.trim().toLowerCase().replace(/\s+/g, ''));

      // Calculate weight
      const gambleWeight = this.weight(url);

      // Prepare result
      const result = {
        result: "통과",
        score: gambleScore,
        weight: gambleWeight,
        word_list: gambleWords
      };

      // 도박성 판단
      if (gambleWeight === 0.0) {
        result.result = "차단";
      } else if (gambleScore >= this.cutline * gambleWeight) {
        result.result = "도박";
      }
      return result;
    }

    score(content) {
      const gambleWords = [];
      let gambleScore = 0;

      // Check group A words
      for (const word of this.wordGroupA) {
        if (content.includes(word)) {
          gambleScore += this.wordGroupAScore;
          gambleWords.push(word);
        }
      }
      // Check group B words
      for (const word of this.wordGroupB) {
        if (content.includes(word)) {
          gambleScore += this.wordGroupBScore;
          gambleWords.push(word);
        }
      }
      // Check group C words
      for (const word of this.wordGroupC) {
        if (content.includes(word)) {
          gambleScore += this.wordGroupCScore;
          gambleWords.push(word);
        }
      }
      return [gambleScore, gambleWords];
    }

    weight(url) {
      const PKG_WHITELIST_WEIGHT = 5.0;  // 화이트리스트 둔감하게
      const PKG_BLACKLIST_WEIGHT = 0.0;  // 블랙리스트 즉시차단

      let gambleWeight = 1.0;

      // Check url blacklist
      if (this.urlBlacklist.some(blacklist => url.includes(blacklist))) {
        gambleWeight = PKG_BLACKLIST_WEIGHT;
      }
      // Check url whitelist
      if (this.urlWhitelist.some(whitelist => url.includes(whitelist))) {
        gambleWeight = PKG_WHITELIST_WEIGHT;
      }
      return gambleWeight;
    }
  }

  useEffect(() => {
    const messageListener = async (event) => {
      if (
        event.data.type === "HHH" &&
        event.data.source === EXTENSION_IDENTIFIER
      ) {
        const currentData = formConverter(event.data.data.data);

        if (currentData[0]?.title === "PWA") {
          setIsPaused(true);
          return ;
        }

        setIsPaused(false);


        const content = currentData[0]?.content;
        const currentUrl = currentData[0]?.url;


        if (content) {
          try {
            const detector = new GamblingDetector();
            const result = detector.gamble(content, currentUrl);
            //console.log(result.result)
            if (result.result !== "통과") {
              console.log(result.result)
              // 저장
              await saveDetection({
                url: currentData[0].url,
                title: currentData[0].title,
                screenshot: currentData[0].screenshot,
                content: currentData[0].content,
                detectedAt: new Date(),
                score : result.score
              });

              currentData[0].검출유무 = 1;
              console.log('도박성 컨텐츠 저장 성공:', currentUrl);

              //showNotification();
            } else {
              //console.log('이미 저장된 URL입니다:', currentUrl);
            }
          } catch (error) {
            console.error('저장 실패:', error);
          }
        }

        processedUrls.add(currentUrl);
        setUrlHistory(currentData);
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
