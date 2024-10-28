import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkExtensionInstalled } from "./extensionCheck";
import TextView from "../view/TextView";

const TextViewWrapper = () => {
    const [isExtensionInstalled, setIsExtensionInstalled] = useState(null);

    useEffect(() => {
        const checkExtension = async () => {
            const installed = await checkExtensionInstalled();
            setIsExtensionInstalled(installed);
        };

        checkExtension();
    }, []);

    if (isExtensionInstalled === null) {
        return (
            <div className="flex-1 h-full w-full flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (!isExtensionInstalled) {
        console.log('확장프로그램 설치 안되어 있음');
        return <Navigate to="/install-guide" replace />;
    }
    console.log('확장프로그램 설치 되어 있음');
    return <TextView />;
};

export default TextViewWrapper;