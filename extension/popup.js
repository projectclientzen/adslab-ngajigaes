const DEDUP_STATS_STORAGE_KEY = "adsLabDedupStats";
const AUTO_SCROLL_STATE_STORAGE_KEY = "adsLabScrollState";

renderDedupStats();
renderScrollStats();

chrome.storage.onChanged.addListener(function handleStorageChange(changes, areaName) {
  if (areaName !== "session") {
    return;
  }

  if (changes[DEDUP_STATS_STORAGE_KEY]) {
    updateDedupUi(changes[DEDUP_STATS_STORAGE_KEY].newValue);
  }

  if (changes[AUTO_SCROLL_STATE_STORAGE_KEY]) {
    updateScrollUi(changes[AUTO_SCROLL_STATE_STORAGE_KEY].newValue);
  }
});

function renderDedupStats() {
  chrome.storage.session.get(DEDUP_STATS_STORAGE_KEY).then(function handleStats(data) {
    updateDedupUi(data[DEDUP_STATS_STORAGE_KEY] || null);
  });
}

function renderScrollStats() {
  chrome.storage.session.get(AUTO_SCROLL_STATE_STORAGE_KEY).then(function handleStats(data) {
    updateScrollUi(data[AUTO_SCROLL_STATE_STORAGE_KEY] || null);
  });
}

function updateDedupUi(stats) {
  const counterElement = document.getElementById("dedup-counter");
  const metaElement = document.getElementById("dedup-meta");
  const insertedCount = stats ? stats.insertedCount || 0 : 0;
  const duplicateCount = stats ? stats.duplicateCount || 0 : 0;

  counterElement.textContent = insertedCount + " baru / " + duplicateCount + " duplikat";

  if (stats && stats.lastRunAt) {
    metaElement.textContent =
      "Processed " +
      (stats.processedCount || 0) +
      " record. Last run " +
      new Date(stats.lastRunAt).toLocaleString("id-ID");
    return;
  }

  metaElement.textContent = "Belum ada run scraping.";
}

function updateScrollUi(stats) {
  const counterElement = document.getElementById("scroll-counter");
  const metaElement = document.getElementById("scroll-meta");

  if (!stats) {
    counterElement.textContent = "Scrolling... 0/0 iklan";
    metaElement.textContent = "Auto-scroll belum aktif.";
    return;
  }

  counterElement.textContent =
    stats.progressText ||
    (stats.statusLabel || "Scrolling") +
      "... " +
      (stats.visibleCount || 0) +
      "/" +
      (stats.estimatedCount || 0) +
      " iklan";

  metaElement.textContent =
    "Stagnant " +
    (stats.stagnantScrolls || 0) +
    "/3 · " +
    (stats.completed ? "observer berhenti otomatis" : "observer aktif");
}

// ─── Supabase config form ──────────────────────────────────────────────────────
loadConfig();

document.getElementById("save-config").addEventListener("click", function saveConfig() {
  const url = document.getElementById("supabase-url").value.trim();
  const key = document.getElementById("supabase-key").value.trim();
  const status = document.getElementById("config-status");
  const button = document.getElementById("save-config");

  if (!url || !key) {
    status.textContent = "URL dan Key wajib diisi.";
    status.className = "status err";
    return;
  }

  chrome.storage.local.set({ SUPABASE_URL: url, SUPABASE_ANON_KEY: key }).then(function onSaved() {
    status.textContent = "✓ Konfigurasi tersimpan.";
    status.className = "status ok";
    button.textContent = "Tersimpan!";
    button.classList.add("saved");
    setTimeout(function reset() {
      button.textContent = "Simpan Konfigurasi";
      button.classList.remove("saved");
    }, 1500);
  });
});

function loadConfig() {
  chrome.storage.local.get(["SUPABASE_URL", "SUPABASE_ANON_KEY"]).then(function onLoad(data) {
    if (data.SUPABASE_URL) {
      document.getElementById("supabase-url").value = data.SUPABASE_URL;
    }
    if (data.SUPABASE_ANON_KEY) {
      document.getElementById("supabase-key").value = data.SUPABASE_ANON_KEY;
      const status = document.getElementById("config-status");
      status.textContent = "✓ Sudah dikonfigurasi.";
      status.className = "status ok";
    }
  });
}
