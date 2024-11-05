import {DETECTION_SETTINGS, GAMBLING_KEYWORDS} from "../constants/gamblingKeywords";

export const highlightGamblingContent = (text) => {
    if (!text) return { __html: '' };
    let processedText = text;
    GAMBLING_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        processedText = processedText.replace(
            regex,
            `<span style="color: red; font-weight: bold;">$&</span>`
        );
    });
    return { __html: processedText };
};

export const hasGamblingContent = (text) => {
    if (!text) return false;
    return GAMBLING_KEYWORDS.some(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
};

/**
 * 도박 관련 키워드 검출 및 퍼센트 계산 함수
 * */
export const calculateGamblingPercent = (content) => {
    if (!content) return 0;

    // 텍스트에서 도박 키워드 > detectedWords 배열에 저장
    const detectedWords = content.split(/\s+/).filter(word =>
        GAMBLING_KEYWORDS.some(keyword =>
            word.toLowerCase().includes(keyword.toLowerCase())
        )
    );

    // 전체 단어 수
    const totalWords = content.split(/\s+/).length;

    // 검출된 도박 키워드가 없으면 0 반환
    const basePercent = Math.min(
        (detectedWords.length / totalWords) * DETECTION_SETTINGS.MULTIPLIER,
        DETECTION_SETTINGS.MAX_PERCENT
    );

    return detectedWords.length > 0
        ? Math.max(Math.round(basePercent), DETECTION_SETTINGS.MIN_PERCENT)
        : 0;
};