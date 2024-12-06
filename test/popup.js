const addSiteButton = document.getElementById('add-site');
const siteInput = document.getElementById('site-input');
const blockedSitesList = document.getElementById('blocked-sites');

async function loadBlockedSites() {
  const {blockedSites} = await chrome.storage.sync.get('blockedSites');
  blockedSitesList.innerHTML = blockedSites
  .map(site => `<li>${site} <button data-site="${site}">Remove</button></li>`)
  .join('');
}

async function addBlockedSite() {
  const site = siteInput.value;
  siteInput.value = '';
  const {blockedSites} = await chrome.storage.sync.get('blockedSites');
  if (!blockedSites.includes(site)) {
    await chrome.storage.sync.set({blockedSites: [...blockedSites, site]});
    loadBlockedSites();
  }
}

async function removeBlockedSite(event) {
  if (event.target.tagName === 'BUTTON') {
    const site = event.target.dataset.site;
    const {blockedSites} = await chrome.storage.sync.get('blockedSites');
    await chrome.storage.sync.set({
      blockedSites: blockedSites.filter(s => s !== site)
    });
    loadBlockedSites();
  }
}

addSiteButton.addEventListener('click', addBlockedSite);
blockedSitesList.addEventListener('click', removeBlockedSite);
loadBlockedSites();

async function updateTimer() {
  const {unblockTime} = await chrome.storage.sync.get('unblockTime');
  if (unblockTime) {
    const remainingTime = Math.ceil((unblockTime - Date.now()) / 1000);
    document.getElementById('timer').textContent =
        `차단이 ${remainingTime}초 후에 해제됩니다.`;
  } else {
    document.getElementById('timer').textContent = '';
  }
}

setInterval(updateTimer, 1000);