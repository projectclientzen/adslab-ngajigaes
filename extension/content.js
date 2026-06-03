const PAGE_RESPONSE_TYPE = "ADS_LAB_GRAPHQL_RESPONSE";
const PAGE_RESPONSE_SOURCE = "ads-lab-page";
const BACKGROUND_MESSAGE_TYPE = "ADS_LAB_PROCESS_GRAPHQL_RESPONSE";
const ATTACH_RECORD_MESSAGE = "ADS_LAB_ATTACH_RECORD";
const ATTACH_RECORDS_MESSAGE = "ADS_LAB_ATTACH_RECORDS";
const GET_DESTINATION_URL_MESSAGE = "ADS_LAB_GET_DESTINATION_URL";
const SAVE_AD_RECORDS_MESSAGE = "ADS_LAB_SAVE_AD_RECORDS";
const GET_DEDUP_STATS_MESSAGE = "ADS_LAB_GET_DEDUP_STATS";
const INJECTED_SCRIPT_ID = "ads-lab-fetch-interceptor";
const AUTO_SCROLL_STATE_STORAGE_KEY = "adsLabScrollState";
const AUTO_SCROLL_SENTINEL_ID = "ads-lab-scroll-sentinel";
const AUTO_SCROLL_STEP_PX = 800;
const MAX_STAGNANT_SCROLLS = 3;
const MAX_CAPTURED_TEXT_LENGTH = 2000;
const CTA_TEXT_PATTERNS = [
  "learn more",
  "send message",
  "send whatsapp message",
  "sign up",
  "book now",
  "apply now",
  "contact us",
  "get quote",
  "download",
  "shop now",
  "call now",
  "view profile",
  "watch more",
];
const scrollState = {
  active: false,
  completed: false,
  container: null,
  sentinel: null,
  intersectionObserver: null,
  mutationObserver: null,
  lastVisibleCount: 0,
  stagnantScrolls: 0,
  scrollLocked: false,
};

injectFetchInterceptor();
bootstrapAutoScroll();

window.addEventListener("message", function handlePageMessage(event) {
  if (event.source !== window || !event.data) {
    return;
  }

  if (
    event.data.source !== PAGE_RESPONSE_SOURCE ||
    event.data.type !== PAGE_RESPONSE_TYPE
  ) {
    return;
  }

  chrome.runtime.sendMessage(
    {
      type: BACKGROUND_MESSAGE_TYPE,
      payload: event.data.payload,
    },
    function handleBackgroundResponse(response) {
      if (chrome.runtime.lastError) {
        console.warn(
          "[ADS LAB] gagal mengirim GraphQL payload ke background:",
          chrome.runtime.lastError.message
        );
        return;
      }

      if (response && response.ok && response.result) {
        window.dispatchEvent(
          new CustomEvent("adslab:lp-url-captured", {
            detail: response.result,
          })
        );
      }
    }
  );
});

