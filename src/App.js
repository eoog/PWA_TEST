import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';


async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Notification permission granted.');
  } else {
    console.log('Notification permission denied.');
  }
}

async function registerBackgroundSync() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    try {
      await registration.sync.register('background-sync');
      console.log('백그라운드 싱크  등록 registered');
    } catch (error) {
      console.error('백그라운드 에러:', error);
    }
  }
}

function App() {

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleSync = () => {
    registerBackgroundSync();
  };

  return (
      <div>
        <h1>PWA with Background Sync</h1>
        <button onClick={handleSync}>백그라운드 동기화 요청</button>
      </div>
  );
}

export default App;
