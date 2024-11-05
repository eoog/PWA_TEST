import {Card} from "../components/common/Card";
import React, {useContext, useEffect} from "react";
import {UrlHistoryContext} from "../contexts/UrlHistoryContext";
import ScreenShareContext from "../contexts/ScreenShareContext";


const TextView = () => {
  const urlHistory = useContext(UrlHistoryContext);
  const { stream, videoRef, startScreenShare } = useContext(ScreenShareContext);

  // 선정성
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // 도박성
  useEffect(() => {

    const url = urlHistory[0].url;
    const content = urlHistory[0].content;

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

    const detector = new GamblingDetector();
    const result = detector.gamble(content, url);
    console.log(result)

  }, [urlHistory]);


  return (
      <>
        <div className="min-h-screen bg-gray-100 p-8 w-full flex flex-col">
          <Card
              className="w-full mt-6 h-full"
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                overflow: 'hidden',
                margin: 'auto',
              }}
          >

            <ul>
              {urlHistory.map((item, index) => (
                  <li key={index} className="url-history-item">
                    <h4>{item.title || 'No Title'}</h4>
                    <p className="url-text">URL : {item.url}</p>
                    <details open={true}>
                      <summary className="details-summary">URL 텍스트 펼치기</summary>
                      <div className="content-container">
                        <p className="content-preview">
                          {item.content ? item.content + '@@@---끝---@@@@'
                              : 'No content available'}
                        </p>
                      </div>
                    </details>
                  </li>
              ))}
            </ul>

          </Card>
        </div>
        {/*선정성 비디오 삭제 금지*/}
        <video ref={videoRef} hidden={true} autoPlay playsInline
               style={{width: '10%', height: 'auto'}}/>
      </>
  )
}

export default TextView