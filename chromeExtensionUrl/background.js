const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';
let unblockTimer = null;
const PASSWORD = 1234;

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
      const {content, screenshot} = await getTabContentAndScreenshot(tab);
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
    const {content, screenshot} = await getTabContentAndScreenshot(tab);
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
    .map(tab => ({tab}));
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

async function unblockCurrentSite(targetUrl) {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log('Current rules:', rules);

    // URL 디코딩 및 정규화
    const decodedUrl = decodeURIComponent(targetUrl).toLowerCase();
    console.log('Trying to unblock:', decodedUrl);

    // 특정 URL에 해당하는 규칙만 찾아서 제거
    const ruleToRemove = rules.find(rule => {
      if (rule.condition.urlFilter) {
        const ruleUrl = decodeURIComponent(
            rule.condition.urlFilter).toLowerCase();
        return ruleUrl === decodedUrl || decodedUrl.includes(ruleUrl);
      }
      return false;
    });

    if (ruleToRemove) {
      // 해당 규칙만 제거
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleToRemove.id]
      });
      console.log('Specific rule removed for:', decodedUrl);
      return true;
    }

    console.log('No matching rule found for:', decodedUrl);
    return false;
  } catch (error) {
    console.error('Unblock error:', error);
    return false;
  }
}

async function updateBlockedSites(blockedSites, unblockAfter = 0) {
  try {
    // 기존 규칙 가져오기
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(rule => rule.id);

    // 새 규칙 ID는 기존 ID의 최대값 + 1부터 시작
    let nextId = Math.max(0, ...existingIds) + 1;

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [], // 기존 규칙은 유지
      addRules: blockedSites.map((site) => ({
        id: nextId++,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            url: chrome.runtime.getURL("/blocked.html") + "?uri="
                + encodeURIComponent(site)
          }
        },
        condition: {
          urlFilter: site,
          resourceTypes: ['main_frame']
        }
      }))
    });

    if (unblockAfter > 0) {
      if (unblockTimer) {
        clearTimeout(unblockTimer);
      }

      unblockTimer = setTimeout(async () => {
        // 해당 URL만 해제
        await unblockCurrentSite(blockedSites[0]);
      }, unblockAfter * 1000);

      return true;
    }

    return blockedSites.length > 0;
  } catch (error) {
    console.error('Error updating blocked sites:', error);
    return false;
  }
}

function decodeUrl(url) {
  try {
    return decodeURIComponent(decodeURIComponent(url)); // 두 번 디코딩
  } catch (e) {
    console.error('URL 디코딩 오류:', e);
    return url;
  }
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let success;
  (async () => {
    try {

      if (request.type === "checkPassword") {
        try {
          console.log('Password check:', request.password, PASSWORD);
          const isValid = request.password.toString() === PASSWORD.toString();

          if (isValid) {
            const currentUrl = sender.tab.url;
            const params = new URLSearchParams(new URL(currentUrl).search);
            const targetUrl = params.get('uri');

            console.log('Target URL to unblock:', targetUrl);

            if (targetUrl) {
              const unblocked = await unblockCurrentSite(targetUrl);
              if (unblocked) {
                setTimeout(async () => {
                  try {
                    await chrome.tabs.update(sender.tab.id, {
                      url: decodeURIComponent(targetUrl)
                    });
                    sendResponse({success: true});
                  } catch (err) {
                    console.error('Navigation error:', err);
                    sendResponse({success: false, error: 'Navigation failed'});
                  }
                }, 100); // 약간의 지연을 추가
              } else {
                sendResponse({success: false, error: 'Unblock failed'});
              }
            } else {
              sendResponse({success: false, error: 'URL parameter not found'});
            }
          } else {
            sendResponse({success: false, error: 'Invalid password'});
          }
        } catch (error) {
          console.error('Password check error:', error);
          sendResponse({success: false, error: error.message});
        }
        return true;
      }

      if (request.type === "block") {
        console.log(request)
        success = await updateBlockedSites([request.data],
            request.duration || 0);
        await chrome.tabs.sendMessage(sender.tab.id, {
          type: "block",
          source: EXTENSION_IDENTIFIER,
          data: success
        });
      }
      if (request.type === "unblock") {
        try {
          await updateBlockedSites([]);
          if (unblockTimer) {
            clearTimeout(unblockTimer);
          }
          sendResponse({success: true});
        } catch (error) {
          console.error('Error in unblock handler:', error);
          sendResponse({success: false, error: error.message});
        }
      }

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
    } catch (error) {
      console.error('메시지 처리 중 오류:', error);
    }
  })();

  // 비동기 응답을 사용하지 않으므로 false 반환
  return false;
});