chrome.runtime.onMessage.addListener(function handleContentMessage(
  message,
  _sender,
  sendResponse
) {
  if (!message || !message.type) {
    return false;
  }

  if (message.type === GET_DESTINATION_URL_MESSAGE) {
    getDestinationUrlForLibraryId(message.libraryId).then(function respond(url) {
      sendResponse({ destinationUrl: url });
    });
    return true;
  }

  if (message.type === ATTACH_RECORD_MESSAGE) {
    attachDestinationUrlToRecord(message.record).then(function respond(record) {
      sendResponse({ record: record });
    });
    return true;
  }

  if (message.type === ATTACH_RECORDS_MESSAGE) {
    attachDestinationUrlsToRecords(message.records).then(function respond(records) {
      sendResponse({ records: records });
    });
    return true;
  }

  if (message.type === SAVE_AD_RECORDS_MESSAGE) {
    prepareAndSaveRecords(message.records).then(function respond(result) {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === GET_DEDUP_STATS_MESSAGE) {
    getDedupStats().then(function respond(stats) {
      sendResponse({ stats: stats });
    });
    return true;
  }

  return false;
});

function injectFetchInterceptor() {
  if (document.getElementById(INJECTED_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.id = INJECTED_SCRIPT_ID;
  script.src = chrome.runtime.getURL("injected-fetch.js");
  script.async = false;
  (document.documentElement || document.head).appendChild(script);
}

function getDestinationUrlForLibraryId(libraryId) {
  if (!libraryId) {
    return Promise.resolve(null);
  }

  return chrome.storage.session.get(libraryId).then(function resolveStoredUrl(data) {
    return data[libraryId] || null;
  });
}

async function attachDestinationUrlToRecord(record) {
  if (!record || !record.library_id) {
    return record;
  }

  const destinationUrl = await getDestinationUrlForLibraryId(record.library_id);

  if (!destinationUrl) {
    return record;
  }

  return Object.assign({}, record, {
    destination_url: destinationUrl,
  });
}

function attachDestinationUrlsToRecords(records) {
  const safeRecords = Array.isArray(records) ? records : [];
  return Promise.all(safeRecords.map(attachDestinationUrlToRecord));
}

async function prepareAndSaveRecords(records) {
  const recordsWithDestinationUrl = await attachDestinationUrlsToRecords(records);
  const enrichedRecords = enrichRecordsWithAdFields(recordsWithDestinationUrl);

  return chrome.runtime.sendMessage({
    type: SAVE_AD_RECORDS_MESSAGE,
    records: enrichedRecords,
  });
}

async function getDedupStats() {
  const response = await chrome.runtime.sendMessage({
    type: GET_DEDUP_STATS_MESSAGE,
  });

  return response && response.result ? response.result : response && response.stats ? response.stats : null;
}

window.adsLabPrepareAndSaveRecords = prepareAndSaveRecords;
window.adsLabGetDedupStats = getDedupStats;

function enrichRecordsWithAdFields(records) {
  const safeRecords = Array.isArray(records) ? records : [];

  return safeRecords.map(function enrichRecord(record) {
    if (!record || !record.library_id) {
      return record;
    }

    const extractedFields = extractAdFieldsForLibraryId(record.library_id);

    return Object.assign({}, record, {
      ad_copy:
        record.ad_copy !== undefined && record.ad_copy !== null
          ? sanitizeCapturedText(record.ad_copy)
          : extractedFields.ad_copy,
      creative_type:
        record.creative_type !== undefined && record.creative_type !== null
          ? sanitizeCreativeType(record.creative_type)
          : extractedFields.creative_type,
      cta_button:
        record.cta_button !== undefined && record.cta_button !== null
          ? sanitizeCapturedText(record.cta_button)
          : extractedFields.cta_button,
      funnel_type:
        record.funnel_type !== undefined && record.funnel_type !== null
          ? sanitizeFunnelType(record.funnel_type)
          : classifyRecordFunnelType(record, extractedFields),
      date_active:
        record.date_active !== undefined && record.date_active !== null
          ? normalizeDateActive(record.date_active)
          : extractedFields.date_active,
    });
  });
}

function extractAdFieldsForLibraryId(libraryId) {
  const adCard = getAdCardByLibraryId(libraryId);

  if (!adCard) {
    return {
      ad_copy: null,
      creative_type: null,
      cta_button: null,
      date_active: null,
    };
  }

  return {
    ad_copy: extractAdCopyFromCard(adCard),
    creative_type: extractCreativeTypeFromCard(adCard),
    cta_button: extractCtaButtonFromCard(adCard),
    date_active: extractDateActiveFromCard(adCard),
  };
}

function getAdCardByLibraryId(libraryId) {
  if (!libraryId) {
    return null;
  }

  const matchingLink = getAdLinks().find(function findMatchingLink(link) {
    return extractLibraryIdFromUrl(link.href) === String(libraryId);
  });

  if (!matchingLink) {
    return null;
  }

  return findAdCardElement(matchingLink);
}

function findAdCardElement(link) {
  let currentNode = link;

  while (currentNode && currentNode !== document.body) {
    const adLinkCount = currentNode.querySelectorAll(
      'a[href*="/ads/library/?id="], a[href*="ads/library/?id="], a[href*="ad_archive_id="]'
    ).length;
    const textNodeCount = currentNode.querySelectorAll(
      '[role="text"], div[dir="auto"], span[dir="auto"], button, [role="button"]'
    ).length;

    if (adLinkCount === 1 && textNodeCount >= 3) {
      return currentNode;
    }

    currentNode = currentNode.parentElement;
  }

  return (
    link.closest('[role="article"], article, [data-pagelet], [role="feed"] > div') ||
    link.parentElement ||
    null
  );
}

function extractAdCopyFromCard(adCard) {
  const candidateTexts = collectCandidateTexts(
    adCard,
    '[role="text"], div[dir="auto"], span[dir="auto"], div[data-ad-preview="message"]'
  ).filter(function filterCandidate(text) {
    return !isMetaText(text) && text.split(/\s+/).length >= 3;
  });

  if (!candidateTexts.length) {
    return null;
  }

  candidateTexts.sort(function sortByLength(left, right) {
    return right.length - left.length;
  });

  return candidateTexts[0] || null;
}

function extractCreativeTypeFromCard(adCard) {
  const videoCount = adCard.querySelectorAll("video").length;
  if (videoCount > 0) {
    return "video";
  }

  const imageCount = adCard.querySelectorAll("img").length;
  if (imageCount > 1) {
    return "carousel";
  }

  if (imageCount >= 1) {
    return "image";
  }

  return null;
}

function extractCtaButtonFromCard(adCard) {
  const buttonTexts = collectCandidateTexts(
    adCard,
    'button, [role="button"], a[role="button"], div[role="button"]'
  );

  const matchedCta = buttonTexts.find(function matchKnownCta(text) {
    const normalizedText = text.toLowerCase();
    return CTA_TEXT_PATTERNS.some(function hasPattern(pattern) {
      return normalizedText.includes(pattern);
    });
  });

  if (matchedCta) {
    return matchedCta;
  }

  return buttonTexts.find(function findFallbackButton(text) {
    return text.length <= 80 && !/see ad details|lihat detail iklan/i.test(text);
  }) || null;
}

function extractDateActiveFromCard(adCard) {
  const candidateTexts = collectCandidateTexts(
    adCard,
    '[role="text"], div[dir="auto"], span[dir="auto"]'
  );

  for (const text of candidateTexts) {
    const normalizedDate = normalizeDateActive(text);
    if (normalizedDate) {
      return normalizedDate;
    }
  }

  return null;
}

function collectCandidateTexts(rootNode, selector) {
  return Array.from(rootNode.querySelectorAll(selector))
    .map(function mapNode(node) {
      return sanitizeCapturedText(node.textContent);
    })
    .filter(Boolean)
    .filter(function uniqueOnly(value, index, allValues) {
      return allValues.indexOf(value) === index;
    });
}

function sanitizeCapturedText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const sanitized = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) {
    return null;
  }

  return sanitized.slice(0, MAX_CAPTURED_TEXT_LENGTH);
}

function sanitizeCreativeType(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "video" || normalized === "carousel" || normalized === "image") {
    return normalized;
  }

  return null;
}

function sanitizeFunnelType(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "lp") {
    return "LP";
  }

  if (normalized === "ctwa") {
    return "CTWA";
  }

  if (normalized === "visit profile") {
    return "Visit Profile";
  }

  if (normalized === "lead form") {
    return "Lead Form";
  }

  return null;
}

