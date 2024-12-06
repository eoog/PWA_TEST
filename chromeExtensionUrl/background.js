const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// 탭에서 컨텐츠와 스크린샷을 추출하는 함수
async function getTabContentAndScreenshot(tab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: () => document.body.innerText
    });
    
    const screenshot = await chrome.tabs.captureVisibleTab(null, {
      format: 'jpeg',
      quality: 50
    });

    return {
      content: results[0]?.result || '내용을 가져올 수 없습니다',
      screenshot: screenshot
    };
  } catch (error) {
    console.error('탭 내용 가져오기 오류:', error);
    return {
      content: '내용을 가져올 수 없습니다',
      screenshot: null
    };
  }
}

async function collectTabsData() {
  try {
    const tabs = await chrome.tabs.query({active: true});
    const tabsData = [];

    for (const tab of tabs) {
      const { content, screenshot } = await getTabContentAndScreenshot(tab);
      tabsData.push({
        url: tab.url,
        title: tab.title,
        content: content,
        screenshot: screenshot
      });
    }

    return tabsData;
  } catch (error) {
    console.error('탭 데이터 수집 실패:', error);
    return [];
  }
}

async function HHHURL(tab) {
  try {
    const { content, screenshot } = await getTabContentAndScreenshot(tab);
    return [{
      url: tab.url,
      title: tab.title,
      content: content,
      screenshot: screenshot
    }];
  } catch (error) {
    console.error('탭 데이터 수집 실패:', error);
    return [];
  }
}

async function HHHH() {
  try {
    const [allWindows, currentWindow] = await Promise.all([
      chrome.windows.getAll({populate: true}),
      chrome.windows.getCurrent()
    ]);

    return allWindows
      .filter(window => window.id === currentWindow.id)
      .flatMap(window => window.tabs.filter(tab => tab.active))
      .map(tab => ({ tab }));
  } catch (error) {
    console.error('탭 데이터 수집 실패:', error);
    return [];
  }
}

// 탭 업데이트 리스너
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    (async () => {
      try {
        const tabsData = await collectTabsData();
        await chrome.tabs.sendMessage(tabId, {
          type: "TABS_DATA_RESPONSE",
          source: EXTENSION_IDENTIFIER,
          data: tabsData
        });

        const hhhData = await HHHH();
        if (hhhData.length > 0) {
          const result = await HHHURL(hhhData[0].tab);
          await chrome.tabs.sendMessage(tabId, {
            type: "HHH",
            source: EXTENSION_IDENTIFIER,
            data: result
          });
        }
      } catch (error) {
        console.error('탭 업데이트 처리 중 오류:', error);
      }
    })();
  }
});

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.type === "REQUEST_TABS_DATA") {
        const tabsData = await collectTabsData();
        await chrome.tabs.sendMessage(sender.tab.id, {
          type: "TABS_DATA_RESPONSE",
          source: EXTENSION_IDENTIFIER,
          data: tabsData
        });
      }

       if (request.action === "minimize_window") {
        const window = await chrome.windows.getCurrent();
        await chrome.windows.update(window.id, {state: 'minimized'});
      }



      if (request.type === "HHH") {
        const hhhData = await HHHH();
        if (hhhData.length > 0) {
          const result = await HHHURL(hhhData[0].tab);
          await chrome.tabs.sendMessage(sender.tab.id, {
            type: "HHH",
            source: EXTENSION_IDENTIFIER,
            data: result
          });
        }
      }

      if (request.action === "close_tab") {
        const tabs = await chrome.tabs.query({});
        const targetTab = tabs.find(tab => tab.url === request.url);
        if (targetTab) {
          await chrome.tabs.remove(targetTab.id);
        }
      }

    } catch (error) {
      console.error('메시지 처리 중 오류:', error);
    }
  })();

  // 비동기 응답을 사용하지 않으므로 false 반환
  return false;
});
