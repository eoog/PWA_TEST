import React, { useState } from 'react';

const ExtensionSettingsButton = () => {
    const [showCopied, setShowCopied] = useState(false);
    const extensionUrl = 'chrome://extensions';

    const handleCopyClick = () => {
        navigator.clipboard.writeText(extensionUrl).then(() => {
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        });
    };

    return (
        <div className="flex flex-col items-center gap-2 mt-4">
            <button
                onClick={handleCopyClick}
                className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
                {showCopied ? '주소가 복사되었습니다!' : '확장 프로그램 설정 주소 복사'}
            </button>
            <div className="text-sm text-gray-600">
                <p>1. 위 버튼을 클릭하여 주소를 복사하세요</p>
                <p>2. 새 탭을 열고 주소창에 붙여넣기 하세요</p>
                <p>3. Enter를 눌러 확장 프로그램 설정으로 이동하세요</p>
            </div>
        </div>
    );
};

export default ExtensionSettingsButton;