function classifyRecordFunnelType(record, extractedFields) {
  const classifier = window.adsLabFunnelClassifier || null;
  const ctaText =
    sanitizeCapturedText(record?.cta_button) || extractedFields?.cta_button || null;
  const destinationUrl =
    sanitizeCapturedText(record?.destination_url) || sanitizeCapturedText(record?.url) || null;

  if (!classifier || typeof classifier.classifyFunnelDetailed !== "function") {
    return null;
  }

  const classification = classifier.classifyFunnelDetailed(ctaText, destinationUrl);
  return sanitizeFunnelType(classification?.funnelType);
}

function isMetaText(text) {
  return /^(sponsored|bersponsor|learn more|send message|send whatsapp message|sign up|active since|started running on|lihat detail iklan)$/i.test(
    text
  );
}

function normalizeDateActive(value) {
  const sanitizedValue = sanitizeCapturedText(String(value || ""));
  if (!sanitizedValue) {
    return null;
  }

  const matchedLabel = sanitizedValue.match(
    /(active since|started running on|running since|mulai tayang|tayang sejak)\s*(.+)$/i
  );
  const candidateDateText = matchedLabel ? matchedLabel[2] : sanitizedValue;
  const parsedTimestamp = Date.parse(candidateDateText);

  if (Number.isFinite(parsedTimestamp)) {
    return new Date(parsedTimestamp).toISOString();
  }

  return null;
}

