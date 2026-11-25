"use strict";

(() => {
  const $ = (id) => document.getElementById(id);

  // ---------- Sabitler & Güvenlik Sınırları ----------
  const STORAGE_KEY = "kurtarbeni_prefs_v1";
  const DB_NAME = "kurtarbeni_audio_db";
  const DB_STORE = "ringtones";
  const KEY_AUDIO = "user_tone";
  const KEY_WALLPAPER = "user_wallpaper";
  const MAX_MEDIA_BYTES = 15 * 1024 * 1024; // 15 MB
  const SAMPLE_RATE = 22050;

  // ---------- Uygulama Durumu ----------
  const state = {
    mode: "call", // "call" | "msg"
    detectedOS: detectOS(), // "ios" | "android" | "desktop"
    activeOS: "android", // "ios" | "android"
    timers: [],
    audioCtx: null,
    player: new Audio(),
    notiPlayer: new Audio(),
    silentWavUrl: null,
    synthCache: Object.create(null),
    vibeInterval: null,
    talkInterval: null,
    wakeLock: null,
    isWaiting: false,
    targetEndTime: 0,
    customAudioBlob: null,
    customAudioName: "",
    customAudioUrl: null,
    wallpaperBlob: null,
    wallpaperName: "",
    wallpaperUrl: null,
    deferredPrompt: null,
    lastTapTime: 0,
    isTestingSound: false
  };

  state.player.preload = "auto";
  state.notiPlayer.preload = "auto";

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
    wallpaperInput: $("wallpaperInput"),
    clearWallpaperBtn: $("clearWallpaperBtn"),
    wpThumb: $("wpThumb"),
    wallpaperStatus: $("wallpaperStatus"),
    wpBlurCallToggle: $("wpBlurCallToggle"),
    homeBgImg: $("homeBgImg"),
    homeBgScrim: $("homeBgScrim"),
    callBgImg: $("callBgImg"),
    callBgScrim: $("callBgScrim"),
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
    tipsModal: $("tipsModal"),
    openTipsBtn: $("openTipsBtn"),
    openTipsBanner: $("openTipsBanner"),
    openTipsDesktop: $("openTipsDesktop"),
    openWallpaperTipBtn: $("openWallpaperTipBtn"),
    openRingtoneGuideBtn: $("openRingtoneGuideBtn"),
    closeTipsBtn: $("closeTipsBtn"),
    acceptTipsBtn: $("acceptTipsBtn"),
    ringtoneGuideList: $("ringtoneGuideList"),
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
    const platform =
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      "";
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
        tone: el.toneSelect.value,
        wpBlurCall: Boolean(el.wpBlurCallToggle && el.wpBlurCallToggle.checked)
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
      if (el.wpBlurCallToggle && typeof data.wpBlurCall === "boolean") {
        el.wpBlurCallToggle.checked = data.wpBlurCall;
      }
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // yoksay
      }
    }
  }

  // ---------- 5. IndexedDB (Cihaz İçi Özel Ses & Duvar Kağıdı) ----------
  function openMediaDB() {
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

  async function saveMediaItem(key, file) {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({ blob: file, name: file.name }, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadMediaItem(key) {
    try {
      const db = await openMediaDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readonly");
        const req = tx.objectStore(DB_STORE).get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async function deleteMediaItem(key) {
    try {
      const db = await openMediaDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // yoksay
    }
  }

  async function deleteCustomAudio() {
    if (state.customAudioUrl) {
      URL.revokeObjectURL(state.customAudioUrl);
      state.customAudioUrl = null;
    }
    state.customAudioBlob = null;
    state.customAudioName = "";
    await deleteMediaItem(KEY_AUDIO);
    updateCustomAudioUI();
  }

  async function deleteCustomWallpaper() {
    if (state.wallpaperUrl) {
      URL.revokeObjectURL(state.wallpaperUrl);
      state.wallpaperUrl = null;
    }
    state.wallpaperBlob = null;
    state.wallpaperName = "";
    await deleteMediaItem(KEY_WALLPAPER);
    applyWallpaperUI();
  }

  function updateCustomAudioUI() {
    const showBox = el.toneSelect.value === "custom";
    el.customAudioBox.classList.toggle("is-hidden", !showBox);

    if (state.customAudioBlob) {
      el.customAudioStatus.textContent =
        "Yüklü ses: " + state.customAudioName + " (yalnızca bu cihazda saklanır)";
      el.clearAudioBtn.classList.remove("is-hidden");
    } else {
      el.customAudioStatus.textContent =
        "Kendi telefonunun zil sesini seçersen yalnızca cihazında (çevrimdışı) saklanır.";
      el.clearAudioBtn.classList.add("is-hidden");
    }
  }

  function applyWallpaperUI() {
    const hasWp = Boolean(state.wallpaperBlob);
    const useOnCall = Boolean(el.wpBlurCallToggle && el.wpBlurCallToggle.checked);

    if (hasWp) {
      if (!state.wallpaperUrl) {
        state.wallpaperUrl = URL.createObjectURL(state.wallpaperBlob);
      }
      el.wpThumb.src = state.wallpaperUrl;
      el.wpThumb.classList.remove("is-hidden");
      el.clearWallpaperBtn.classList.remove("is-hidden");
      el.wallpaperStatus.textContent =
        "Aktif duvar kağıdı: " + state.wallpaperName + " (yalnızca bu cihazda)";

      el.homeBgImg.src = state.wallpaperUrl;
      el.homeBgImg.classList.remove("is-hidden");
      el.homeBgScrim.classList.remove("is-hidden");

      if (useOnCall) {
        el.callBgImg.src = state.wallpaperUrl;
        el.callBgImg.classList.remove("is-hidden");
        el.callBgScrim.classList.remove("is-hidden");
      } else {
        el.callBgImg.removeAttribute("src");
        el.callBgImg.classList.add("is-hidden");
        el.callBgScrim.classList.add("is-hidden");
      }
    } else {
      el.wpThumb.removeAttribute("src");
      el.wpThumb.classList.add("is-hidden");
      el.clearWallpaperBtn.classList.add("is-hidden");
      el.wallpaperStatus.textContent =
        "Kendi duvar kağıdını veya boş ana ekran SS'ini seç; yalnızca bu cihazda saklanır.";

      el.homeBgImg.removeAttribute("src");
      el.homeBgImg.classList.add("is-hidden");
      el.homeBgScrim.classList.add("is-hidden");
      el.callBgImg.removeAttribute("src");
      el.callBgImg.classList.add("is-hidden");
      el.callBgScrim.classList.add("is-hidden");
    }
  }

  // ---------- 6. Stüdyo DSP Ses Sentezleyici (PCM WAV Blob Motoru) ----------
  function encodeWavBlobUrl(samples, sampleRate) {
    const len = samples.length;
    const buffer = new ArrayBuffer(44 + len * 2);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + len * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, len * 2, true);

    let offset = 44;
    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  }

  function getSilentWavUrl() {
    if (!state.silentWavUrl) {
      const silent = new Float32Array(8000);
      state.silentWavUrl = encodeWavBlobUrl(silent, 8000);
    }
    return state.silentWavUrl;
  }

  function applyStudioReverb(buf, mix) {
    const n = buf.length;
    const delays = [
      Math.floor(SAMPLE_RATE * 0.0297),
      Math.floor(SAMPLE_RATE * 0.0371),
      Math.floor(SAMPLE_RATE * 0.0411),
      Math.floor(SAMPLE_RATE * 0.0437)
    ];
    const gains = [0.68, 0.64, 0.6, 0.56];
    const wet = new Float32Array(n);

    for (let c = 0; c < delays.length; c++) {
      const d = delays[c];
      const g = gains[c];
      const y = new Float32Array(n);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const prev = i >= d ? y[i - d] : 0;
        lp = lp * 0.36 + prev * 0.64;
        const val = buf[i] + lp * g;
        y[i] = val;
        wet[i] += val * 0.25;
      }
    }

    const out = new Float32Array(n);
    const dry = 1 - mix;
    for (let i = 0; i < n; i++) {
      out[i] = buf[i] * dry + wet[i] * mix;
    }
    return out;
  }

  function masterNormalize(buf, targetPeak) {
    const n = buf.length;
    let peak = 1e-6;
    for (let i = 0; i < n; i++) {
      const a = Math.abs(buf[i]);
      if (a > peak) peak = a;
    }
    const drive = 1.32 / peak;
    const out = new Float32Array(n);
    let peak2 = 1e-6;
    for (let i = 0; i < n; i++) {
      const v = Math.tanh(buf[i] * drive);
      out[i] = v;
      const a = Math.abs(v);
      if (a > peak2) peak2 = a;
    }
    const gain = targetPeak / peak2;
    const fade = Math.min(Math.floor(SAMPLE_RATE * 0.015), Math.floor(n / 2));
    for (let i = 0; i < n; i++) {
      out[i] *= gain;
    }
    for (let i = 0; i < fade; i++) {
      const w = i / fade;
      out[i] *= w;
      out[n - 1 - i] *= w;
    }
    return out;
  }

  function addMarimbaNote(buf, freq, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    const decay = durSec * 0.34;
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const env = (1 - Math.exp(-t / 0.0035)) * Math.exp(-t / decay);
      const strike = Math.sin(twoPi * freq * 3.98 * t) * Math.exp(-t / 0.022) * 0.3;
      const shimmer = Math.sin(twoPi * freq * 2.0 * t) * Math.exp(-t / 0.13) * 0.24;
      const body =
        Math.sin(twoPi * freq * t) * 0.72 +
        Math.sin(twoPi * freq * 1.0024 * t) * 0.22;
      buf[idx] += (body + shimmer + strike) * env * amp;
    }
  }

  function addElectricPianoNote(buf, freq, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const env = (1 - Math.exp(-t / 0.006)) * Math.exp(-t / (durSec * 0.48));
      const fmIndex = 1.6 * Math.exp(-t / 0.09);
      const tine = Math.sin(twoPi * freq * t + fmIndex * Math.sin(twoPi * freq * 2.0 * t));
      const warmth = Math.sin(twoPi * freq * 0.5 * t) * 0.14 * Math.exp(-t / 0.25);
      const chorus = Math.sin(twoPi * freq * 1.003 * t) * 0.22;
      buf[idx] += (tine * 0.7 + chorus + warmth) * env * amp;
    }
  }

  function addSoftPad(buf, freqs, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const attack = Math.min(1, t / 0.12);
      const release = Math.max(0, 1 - Math.max(0, t - (durSec - 0.35)) / 0.35);
      const env = attack * release * amp;
      let sum = 0;
      for (let f = 0; f < freqs.length; f++) {
        sum += Math.sin(twoPi * freqs[f] * t);
      }
      buf[idx] += (sum / freqs.length) * env;
    }
  }

  function addHarpPluck(buf, freq, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const env = (1 - Math.exp(-t / 0.0025)) * Math.exp(-t / (durSec * 0.42));
      const h1 = Math.sin(twoPi * freq * t) * 0.65;
      const h2 = Math.sin(twoPi * freq * 2.0 * t) * Math.exp(-t / 0.22) * 0.28;
      const h3 = Math.sin(twoPi * freq * 3.0 * t) * Math.exp(-t / 0.09) * 0.14;
      const h4 = Math.sin(twoPi * freq * 4.01 * t) * Math.exp(-t / 0.04) * 0.07;
      buf[idx] += (h1 + h2 + h3 + h4) * env * amp;
    }
  }

  function addClassicBellBurst(buf, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    const partials = [
      [1180, 0.5],
      [1495, 0.45],
      [2390, 0.28],
      [3120, 0.18],
      [4280, 0.1]
    ];
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const gate =
        Math.min(1, t / 0.015) *
        Math.max(0, 1 - Math.max(0, t - (durSec - 0.05)) / 0.05);
      const clapper = 0.42 + 0.58 * Math.pow(Math.abs(Math.sin(Math.PI * 19 * t)), 0.7);
      let bell = 0;
      for (let p = 0; p < partials.length; p++) {
        bell += Math.sin(twoPi * partials[p][0] * t) * partials[p][1];
      }
      buf[idx] += bell * clapper * gate * amp;
    }
  }

  function buildRingtoneUrl(style) {
    const cacheKey = "ring_" + style;
    if (state.synthCache[cacheKey]) return state.synthCache[cacheKey];

    let buf;
    if (style === "ios_melody") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 3.1));
      addSoftPad(buf, [207.65, 261.63, 311.13], 0.02, 1.0, 0.12);
      addSoftPad(buf, [174.61, 220.0, 261.63], 1.08, 1.15, 0.12);
      const phrase = [
        [523.25, 0.03, 0.52, 0.5],
        [622.25, 0.19, 0.52, 0.54],
        [830.61, 0.35, 0.68, 0.62],
        [698.46, 0.53, 0.56, 0.52],
        [622.25, 0.71, 0.72, 0.48],
        [415.3, 1.08, 0.52, 0.46],
        [523.25, 1.24, 0.54, 0.52],
        [698.46, 1.4, 0.74, 0.6],
        [622.25, 1.59, 0.64, 0.52],
        [523.25, 1.78, 0.92, 0.48]
      ];
      phrase.forEach(([f, s, d, a]) => addMarimbaNote(buf, f, s, d, a));
      buf = applyStudioReverb(buf, 0.3);
    } else if (style === "android_melody") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 3.2));
      addSoftPad(buf, [293.66, 349.23, 440.0, 523.25], 0.02, 1.1, 0.14);
      addSoftPad(buf, [261.63, 329.63, 392.0, 493.88], 1.15, 1.25, 0.14);
      const notes = [
        [587.33, 0.03, 0.6, 0.52],
        [659.25, 0.21, 0.55, 0.5],
        [880.0, 0.39, 0.78, 0.6],
        [783.99, 0.62, 0.62, 0.5],
        [659.25, 0.82, 0.75, 0.46],
        [523.25, 1.16, 0.55, 0.48],
        [659.25, 1.34, 0.58, 0.52],
        [783.99, 1.52, 0.78, 0.58],
        [987.77, 1.74, 0.95, 0.54]
      ];
      notes.forEach(([f, s, d, a]) => addElectricPianoNote(buf, f, s, d, a));
      buf = applyStudioReverb(buf, 0.32);
    } else if (style === "soft") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 3.2));
      const arp = [
        [329.63, 0.04, 0.9, 0.42],
        [392.0, 0.2, 0.9, 0.44],
        [493.88, 0.36, 0.95, 0.48],
        [659.25, 0.52, 1.1, 0.52],
        [587.33, 0.78, 0.9, 0.44],
        [493.88, 0.98, 0.95, 0.42],
        [392.0, 1.34, 0.95, 0.42],
        [493.88, 1.5, 0.95, 0.46],
        [587.33, 1.66, 1.15, 0.5]
      ];
      arp.forEach(([f, s, d, a]) => addHarpPluck(buf, f, s, d, a));
      buf = applyStudioReverb(buf, 0.36);
    } else {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 2.8));
      addClassicBellBurst(buf, 0.05, 0.58, 0.55);
      addClassicBellBurst(buf, 0.78, 0.58, 0.55);
      buf = applyStudioReverb(buf, 0.2);
    }

    const mastered = masterNormalize(buf, 0.88);
    const url = encodeWavBlobUrl(mastered, SAMPLE_RATE);
    state.synthCache[cacheKey] = url;
    return url;
  }

  function buildNotificationUrl(style) {
    const cacheKey = "noti_" + style;
    if (state.synthCache[cacheKey]) return state.synthCache[cacheKey];

    let buf;
    if (style === "ios_melody") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 0.95));
      addMarimbaNote(buf, 783.99, 0.01, 0.36, 0.52);
      addMarimbaNote(buf, 1046.5, 0.11, 0.42, 0.56);
      addMarimbaNote(buf, 1174.66, 0.22, 0.56, 0.6);
      buf = applyStudioReverb(buf, 0.26);
    } else if (style === "soft") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 0.75));
      addHarpPluck(buf, 659.25, 0.01, 0.45, 0.48);
      addHarpPluck(buf, 987.77, 0.1, 0.55, 0.52);
      buf = applyStudioReverb(buf, 0.3);
    } else if (style === "classic") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 0.75));
      addClassicBellBurst(buf, 0.02, 0.14, 0.5);
      addClassicBellBurst(buf, 0.2, 0.16, 0.5);
      buf = applyStudioReverb(buf, 0.18);
    } else {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 0.85));
      addElectricPianoNote(buf, 880.0, 0.01, 0.38, 0.52);
      addElectricPianoNote(buf, 1318.51, 0.11, 0.58, 0.58);
      buf = applyStudioReverb(buf, 0.28);
    }

    const mastered = masterNormalize(buf, 0.86);
    const url = encodeWavBlobUrl(mastered, SAMPLE_RATE);
    state.synthCache[cacheKey] = url;
    return url;
  }

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
      // iOS Safari desteklemez, yoksay
    }
  }

  function startSilentKeepAlive() {
    try {
      const player = state.player;
      player.pause();
      player.src = getSilentWavUrl();
      player.loop = true;
      player.volume = 0.01;
      player.play().catch(() => {});
    } catch {
      // yoksay
    }
  }

  function startRinging() {
    stopRinging();
    const style = resolveToneStyle();

    triggerVibrate([700, 350, 700, 350, 700]);
    state.vibeInterval = setInterval(() => {
      triggerVibrate([700, 350, 700]);
    }, 2600);

    if (style === "none") {
      state.player.pause();
      return;
    }

    let url;
    if (style === "custom" && state.customAudioBlob) {
      if (!state.customAudioUrl) {
        state.customAudioUrl = URL.createObjectURL(state.customAudioBlob);
      }
      url = state.customAudioUrl;
    } else {
      url = buildRingtoneUrl(style);
    }

    const player = state.player;
    player.pause();
    player.src = url;
    player.loop = true;
    player.volume = 1.0;
    player.currentTime = 0;
    player.play().catch(() => {});
  }

  function stopRinging() {
    clearInterval(state.vibeInterval);
    state.vibeInterval = null;
    try {
      state.player.pause();
      state.player.currentTime = 0;
    } catch {
      // yoksay
    }
    triggerVibrate(0);
  }

  function playNotificationSound() {
    const style = resolveToneStyle();
    triggerVibrate([180, 90, 180]);
    if (style === "none") return;

    let url;
    let clipMs = 0;
    if (style === "custom" && state.customAudioBlob) {
      if (!state.customAudioUrl) {
        state.customAudioUrl = URL.createObjectURL(state.customAudioBlob);
      }
      url = state.customAudioUrl;
      clipMs = 2200;
    } else {
      url = buildNotificationUrl(style);
    }

    const p = state.notiPlayer;
    p.pause();
    p.src = url;
    p.loop = false;
    p.volume = 1.0;
    p.currentTime = 0;
    p.play().catch(() => {});
    if (clipMs > 0) {
      state.timers.push(setTimeout(() => p.pause(), clipMs));
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
    pair.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.11, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  // ---------- 7. Wake Lock & Tam Ekran ----------
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        state.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch {
      // yoksay
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
      // yoksay
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
    state.isWaiting = false;
    state.targetEndTime = 0;
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

  function triggerScheduledEvent() {
    if (!state.isWaiting) return;
    state.isWaiting = false;
    state.targetEndTime = 0;

    state.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    state.timers = [];
    el.screenWait.classList.remove("is-stealth");

    if (state.mode === "call") {
      launchIncomingCall();
    } else {
      launchMessages();
    }
  }

  function checkCountdownProgress() {
    if (!state.isWaiting) return;
    const msLeft = state.targetEndTime - Date.now();
    if (msLeft <= 0) {
      el.waitTimer.textContent = "0";
      triggerScheduledEvent();
    } else {
      el.waitTimer.textContent = String(Math.ceil(msLeft / 1000));
    }
  }

  function startSimulation() {
    stopTestSound();
    clearAllTimers();
    savePrefs();
    applyOSTheme();
    applyWallpaperUI();

    const resolved = resolveToneStyle();
    if (resolved !== "none" && resolved !== "custom") {
      if (state.mode === "call") {
        buildRingtoneUrl(resolved);
      } else {
        buildNotificationUrl(resolved);
      }
    }

    startSilentKeepAlive();
    ensureAudioContext();

    const delaySec = clampInt(el.delayInput.value, 1, 3600, 5);
    el.delayInput.value = String(delaySec);

    state.isWaiting = true;
    state.targetEndTime = Date.now() + delaySec * 1000;
    el.waitTimer.textContent = String(delaySec);
    el.screenWait.classList.remove("is-stealth");
    showScreen(el.screenWait);

    requestWakeLock();
    enterFullscreenIfMobile();

    if (delaySec >= 3) {
      state.timers.push(
        setTimeout(() => {
          if (state.isWaiting) el.screenWait.classList.add("is-stealth");
        }, 2000)
      );
    }

    const tick = setInterval(checkCountdownProgress, 250);
    state.timers.push(tick);
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
    state.player.pause();
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
      const text = customLines[i] || fallbackMsgs[i % fallbackMsgs.length];

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
    try {
      state.notiPlayer.pause();
      state.notiPlayer.currentTime = 0;
    } catch {
      // yoksay
    }
    state.isTestingSound = false;
    el.testSoundBtn.textContent = "▶ Sesi Test Et";
  }

  function toggleTestSound() {
    if (state.isTestingSound) {
      stopTestSound();
      return;
    }
    state.isTestingSound = true;
    el.testSoundBtn.textContent = "■ Durdur";

    if (state.mode === "call") {
      startRinging();
      const autoStop = setTimeout(stopTestSound, 3200);
      state.timers.push(autoStop);
    } else {
      playNotificationSound();
      const autoStop = setTimeout(stopTestSound, 1100);
      state.timers.push(autoStop);
    }
  }

  // ---------- 10. Pano Kopyalama (Güvenli) ----------
  async function copyTextSafe(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast("Arama metni kopyalandı: " + text);
        return;
      }
    } catch {
      // yedek yönteme geç
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.className = "sr-only";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("Arama metni kopyalandı.");
    } catch {
      showToast("Kopyalanamadı, metni manuel aratabilirsin.");
    }
    document.body.removeChild(ta);
  }

  // ---------- 11. Mod, PWA & Modallar ----------
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

    if (state.detectedOS === "ios") {
      el.installTitle.textContent = "iPhone Ana Ekranına Ekle";
      el.installDesc.textContent =
        "Safari alt menüden Paylaş simgesine dokun ve 'Ana Ekrana Ekle'yi seç.";
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
          .catch(() => {});
      });
    }
  }

  function openTipsModal() {
    el.tipsModal.classList.remove("is-hidden");
  }

  function closeTipsModal() {
    el.tipsModal.classList.add("is-hidden");
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
    await deleteCustomWallpaper();
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
    if (el.wpBlurCallToggle) el.wpBlurCallToggle.checked = true;
    applyOSTheme();
    updateCustomAudioUI();
    applyWallpaperUI();
    closeLegalModal();
    showToast("Tüm yerel veriler cihazından silindi.");
  }

  // ---------- 12. Olay Dinleyicileri ----------
  function bindEvents() {
    el.tabCall.addEventListener("click", () => setMode("call"));
    el.tabMsg.addEventListener("click", () => setMode("msg"));

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

    // Duvar kağıdı seçme / silme
    el.wallpaperInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;

      if (!file.type || !file.type.startsWith("image/")) {
        showToast("Lütfen geçerli bir görsel dosyası (.jpg, .png, .webp) seç.");
        return;
      }
      if (file.size > MAX_MEDIA_BYTES) {
        showToast("Görsel dosyası en fazla 15 MB olabilir.");
        return;
      }

      if (state.wallpaperUrl) {
        URL.revokeObjectURL(state.wallpaperUrl);
        state.wallpaperUrl = null;
      }
      state.wallpaperBlob = file;
      state.wallpaperName = file.name.slice(0, 60);

      try {
        await saveMediaItem(KEY_WALLPAPER, file);
        showToast("Arka plan yalnızca bu cihaza kaydedildi.");
      } catch {
        showToast("Arka plan bu oturum için yüklendi.");
      }
      applyWallpaperUI();
    });

    el.clearWallpaperBtn.addEventListener("click", async () => {
      await deleteCustomWallpaper();
      showToast("Arka plan varsayılana döndürüldü.");
    });

    el.wpBlurCallToggle.addEventListener("change", () => {
      applyWallpaperUI();
      savePrefs();
    });

    // Zil sesi seçme / test / özel ses
    el.toneSelect.addEventListener("change", () => {
      stopTestSound();
      updateCustomAudioUI();
      savePrefs();
    });

    el.testSoundBtn.addEventListener("click", toggleTestSound);

    el.customAudioInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;

      if (!file.type || !file.type.startsWith("audio/")) {
        showToast("Lütfen geçerli bir ses dosyası (.mp3, .wav, .m4a) seç.");
        return;
      }
      if (file.size > MAX_MEDIA_BYTES) {
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
        await saveMediaItem(KEY_AUDIO, file);
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

    // Simülasyon kontrolleri
    el.startBtn.addEventListener("click", startSimulation);
    el.cancelWaitBtn.addEventListener("click", returnToSetup);

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

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && state.isWaiting) {
        requestWakeLock();
        checkCountdownProgress();
      }
    });

    // Gerçekçilik Tüyoları Modalı
    [
      el.openTipsBtn,
      el.openTipsBanner,
      el.openTipsDesktop,
      el.openWallpaperTipBtn,
      el.openRingtoneGuideBtn
    ].forEach((btn) => {
      if (btn) btn.addEventListener("click", openTipsModal);
    });
    el.closeTipsBtn.addEventListener("click", closeTipsModal);
    el.acceptTipsBtn.addEventListener("click", closeTipsModal);
    el.tipsModal.addEventListener("click", (e) => {
      if (e.target === el.tipsModal) closeTipsModal();
    });

    el.ringtoneGuideList.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-pill");
      if (!btn || !btn.dataset.copy) return;
      copyTextSafe(btn.dataset.copy);
    });

    // KVKK Modalı
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
      if (e.key === "Escape") {
        if (!el.tipsModal.classList.contains("is-hidden")) closeTipsModal();
        if (!el.legalModal.classList.contains("is-hidden")) closeLegalModal();
      }
    });
  }

  // ---------- 13. Başlatma ----------
  async function init() {
    loadPrefs();
    applyOSTheme();
    updateClocks();
    setInterval(updateClocks, 1000);

    const [savedAudio, savedWp] = await Promise.all([
      loadMediaItem(KEY_AUDIO),
      loadMediaItem(KEY_WALLPAPER)
    ]);

    if (savedAudio && savedAudio.blob) {
      state.customAudioBlob = savedAudio.blob;
      state.customAudioName = savedAudio.name || "Özel Ses";
    }
    if (savedWp && savedWp.blob) {
      state.wallpaperBlob = savedWp.blob;
      state.wallpaperName = savedWp.name || "Duvar Kağıdı";
    }

    updateCustomAudioUI();
    applyWallpaperUI();

    bindEvents();
    setupPWAInstall();
    registerServiceWorker();
  }

  init();
})();
