const PREFIX = "refresh:";
const MIN_SECONDS = 10 * 60;
const MAX_SECONDS = 20 * 60;
const pending = new Map();

// Keep timer changes and alarm callbacks in order for each tab.
function inOrder(tabId, run) {
  const previous = pending.get(tabId) ?? Promise.resolve();
  const current = previous.catch(() => {}).then(run);
  pending.set(tabId, current);
  return current.finally(() => {
    if (pending.get(tabId) === current) pending.delete(tabId);
  });
}

function timerKey(tabId) {
  return `${PREFIX}${tabId}`;
}

async function getTimer(tabId) {
  const key = timerKey(tabId);
  return (await chrome.storage.session.get(key))[key];
}

async function getPage(tabId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  const url = tab?.url;
  if (!/^https?:\/\//.test(url ?? "")) return null;
  if (tab.pendingUrl && tab.pendingUrl !== url) return null;
  return url;
}

function randomDelay() {
  const random = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  return (MIN_SECONDS + Math.floor(random * (MAX_SECONDS - MIN_SECONDS + 1))) * 1000;
}

async function stop(tabId) {
  const key = timerKey(tabId);
  await chrome.storage.session.remove(key);
  await chrome.alarms.clear(key);
}

async function schedule(tabId, url) {
  const key = timerKey(tabId);
  const nextAt = Date.now() + randomDelay();
  await chrome.storage.session.set({ [key]: { url, nextAt } });
  try {
    await chrome.alarms.create(key, { when: nextAt });
  } catch (error) {
    await stop(tabId);
    throw error;
  }
  return nextAt;
}

async function status(tabId, command) {
  if (command === "stop") await stop(tabId);
  const url = await getPage(tabId);
  const timer = await getTimer(tabId);
  if (timer && timer.url !== url) await stop(tabId);
  if (!url) return { available: false };
  if (timer?.url === url) return { available: true, nextAt: timer.nextAt };
  const nextAt = command === "start" ? await schedule(tabId, url) : null;
  return { available: true, nextAt };
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.url !== chrome.runtime.getURL("popup.html")) return;
  const { tabId, command } = message ?? {};
  if (!Number.isInteger(tabId) || tabId < 0) return;
  if (!["status", "start", "stop"].includes(command)) return;

  inOrder(tabId, () => status(tabId, command)).then(respond, (error) => {
    console.error(error);
    respond({ error: "操作失败，请重新打开扩展后再试。" });
  });
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith(PREFIX)) return;
  const tabId = Number(alarm.name.slice(PREFIX.length));
  inOrder(tabId, async () => {
    const timer = await getTimer(tabId);
    if (!timer || timer.nextAt !== alarm.scheduledTime) return;
    if (timer.url !== await getPage(tabId)) {
      await stop(tabId);
      return;
    }

    try {
      await chrome.tabs.reload(tabId);
      await schedule(tabId, timer.url);
    } catch (error) {
      await stop(tabId);
      throw error;
    }
  }).catch(console.error);
});

chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (!change.url && change.status !== "complete") return;
  inOrder(tabId, async () => {
    const timer = await getTimer(tabId);
    if (timer && timer.url !== await getPage(tabId)) await stop(tabId);
  }).catch(console.error);
});

function stopForClosedTab(tabId) {
  inOrder(tabId, () => stop(tabId)).catch(console.error);
}

chrome.tabs.onRemoved.addListener(stopForClosedTab);
chrome.tabs.onReplaced.addListener((_, removedTabId) => stopForClosedTab(removedTabId));
