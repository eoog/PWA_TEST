const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// 이전 컨텐츠를 저장할 변수
let previousContent = '';

// 컨텐츠 변경 감지 함수
function detectContentChanges() {
    const currentContent = document.body.innerText;

    if (currentContent !== previousContent) {
        previousContent = currentContent;

        // PWA로 변경된 컨텐츠 전송
        window.postMessage({
            type: "CONTENT_CHANGED",
            source: EXTENSION_IDENTIFIER,
            data: {
                url: window.location.href,
                title: document.title,
                content: currentContent
            }
        }, "*");
    }
}

// DOM 변경 감지를 위한 MutationObserver 설정
const observer = new MutationObserver(() => {
    detectContentChanges();
});

// Observer 시작
observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

// 기존 이벤트 리스너
window.addEventListener("message", (event) => {
    if (event.data.type === "REQUEST_URLS_AND_CONTENT" &&
        event.data.identifier === EXTENSION_IDENTIFIER) {
        chrome.runtime.sendMessage({ type: "REQUEST_TABS_DATA" });
    }

    if (event.data.type === "SHARE" &&
        event.data.identifier === EXTENSION_IDENTIFIER) {
        chrome.runtime.sendMessage({ action: "minimize_window" });
    }

    if (event.data.type === "HHH" &&
        event.data.identifier === EXTENSION_IDENTIFIER) {
        chrome.runtime.sendMessage({ type: "HHH" });
    }
});

// window.addEventListener("message1", (event) => {
//
//     if (event.data.type === "HHH" &&
//         event.data.identifier === EXTENSION_IDENTIFIER) {
//         chrome.runtime.sendMessage({ type: "HHH" });
//         console.log("여기 진입")
//     }
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TABS_DATA_RESPONSE" &&
        message.source === EXTENSION_IDENTIFIER) {
        window.postMessage({
            type: "URLS_AND_CONTENT_FROM_EXTENSION",
            source: EXTENSION_IDENTIFIER,
            data: message.data
        }, "*");
    }

    if (message.type === "HHH" &&
        message.source === EXTENSION_IDENTIFIER) {
        console.log("ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ====",message)
        window.postMessage({
            type: "HHH",
            source: EXTENSION_IDENTIFIER,
            data: message
        }, "*");
    }
});

// chrome.runtime.onMessage.addListener((message1, sender, sendResponse) => {
//
//     if (message.type === "HHH" &&
//         message.source === EXTENSION_IDENTIFIER) {
//         console.log("ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ====",message1)
//         window.postMessage({
//             type: "HHH",
//             source: EXTENSION_IDENTIFIER,
//             data: message
//         }, "*");
//     }
// });