import { Navigate } from 'react-router-dom';
import { useExtension } from '../contexts/ExtensionContext';

export const ProtectedRoute = ({ children }) => {
    const { isExtensionInstalled, isChecking } = useExtension();

    if (isChecking) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (!isExtensionInstalled) {
        return <Navigate to="/demo-install-guide" replace />;
    }

    return children;
};