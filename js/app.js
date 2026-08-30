'use strict';
/* ============================================================
   BINGO ÎN PREDICARE — Milwaukee 2026
   Vanilla JS (ES6), fără framework-uri sau dependențe externe.
   Toate datele sunt salvate local, pe dispozitiv (LocalStorage).
   ============================================================ */

/* ---------- 1. Datele cardului (din foaia Bingo Milwaukee 2026) ---------- */
const ACTIVITIES = [
  'Rugăciune înainte de predicare',
  'A răspuns cineva la ușă',
  'Nu era nimeni acasă',
  'Am citit un verset',
  'Am oferit literatură',
  'Am folosit jw.org',
  'Am vorbit despre tema congresului',
  'Mi-am încurajat partenerul',
  'Am făcut schimb de date de contact',
  'Conversație prietenoasă',
  'Alee lungă până la casă',
  'Am întâlnit un vecin afară',
  'Am fost invitat înăuntru',
  'Am văzut un animal de companie',
  'Cineva a spus: „Sunt ocupat”',
  'Am arătat un material video',
  'Am văzut o sonerie video',
  'Conversație frumoasă',
  'Vremea s-a schimbat brusc',
  'Am oferit o invitație la congres',
  'Am lucrat cu un delegat',
  'Am văzut o Biblie la ușă',
  'Am luat o scurtă pauză',
  'Am terminat teritoriul',
];
const FREE_SPACE_TEXT = 'SPAȚIU LIBER';
const CENTER_INDEX = 12; // poziția 12 (a treia din a treia linie) într-un grid 5x5 (0-24)
const APP_VERSION = '1.1.0';

/* ---------- 2. Chei LocalStorage ---------- */
const LS = {
  card: 'bingoPredicare.v1.card',           // ordinea celor 24 de activități pe grid
  marks: 'bingoPredicare.v1.marks',         // array de 25 boolean
  completedLines: 'bingoPredicare.v1.completedLines', // indecșii liniilor deja sărbătorite
  theme: 'bingoPredicare.v1.theme',         // 'light' | 'dark' | 'system'
  sound: 'bingoPredicare.v1.sound',         // 'on' | 'off'
  announce: 'bingoPredicare.v1.announce',   // 'on' | 'off'
  experiences: 'bingoPredicare.v1.experiences', // array {id, date, text}
};

/* ---------- 3. Liniile câștigătoare (rânduri, coloane, diagonale) ---------- */
function buildWinningLines() {
  const lines = [];
  for (let r = 0; r < 5; r++) lines.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines;
}
const WINNING_LINES = buildWinningLines();

/* ---------- 4. Utilitare ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* spațiu de stocare indisponibil — jocul continuă doar în sesiunea curentă */ }
}

/* ============================================================
   5. STARE — se încarcă din LocalStorage sau se generează nouă
   ============================================================ */
let state = {
  card: readJSON(LS.card, null),                 // array de 24 texte, în ordinea pozițiilor non-libere
  marks: readJSON(LS.marks, null),                // array de 25 boolean
  completedLines: readJSON(LS.completedLines, []),
  theme: localStorage.getItem(LS.theme) || 'system',
  sound: localStorage.getItem(LS.sound) !== 'off',
  announce: localStorage.getItem(LS.announce) !== 'off',
  experiences: readJSON(LS.experiences, []),
};

function generateNewCard() {
  state.card = shuffle(ACTIVITIES);
  state.marks = Array(25).fill(false);
  state.marks[CENTER_INDEX] = true;
  state.completedLines = [];
  persistCard();
}

if (!state.card || !state.marks || state.card.length !== 24 || state.marks.length !== 25) {
  generateNewCard();
}
// spațiul liber este mereu bifat, chiar dacă vine dintr-o stare veche
state.marks[CENTER_INDEX] = true;

function persistCard() {
  writeJSON(LS.card, state.card);
  writeJSON(LS.marks, state.marks);
  writeJSON(LS.completedLines, state.completedLines);
}

/* Textul de pe fiecare din cele 25 de căsuțe ale gridului */
function tileTextAt(gridIndex) {
  if (gridIndex === CENTER_INDEX) return FREE_SPACE_TEXT;
  const activityIndex = gridIndex < CENTER_INDEX ? gridIndex : gridIndex - 1;
  return state.card[activityIndex];
}

/* ============================================================
   6. SUNET — tonuri scurte generate cu Web Audio API (fără fișiere audio)
   ============================================================ */
