(() => {
  const endpoint = "/events";
  const sessionKey = "seo_researcher_session";
  let sessionId = sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(sessionKey, sessionId);
  }

  const query = new URLSearchParams(location.search);
  const attribution = {
    referrer: document.referrer || null,
    utm_source: query.get("utm_source"),
    utm_medium: query.get("utm_medium"),
    utm_campaign: query.get("utm_campaign"),
    utm_content: query.get("utm_content"),
    utm_term: query.get("utm_term"),
  };

  function track(event, properties = {}) {
    const payload = JSON.stringify({
      event,
      session_id: sessionId,
      path: location.pathname,
      properties: { ...attribution, ...properties },
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  }

  track("landing_page_viewed", { title: document.title });

  document.querySelectorAll("[data-event]").forEach((element) => {
    element.addEventListener("click", () => {
      track(element.dataset.event, { location: element.dataset.location || null });
    });
  });

  document.querySelectorAll("[data-copy-prompt]").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(button.dataset.copyPrompt || "");
      button.textContent = "Copied";
    });
  });

  const pricing = document.querySelector("#pricing");
  if (pricing && "IntersectionObserver" in window) {
    let seen = false;
    new IntersectionObserver((entries, observer) => {
      if (!seen && entries.some((entry) => entry.isIntersecting)) {
        seen = true;
        track("pricing_viewed");
        observer.disconnect();
      }
    }, { threshold: .35 }).observe(pricing);
  }
})();
