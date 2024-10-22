import React, {useEffect, useState} from 'react';
import './App.css';
import YOLOv8ObjectDetection from "./YOLOv8ObjectDetection";
import ScreenCapture from './ScreenCapture';
import Example from "./sidebar"; // 사이드바 컴포넌트를 가져옵니다.
import { Box } from '@mui/material';
import ToastExample from "./toast"; // 레이아웃 구성을 위한 MUI Box 컴포넌트

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Notification permission granted.');
  } else {
    console.log('Notification permission denied.');
  }


}

function App() {
  const [capturedFile, setCapturedFile] = useState(null); // 캡처된 파일 상태

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered with scope:', registration.scope);

          // 서비스 워커에 메시지 보내기

            registration.active.postMessage({ type: 'BACKGROUND_SYNC' });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    }
    requestNotificationPermission()
  }, []);

  return (
      <Box sx={{ display: 'flex', height: '100vh' }}>  {/* 전체 화면을 수평으로 나누는 레이아웃 */}
        <Example />  {/* 사이드바 컴포넌트 */}

        {/* 사이드바 옆에 나머지 컴포넌트를 배치 */}
        <Box
            sx={{
              flexGrow: 1,
              padding: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },  // 작은 화면(xs)에서는 상하(column), 중간 이상(md)에서는 좌우(row)
            }}
        >

          {/* ScreenCapture와 YOLOv8ObjectDetection을 반반으로 나눔 */}
          <Box
              sx={{
                flex: 1,
                paddingRight: { xs: 0, md: 1 },  // 작은 화면에서는 패딩을 제거하고 중간 이상에서만 적용
                paddingBottom: { xs: 1, md: 0 }, // 작은 화면에서 하단 패딩 추가
                width: { xs: '100%', md: '50%' },  // 작은 화면에서는 100%, 큰 화면에서는 50%
              }}
          >
            <ScreenCapture setCapturedFile={setCapturedFile} />
          </Box>

          <Box
              sx={{
                flex: 1,
                paddingLeft: { xs: 0, md: 1 },  // 작은 화면에서는 패딩 제거, 중간 이상에서만 적용
                width: { xs: '100%', md: '50%' },  // 작은 화면에서는 100%, 큰 화면에서는 50%
              }}
          >
            <YOLOv8ObjectDetection capturedFile={capturedFile} />
          </Box>
        </Box>
      </Box>
  );
}

export default App;
