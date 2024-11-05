const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// PWA로부터의 메시지 수신
window.addEventListener("message", (event) => {
  // PWA로부터의 메시지 확인
  if (event.data.type === "REQUEST_URLS_AND_CONTENT" && 
      event.data.identifier === EXTENSION_IDENTIFIER) {
    
    // background script에 데이터 요청
    chrome.runtime.sendMessage({ type: "REQUEST_TABS_DATA" });
  }

  // 화면 공유하기 연결시 브라우저 최소화..
  if (event.data.type === "SHARE" &&
      event.data.identifier === EXTENSION_IDENTIFIER) {

    chrome.runtime.sendMessage({ action: "minimize_window" });
      console.log("안녕")
  }
});

// background script로부터의 메시지 수신
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TABS_DATA_RESPONSE" && 
      message.source === EXTENSION_IDENTIFIER) {
    
    // PWA로 데이터 전송
    window.postMessage({
      type: "URLS_AND_CONTENT_FROM_EXTENSION",
      source: EXTENSION_IDENTIFIER,
      data: message.data
    }, "*");
  }
});

// // DOM 변화 감지
// const observer = new MutationObserver(() => {
//   // 탭의 변화된 내용을 감지하고 background script에 요청
//   console.log("변화 감지!");
//   chrome.runtime.sendMessage({ type: "REQUEST_TABS_DATA" });
// });
//
// // body 태그의 변화를 감지
// observer.observe(document.body, { childList: true, subtree: true, characterData: true });

// DOM 변화 감지
const observer = new MutationObserver((mutationsList) => {
  // 변화가 감지되었을 때 처리
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {

      // 백그라운드 스크립트에 데이터 요청
      chrome.runtime.sendMessage({ type: "REQUEST_TABS_DATA" });
    }
  });
});

// body 태그의 변화를 감지
observer.observe(document.body, {
  childList: true,  // 자식 요소의 추가/제거 감지
  subtree: true,    // 하위 요소도 감지
  characterData: true // 텍스트 노드의 변화 감지
});