chrome.runtime.onInstalled.addListener(async () => {
  const {blockedSites} = await chrome.storage.sync.get('blockedSites');
  if (!blockedSites) {
    await chrome.storage.sync.set({blockedSites: []});
  }
});

let unblockTimer = null;

async function updateBlockedSites(blockedSites, unblockAfter = 0) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: Array.from({length: 1000}, (_, i) => i + 1),
    addRules: blockedSites.map((site, i) => ({
      id: i + 1,
      priority: 1,
      action: {type: "block"},
      condition: {urlFilter: site, resourceTypes: ['main_frame']}
    }))
  });

  if (unblockAfter > 0) {
    const unblockTime = Date.now() + unblockAfter * 1000;
    await chrome.storage.sync.set({unblockTime});

    if (unblockTimer) {
      clearTimeout(unblockTimer);
    }

    unblockTimer = setTimeout(async () => {
      await chrome.storage.sync.remove('unblockTime');
      await updateBlockedSites([]);
    }, unblockAfter * 1000);
  } else {
    await chrome.storage.sync.remove('unblockTime');
  }
}

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'sync' && changes.blockedSites?.newValue) {
    const blockedSites = changes.blockedSites.newValue;
    await updateBlockedSites(blockedSites, 10);
  }
});