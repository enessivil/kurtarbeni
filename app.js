"use strict";

(() => {
  const $ = (id) => document.getElementById(id);

  // ---------- Sabitler & Güvenlik Sınırları ----------
  const STORAGE_KEY = "kurtarbeni_prefs_v1";
  const DB_NAME = "kurtarbeni_audio_db";
  const DB_STORE = "ringtones";
  const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15 MB

  // ---------- Uygulama Durumu ----------
  const state = {
    mode: "call", // "call" | "msg"
    detectedOS: detectOS(), // "ios" | "android" | "desktop"
    activeOS: "android", // "ios" | "android"
    timers: [],
    audioCtx: null,
    ringInterval: null,
    talkInterval: null,
    wakeLock: null,
    customAudioBlob: null,
    customAudioName: "",
    customAudioUrl: null,
    customAudioEl: null,
    deferredPrompt: null,
    lastTapTime: 0,
    isTestingSound: false
  };

  // ---------- DOM Referansları ----------
  const el = {
    appShell: $("appShell"),
    detectedOsLabel: $("detectedOsLabel"),
    offlineStatusDesktop: $("offlineStatusDesktop"),
    installCard: $("installCard"),
    installTitle: $("installTitle"),
    installDesc: $("installDesc"),
    installActionBtn: $("installActionBtn"),
    dismissInstallBtn: $("dismissInstallBtn"),
    tabCall: $("tabCall"),
    tabMsg: $("tabMsg"),
    presetRow: $("presetRow"),
    whoInput: $("whoInput"),
    subInput: $("subInput"),
    delayInput: $("delayInput"),
    quickDelays: $("quickDelays"),
    msgOptions: $("msgOptions"),
    msgCountInput: $("msgCountInput"),
    msgGapInput: $("msgGapInput"),
    msgTextInput: $("msgTextInput"),
    osStyleSelect: $("osStyleSelect"),
    toneLabel: $("toneLabel"),
    toneSelect: $("toneSelect"),
    testSoundBtn: $("testSoundBtn"),
    customAudioBox: $("customAudioBox"),
    customAudioInput: $("customAudioInput"),
    clearAudioBtn: $("clearAudioBtn"),
    customAudioStatus: $("customAudioStatus"),
    startBtn: $("startBtn"),
    screenSetup: $("screenSetup"),
    screenWait: $("screenWait"),
    screenHome: $("screenHome"),
    screenCall: $("screenCall"),
    waitTimer: $("waitTimer"),
    cancelWaitBtn: $("cancelWaitBtn"),
    sbTimeHome: $("sbTimeHome"),
    sbTimeCall: $("sbTimeCall"),
    lockDate: $("lockDate"),
    lockClock: $("lockClock"),
    notiStack: $("notiStack"),
    homeBackBtn: $("homeBackBtn"),
    callRipple: $("callRipple"),
    callInitial: $("callInitial"),
    callName: $("callName"),
    callSub: $("callSub"),
    inCallGrid: $("inCallGrid"),
    dtmfPad: $("dtmfPad"),
    dtmfDisplay: $("dtmfDisplay"),
    dtmfKeys: $("dtmfKeys"),
    hideDtmfBtn: $("hideDtmfBtn"),
    callActions: $("callActions"),
    declineBtn: $("declineBtn"),
    declineLabel: $("declineLabel"),
    acceptWrap: $("acceptWrap"),
    acceptBtn: $("acceptBtn"),
    legalModal: $("legalModal"),
    openLegalBtn: $("openLegalBtn"),
    openLegalInline: $("openLegalInline"),
    openLegalDesktop: $("openLegalDesktop"),
    closeLegalBtn: $("closeLegalBtn"),
    acceptLegalBtn: $("acceptLegalBtn"),
    wipeDataBtn: $("wipeDataBtn"),
    toast: $("toast")
  };

  // ---------- 1. Cihaz / İşletim Sistemi Algılama ----------
  function detectOS() {
    const ua = navigator.userAgent || "";
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    const isIOS =
      /iPad|iPhone|iPod/i.test(ua) ||
      (/Mac/i.test(platform) && navigator.maxTouchPoints > 1);
    if (isIOS) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "desktop";
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function applyOSTheme() {
    const selected = el.osStyleSelect.value;
    if (selected === "ios") {
      state.activeOS = "ios";
    } else if (selected === "android") {
      state.activeOS = "android";
    } else {
      state.activeOS = state.detectedOS === "ios" ? "ios" : "android";
    }

    el.appShell.classList.toggle("os-ios", state.activeOS === "ios");
    el.appShell.classList.toggle("os-android", state.activeOS === "android");

    const osNames = {
      ios: "iOS algılandı · iPhone arayüzü aktif",
      android: "Android algılandı · Android arayüzü aktif",
      desktop: "Masaüstü algılandı · Önizleme modu"
    };
    el.detectedOsLabel.textContent = osNames[state.detectedOS];
  }

  // ---------- 2. Bildirim Toast ----------
  let toastTimer = null;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.remove("is-hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.add("is-hidden");
    }, 2800);
  }

  // ---------- 3. Ekran Yönetimi ----------
  function showScreen(target) {
    [el.screenSetup, el.screenWait, el.screenHome, el.screenCall].forEach((scr) => {
      scr.classList.toggle("is-active", scr === target);
    });
  }

  // ---------- 4. Yerel Tercihler (localStorage) ----------
  function savePrefs() {
    try {
      const data = {
        mode: state.mode,
        who: el.whoInput.value.slice(0, 40),
        sub: el.subInput.value.slice(0, 28),
        delay: clampInt(el.delayInput.value, 1, 3600, 5),
        msgCount: clampInt(el.msgCountInput.value, 1, 10, 3),
        msgGap: clampInt(el.msgGapInput.value, 1, 60, 3),
        msgText: el.msgTextInput.value.slice(0, 300),
        osStyle: el.osStyleSelect.value,
        tone: el.toneSelect.value
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Depolama kısıtlıysa sessizce devam et
    }
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.mode === "call" || data.mode === "msg") setMode(data.mode, false);
      if (typeof data.who === "string") el.whoInput.value = data.who.slice(0, 40);
      if (typeof data.sub === "string") el.subInput.value = data.sub.slice(0, 28);
      if (data.delay) el.delayInput.value = String(clampInt(data.delay, 1, 3600, 5));
      if (data.msgCount) el.msgCountInput.value = String(clampInt(data.msgCount, 1, 10, 3));
      if (data.msgGap) el.msgGapInput.value = String(clampInt(data.msgGap, 1, 60, 3));
      if (typeof data.msgText === "string") el.msgTextInput.value = data.msgText.slice(0, 300);
      if (["auto", "android", "ios"].includes(data.osStyle)) {
        el.osStyleSelect.value = data.osStyle;
      }
      if (
        ["auto", "ios_melody", "android_melody", "classic", "soft", "custom", "none"].includes(
          data.tone
        )
      ) {
        el.toneSelect.value = data.tone;
      }
    } catch {
      // Bozuk veri varsa sıfırla
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // yoksay
      }
    }
  }

  // ---------- 5. IndexedDB (Cihaz İçi Özel Zil Sesi) ----------
  function openAudioDB() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB desteklenmiyor"));
        return;
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveCustomAudio(file) {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({ blob: file, name: file.name }, "user_tone");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadCustomAudio() {
    try {
      const db = await openAudioDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readonly");
        const req = tx.objectStore(DB_STORE).get("user_tone");
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async function deleteCustomAudio() {
    if (state.customAudioUrl) {
      URL.revokeObjectURL(state.customAudioUrl);
      state.customAudioUrl = null;
    }
    state.customAudioBlob = null;
    state.customAudioName = "";
    try {
      const db = await openAudioDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete("user_tone");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // yoksay
    }
    updateCustomAudioUI();
  }

  function updateCustomAudioUI() {
    const showBox = el.toneSelect.value === "custom";
    el.customAudioBox.classList.toggle("is-hidden", !showBox);

    if (state.customAudioBlob) {
      el.customAudioStatus.textContent = "Yüklü ses: " + state.customAudioName + " (yalnızca bu cihazda saklanır)";
      el.clearAudioBtn.classList.remove("is-hidden");
    } else {
      el.customAudioStatus.textContent =
        "Tarayıcı güvenliği gereği sistem zil sesine doğrudan erişilemez; kendi ses dosyanı seçersen yalnızca cihazında (çevrimdışı) saklanır.";
      el.clearAudioBtn.classList.add("is-hidden");
    }
  }

  // ---------- 6. Ses Motoru (Web Audio API + Özel Ses Dosyası) ----------
  function ensureAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!state.audioCtx) state.audioCtx = new AudioCtx();
      if (state.audioCtx.state === "suspended") {
        state.audioCtx.resume();
      }
      return state.audioCtx;
    } catch {
      return null;
    }
  }

  function playNote(ctx, freq, startTime, duration, volume, type = "sine") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  }

  function resolveToneStyle() {
    const val = el.toneSelect.value;
    if (val === "auto") {
      return state.activeOS === "ios" ? "ios_melody" : "android_melody";
    }
    if (val === "custom" && !state.customAudioBlob) {
      return state.activeOS === "ios" ? "ios_melody" : "android_melody";
    }
    return val;
  }

  function triggerVibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {
      // iOS Safari desteklemez, sorunsuz yoksay
    }
  }

  function playSynthRingBurst(style) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime + 0.02;

    if (style === "ios_melody") {
      // iOS tarzı sıcak marimba/harp arpej motifi
      const notes = [
        [523.25, 0.0, 0.22],
        [659.25, 0.16, 0.22],
        [783.99, 0.32, 0.22],
        [1046.5, 0.48, 0.36],
        [783.99, 0.86, 0.2],
        [880.0, 1.04, 0.24],
        [659.25, 1.28, 0.42]
      ];
      notes.forEach(([f, off, dur]) => {
        playNote(ctx, f, t + off, dur, 0.22, "triangle");
        playNote(ctx, f * 2, t + off, dur * 0.6, 0.05, "sine");
      });
    } else if (style === "android_melody") {
      // Android modern temiz dijital melodi
      const notes = [
        [587.33, 0.0, 0.25],
        [739.99, 0.22, 0.25],
        [880.0, 0.44, 0.3],
        [1174.66, 0.72, 0.45],
        [880.0, 1.18, 0.35]
      ];
      notes.forEach(([f, off, dur]) => {
        playNote(ctx, f, t + off, dur, 0.2, "sine");
        playNote(ctx, f * 1.5, t + off, dur * 0.7, 0.05, "triangle");
      });
    } else if (style === "classic") {
      // Çift frekanslı klasik telefon zili
      for (let burst = 0; burst < 2; burst++) {
        const base = t + burst * 0.75;
        for (let i = 0; i < 9; i++) {
          playNote(ctx, 440, base + i * 0.055, 0.045, 0.2, "sine");
          playNote(ctx, 480, base + i * 0.055 + 0.02, 0.045, 0.18, "sine");
        }
      }
    } else if (style === "soft") {
      [523.25, 659.25, 783.99].forEach((f, idx) => {
        playNote(ctx, f, t + idx * 0.32, 0.45, 0.14, "sine");
      });
    }
  }

  function startRinging() {
    stopRinging();
    const style = resolveToneStyle();
    triggerVibrate([700, 350, 700, 350, 700]);

    if (style === "none") return;

    if (style === "custom" && state.customAudioBlob) {
      if (!state.customAudioUrl) {
        state.customAudioUrl = URL.createObjectURL(state.customAudioBlob);
      }
      const audio = new Audio(state.customAudioUrl);
      audio.loop = true;
      state.customAudioEl = audio;
      audio.play().catch(() => {
        playSynthRingBurst(state.activeOS === "ios" ? "ios_melody" : "android_melody");
      });
      return;
    }

    playSynthRingBurst(style);
    state.ringInterval = setInterval(() => {
      triggerVibrate([700, 350, 700]);
      playSynthRingBurst(style);
    }, 2600);
  }

  function stopRinging() {
    clearInterval(state.ringInterval);
    state.ringInterval = null;
    if (state.customAudioEl) {
      state.customAudioEl.pause();
      state.customAudioEl.currentTime = 0;
      state.customAudioEl = null;
    }
    triggerVibrate(0);
  }

  function playNotificationSound() {
    const style = resolveToneStyle();
    triggerVibrate([160, 80, 160]);
    if (style === "none") return;

    if (style === "custom" && state.customAudioBlob) {
      if (!state.customAudioUrl) {
        state.customAudioUrl = URL.createObjectURL(state.customAudioBlob);
      }
      const audio = new Audio(state.customAudioUrl);
      audio.play().catch(() => {});
      setTimeout(() => {
        audio.pause();
      }, 2200);
      return;
    }

    const ctx = ensureAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;

    if (style === "ios_melody") {
      // iOS tarzı üçlü yumuşak ton
      playNote(ctx, 880, t, 0.14, 0.18, "sine");
      playNote(ctx, 1174.66, t + 0.11, 0.14, 0.18, "sine");
      playNote(ctx, 1046.5, t + 0.22, 0.22, 0.2, "sine");
    } else {
      // Android tarzı ikili parlak çınlama
      playNote(ctx, 987.77, t, 0.12, 0.18, "sine");
      playNote(ctx, 1318.51, t + 0.12, 0.22, 0.2, "triangle");
    }
  }

  function playDtmfTone(key) {
    const map = {
      "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
      "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
      "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
      "*": [941, 1209], "0": [941, 1336], "#": [941, 1477]
    };
    const pair = map[key];
    const ctx = ensureAudioContext();
    if (!pair || !ctx) return;
    const t = ctx.currentTime;
    playNote(ctx, pair[0], t, 0.14, 0.12, "sine");
    playNote(ctx, pair[1], t, 0.14, 0.12, "sine");
  }

  // ---------- 7. Wake Lock & Tam Ekran (Ekranın Uykuya Geçmesini Önler) ----------
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        state.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch {
      // Desteklenmiyor veya izin verilmedi; normal devam et
    }
  }

  async function releaseWakeLock() {
    try {
      if (state.wakeLock) {
        await state.wakeLock.release();
        state.wakeLock = null;
      }
    } catch {
      // yoksay
    }
  }

  function enterFullscreenIfMobile() {
    if (window.innerWidth > 820) return;
    try {
      const root = document.documentElement;
      if (root.requestFullscreen && !document.fullscreenElement) {
        root.requestFullscreen().catch(() => {});
      }
    } catch {
      // iOS Safari fullscreen kısıtlı olabilir
    }
  }

  function exitFullscreenSafe() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // yoksay
    }
  }

  // ---------- 8. Zamanlayıcı & Simülasyon Akışı ----------
  function clearAllTimers() {
    state.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    state.timers = [];
    clearInterval(state.talkInterval);
    state.talkInterval = null;
    stopRinging();
    releaseWakeLock();
    el.screenWait.classList.remove("is-stealth");
  }

  function clampInt(val, min, max, fallback) {
    const n = parseInt(String(val), 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function formatClock(date) {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatDate(date) {
    return date.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  function updateClocks() {
    const now = new Date();
    const timeStr = formatClock(now);
    el.lockClock.textContent = timeStr;
    el.sbTimeHome.textContent = timeStr;
    el.sbTimeCall.textContent = timeStr;
    el.lockDate.textContent = formatDate(now);
  }

  function startSimulation() {
    stopTestSound();
    clearAllTimers();
    ensureAudioContext();
    savePrefs();
    applyOSTheme();

    const delaySec = clampInt(el.delayInput.value, 1, 3600, 5);
    el.delayInput.value = String(delaySec);

    let remaining = delaySec;
    el.waitTimer.textContent = String(remaining);
    el.screenWait.classList.remove("is-stealth");
    showScreen(el.screenWait);

    requestWakeLock();
    enterFullscreenIfMobile();

    // 2 saniye sonra ekranı AMOLED saf siyah gizli moda al
    if (delaySec >= 3) {
      state.timers.push(
        setTimeout(() => {
          el.screenWait.classList.add("is-stealth");
        }, 2000)
      );
    }

    const countdown = setInterval(() => {
      remaining -= 1;
      el.waitTimer.textContent = String(Math.max(remaining, 0));
    }, 1000);
    state.timers.push(countdown);

    const trigger = setTimeout(() => {
      clearInterval(countdown);
      el.screenWait.classList.remove("is-stealth");
      if (state.mode === "call") {
        launchIncomingCall();
      } else {
        launchMessages();
      }
    }, delaySec * 1000);
    state.timers.push(trigger);
  }

  function launchIncomingCall() {
    const caller = el.whoInput.value.trim().slice(0, 40) || "Bilinmeyen";
    const sub = el.subInput.value.trim().slice(0, 28) || "Cep";

    el.callName.textContent = caller;
    el.callInitial.textContent = caller.charAt(0).toUpperCase() || "?";
    el.callSub.textContent = sub + " · arıyor…";

    el.callRipple.classList.remove("is-paused");
    el.inCallGrid.classList.add("is-hidden");
    el.dtmfPad.classList.add("is-hidden");
    el.dtmfDisplay.textContent = "";
    el.acceptWrap.classList.remove("is-hidden");
    el.callActions.classList.remove("is-single");
    el.declineLabel.textContent = "Reddet";

    el.inCallGrid.querySelectorAll(".call-tool-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");
    });

    showScreen(el.screenCall);
    startRinging();
  }

  function answerCall() {
    stopRinging();
    el.callRipple.classList.add("is-paused");
    el.acceptWrap.classList.add("is-hidden");
    el.callActions.classList.add("is-single");
    el.declineLabel.textContent = "Bitir";
    el.inCallGrid.classList.remove("is-hidden");

    let elapsed = 0;
    el.callSub.textContent = "00:00";
    state.talkInterval = setInterval(() => {
      elapsed += 1;
      const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const secs = String(elapsed % 60).padStart(2, "0");
      el.callSub.textContent = mins + ":" + secs;
    }, 1000);
  }

  function createNotificationNode(sender, text, timeStr) {
    const card = document.createElement("article");
    card.className = "noti-card";

    const top = document.createElement("div");
    top.className = "noti-top";

    const senderWrap = document.createElement("div");
    senderWrap.className = "noti-sender-wrap";

    const badge = document.createElement("span");
    badge.className = "noti-badge";
    badge.textContent = sender.charAt(0).toUpperCase() || "M";

    const senderEl = document.createElement("span");
    senderEl.className = "noti-sender";
    senderEl.textContent = sender;

    const timeEl = document.createElement("span");
    timeEl.className = "noti-time";
    timeEl.textContent = timeStr;

    const body = document.createElement("p");
    body.className = "noti-body";
    body.textContent = text;

    senderWrap.appendChild(badge);
    senderWrap.appendChild(senderEl);
    top.appendChild(senderWrap);
    top.appendChild(timeEl);
    card.appendChild(top);
    card.appendChild(body);
    return card;
  }

  function launchMessages() {
    updateClocks();
    el.notiStack.replaceChildren();
    showScreen(el.screenHome);

    const count = clampInt(el.msgCountInput.value, 1, 10, 3);
    const gap = clampInt(el.msgGapInput.value, 1, 60, 3);
    const sender = el.whoInput.value.trim().slice(0, 40) || "Bilinmeyen";

    const fallbackMsgs = [
      "Neredesin? Hemen döner misin?",
      "Mesajımı görmedin mi?",
      "Acil beni ara!",
      "Bekliyorum, önemli."
    ];
    const customLines = el.msgTextInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    for (let i = 0; i < count; i++) {
      const text =
        customLines[i] ||
        (customLines.length > 0
          ? fallbackMsgs[i % fallbackMsgs.length]
          : fallbackMsgs[i % fallbackMsgs.length]);

      const tId = setTimeout(() => {
        const node = createNotificationNode(sender, text, formatClock(new Date()));
        el.notiStack.prepend(node);
        playNotificationSound();
      }, i * gap * 1000);
      state.timers.push(tId);
    }
  }

  function returnToSetup() {
    clearAllTimers();
    exitFullscreenSafe();
    showScreen(el.screenSetup);
  }

  // ---------- 9. Ses Testi ----------
  function stopTestSound() {
    if (!state.isTestingSound) return;
    stopRinging();
    state.isTestingSound = false;
    el.testSoundBtn.textContent = "▶ Sesi Test Et";
  }

  function toggleTestSound() {
    if (state.isTestingSound) {
      stopTestSound();
      return;
    }
    ensureAudioContext();
    state.isTestingSound = true;
    el.testSoundBtn.textContent = "■ Durdur";

    if (state.mode === "call") {
      startRinging();
      const autoStop = setTimeout(stopTestSound, 3000);
      state.timers.push(autoStop);
    } else {
      playNotificationSound();
      const autoStop = setTimeout(stopTestSound, 1200);
      state.timers.push(autoStop);
    }
  }

  // ---------- 10. Mod & Arayüz Olayları ----------
  function setMode(mode, persist = true) {
    state.mode = mode;
    const isCall = mode === "call";

    el.tabCall.classList.toggle("is-selected", isCall);
    el.tabCall.setAttribute("aria-selected", String(isCall));
    el.tabMsg.classList.toggle("is-selected", !isCall);
    el.tabMsg.setAttribute("aria-selected", String(!isCall));

    el.msgOptions.classList.toggle("is-hidden", isCall);
    el.toneLabel.textContent = isCall ? "Zil Sesi" : "Bildirim Sesi";
    stopTestSound();
    if (persist) savePrefs();
  }

  function setupPWAInstall() {
    if (isStandalone()) return;

    // Android Chrome / Edge gerçek yükleme istemi
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      state.deferredPrompt = e;
      el.installTitle.textContent = "Telefonuna Yükle (Çevrimdışı)";
      el.installDesc.textContent = "İnternet olmadan tek dokunuşla açmak için ana ekrana ekle.";
      el.installActionBtn.classList.remove("is-hidden");
      el.installCard.classList.remove("is-hidden");
    });

    window.addEventListener("appinstalled", () => {
      state.deferredPrompt = null;
      el.installCard.classList.add("is-hidden");
      showToast("Uygulama ana ekranına eklendi!");
    });

    // iOS Safari için akıllı kısayol rehberi
    if (state.detectedOS === "ios") {
      el.installTitle.textContent = "iPhone Ana Ekranına Ekle";
      el.installDesc.textContent = "Safari alt menüden Paylaş simgesine dokun ve 'Ana Ekrana Ekle'yi seç.";
      el.installActionBtn.classList.add("is-hidden");
      el.installCard.classList.remove("is-hidden");
    }

    el.installActionBtn.addEventListener("click", async () => {
      if (!state.deferredPrompt) return;
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      el.installCard.classList.add("is-hidden");
    });

    el.dismissInstallBtn.addEventListener("click", () => {
      el.installCard.classList.add("is-hidden");
    });
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then(() => {
            if (el.offlineStatusDesktop) {
              el.offlineStatusDesktop.textContent = "Çevrimdışı Önbellek Aktif";
            }
          })
          .catch(() => {
            // file:// protokolünde test edilirken SW çalışmaz; HTTPS/GitHub Pages'te çalışır
          });
      });
    }
  }

  function openLegalModal() {
    el.legalModal.classList.remove("is-hidden");
  }

  function closeLegalModal() {
    el.legalModal.classList.add("is-hidden");
  }

  async function wipeAllLocalData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // yoksay
    }
    await deleteCustomAudio();
    if ("caches" in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // yoksay
      }
    }
    el.whoInput.value = "Annem";
    el.subInput.value = "Cep";
    el.delayInput.value = "5";
    el.osStyleSelect.value = "auto";
    el.toneSelect.value = "auto";
    applyOSTheme();
    updateCustomAudioUI();
    closeLegalModal();
    showToast("Tüm yerel veriler cihazından silindi.");
  }

  // ---------- 11. Olay Dinleyicileri ----------
  function bindEvents() {
    el.tabCall.addEventListener("click", () => setMode("call"));
    el.tabMsg.addEventListener("click", () => setMode("msg"));

    // Hızlı şablonlar
    el.presetRow.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      el.presetRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      el.whoInput.value = chip.dataset.who || "Annem";
      el.subInput.value = chip.dataset.sub || "Cep";
      if (chip.dataset.msg) {
        el.msgTextInput.value = chip.dataset.msg + "\nAcil döner misin?";
      }
      savePrefs();
    });

    // Hızlı süre seçiciler
    el.quickDelays.addEventListener("click", (e) => {
      const btn = e.target.closest(".mini-pill");
      if (!btn) return;
      el.quickDelays.querySelectorAll(".mini-pill").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      el.delayInput.value = btn.dataset.sec || "5";
      savePrefs();
    });

    el.delayInput.addEventListener("input", () => {
      el.quickDelays.querySelectorAll(".mini-pill").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.sec === el.delayInput.value);
      });
      savePrefs();
    });

    [el.whoInput, el.subInput, el.msgCountInput, el.msgGapInput, el.msgTextInput].forEach((inp) => {
      inp.addEventListener("change", savePrefs);
    });

    el.osStyleSelect.addEventListener("change", () => {
      applyOSTheme();
      savePrefs();
    });

    el.toneSelect.addEventListener("change", () => {
      stopTestSound();
      updateCustomAudioUI();
      savePrefs();
    });

    el.testSoundBtn.addEventListener("click", toggleTestSound);

    // Özel ses dosyası yükleme (güvenlik + boyut kontrolü)
    el.customAudioInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;

      if (!file.type || !file.type.startsWith("audio/")) {
        showToast("Lütfen geçerli bir ses dosyası (.mp3, .wav, .m4a) seç.");
        return;
      }
      if (file.size > MAX_AUDIO_BYTES) {
        showToast("Ses dosyası en fazla 15 MB olabilir.");
        return;
      }

      if (state.customAudioUrl) {
        URL.revokeObjectURL(state.customAudioUrl);
        state.customAudioUrl = null;
      }
      state.customAudioBlob = file;
      state.customAudioName = file.name.slice(0, 60);

      try {
        await saveCustomAudio(file);
        showToast("Özel ses cihazına kaydedildi.");
      } catch {
        showToast("Ses bu oturum için yüklendi.");
      }
      updateCustomAudioUI();
    });

    el.clearAudioBtn.addEventListener("click", async () => {
      stopTestSound();
      await deleteCustomAudio();
      showToast("Özel ses kaldırıldı.");
    });

    // Simülasyon başlat / iptal / arama kontrolleri
    el.startBtn.addEventListener("click", startSimulation);
    el.cancelWaitBtn.addEventListener("click", returnToSetup);

    // Gizli bekleme ekranında çift dokunma ile iptal
    el.screenWait.addEventListener("click", (e) => {
      if (e.target === el.cancelWaitBtn) return;
      const now = Date.now();
      if (now - state.lastTapTime < 380) {
        returnToSetup();
      }
      state.lastTapTime = now;
    });

    el.acceptBtn.addEventListener("click", answerCall);
    el.declineBtn.addEventListener("click", returnToSetup);
    el.homeBackBtn.addEventListener("click", returnToSetup);

    // Arama içi araç butonları (Sessiz, Klavye, Hoparlör vb.)
    el.inCallGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".call-tool-btn");
      if (!btn) return;
      const tool = btn.dataset.tool;
      if (tool === "keypad") {
        el.inCallGrid.classList.add("is-hidden");
        el.dtmfPad.classList.remove("is-hidden");
        return;
      }
      const pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!pressed));
    });

    el.dtmfKeys.addEventListener("click", (e) => {
      const keyBtn = e.target.closest(".dtmf-key");
      if (!keyBtn) return;
      const k = keyBtn.dataset.k || "";
      playDtmfTone(k);
      if (el.dtmfDisplay.textContent.length < 16) {
        el.dtmfDisplay.textContent += k;
      }
    });

    el.hideDtmfBtn.addEventListener("click", () => {
      el.dtmfPad.classList.add("is-hidden");
      el.inCallGrid.classList.remove("is-hidden");
    });

    // KVKK & Yasal Modal
    [el.openLegalBtn, el.openLegalInline, el.openLegalDesktop].forEach((btn) => {
      if (btn) btn.addEventListener("click", openLegalModal);
    });
    el.closeLegalBtn.addEventListener("click", closeLegalModal);
    el.acceptLegalBtn.addEventListener("click", closeLegalModal);
    el.wipeDataBtn.addEventListener("click", wipeAllLocalData);
    el.legalModal.addEventListener("click", (e) => {
      if (e.target === el.legalModal) closeLegalModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !el.legalModal.classList.contains("is-hidden")) {
        closeLegalModal();
      }
    });
  }

  // ---------- 12. Başlatma ----------
  async function init() {
    loadPrefs();
    applyOSTheme();
    updateClocks();
    setInterval(updateClocks, 1000);

    const savedAudio = await loadCustomAudio();
    if (savedAudio && savedAudio.blob) {
      state.customAudioBlob = savedAudio.blob;
      state.customAudioName = savedAudio.name || "Özel Ses";
    }
    updateCustomAudioUI();

    bindEvents();
    setupPWAInstall();
    registerServiceWorker();
  }

  init();
})();
