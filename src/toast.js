import React, { useState } from 'react';
import { Snackbar, Button } from '@mui/material';

const ToastExample = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = (msg) => {
    setMessage(msg); // 메시지를 설정
    setOpen(true);   // Snackbar 열기
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false); // Snackbar 닫기
  };

  return (
      <div>
        <Button variant="contained" onClick={() => handleClick('이 알림은 성공적으로 표시되었습니다!')}>
          Toast 메시지 표시
        </Button>
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Snackbar 위치 설정
            open={open} // Snackbar 열림 상태
            autoHideDuration={6000} // 자동으로 닫히는 시간 (밀리초)
            onClose={handleClose} // 닫힘 이벤트
            message={message} // 표시할 메시지
            action={
              <Button color="inherit" onClick={handleClose}>
                닫기
              </Button>
            }
        />
      </div>
  );
};

export default ToastExample;
