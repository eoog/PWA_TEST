import { Navigate } from 'react-router-dom';
import { useExtension } from '../../contexts/ExtensionContext';

export const ProtectedRoute = ({ children }) => {
    const { isExtensionInstalled, isChecking } = useExtension();

    if (isChecking) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent">
                </div>
            </div>
        );
    }

    if (!isExtensionInstalled) {
        return <Navigate to="/demo-install-guide" replace />;
    }

    return children;
};