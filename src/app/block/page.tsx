"use client"
import {useEffect, useState} from 'react';

const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

// Extension과 통신하는 함수
const sendMessageToExtension = (type: string, data?: any) => {
  window.postMessage({
    type: type,
    source: 'nextjs-app',
    identifier: EXTENSION_IDENTIFIER,
    data
  }, '*');
};

const SiteBlocker = () => {
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (!event.data || event.data.source !== EXTENSION_IDENTIFIER) return;

      if (event.data.type === "BLOCKED_SITES_UPDATE") {
        setBlockedSites(event.data.data || []);
      }
    };

    window.addEventListener('message', messageHandler);

    // 초기 차단된 사이트 목록 요청
    sendMessageToExtension('GET_BLOCKED_SITES');

    // 주기적으로 업데이트 요청
    const intervalId = setInterval(() => {
      sendMessageToExtension('GET_BLOCKED_SITES');
    }, 1000);

    return () => {
      window.removeEventListener('message', messageHandler);
      clearInterval(intervalId);
    };
  }, []);

  const handleAddSite = () => {
    if (!inputValue) return;

    try {
      let domain = inputValue;
      if (domain.startsWith('http://') || domain.startsWith('https://')) {
        domain = new URL(domain).hostname;
      }

      sendMessageToExtension('ADD_BLOCKED_SITE', {site: domain});
      setInputValue('');
    } catch (error) {
      alert('올바른 URL 형식이 아닙니다.');
    }
  };

  const handleRemoveSite = (site: string) => {
    sendMessageToExtension('REMOVE_BLOCKED_SITE', {site});
  };

  return (
      <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">사이트 차단 관리</h1>

        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSite()}
                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="차단할 사이트 입력 (예: youtube.com)"
            />
          </div>
          <button
              onClick={handleAddSite}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600
                   transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            차단 추가 (10초)
          </button>
        </div>

        <ul className="space-y-2">
          {blockedSites.map((site) => (
              <li key={site}
                  className="flex justify-between items-center border p-3 rounded hover:bg-gray-50">
                <span className="text-gray-700">{site}</span>
                <button
                    onClick={() => handleRemoveSite(site)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                >
                  삭제
                </button>
              </li>
          ))}
        </ul>
      </div>
  );
};

export default SiteBlocker;