import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkExtensionInstalled } from '../components/extensionCheck';

const ExtensionContext = createContext(null);

export const ExtensionProvider = ({ children }) => {
    const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // 확장 프로그램 설치 상태 확인
    const checkExtension = async () => {
        try {
            setIsChecking(true);
            const installed = await checkExtensionInstalled();
            setIsExtensionInstalled(installed);

            // 설치되지 않았고, 현재 설치 가이드 페이지가 아니라면 리디렉션
            if (!installed && !location.pathname.includes('install-guide')) {
                // 알림 권한이 허용되어 있을 때만 알림 표시
                if(Notification.permission === 'granted') {
                    new Notification('확장 프로그램 알림', {
                        body: '확장 프로그램이 비활성화되었습니다. 서비스 이용을 위해 다시 설치해주세요.',
                    });
                }
                navigate('/demo-install-guide', { replace: true });
            }

            return installed;
        } catch (error) {
            console.error('Extension check error:', error);
            setIsExtensionInstalled(false);
            return false;
        } finally {
            setIsChecking(false);
        }
    };

    // location 변경 시 확장 프로그램 설치 확인
    useEffect(() => {
        checkExtension();
    }, [location.pathname]);

    // 초기 로드 시 한 번 확인
    useEffect(() => {
        checkExtension();
    }, []);

    const value = {
        isExtensionInstalled,
        isChecking,
        checkExtension
    };

    return (
        <ExtensionContext.Provider value={value}>
            {children}
        </ExtensionContext.Provider>
    );
};

export const useExtension = () => {
    const context = useContext(ExtensionContext);
    if (!context) {
        throw new Error('useExtension must be used within an ExtensionProvider');
    }
    return context;
};