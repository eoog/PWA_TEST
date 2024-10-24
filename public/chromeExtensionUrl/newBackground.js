const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

async function getTabContent(tab) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => document.body.innerText
        });
        return results[0]?.result || '내용을 가져올 수 없습니다';
    } catch (error) {
        console.error('탭 내용 가져오기 오류:', error);
        return '내용을 가져올 수 없습니다';
    }
}

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

// 탭 변경 감지
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
});

// content script로부터의 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "REQUEST_TABS_DATA") {
        collectTabsData().then(tabsData => {
            chrome.tabs.sendMessage(sender.tab.id, {
                type: "TABS_DATA_RESPONSE",
                source: EXTENSION_IDENTIFIER,
                data: tabsData
            });
        });
    }

    if (request.action === "minimize_window") {
        chrome.windows.getCurrent((window) => {
            chrome.windows.update(window.id, { state: 'minimized' });
        });
    }

    return true;
});