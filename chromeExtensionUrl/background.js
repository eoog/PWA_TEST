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

// URL 패턴에 해당하는 탭을 새 윈도우로 이동
async function moveTabsByUrls(urlPatterns) {
    try {
        console.log('urlPatterns:', urlPatterns);
        // urlPatterns 검증
        if (!Array.isArray(urlPatterns) || urlPatterns.length === 0) {
            throw new Error("urlPatterns는 배열이어야 하며, 최소 하나의 값이 필요합니다.");
        }

        // 현재 모든 윈도우의 탭 조회
        const allTabs = await chrome.tabs.query({});

        // URL 패턴에 매칭되는 탭 필터링
        const tabsToMove = allTabs.filter(tab =>
            urlPatterns.some(pattern => tab.url.includes(pattern))
        );

        if (tabsToMove.length === 0) {
            console.log("URL 패턴과 매칭되는 탭이 없습니다.");
            return {
                success: false,
                message: "No tabs match the provided URL patterns."
            };
        }

        // 새로운 윈도우 생성
        const newWindow = await chrome.windows.create({
            state: "minimized", // 창을 최소화 상태로 생성
            tabId: tabsToMove[0].id // 첫 번째 탭 추가
        });

        // 나머지 탭을 새 창으로 이동
        const remainingTabs = tabsToMove.slice(1); // 첫 번째 탭 제외
        for (const tab of remainingTabs) {
            await chrome.tabs.move(tab.id, {windowId: newWindow.id, index: -1});
        }

        console.log(`${tabsToMove.length}개의 탭이 새 창으로 이동되었습니다.`);
        return {
            success: true,
            windowId: newWindow.id,
            movedTabs: tabsToMove.length
        };
    } catch (error) {
        console.error("탭 이동 중 오류 발생:", error);
        return {
            success: false,
            message: error.message
        };
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
            // active 상태의 탭 데이터 요청
            if (request.type === "REQUEST_TABS_DATA") {
                const tabsData = await collectTabsData();
                await chrome.tabs.sendMessage(sender.tab.id, {
                    type: "TABS_DATA_RESPONSE",
                    source: EXTENSION_IDENTIFIER,
                    data: tabsData
                });
            }

            // 창 최소화
            if (request.action === "minimize_window") {
                const window = await chrome.windows.getCurrent();
                await chrome.windows.update(window.id, {state: 'minimized'});
            }

            // 현재 탭 데이터 요청
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

            // URL 패턴에 해당하는 탭을 새 윈도우로 이동
            if (request.type === "MOVE_TABS_BY_URLS") {
                const result = await moveTabsByUrls(request.urls);
                await chrome.runtime.sendMessage({
                    type: "RESPONSE_MOVE_TABS_BY_URLS",
                    data: result
                });
            }

        } catch (error) {
            console.error('메시지 처리 중 오류:', error);
        }
    })();

    // 비동기 응답을 사용하지 않으므로 false 반환
    return false;
});
