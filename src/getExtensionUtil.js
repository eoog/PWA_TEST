const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4'; // extension 식별자

export function getUrlHistory(callback) {
  console.log("getUrlHistory called");
  const messageListener = (event) => {
    console.log("Received message in PWA:", event.data);
    if (event.data.type === "FROM_EXTENSION" && 
        event.data.identifier === EXTENSION_IDENTIFIER &&
        event.data.action === "historyData") {
      window.removeEventListener("message", messageListener);
      console.log("Calling callback with history data");
      callback(event.data.history);
    }
  };

  window.addEventListener("message", messageListener);

  console.log("Sending message to extension");
  window.postMessage({ 
    type: "FROM_PAGE", 
    action: "getHistory",
    identifier: EXTENSION_IDENTIFIER
  }, "*");
}
