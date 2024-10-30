const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8089;

// SSL 인증서 파일 경로 설정
const options = {
  key: fs.readFileSync(path.join(__dirname, 'private_key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificate.pem'))
};

// 정적 파일 제공 (React 빌드 폴더)
app.use(express.static(path.join(__dirname, 'build')));

// 모든 경로에 대해 React의 index.html 반환
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// HTTPS 서버 시작
https.createServer(options, app).listen(PORT, () => {
  console.log(`서버가 https://localhost:${PORT} 에서 실행 중입니다.`);
});

// // HTTPS 서버 시작
// app.listen(PORT, () => {
//   console.log(`서버가 https://localhost:${PORT} 에서 실행 중입니다.`);
// });

