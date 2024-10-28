import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { useNavigate } from 'react-router-dom';
import { checkExtensionInstalled } from "./extensionCheck";

const DemoInstallGuide = () => {
    const navigate = useNavigate();
    const [isInstalled, setIsInstalled] = useState(false);

    const installSteps = [
        {
            title: "1. 확장 프로그램 다운로드",
            description: "아래 버튼을 클릭하여 확장 프로그램 파일을 다운로드합니다.",
            imageSrc: "/api/placeholder/800/400",
            imageAlt: "확장 프로그램 다운로드",
            note: "다운로드된 파일의 압축을 해제하지 않고 그대로 보관해주세요."
        },
        {
            title: "2. Chrome 확장 프로그램 설정 열기",
            description: "Chrome 브라우저 주소창에 'chrome://extensions'를 입력하거나, Chrome 메뉴 → 도구 더보기 → 확장 프로그램을 선택합니다.",
            imageSrc: "/api/placeholder/800/400",
            imageAlt: "확장 프로그램 설정 열기",
            note: "또는 브라우저 우측 상단의 퍼즐 모양 아이콘을 클릭하고 '확장 프로그램 관리'를 선택하세요."
        },
        {
            title: "3. 개발자 모드 활성화",
            description: "확장 프로그램 페이지의 우측 상단에 있는 '개발자 모드' 토글을 켭니다.",
            imageSrc: "/api/placeholder/800/400",
            imageAlt: "개발자 모드 활성화",
            note: "개발자 모드를 활성화하면 압축해제된 확장 프로그램을 설치할 수 있습니다."
        },
        {
            title: "4. 확장 프로그램 로드",
            description: "'압축해제된 확장 프로그램을 로드합니다' 버튼을 클릭하고, 다운로드 받은 확장 프로그램 폴더를 선택합니다.",
            imageSrc: "/api/placeholder/800/400",
            imageAlt: "확장 프로그램 로드",
            note: "설치가 완료되면 확장 프로그램 목록에 'URL Content Tracker'가 표시됩니다."
        }
    ];

    // 주기적으로 확장 프로그램 설치 상태 확인
    useEffect(() => {
        const checkInterval = setInterval(async () => {
            const installed = await checkExtensionInstalled();
            if (installed) {
                setIsInstalled(true);
                clearInterval(checkInterval);
                navigate('/text-view');
            }
        }, 2000);

        return () => clearInterval(checkInterval);
    }, [navigate]);

    return (
        <div className="flex-1 overflow-hidden h-full">
            <div className="h-full overflow-auto p-4 md:p-8 bg-gray-50">
                <div className="mx-auto max-w-6xl">
                    <Card className="bg-white shadow-lg">
                        <CardHeader>
                            <div className="text-center space-y-4 pb-6 border-b">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    URL Content Tracker 데모 버전 설치 가이드
                                </h1>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    개발자 모드를 사용하여 데모 버전 확장 프로그램을 설치합니다.
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
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href="/extension-demo.zip" // 실제 확장 프로그램 파일 경로
                                        download
                                        className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg"
                                    >
                                        확장 프로그램 다운로드
                                    </a>
                                    <a
                                        href="chrome://extensions"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 text-lg"
                                    >
                                        확장 프로그램 설정 열기
                                    </a>
                                </div>
                                {isInstalled && (
                                    <div className="text-green-600 font-semibold mt-4">
                                        ✅ 확장 프로그램이 설치되었습니다! 잠시 후 자동으로 이동됩니다...
                                    </div>
                                )}
                                <p className="text-sm text-gray-500">
                                    설치가 완료되면 자동으로 텍스트 뷰 페이지로 이동됩니다
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DemoInstallGuide;