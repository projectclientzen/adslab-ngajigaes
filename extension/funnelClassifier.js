const FUNNEL_TYPES = Object.freeze(["LP", "CTWA", "Visit Profile", "Lead Form"]);

function normalizeInput(value) {
  return typeof value === "string" ? value.trim() : "";
}

function classifyFunnelDetailed(ctaText, destinationUrl) {
  const normalizedCta = normalizeInput(ctaText).toLowerCase();
  const normalizedUrl = normalizeInput(destinationUrl).toLowerCase();

  if (
    /(?:wa\.me|m\.me|api\.whatsapp\.com)/.test(normalizedUrl) ||
    normalizedCta.includes("send message") ||
    normalizedCta.includes("send whatsapp message")
  ) {
    return {
      funnelType: "CTWA",
      confidence:
        /(?:wa\.me|m\.me|api\.whatsapp\.com)/.test(normalizedUrl) ||
        normalizedCta.includes("send whatsapp message")
          ? 1
          : 0.8,
      source: normalizedUrl ? "url" : "cta",
    };
  }

  if (
    /facebook\.com\/lead_gen|leadgen/.test(normalizedUrl) ||
    normalizedCta.includes("sign up")
  ) {
    return {
      funnelType: "Lead Form",
      confidence:
        /facebook\.com\/lead_gen|leadgen/.test(normalizedUrl) || normalizedCta === "sign up" ? 1 : 0.8,
      source: normalizedUrl ? "url" : "cta",
    };
  }

  if (
    !normalizedUrl ||
    /facebook\.com|instagram\.com/.test(normalizedUrl) ||
    normalizedCta.includes("view profile")
  ) {
    return {
      funnelType: "Visit Profile",
      confidence:
        !normalizedUrl || normalizedCta === "view profile" || /facebook\.com|instagram\.com/.test(normalizedUrl)
          ? 1
          : 0.8,
      source: normalizedUrl ? "url" : "cta",
    };
  }

  return {
    funnelType: "LP",
    confidence: normalizedUrl ? 1 : 0.8,
    source: normalizedUrl ? "url" : "fallback",
  };
}

function classifyFunnel(ctaText, destinationUrl) {
  return classifyFunnelDetailed(ctaText, destinationUrl).funnelType;
}

const exportedClassifier = {
  FUNNEL_TYPES: FUNNEL_TYPES,
  classifyFunnel: classifyFunnel,
  classifyFunnelDetailed: classifyFunnelDetailed,
};

if (typeof window !== "undefined") {
  window.classifyFunnel = classifyFunnel;
  window.classifyFunnelDetailed = classifyFunnelDetailed;
  window.adsLabFunnelClassifier = exportedClassifier;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = exportedClassifier;
}
