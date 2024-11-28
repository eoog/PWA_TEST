import React, {useContext, useEffect} from 'react';
import './App.css';
import {Box}                          from '@mui/material';
import {Route, Routes, useLocation}   from "react-router-dom";
import Dashboard                      from "./view/Dashboard";
import ImageBoard                     from "./view/ImageBoard";
import TextDetectView                 from "./view/TextdetectResult";
import ScreenShareContext             from "./contexts/ScreenShareContext";
import SidebarMenu                    from "./components/sidebar/SidebarMenu";

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
  const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

  const {stream, videoRef, startScreenShare} = useContext(ScreenShareContext);

  // 데이터 요청 함수
  const requestShareAndContent = () => {
    window.postMessage({
      type: "SHARE",
      source: "SHARE",
      identifier: EXTENSION_IDENTIFIER
    }, "*")
  };
  const location = useLocation();

  useEffect(() => {
    requestNotificationPermission().then(value => () => {
      console.log("성공")
      requestShareAndContent()
    }).catch(
        requestNotificationPermission()
    )

  }, []);

  return (
      <Box sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <SidebarMenu/>
        <Routes>
          <Route path="/text-result" element={<TextDetectView/>}/>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/board" element={<ImageBoard/>}/>
          />
        </Routes>
      </Box>
  );
}

export default App;