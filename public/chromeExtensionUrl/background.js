const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// 탭 컨텐츠 가져오기
async function getTabContent(tab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const text = document.body.innerText;
        return text
      }
    });
    return results[0]?.result || '내용을 가져올 수 없습니다';
  } catch (error) {
    console.error('탭 내용 가져오기 오류:', error);
    return '내용을 가져올 수 없습니다';
  }
}

// 활성화된 탭의 데이터 수집
async function collectTabsData() {
  try {
    const tabs = await chrome.tabs.query({active: true});
    const tabsData = [];
    
    for (const tab of tabs) {
      const content = await getTabContent(tab);
      tabsData.push({
        url: tab.url,
        title: tab.title,
        content: content
      });
    }
    
    return tabsData;
  } catch (error) {
    console.error('탭 데이터 수집 실패:', error);
    return [];
  }
}

// content script로부터의 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "REQUEST_TABS_DATA") {
    collectTabsData().then(tabsData => {
      // content script로 데이터 전송
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "TABS_DATA_RESPONSE",
        source: EXTENSION_IDENTIFIER,
        data: tabsData
      });
    });
  }
  return true;
});


// 화면 공유하기 완료시 브라우저창 최소화.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "minimize_window") {
    // 현재 창 가져오기
    chrome.windows.getCurrent((window) => {
      // 창 최소화
      chrome.windows.update(window.id, { state: 'minimized' });
    });

    console.log("브라우저 창이 최소화되었습니다.");
  }
});

