export const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';
/**
 * 확장 프로그램이 설치되어 있는지 확인합니다.
 * */
export const checkExtensionInstalled = () => {
    return new Promise((resolve) => {
        // Extension이 설치되어 있는지 확인하기 위한 메시지 전송
        window.postMessage({
            type: "REQUEST_URLS_AND_CONTENT",
            identifier: EXTENSION_IDENTIFIER
        }, "*");

        // 응답 대기를 위한 타임아웃 설정 (1초)
        const timeoutId = setTimeout(() => {
            resolve(false);
        }, 1000);

        // 확장프로그램으로부터의 응답 리스너
        const messageListener = (event) => {
            if (event.data.type === "URLS_AND_CONTENT_FROM_EXTENSION" &&
                event.data.source === EXTENSION_IDENTIFIER) {
                clearTimeout(timeoutId);
                window.removeEventListener("message", messageListener);
                resolve(true);
            }
        };

        window.addEventListener("message", messageListener);
    });
};