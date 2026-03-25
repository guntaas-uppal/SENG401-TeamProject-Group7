// src/utils/audio.js
// client/public/audio/ needs:
//   home.mp3  household.mp3  city.mp3  country.mp3  click.mp3  achievement.mp3

const TRACKS = {
  home:      "/audio/home.mp3",
  household: "/audio/household.mp3",
  city:      "/audio/city.mp3",
  country:   "/audio/country.mp3",
};

// ── State ─────────────────────────────────────────────────────
let _bg           = null;
let _currentTrack = null;
let _unlocked     = false;
let _fadeTimer    = null;   // track active fade so we can cancel it

// Volume levels — persisted across page loads
let _musicVol = parseFloat(localStorage.getItem("ecosim_music_vol") ?? "0.4");
let _sfxVol   = parseFloat(localStorage.getItem("ecosim_sfx_vol")   ?? "0.6");

// ── Background music element ──────────────────────────────────
function _getBg() {
  if (!_bg) {
    _bg = new Audio();
    _bg.loop   = true;
    _bg.volume = _musicVol;
  }
  return _bg;
}

// ── Fade — cancels any in-progress fade before starting a new one ──
function _fade(audioEl, targetVol, durationMs, onDone) {
  if (_fadeTimer) { clearInterval(_fadeTimer); _fadeTimer = null; }
  const STEPS    = 20;
  const interval = durationMs / STEPS;
  const startVol = audioEl.volume;
  const delta    = (targetVol - startVol) / STEPS;
  let   step     = 0;
  _fadeTimer = setInterval(() => {
    step++;
    audioEl.volume = Math.max(0, Math.min(1, startVol + delta * step));
    if (step >= STEPS) {
      clearInterval(_fadeTimer);
      _fadeTimer = null;
      audioEl.volume = targetVol;
      onDone?.();
    }
  }, interval);
}

// ── SFX pool — pre-create real Audio elements so they are
//    already "trusted" by the browser after the first gesture ──
const SFX_POOL_SIZE = 4;
const _sfxPools = {};

function _getSfxPool(src) {
  if (!_sfxPools[src]) {
    _sfxPools[src] = Array.from({ length: SFX_POOL_SIZE }, () => {
      const el = new Audio(src);
      el.volume = _sfxVol;
      return el;
    });
  }
  return _sfxPools[src];
}

// Round-robin index per pool
const _sfxIdx = {};

function _playSfx(src) {
  const pool = _getSfxPool(src);
  const i    = (_sfxIdx[src] ?? 0) % SFX_POOL_SIZE;
  _sfxIdx[src] = i + 1;
  const el = pool[i];
  el.volume = _sfxVol;       // always use latest volume
  el.currentTime = 0;
  el.play().catch(() => {});
}

// ── Unlock on first gesture ───────────────────────────────────
// "Warm up" all pool elements so they are pre-approved by the browser.
// We do this by calling play() then immediately pause() on each one.
function _warmUp(el) {
  const p = el.play();
  if (p) p.then(() => el.pause()).catch(() => {});
}

function _unlockAudio() {
  if (_unlocked) return;
  _unlocked = true;

  // Warm up every SFX pool element
  Object.values(_sfxPools).forEach(pool => pool.forEach(_warmUp));

  // Start background music if a track is pending
  const bg = _getBg();
  if (bg.src && bg.paused) bg.play().catch(() => {});

  document.removeEventListener("click",   _unlockAudio);
  document.removeEventListener("keydown", _unlockAudio);
}
document.addEventListener("click",   _unlockAudio);
document.addEventListener("keydown", _unlockAudio);

// ── Pre-load SFX pools immediately so they exist before first gesture ──
_getSfxPool("/audio/click.mp3");
_getSfxPool("/audio/achievement.mp3");

// ── Public API ────────────────────────────────────────────────
export const audio = {

  // Play background music for a scene — crossfades if switching tracks
  playBg(scene) {
    const src = TRACKS[scene];
    if (!src || _currentTrack === scene) return;
    _currentTrack = scene;
    const bg = _getBg();

    _fade(bg, 0, 400, () => {
      bg.src = src;
      bg.load();
      bg.volume = 0;
      if (_unlocked) bg.play().catch(() => {});
      // Fade in to the CURRENT _musicVol (not a stale snapshot)
      _fade(bg, _musicVol, 600);
    });
  },

  stopBg() {
    _fade(_getBg(), 0, 500, () => {
      _getBg().pause();
      _currentTrack = null;
    });
  },

  // SFX — uses pool so rapid clicks don't cut each other,
  // and music volume has zero effect on SFX volume
  playClick() {
    _playSfx("/audio/click.mp3");
  },

  playAchievement() {
    _playSfx("/audio/achievement.mp3");
  },

  // ── Volume getters / setters ──────────────────────────────

  getMusicVol() { return _musicVol; },
  getSfxVol()   { return _sfxVol; },

  setMusicVol(v) {
    _musicVol = Math.max(0, Math.min(1, v));
    localStorage.setItem("ecosim_music_vol", String(_musicVol));
    // Cancel any in-progress fade and apply immediately
    if (_fadeTimer) { clearInterval(_fadeTimer); _fadeTimer = null; }
    if (_bg) _bg.volume = _musicVol;
  },

  setSfxVol(v) {
    _sfxVol = Math.max(0, Math.min(1, v));
    localStorage.setItem("ecosim_sfx_vol", String(_sfxVol));
    // Update all pool elements so next play() picks up the new volume
    Object.values(_sfxPools).forEach(pool =>
      pool.forEach(el => { el.volume = _sfxVol; })
    );
  },
};