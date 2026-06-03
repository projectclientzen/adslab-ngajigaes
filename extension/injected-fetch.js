(function () {
  if (window.__ADS_LAB_FETCH_HOOK_INSTALLED__) {
    return;
  }

  window.__ADS_LAB_FETCH_HOOK_INSTALLED__ = true;

  const nativeFetch = window.fetch;

  if (typeof nativeFetch !== "function") {
    return;
  }

  window.fetch = async function adsLabInterceptedFetch(input, init) {
    const response = await nativeFetch.apply(this, arguments);

    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";
      const requestMethod = (
        (init && init.method) ||
        (input && input.method) ||
        "GET"
      ).toUpperCase();

      if (
        requestMethod === "POST" &&
        requestUrl.includes("/api/graphql/")
      ) {
        const body = await response.clone().text();

        window.postMessage(
          {
            source: "ads-lab-page",
            type: "ADS_LAB_GRAPHQL_RESPONSE",
            payload: {
              method: requestMethod,
              url: requestUrl,
              body: body,
            },
          },
          window.location.origin
        );
      }
    } catch (error) {
      console.warn("[ADS LAB] fetch intercept gagal:", error);
    }

    return response;
  };
})();
