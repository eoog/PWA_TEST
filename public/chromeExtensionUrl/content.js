const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// PWA로부터의 메시지 수신
window.addEventListener("message", (event) => {
  // PWA로부터의 메시지 확인
  if (event.data.type === "REQUEST_URLS_AND_CONTENT" && 
      event.data.identifier === EXTENSION_IDENTIFIER) {
    
    // background script에 데이터 요청
    chrome.runtime.sendMessage({ type: "REQUEST_TABS_DATA" });
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

// DOM 변화 감지
const observer = new MutationObserver(() => {
  // 탭의 변화된 내용을 감지하고 background script에 요청
  console.log("변화 감지!");
  chrome.runtime.sendMessage({ type: "REQUEST_TABS_DATA" });
});

// body 태그의 변화를 감지
observer.observe(document.body, { childList: true, subtree: true, characterData: true });