let audioCtx = null;
function ensureAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}
function playTone(freq, durationMs, type = 'sine', startDelay = 0, gainPeak = 0.08) {
  if (!state.sound) return;
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = ctx.currentTime + startDelay;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}
function soundMark() { playTone(660, 110, 'triangle'); }
function soundUnmark() { playTone(320, 90, 'triangle'); }
function soundWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, 220, 'sine', i * 0.11, 0.09));
}

/* ============================================================
   7. RENDER — cardul de bingo
   ============================================================ */
const gridEl = document.getElementById('bingo-grid');
const markedCountEl = document.getElementById('marked-count');
const linesCountEl = document.getElementById('lines-count-text');
const linesCountWrap = document.getElementById('lines-count-wrap');
const pathFillEl = document.getElementById('path-fill');
const pathFootEl = document.getElementById('path-foot');
const announcer = document.getElementById('sr-announcer');

function announce(text) {
  if (!state.announce) return;
  announcer.textContent = '';
  window.requestAnimationFrame(() => { announcer.textContent = text; });
}

const checkmarkSVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.001"/>
  <path d="M5 12.5l4.2 4.2L19 6.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function renderGrid() {
  gridEl.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const isFree = i === CENTER_INDEX;
    const marked = state.marks[i];
    const text = tileTextAt(i);

    const btn = document.createElement('button');
    btn.type = 'button';
    // spațiul liber își arată mereu textul — efectul de "ștampilă" (is-marked)
    // se aplică doar căsuțelor obișnuite bifate de utilizator
    btn.className = 'tile' + (isFree ? ' tile--free' : '') + (marked && !isFree ? ' is-marked' : '');
    btn.dataset.index = String(i);
    btn.setAttribute('aria-pressed', marked ? 'true' : 'false');
    btn.setAttribute('aria-label', (isFree ? 'Spațiu liber, bifat automat' : text) + (marked && !isFree ? ', bifat' : ''));
    if (isFree) btn.disabled = true; // spațiul liber nu se poate debifa

    const span = document.createElement('span');
    span.className = 'tile__text';
    span.textContent = text;
    btn.appendChild(span);

    if (!isFree) {
      const stamp = document.createElement('span');
      stamp.className = 'tile__stamp';
      stamp.innerHTML = checkmarkSVG;
      btn.appendChild(stamp);
    }

    if (!isFree) {
      btn.addEventListener('click', () => toggleTile(i));
    }
    gridEl.appendChild(btn);
  }
  applyWinningHighlight();
  updateProgress();
}

/* ---------- 8. Logica de bifare + detecție linii ---------- */
function toggleTile(index) {
  state.marks[index] = !state.marks[index];
  const marked = state.marks[index];
  marked ? soundMark() : soundUnmark();

  const btn = gridEl.querySelector(`[data-index="${index}"]`);
  if (btn) {
    btn.classList.toggle('is-marked', marked);
    btn.setAttribute('aria-pressed', marked ? 'true' : 'false');
    const text = tileTextAt(index);
    btn.setAttribute('aria-label', text + (marked ? ', bifat' : ''));
  }
  announce(marked ? `Bifat: ${tileTextAt(index)}` : `Debifat: ${tileTextAt(index)}`);

  persistCard();
  updateProgress();
  checkForNewWins();
}

function getCompletedLines() {
  return WINNING_LINES
    .map((line, idx) => ({ idx, line }))
    .filter(({ line }) => line.every(i => state.marks[i]));
}

function applyWinningHighlight() {
  const completed = getCompletedLines();
  const highlighted = new Set(completed.flatMap(c => c.line));
  gridEl.querySelectorAll('.tile').forEach(btn => {
    const i = Number(btn.dataset.index);
    btn.classList.toggle('is-in-winning-line', highlighted.has(i));
  });
  const n = completed.length;
  linesCountEl.textContent = n === 1 ? '1 linie completă' : `${n} linii complete`;
  linesCountWrap.hidden = n === 0;
}

function checkForNewWins() {
  const completed = getCompletedLines();
  applyWinningHighlight();
  const newlyCompleted = completed.filter(c => !state.completedLines.includes(c.idx));
  if (newlyCompleted.length > 0) {
    state.completedLines = completed.map(c => c.idx);
    persistCard();
    soundWin();
    showWinBanner(completed.length);
  } else {
    state.completedLines = completed.map(c => c.idx);
    persistCard();
  }
}

function updateProgress() {
  const markedNonFree = state.marks.filter(Boolean).length - 1; // scade spațiul liber
  markedCountEl.textContent = String(markedNonFree);
  const pct = Math.round((markedNonFree / 24) * 100);
  pathFillEl.style.width = pct + '%';
  pathFootEl.style.left = pct + '%';
}

