import React from 'react';
import { Card, CardHeader, CardContent } from "../components/ui/card";
import catImage1 from '../images/cat1.jpg';
import catImage2 from '../images/cat2.jpg';

const InstallGuide = () => {
    const installSteps = [
        {
            title: "Chrome 웹 스토어 방문",
            description: "Chrome 웹 스토어에서 'URL Content Tracker' 확장 프로그램을 검색합니다. 또는 아래 '설치하기' 버튼을 클릭하여 바로 이동할 수 있습니다.",
            imageSrc: catImage2,
            imageAlt: "Chrome 웹 스토어 접속 화면",
            note: "Chrome 웹 스토어는 Google에서 제공하는 공식 확장 프로그램 스토어입니다."
        },
        {
            title: "확장 프로그램 설치",
            description: "'Chrome에 추가' 버튼을 클릭하여 설치를 시작합니다. 설치 확인 팝업이 표시되면 '확장 프로그램 추가'를 클릭해주세요.",
            imageSrc: catImage1,
            imageAlt: "확장 프로그램 설치 버튼",
            note: "확장 프로그램은 무료이며, 언제든지 제거할 수 있습니다."
        },
        {
            title: "권한 확인",
            description: "확장 프로그램이 요청하는 권한을 확인하고 '허용'을 클릭합니다. 요청되는 권한은 텍스트 추적 기능을 위해 필요한 최소한의 권한입니다.",
            imageSrc: catImage2,
            imageAlt: "권한 확인 화면",
            note: "모든 권한은 텍스트 추적 기능을 위해 필수적인 것들만 포함됩니다."
        },
        {
            title: "설치 완료",
            description: "설치가 완료되면 Chrome 브라우저 우측 상단에 확장 프로그램 아이콘이 표시됩니다. 이제 텍스트 추적 기능을 사용할 수 있습니다.",
            imageSrc: catImage1,
            imageAlt: "설치 완료 화면",
            note: "아이콘을 클릭하여 확장 프로그램의 상태를 확인할 수 있습니다."
        }
    ];

    return (
        <div className="flex-1 overflow-hidden h-full"> {/* 컨테이너를 h-full로 설정 */}
            <div className="h-full overflow-auto p-4 md:p-8 bg-gray-50"> {/* 스크롤 가능한 영역 */}
                <div className="mx-auto max-w-6xl">
                    <Card className="bg-white shadow-lg">
                        <CardHeader>
                            <div className="text-center space-y-4 pb-6 border-b">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    URL Content Tracker 설치 가이드
                                </h1>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    텍스트 추적 기능을 사용하기 위해 Chrome 확장 프로그램 설치가 필요합니다.
                                    아래 가이드를 따라 단계별로 설치를 진행해주세요.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-8 space-y-12">
                                {installSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-12 border-b last:border-b-0 last:pb-0"
                                    >
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-semibold text-gray-900">
                                                            {step.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-lg leading-relaxed ml-14">
                                                    {step.description}
                                                </p>
                                            </div>
                                            <div className="ml-14 p-4 bg-blue-50 rounded-lg">
                                                <p className="text-blue-800 text-sm">
                                                    💡 {step.note}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="lg:pl-8">
                                            <img
                                                src={step.imageSrc}
                                                alt={step.imageAlt}
                                                className="rounded-lg shadow-md w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 flex flex-col items-center space-y-6 bg-gray-50 p-8 rounded-lg">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    지금 바로 설치하시겠습니까?
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href="[크롬 웹스토어 URL]"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg"
                                    >
                                        Chrome 웹 스토어에서 설치하기
                                    </a>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 text-lg"
                                    >
                                        이미 설치했어요
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    설치가 완료되면 페이지를 새로고침하거나 '이미 설치했어요' 버튼을 클릭해주세요
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InstallGuide;