import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { checkExtensionInstalled } from "../components/extensionCheck";
import Swal from "sweetalert2";

const EXTENSION_CONFIG = {
    DOWNLOAD_PATH: '/extensions/extension-demo.zip',
    VERSION: '1.0.0',
    FILENAME: 'URL_Content_Tracker_Demo.zip'
};

const DemoInstallGuide = () => {
    const navigate = useNavigate();
    const [downloadError, setDownloadError] = useState(null);

    // 이미지 import
    const processImage1 = require('../images/demo-process1.png');
    const processImage2 = require('../images/demo-process2.png');
    const processImage3 = require('../images/demo-process3.png');
    const processImage4 = require('../images/demo-process4.png');
    const processImage5 = require('../images/demo-process5.png');

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

    const handleInstallComplete = async () => {
        window.location.reload();
    };

    const checkInstalled = async () => {
        try {
            const installed = await checkExtensionInstalled();
            if (installed) {
                await Swal.fire({
                    title: '설치 완료!',
                    text: '확장 프로그램이 성공적으로 설치되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인'
                });
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Extension check error:', error);
        }
    }

    useEffect(() => {
        console.log('마운트 됨');
        checkInstalled();

    }, [navigate]);

    const installSteps = [
        {
            title: "확장 프로그램 다운로드",
            description: [
                "하단의 [확장 프로그램 다운로드] 버튼을 클릭해 압축된 확장 프로그램 파일을 다운로드 합니다.",
                "다운로드된 파일의 압축을 풀어주세요.",
                "압축을 해제한 파일은 관리하기 편한 위치에 옮겨주세요."
            ],
            image: processImage1,
            imageAlt: "확장 프로그램 다운로드",
            note: "문서 폴더나 바탕화면에 별도의 폴더를 만들어 저장하면 관리하기 편리합니다.",
            action: {
                text: `확장 프로그램 다운로드 (v${EXTENSION_CONFIG.VERSION})`,
                handler: handleDownload
            }
        },
        {
            title: "Chrome 확장 프로그램 설정 열기",
            description: [
                "Chrome 브라우저 주소창에 'chrome://extensions'를 입력하세요.",
                "Chrome 메뉴 → 도구 더보기 → 확장 프로그램 → 확장 프로그램 관리를 선택하세요."
            ],
            image: processImage2,
            imageAlt: "확장 프로그램 설정 열기",
            note: "브라우저 우측 상단의 퍼즐 모양 아이콘을 클릭하고 '확장 프로그램 관리'를 선택하세요."
        },
        {
            title: "개발자 모드 활성화",
            description: [
                "확장 프로그램 페이지의 우측 상단에 있는 '개발자 모드' 토글을 켭니다.",
                "개발자 모드를 활성화하면 압축해제된 확장 프로그램을 설치할 수 있습니다."
            ],
            image: processImage3,
            imageAlt: "개발자 모드 활성화"
        },
        {
            title: "확장 프로그램 로드",
            description: [
                "'압축해제된 확장 프로그램을 로드합니다' 버튼을 클릭한다.",
                "압축 해제한 확장 프로그램이 있는 경로로 이동해서 파일을 선택한다."
            ],
            image: processImage4,
            imageAlt: "확장 프로그램 로드",
            note: "경로에 확장 프로그램이 보이지 않는다면, 해당 경로가 맞는지, 확장 프로그램의 압축을 풀었는지 확인해주세요."
        },
        {
            title: "설치 완료 확인",
            description: [
                "설치가 완료되면 확장 프로그램 목록에 'URL Content Tracker'가 표시됩니다.",
                "이제 프로그램을 사용할 수 있습니다. 하단의 버튼을 눌러주세요."
            ],
            image: processImage5,
            imageAlt: "확장 프로그램 설치 완료",
            action: {
                text: "설치 완료",
                handler: handleInstallComplete
            }
        }
    ];

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
                                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-semibold text-gray-900">
                                                            {step.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="ml-14">
                                                    {step.description.map((desc, i) => (
                                                        <p key={i} className="text-gray-600 text-lg leading-relaxed">
                                                            {desc}
                                                        </p>
                                                    ))}
                                                    {step.action && (
                                                        <div className="flex justify-end mt-4">
                                                            <button
                                                                onClick={step.action.handler}
                                                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                                            >
                                                                {step.action.text}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {step.note && (
                                                <div className="ml-14 p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-blue-800 text-sm">
                                                        💡 {step.note}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="lg:pl-8">
                                            <img
                                                src={step.image}
                                                alt={step.imageAlt}
                                                className="rounded-lg shadow-md w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {downloadError && (
                                <div className="mt-6 text-center">
                                    <p className="text-red-500 text-sm">{downloadError}</p>
                                </div>
                            )}

                            <div className="mt-8 text-center text-sm text-gray-500">
                                <p>⚠️ 주의: 개발자 모드 설치는 데모 버전에만 해당됩니다.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DemoInstallGuide;