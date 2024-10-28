const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// 탭에서 컨텐츠 추출하는 함수
async function getTabContent(tab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: () => document.body.innerText
    });
    return results[0]?.result || '내용을 가져올 수 없습니다';
  } catch (error) {
    console.error('탭 내용 가져오기 오류:', error);
    return '내용을 가져올 수 없습니다';
  }
}

// 활성화된 탭의 데이터 수집하는 함수
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

// 탭의 변경을 감지하고 데이터 전송
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    collectTabsData().then(tabsData => {
      chrome.tabs.sendMessage(tabId, {
        type: "TABS_DATA_RESPONSE",
        source: EXTENSION_IDENTIFIER,
        data: tabsData
      });
    });
  }

    HHHH().then(tabsData => {
      HHHURL(tabsData[0].tab).then(result => {
        chrome.tabs.sendMessage(tabId, {
          type: "HHH",
          source: EXTENSION_IDENTIFIER,
          data: result
        });
      })
    });

});

// content script로부터의 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 탭의 데이터 요청
  if (request.type === "REQUEST_TABS_DATA") {
    collectTabsData().then(tabsData => {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "TABS_DATA_RESPONSE",
        source: EXTENSION_IDENTIFIER,
        data: tabsData
      });
    });
  }
  // 화면 공유하기 연결시 브라우저 최소화
  if (request.action === "minimize_window") {
    chrome.windows.getCurrent((window) => {
      chrome.windows.update(window.id, {state: 'minimized'});
    });
  }

  if (request.type === "HHH") {
    HHHH().then(tabsData => {
      HHHURL(tabsData[0].tab).then(result => {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "HHH",
          source: EXTENSION_IDENTIFIER,
          data: result
        });
      })
    });
  }

  return true;
});

// 활성화된 탭의 데이터 수집하는 함수
async function HHHURL(tab) {
  try {

    const tabsData = [];

    const content = await getTabContent(tab);
    tabsData.push({
      url: tab.url,
      title: tab.title,
      content: content
    });

    return tabsData;
  } catch (error) {
    console.error('탭 데이터 수집 실패:', error);
    return [];
  }
}

async function HHHH() {
  try {
    const tabsData = [];

    // 모든 창을 가져오는 Promise 래퍼 함수
    const allWindows = await new Promise(
        (resolve) => chrome.windows.getAll({populate: true}, resolve));
    const currentWindow = await new Promise(
        (resolve) => chrome.windows.getCurrent(resolve));


    // 현재 창과 일치하는 창의 활성 탭만 필터링하여 저장
    allWindows.forEach(window => {
      if (window.id === currentWindow.id) {  // 현재 창과 ID가 같은 창 필터링
        window.tabs.forEach(tab => {
          if (tab.active) {
            tabsData.push({
              tab: tab
            });
          }
        });
      }
    });

    return tabsData;

  } catch (error) {
    console.error('탭 데이터 수집 실패:', error);
    return [];
  }
}