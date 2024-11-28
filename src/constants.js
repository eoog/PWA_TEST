export const DB_CONFIG = {
  CANVAS_DB: "canvasImage",
  DETECTION_DB: "CanvasDB",
  STORE_NAME: "images",
  VERSION: 1,
  MAX_IMAGES: 1000
};

export const DB_CANVAS_DB_CONFIG = {
  name: "CanvasDB",
  version: 1,
  store: "images",
  refreshInterval: 5000
};

export const VIEW_MODES = {
  ALL: 'all',
  DETECTIONS: 'detections'
};

export const GAMBLING_KEYWORDS = [
  "첫충", "단폴", "다리다리", "매충", "꽁머니", "슈어맨",
  "다음드", "한폴낙", "두폴낙", "단폴", "프리벳", "카지노", "슬롯", "바카라", "블랙잭", "잭팟", "포커",
  "섯다", "화투", "홀덤", "배팅", "베팅", "토토",
  "라이브카지노", "입금보너스", "멀티베팅", "승자예상", "이벤트", "사다리", "스포츠", "충전", "지급", "도박",
  "포인트", "입출금", "게임", "토큰", "인플레이", "토너먼트",
  "캐시", "적중", "텔레그램", "복권", "레이싱", "입출금",
  "가상화폐", "폴더", "페이벡", "환전", "추천인", "배당",
  "배당율", "미성년자", "가입", "청소년"
];

export const DETECTION_SETTINGS = {
  MAX_PERCENT: 95,
  MIN_PERCENT: 20,
  MULTIPLIER: 500
};

export const CAPTURE_CONFIG = {
  EXTENSION_IDENTIFIER: 'URL_HISTORY_TRACKER_f7e8d9c6b5a4',
  DEFAULT_INTERVAL: 5000,
  IMAGE_FORMAT: 'image/jpg',
  FILE_NAME: 'screenshot.png'
};

export const CONFIG = {
  MODEL: {
    PATH: "nude.onnx",
    INPUT_SIZE: 320,
    NUM_BOXES: 2100,
    CONF_THRESHOLD: 0.3,
    IOU_THRESHOLD: 0.7
  },
  NOTIFICATION: {
    ALERT_COOLDOWN: 6000
  },
  DATABASE: {
    VERSION: 1
  }
};

export const DETECTION_CLASSES = [
  '여성 생식기 가리기', '여성 얼굴', '둔부 노출', '여성 유방 노출',
  '여성 생식기 노출', '남성 유방 노출', '항문 노출', '발 노출',
  '배 가리기', '발 가리기', '겨드랑이 가리기', '겨드랑이 노출',
  '남성 얼굴', '배 노출', '남성 생식기 노출', '항문 가리기',
  '여성 유방 가리기', '둔부 가리기'
];