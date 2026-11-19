const statusLine = document.querySelector("#status");
const countdown = document.querySelector("#countdown");
const button = document.querySelector("#toggle");
const errorLine = document.querySelector("#error");

let tabId;
let nextAt = null;

function updateCountdown() {
  if (!nextAt) return;
  const seconds = Math.ceil((nextAt - Date.now()) / 1000);
  if (seconds <= 0) {
    countdown.textContent = "等待浏览器刷新…";
    return;
  }
  countdown.textContent = `${Math.floor(seconds / 60)} 分 ${String(seconds % 60).padStart(2, "0")} 秒`;
}

async function sync(command = "status") {
  button.disabled = true;
  errorLine.hidden = true;
  try {
    const result = await chrome.runtime.sendMessage({ tabId, command });
    if (result.error) throw new Error(result.error);

    nextAt = result.nextAt ?? null;
    statusLine.textContent = "请在普通网页中使用。";
    if (result.available) {
      statusLine.textContent = nextAt ? "距离下次刷新" : "每次随机等待 10–20 分钟。";
    }
    countdown.hidden = !nextAt;
    updateCountdown();
    button.dataset.running = String(Boolean(nextAt));
    button.textContent = nextAt ? "停止刷新" : "开启随机刷新";
    button.disabled = !result.available;
  } catch (error) {
    console.error(error);
    errorLine.textContent = "操作失败，请重新打开扩展后再试。";
    errorLine.hidden = false;
  }
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!Number.isInteger(tab?.id) || tab.id < 0) {
    statusLine.textContent = "请在普通网页中使用。";
    return;
  }

  tabId = tab.id;
  button.addEventListener("click", () => sync(nextAt ? "stop" : "start"));
  chrome.storage.session.onChanged.addListener((changes) => {
    if (changes[`refresh:${tabId}`]) void sync();
  });
  setInterval(updateCountdown, 1000);
  await sync();
}

init().catch((error) => {
  console.error(error);
  statusLine.textContent = "无法读取当前标签页，请重新打开扩展。";
});
