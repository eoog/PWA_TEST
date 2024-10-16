import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if ('serviceWorker' in navigator) {
  const messageChannel = new MessageChannel();

  // 서비스 워커가 준비되었는지 확인
  navigator.serviceWorker.ready.then((registration) => {
    // 서비스 워커에 메시지 전송
    registration.active.postMessage(
        { type: 'GET_CLIENT_URLS' },
        [messageChannel.port2]
    );
  });

  // 서비스 워커로부터 메시지 수신
  messageChannel.port1.onmessage = (event) => {
    const urls = event.data;
    console.log('Opened URLs:', urls);
  };
}
