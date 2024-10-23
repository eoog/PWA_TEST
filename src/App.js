import React, {useEffect, useState} from 'react';
import './App.css';
import Example from "./sidebar"; // 사이드바 컴포넌트를 가져옵니다.
import {Box} from '@mui/material';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Detection from "./view/Detection";
import GambleView from "./view/GambleView";
import SaveImage from "./view/SaveImage";
import Test from "./view/Test";

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Notification permission granted.');
  } else {
    console.log('Notification permission denied.');
    alert("알림 허용을 해주세요.");
  }
}

function App() {
  const [capturedFile, setCapturedFile] = useState(null); // 캡처된 파일 상태
  const [stream, setStream] = useState(null); // 스트림 상태 관리

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
      <Router>
        <Box sx={{
          display: 'flex',
          height: '100vh'
        }}>  {/* 전체 화면을 수평으로 나누는 레이아웃 */}
          <Example/> {/* 사이드바 컴포넌트 */}

          <Routes>
            <Route path="/dection" element={<Detection/>}/>
            <Route path="/dection_save_image" element={<SaveImage/>}/>
            <Route path="/a" element={<GambleView/>}/>
            <Route path="/test" element={<Test/>}/>
          </Routes>

        </Box>
      </Router>
  );
}

export default App;
