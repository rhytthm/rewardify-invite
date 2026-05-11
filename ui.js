/* UI: scroll reveal, card mouse light, smooth anchors */
(function () {
  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Mouse light on cards
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (ev) => {
      const r = card.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    });
  });

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 12, behavior: "smooth" });
        }
      }
    });
  });

  const weatherWrap = document.querySelector(".phero-canvas-wrap");
  const weatherChip = document.querySelector(".weather-chip");
  const weatherLabel = document.querySelector(".weather-label");
  const weatherStates = [
    { key: "sunny", label: "Sunny growth" },
    { key: "cloudy", label: "Market clouds" },
    { key: "rain", label: "Rainy dip" },
    { key: "storm", label: "Storm lesson" },
  ];

  if (weatherWrap && weatherChip && weatherLabel) {
    let weatherIndex = 0;

    function setWeather(index) {
      weatherIndex = (index + weatherStates.length) % weatherStates.length;
      const state = weatherStates[weatherIndex];
      weatherWrap.dataset.weather = state.key;
      weatherLabel.textContent = state.label;
    }

    setWeather(0);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let weatherTimer = reducedMotion ? null : window.setInterval(() => setWeather(weatherIndex + 1), 4200);

    weatherChip.addEventListener("click", () => {
      setWeather(weatherIndex + 1);
      if (weatherTimer) {
        window.clearInterval(weatherTimer);
        weatherTimer = window.setInterval(() => setWeather(weatherIndex + 1), 4200);
      }
    });

    weatherWrap.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(max-width: 700px)").matches) return;
      const rect = weatherWrap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      weatherWrap.style.setProperty("--hero-tilt-x", `${x * 4}deg`);
      weatherWrap.style.setProperty("--hero-tilt-y", `${y * -4}deg`);
    });

    weatherWrap.addEventListener("pointerleave", () => {
      weatherWrap.style.setProperty("--hero-tilt-x", "0deg");
      weatherWrap.style.setProperty("--hero-tilt-y", "0deg");
    });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        if (window.firebase) resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function hasFirebaseConfig() {
    const config = window.REWARDIFY_FIREBASE_CONFIG;
    if (!config) return false;
    return ["apiKey", "authDomain", "projectId", "appId"].every((key) => {
      const value = config[key];
      return typeof value === "string" && value.trim() && !value.includes("PASTE_");
    });
  }

  let firestorePromise;
  async function getInviteStore() {
    if (!hasFirebaseConfig()) return null;
    if (!firestorePromise) {
      firestorePromise = (async () => {
        await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js");
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(window.REWARDIFY_FIREBASE_CONFIG);
        }
        return window.firebase.firestore();
      })();
    }
    return firestorePromise;
  }

  document.querySelectorAll(".contact .form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const panel = form.closest(".panel");
      const input = form.querySelector("input[type='email']");
      const button = form.querySelector("button[type='submit']");
      const status = form.querySelector(".form-status");
      const email = input?.value.trim().toLowerCase();

      if (!email || !button) return;

      const originalText = button.textContent;
      form.classList.remove("is-error");
      button.disabled = true;
      button.textContent = "Saving...";
      if (status) status.textContent = "";

      try {
        const db = await getInviteStore();
        if (!db) {
          throw new Error("Firebase web config is missing in firebase-config.js");
        }

        await db.collection(window.REWARDIFY_INVITES_COLLECTION || "inviteRequests").add({
          email,
          source: "rewardify_launch_site",
          launchCohort: "first_50_families",
          page: window.location.pathname || "/",
          referrer: document.referrer || "",
          userAgent: navigator.userAgent,
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
        });

        input.value = "";
        button.textContent = "You're in ✓";
        if (status) status.textContent = "Invite request saved.";
        panel?.classList.add("form-sent");
        window.setTimeout(() => panel?.classList.remove("form-sent"), 1600);
      } catch (error) {
        console.warn("Invite request was not saved:", error);
        form.classList.add("is-error");
        button.textContent = "Try again";
        if (status) {
          status.textContent = hasFirebaseConfig()
            ? "Could not save. Please try again."
            : "Add Firebase config to save invite requests.";
        }
      } finally {
        window.setTimeout(() => {
          button.disabled = false;
          if (button.textContent !== "Request invite →") {
            button.textContent = originalText;
          }
        }, 1800);
      }
    });
  });

  document.querySelectorAll(".plant").forEach((plant) => {
    plant.addEventListener("pointerdown", () => {
      plant.classList.add("is-active");
      window.setTimeout(() => plant.classList.remove("is-active"), 850);
    });
  });
})();
