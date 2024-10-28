import React, {useEffect} from 'react';
import './App.css';
import MenuSidebar from "./menuSidebar"; // 사이드바 컴포넌트를 가져옵니다.
import {Box} from '@mui/material';
import {Route, Routes, useLocation} from "react-router-dom";
import Dashboard from "./view/Dashboard";
import ImageBoard from "./view/ImageList";
import InstallGuide from "./view/installGuide";
import TextViewWrapper from "./components/TextViewWrapper";
import DemoInstallGuide from "./components/DemoInstallGuide";
import TextView from "./view/TextView";

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Notification permission granted.');
  } else {
    console.log('Notification permission denied.');
    await Notification.requestPermission();
  }
}


function App() {
  const location = useLocation();
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    // 여기에 라우터 이동 시마다 실행할 코드를 작성합니다.
    console.log('Current location:', location.pathname);

    // 필요에 따라 다른 작업을 추가할 수 있습니다.
  }, [location]); // location이 변경될 때마다 useEffect가 실행됩니다.

  return (
      <>
        <Box sx={{
          display: 'flex',
          height: '100vh'
        }}>  {/* 전체 화면을 수평으로 나누는 레이아웃 */}
          <MenuSidebar/> {/* 사이드바 컴포넌트 */}

          <Routes>
            {/*<Route path="/" element={<Dashboard />} />*/}
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/board" element={<ImageBoard/>}/>
            <Route path="/text" element={<TextView/>}/>
            <Route path="/text-view" element={<TextViewWrapper/>}/>
            <Route path="/install-guide" element={<InstallGuide />} />
            <Route path="/demo-install-guide" element={<DemoInstallGuide />} />
          </Routes>
        </Box>
        {/* Same as */}
      </>
  );
}

export default App;
