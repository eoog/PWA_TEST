import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { useNavigate } from 'react-router-dom';
import { checkExtensionInstalled } from "./extensionCheck";
import ExtensionSettingsButton from "./ExtensionSettingsButton";
// 이미지 import
import processImage1 from '../images/demo-process1.png';
import processImage2 from '../images/demo-process2.png';
import processImage3 from '../images/demo-process3.png';
import processImage4 from '../images/demo-process4.png';
import processImage5 from '../images/demo-process5.png';

// 확장 프로그램 관련 상수
const EXTENSION_CONFIG = {
    DOWNLOAD_PATH: '/extensions/extension-demo.zip',
    VERSION: '1.0.0',
    FILENAME: 'URL_Content_Tracker_Demo.zip'
};

const DemoInstallGuide = () => {
    const navigate = useNavigate();
    const [isInstalled, setIsInstalled] = useState(false);
    const [downloadError, setDownloadError] = useState(null);

    const installSteps = [
        {
            title: "확장 프로그램 다운로드",
            description: "1. 아래 [확장 프로그램 다운로드] 버튼을 클릭하여 압축된 확장 프로그램 파일을 다운로드합니다." +
                "2. 다운로드된 파일의 압축을 해제해주세요.",
            imageSrc: processImage1,
            imageAlt: "확장 프로그램 다운로드",
            note: "압축을 해제한 파일은 관리하기 편한 위치에 옮겨주세요."
        },
        {
            title: "Chrome 확장 프로그램 설정 열기",
            description: "다음 두 방법 중 하나를 선택해 확장 프로그램 설정을 여세요. " +
                "1. Chrome 브라우저 주소창에 'chrome://extensions'를 입력하세요." +
                "2. Chrome 메뉴 → 도구 더보기 → 확장 프로그램 → 확장 프로그램 관리를 선택하세요.",
            imageSrc: processImage2,
            imageAlt: "확장 프로그램 설정 열기",
            note: "또는 브라우저 우측 상단의 퍼즐 모양 아이콘을 클릭하고 '확장 프로그램 관리'를 선택하세요."
        },
        {
            title: "개발자 모드 활성화",
            description: "확장 프로그램 페이지의 우측 상단에 있는 '개발자 모드' 토글을 켭니다." +
                "개발자 모드를 활성화하면 압축해제된 확장 프로그램을 설치할 수 있습니다.",
            imageSrc: processImage3,
            imageAlt: "개발자 모드 활성화",
            note: ""
        },
        {
            title: "확장 프로그램 로드",
            description: "'압축해제된 확장 프로그램을 로드합니다' 버튼을 클릭하고, 다운로드 받은 확장 프로그램 폴더를 선택합니다.",
            imageSrc: processImage4,
            imageAlt: "확장 프로그램 로드",
            note: "설치가 완료되면 확장 프로그램 목록에 'URL Content Tracker'가 표시됩니다."
        },
        {
            title: "설치 완료 확인",
            description: "설치가 완료되면 확장 프로그램 목록에 'URL Content Tracker'가 표시됩니다." +
                "이제 프로그램을 사용할 수 있습니다.",
            imageSrc: processImage5,
            imageAlt: "확장 프로그램 설치 완료",
        }
    ];

    // 다운로드 핸들러
    const handleDownload = async () => {
        try {
            const response = await fetch(EXTENSION_CONFIG.DOWNLOAD_PATH);
            if (!response.ok) throw new Error('다운로드에 실패했습니다.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = EXTENSION_CONFIG.FILENAME;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            setDownloadError(error.message);
        }
    };

    // // 설치 확인 로직
    // useEffect(() => {
    //     const checkInterval = setInterval(async () => {
    //         console.log('Checking extension installed...');
    //         const installed = await checkExtensionInstalled();
    //         if (installed) {
    //             setIsInstalled(true);
    //             clearInterval(checkInterval);
    //             setTimeout(() => navigate('/text'), 1500);
    //         }
    //     }, 2000);
    //
    //     return () => clearInterval(checkInterval);
    // }, [navigate]);

    useEffect(() => {
        const checkInterval = setInterval(async () => {
            try {
                const installed = await checkExtensionInstalled();
                console.log('Extension installation check:', installed);

                if (installed) {
                    setIsInstalled(true);
                    clearInterval(checkInterval);
                    // 설치 확인 후 대시보드로 이동
                    setTimeout(() => {
                        console.log('Redirecting to dashboard...');
                        navigate('/dashboard');
                    }, 1500);
                }
            } catch (error) {
                console.error('Extension check error:', error);
            }
        }, 2000); // 2초마다 확인

        // 컴포넌트 언마운트시 인터벌 정리
        return () => {
            console.log('Cleaning up interval');
            clearInterval(checkInterval);
        };
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
                                {isInstalled && (
                                    <div className="text-green-600 font-semibold mt-4 flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M5 13l4 4L19 7"/>
                                        </svg>
                                        확장 프로그램이 설치되었습니다! 잠시 후 대시보드로 이동됩니다...
                                    </div>
                                )}
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    개발자 모드를 사용하여 데모 버전 확장 프로그램을 설치합니다. <br/>
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
                                                    <div
                                                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
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
                                            {step.note ?
                                                <div className="ml-14 p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-blue-800 text-sm">
                                                        💡 {step.note}
                                                    </p>
                                                </div>
                                                : null
                                            }
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
                                <div className="flex flex-col items-center gap-4">
                                    <button
                                        onClick={handleDownload}
                                        className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg"
                                    >
                                        확장 프로그램 다운로드 (v{EXTENSION_CONFIG.VERSION})
                                    </button>

                                    {downloadError && (
                                        <p className="text-red-500 text-sm mt-2">
                                            {downloadError}
                                        </p>
                                    )}
                                </div>

                                {isInstalled && (
                                    <div className="text-green-600 font-semibold mt-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M5 13l4 4L19 7"/>
                                        </svg>
                                        확장 프로그램이 설치되었습니다! 잠시 후 자동으로 이동됩니다...
                                    </div>
                                )}

                                <div className="text-sm text-gray-500 space-y-2">
                                    <p>
                                        ⚠️ 주의: 개발자 모드 설치는 데모 버전에만 해당됩니다.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DemoInstallGuide;