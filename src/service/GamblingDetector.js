// services/GamblingDetector.js
export class GamblingDetector {
  constructor() {
    this.cutline = 100;
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

    this.urlBlacklist = ["www.bwzx", "www.bet16", "1bet1.bet", "10x10v2a.com"];
    this.urlWhitelist = [
      "naver.com", "daum.net", "coupang.com", "ticketmonster.co.kr",
      "baedalMinjok.com", "gmarket.co.kr", "auction.co.kr", "nate.com",
      // ... 나머지 whitelist
    ];
  }

  gamble(content, url) {
    const [gambleScore, gambleWords] = this.score(
        content.trim().toLowerCase().replace(/\s+/g, ''));
    const gambleWeight = this.weight(url);

    return {
      result: this.determineResult(gambleScore, gambleWeight),
      score: gambleScore,
      weight: gambleWeight,
      word_list: gambleWords
    };
  }

  score(content) {
    const gambleWords = [];
    let totalScore = 0;

    // A 그룹 단어 체크
    const aScore = this.checkWordGroup(content, this.wordGroupA,
        this.wordGroupAScore);
    totalScore += aScore.score;
    gambleWords.push(...aScore.words);

    // B 그룹 단어 체크
    const bScore = this.checkWordGroup(content, this.wordGroupB,
        this.wordGroupBScore);
    totalScore += bScore.score;
    gambleWords.push(...bScore.words);

    // C 그룹 단어 체크
    const cScore = this.checkWordGroup(content, this.wordGroupC,
        this.wordGroupCScore);
    totalScore += cScore.score;
    gambleWords.push(...cScore.words);

    return [totalScore, gambleWords];
  }

  checkWordGroup(content, wordGroup, scorePerWord) {
    let score = 0;
    const detectedWords = [];

    for (const word of wordGroup) {
      if (content.includes(word)) {
        score += scorePerWord;
        detectedWords.push(word);
      }
    }

    return {
      score,
      words: detectedWords
    };
  }

  weight(url) {
    if (this.urlBlacklist.some(blacklist => url.includes(blacklist))) {
      return 0.0;
    }
    if (this.urlWhitelist.some(whitelist => url.includes(whitelist))) {
      return 5.0;
    }
    return 1.0;
  }

  determineResult(score, weight) {
    if (weight === 0.0) {
      return "차단";
    }
    if (score >= this.cutline * weight) {
      return "도박";
    }
    return "통과";
  }
}