import React, { useEffect } from 'react';
import './App.css';
import { Box } from '@mui/material';
import { Route, Routes, useLocation } from "react-router-dom";
import { ExtensionProvider } from './contexts/ExtensionContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import MenuSidebar from "./menuSidebar";
import Dashboard from "./view/Dashboard";
import ImageBoard from "./view/ImageList";
import InstallGuide from "./view/installGuide";
import DemoInstallGuide from "./view/DemoInstallGuide";
import TextView from "./view/TextView";

async function requestNotificationPermission() {
  try {
    // 브라우저가 알림을 지원하는지 확인
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    } else {
      console.log('Notification permission denied.');
      // 한 번 더 권한 요청
      await Notification.requestPermission();
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

function App() {
  const location = useLocation();

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
      <ExtensionProvider>
        <Box sx={{
          display: 'flex',
          height: '100vh'
        }}>
          <MenuSidebar />
          <Routes>
            <Route path="/demo-install-guide" element={<DemoInstallGuide />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/board" element={
              <ProtectedRoute>
                <ImageBoard />
              </ProtectedRoute>
            } />
            <Route path="/text" element={
              <ProtectedRoute>
                <TextView />
              </ProtectedRoute>
            } />
          </Routes>
        </Box>
      </ExtensionProvider>
  );
}

export default App;