/* ---------- 9. Banner de câștig ---------- */
const winBanner = document.getElementById('win-banner');
const winBannerText = document.getElementById('win-banner-text');
const btnCloseWin = document.getElementById('btn-close-win');

function showWinBanner(totalLines) {
  winBannerText.textContent = totalLines > 1
    ? `Ai completat ${totalLines} linii pe card. Continuă așa!`
    : 'Ai completat o linie pe card. Continuă așa!';
  winBanner.hidden = false;
  btnCloseWin.focus();
}
btnCloseWin.addEventListener('click', () => { winBanner.hidden = true; });
winBanner.addEventListener('click', (e) => { if (e.target === winBanner) winBanner.hidden = true; });

/* ---------- 10. Card nou / Repornește bifele ---------- */
document.getElementById('btn-new-card').addEventListener('click', () => {
  const hasProgress = state.marks.some((m, i) => m && i !== CENTER_INDEX);
  if (hasProgress && !confirm('Sigur vrei un card nou? Bifele actuale se vor pierde.')) return;
  generateNewCard();
  renderGrid();
  announce('Card nou generat.');
});

document.getElementById('btn-reset-progress').addEventListener('click', () => {
  const hasProgress = state.marks.some((m, i) => m && i !== CENTER_INDEX);
  if (hasProgress && !confirm('Sigur vrei să ștergi toate bifele de pe cardul curent?')) return;
  state.marks = Array(25).fill(false);
  state.marks[CENTER_INDEX] = true;
  state.completedLines = [];
  persistCard();
  renderGrid();
  announce('Bifele au fost șterse.');
});

/* ============================================================
   11. TAB-URI (Card / Experiențe)
   ============================================================ */
const tabGame = document.getElementById('tab-game');
const tabExperiences = document.getElementById('tab-experiences');
const gameView = document.getElementById('game-view');
const experiencesView = document.getElementById('experiences-view');

function activateTab(which) {
  const gameActive = which === 'game';
  tabGame.classList.toggle('is-active', gameActive);
  tabExperiences.classList.toggle('is-active', !gameActive);
  tabGame.setAttribute('aria-selected', String(gameActive));
  tabExperiences.setAttribute('aria-selected', String(!gameActive));
  gameView.hidden = !gameActive;
  experiencesView.hidden = gameActive;
}
tabGame.addEventListener('click', () => activateTab('game'));
tabExperiences.addEventListener('click', () => activateTab('experiences'));

/* ============================================================
   12. EXPERIENȚE — text + dată, salvate local
   ============================================================ */
const experienceForm = document.getElementById('experience-form');
const experienceText = document.getElementById('experience-text');
const experienceList = document.getElementById('experience-list');
const experienceEmpty = document.getElementById('experience-empty');

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderExperiences() {
  experienceList.innerHTML = '';
  const items = state.experiences.slice().sort((a, b) => b.id - a.id);
  experienceEmpty.hidden = items.length > 0;
  for (const exp of items) {
    const li = document.createElement('li');
    li.className = 'experience-card';

    const date = document.createElement('span');
    date.className = 'experience-card__date';
    date.textContent = formatDate(exp.date);

    const text = document.createElement('p');
    text.className = 'experience-card__text';
    text.textContent = exp.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'experience-card__delete';
    del.textContent = 'Șterge';
    del.addEventListener('click', () => {
      if (!confirm('Ștergi această experiență?')) return;
      state.experiences = state.experiences.filter(e => e.id !== exp.id);
      writeJSON(LS.experiences, state.experiences);
      renderExperiences();
    });

    const share = document.createElement('button');
    share.type = 'button';
    share.className = 'experience-card__share';
    share.textContent = 'Trimite';
    share.addEventListener('click', () => shareExperience(exp));

    const actions = document.createElement('div');
    actions.className = 'experience-card__actions';
    actions.appendChild(share);
    actions.appendChild(del);

    li.appendChild(date);
    li.appendChild(text);
    li.appendChild(actions);
    experienceList.appendChild(li);
  }
}

async function shareExperience(exp) {
  const shareText = `${exp.text}\n\n— din Bingo în predicare, Milwaukee 2026`;
  if (navigator.share) {
    try {
      await navigator.share({ text: shareText, title: 'Experiență din predicare' });
    } catch (e) { /* utilizatorul a anulat distribuirea — nu e o eroare */ }
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareText);
      announce('Experiența a fost copiată în clipboard.');
      alert('Experiența a fost copiată — o poți lipi oriunde vrei să o trimiți.');
    } catch (e) {
      alert('Nu am putut copia automat. Textul experienței:\n\n' + shareText);
    }
  } else {
    alert('Textul experienței:\n\n' + shareText);
  }
}

experienceForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = experienceText.value.trim();
  if (!text) return;
  state.experiences.push({ id: Date.now(), date: new Date().toISOString(), text });
  writeJSON(LS.experiences, state.experiences);
  experienceText.value = '';
  renderExperiences();
  announce('Experiență salvată.');
});

/* ============================================================
   13. SETĂRI (temă, sunet, anunțuri, ștergere date)
   ============================================================ */
const settingsModal = document.getElementById('settings-modal');
const btnSettings = document.getElementById('btn-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const settingsBackdrop = document.getElementById('settings-backdrop');
const themeSegmented = document.getElementById('theme-segmented');
const soundToggle = document.getElementById('sound-toggle');
const announceToggle = document.getElementById('announce-toggle');
const btnClearCard = document.getElementById('btn-clear-card');
const btnClearExperiences = document.getElementById('btn-clear-experiences');
const btnInstallApp = document.getElementById('btn-install-app');

function openSettings() {
  settingsModal.hidden = false;
  btnCloseSettings.focus();
}
function closeSettings() {
  settingsModal.hidden = true;
  btnSettings.focus();
}
btnSettings.addEventListener('click', openSettings);
btnCloseSettings.addEventListener('click', closeSettings);
settingsBackdrop.addEventListener('click', closeSettings);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !settingsModal.hidden) closeSettings();
});

/* ---- Temă ---- */
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme() {
  let effective = state.theme;
  if (effective === 'system') effective = systemDark.matches ? 'dark' : 'light';
  document.body.setAttribute('data-theme', effective);
  themeSegmented.querySelectorAll('.segmented__btn').forEach(btn => {
    btn.setAttribute('aria-checked', String(btn.dataset.themeChoice === state.theme));
  });
}
themeSegmented.addEventListener('click', (e) => {
  const btn = e.target.closest('.segmented__btn');
  if (!btn) return;
  state.theme = btn.dataset.themeChoice;
  localStorage.setItem(LS.theme, state.theme);
  applyTheme();
});
systemDark.addEventListener('change', () => { if (state.theme === 'system') applyTheme(); });

/* ---- Sunet / anunțuri ---- */
function syncSwitch(btn, on) { btn.setAttribute('aria-checked', String(on)); }
soundToggle.addEventListener('click', () => {
  state.sound = !state.sound;
  localStorage.setItem(LS.sound, state.sound ? 'on' : 'off');
  syncSwitch(soundToggle, state.sound);
  if (state.sound) playTone(660, 90, 'triangle');
});
announceToggle.addEventListener('click', () => {
  state.announce = !state.announce;
  localStorage.setItem(LS.announce, state.announce ? 'on' : 'off');
  syncSwitch(announceToggle, state.announce);
});

/* ---- Ștergere date (separat: cardul/bifele vs. experiențele) ---- */
btnClearCard.addEventListener('click', () => {
  if (!confirm('Ștergi cardul curent și toate bifele de pe el? Experiențele salvate nu sunt afectate.')) return;
  generateNewCard();
  renderGrid();
  announce('Cardul și bifele au fost șterse.');
});

btnClearExperiences.addEventListener('click', () => {
  if (state.experiences.length === 0) { alert('Nu ai nicio experiență salvată.'); return; }
  if (!confirm('Ștergi toate experiențele salvate? Această acțiune nu poate fi anulată.')) return;
  state.experiences = [];
  writeJSON(LS.experiences, state.experiences);
  renderExperiences();
  announce('Experiențele au fost șterse.');
});

/* ---- Instalare aplicație (PWA) ---- */
let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (!isStandalone()) btnInstallApp.hidden = false;
});

btnInstallApp.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  btnInstallApp.hidden = true;
});

window.addEventListener('appinstalled', () => {
  btnInstallApp.hidden = true;
  deferredInstallPrompt = null;
});

/* ============================================================
   14. INIȚIALIZARE
   ============================================================ */
function init() {
  document.getElementById('app-version').textContent = APP_VERSION;
  syncSwitch(soundToggle, state.sound);
  syncSwitch(announceToggle, state.announce);
  applyTheme();
  renderGrid();
  renderExperiences();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {
        /* funcționarea offline nu e critică pentru joc; eșecul e ignorat silențios */
      });
    });
  }
}
init();