function bootstrapAutoScroll() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAutoScroll, { once: true });
    return;
  }

  initializeAutoScroll();
}

function initializeAutoScroll() {
  const existingContainer = findAdsContainer();

  if (existingContainer) {
    startAutoScroll(existingContainer);
    return;
  }

  const bootstrapObserver = new MutationObserver(function handleBootstrapMutation() {
    const container = findAdsContainer();

    if (!container) {
      return;
    }

    bootstrapObserver.disconnect();
    startAutoScroll(container);
  });

  bootstrapObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function startAutoScroll(container) {
  if (scrollState.active || !container) {
    return;
  }

  scrollState.active = true;
  scrollState.completed = false;
  scrollState.container = container;
  scrollState.lastVisibleCount = getVisibleAdCount();
  scrollState.stagnantScrolls = 0;

  ensureSentinel();
  refreshSentinelPosition();
  createIntersectionObserver();
  createMutationObserver();
  updateScrollProgress("Scrolling", false);
  dispatchVisibleAdsSnapshot();
}

function createIntersectionObserver() {
  if (!scrollState.sentinel) {
    return;
  }

  scrollState.intersectionObserver = new IntersectionObserver(
    function handleIntersection(entries) {
      const firstEntry = entries[0];

      if (
        !firstEntry ||
        !firstEntry.isIntersecting ||
        scrollState.completed ||
        scrollState.scrollLocked
      ) {
        return;
      }

      scrollState.scrollLocked = true;
      handleScrollStep();
    },
    { threshold: 0.1 }
  );

  scrollState.intersectionObserver.observe(scrollState.sentinel);
}

function createMutationObserver() {
  if (!scrollState.container) {
    return;
  }

  scrollState.mutationObserver = new MutationObserver(function handleDomMutation() {
    refreshSentinelPosition();
    updateScrollProgress(scrollState.completed ? "Selesai" : "Scrolling", scrollState.completed);
  });

  scrollState.mutationObserver.observe(scrollState.container, {
    childList: true,
    subtree: true,
  });
}

function handleScrollStep() {
  const currentVisibleCount = getVisibleAdCount();
  const hasNewAds = currentVisibleCount > scrollState.lastVisibleCount;

  if (hasNewAds) {
    scrollState.lastVisibleCount = currentVisibleCount;
    scrollState.stagnantScrolls = 0;
    dispatchVisibleAdsSnapshot();
  } else {
    scrollState.stagnantScrolls += 1;
  }

  if (scrollState.stagnantScrolls >= MAX_STAGNANT_SCROLLS) {
    stopAutoScroll("End of list");
    return;
  }

  requestAnimationFrame(function performScroll() {
    window.scrollBy({
      top: AUTO_SCROLL_STEP_PX,
      behavior: "auto",
    });
    refreshSentinelPosition();
    updateScrollProgress("Scrolling", false);
    scrollState.scrollLocked = false;
  });
}

function stopAutoScroll(reason) {
  scrollState.completed = true;
  scrollState.active = false;

  if (scrollState.intersectionObserver) {
    scrollState.intersectionObserver.disconnect();
    scrollState.intersectionObserver = null;
  }

  if (scrollState.mutationObserver) {
    scrollState.mutationObserver.disconnect();
    scrollState.mutationObserver = null;
  }

  updateScrollProgress(reason || "Selesai", true);
  window.dispatchEvent(
    new CustomEvent("adslab:auto-scroll-complete", {
      detail: {
        visibleCount: scrollState.lastVisibleCount,
        reason: reason || "Selesai",
      },
    })
  );
  scrollState.scrollLocked = false;
}

function ensureSentinel() {
  let sentinel = document.getElementById(AUTO_SCROLL_SENTINEL_ID);

  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = AUTO_SCROLL_SENTINEL_ID;
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.width = "100%";
    sentinel.style.height = "1px";
    sentinel.style.pointerEvents = "none";
  }

  scrollState.sentinel = sentinel;
}

