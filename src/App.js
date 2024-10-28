import React, {useEffect} from 'react';
import './App.css';
import MenuSidebar from "./menuSidebar"; // 사이드바 컴포넌트를 가져옵니다.
import {Box} from '@mui/material';
import {Route, Routes, useLocation} from "react-router-dom";
import Dashboard from "./view/Dashboard";
import ImageBoard from "./view/ImageList";
import InstallGuide from "./view/installGuide";
import InstallChecker from "./components/InstallChecker";
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


  return (
      <>
        <Box sx={{
          display: 'flex',
          height: '100vh'
        }}>  {/* 전체 화면을 수평으로 나누는 레이아웃 */}
          {/* 사이드바 컴포넌트 */}
          <MenuSidebar/>

          <Routes>
            {/*<Route path="/" element={<Dashboard />} />*/}
            <Route path="/" element={<InstallChecker/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/board" element={<ImageBoard/>}/>
            <Route path="/text" element={<TextView/>}/>
            <Route path="/install-guide" element={<InstallGuide />} />
            <Route path="/demo-install-guide" element={<DemoInstallGuide />} />
          </Routes>
        </Box>
        {/* Same as */}
      </>
  );
}

export default App;
