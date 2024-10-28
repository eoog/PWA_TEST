import React from 'react';
import {Card} from "../components/ui/card";

const InstallGuide = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
            <Card className="max-w-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">확장 프로그램 설치가 필요합니다</h2>
                <p className="mb-4">
                    이 기능을 사용하기 위해서는 Chrome 확장 프로그램 설치가 필요합니다.
                </p>
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">설치 방법:</h3>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Chrome 웹 스토어에서 "URL Content Tracker" 검색</li>
                        <li>확장 프로그램 페이지에서 "Chrome에 추가" 버튼 클릭</li>
                        <li>설치 완료 후 페이지 새로고침</li>
                    </ol>
                    <a
                        href="[크롬 웹스토어 URL]"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Chrome 웹 스토어로 이동
                    </a>
                </div>
            </Card>
        </div>
    );
};

export default InstallGuide;