function refreshSentinelPosition() {
  const container = findAdsContainer();

  if (!container || !scrollState.sentinel) {
    return;
  }

  scrollState.container = container;

  if (scrollState.sentinel.parentElement !== container) {
    container.appendChild(scrollState.sentinel);
    return;
  }

  container.appendChild(scrollState.sentinel);
}

function findAdsContainer() {
  const adLinks = getAdLinks();

  if (adLinks.length >= 2) {
    return findCommonAncestor(adLinks[0], adLinks[adLinks.length - 1]) || document.querySelector('[role="main"]');
  }

  return document.querySelector('[role="main"]');
}

function getAdLinks() {
  return Array.from(
    document.querySelectorAll(
      'a[href*="/ads/library/?id="], a[href*="ads/library/?id="], a[href*="ad_archive_id="]'
    )
  );
}

function getVisibleAdLibraryIds() {
  const libraryIds = new Set();

  getAdLinks().forEach(function collectLibraryId(link) {
    const parsedId = extractLibraryIdFromUrl(link.href);
    if (parsedId) {
      libraryIds.add(parsedId);
    }
  });

  return Array.from(libraryIds);
}

function getVisibleAdCount() {
  return getVisibleAdLibraryIds().length;
}

function extractLibraryIdFromUrl(url) {
  if (typeof url !== "string" || !url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return (
      parsedUrl.searchParams.get("id") ||
      parsedUrl.searchParams.get("ad_archive_id") ||
      null
    );
  } catch (error) {
    return null;
  }
}

function findCommonAncestor(firstNode, secondNode) {
  let currentNode = firstNode;

  while (currentNode) {
    if (currentNode.contains(secondNode)) {
      return currentNode;
    }

    currentNode = currentNode.parentElement;
  }

  return null;
}

function dispatchVisibleAdsSnapshot() {
  const visibleLibraryIds = getVisibleAdLibraryIds();

  window.dispatchEvent(
    new CustomEvent("adslab:scrape-requested", {
      detail: {
        visibleLibraryIds: visibleLibraryIds,
        visibleCount: visibleLibraryIds.length,
      },
    })
  );
}

function updateScrollProgress(statusLabel, completed) {
  const visibleCount = getVisibleAdCount();
  const progressPayload = {
    statusLabel: statusLabel,
    visibleCount: visibleCount,
    estimatedCount: scrollState.lastVisibleCount || visibleCount,
    stagnantScrolls: scrollState.stagnantScrolls,
    completed: completed,
    progressText:
      (completed ? statusLabel + ". " : statusLabel + "... ") +
      visibleCount +
      "/" +
      (scrollState.lastVisibleCount || visibleCount) +
      " iklan",
    updatedAt: new Date().toISOString(),
  };

  chrome.storage.session.set({
    [AUTO_SCROLL_STATE_STORAGE_KEY]: progressPayload,
  });
}
