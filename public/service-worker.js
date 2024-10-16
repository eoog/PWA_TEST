// public/service-worker.js 파일
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'GET_CURRENT_URL') {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    allClients.forEach(client => {
      console.log('Current URL:', client.url);
      // 추가 처리가 필요하다면 이곳에 작성
    });
  }
});
