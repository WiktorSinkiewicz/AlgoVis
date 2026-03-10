const renderer = new Renderer({
  scene:      document.getElementById('visualizer'),
  codeBlock:  document.getElementById('code-block'),
  logPanel:   document.getElementById('log-panel'),
});

let trace       = [];
let cursor      = 0;
let isPlaying   = false;
let playTimer   = null;

const progressBar = document.getElementById('progress-bar');

// ── Speed control ─────────────────────────────────────
// The player owns all timing. Trace files use "pause" only as
// a step boundary marker — their ms value is ignored.
// BASE_DELAY is the ms per step at 1× speed.

const BASE_DELAY = 900;

const SPEED_STEPS  = [0.2, 0.4, 1, 1.75, 3, 5, 8];
const SPEED_LABELS = ['¼×', '½×', '1×', '2×', '3×', '5×', '8×'];

let speedMultiplier = 1;

const speedSlider = document.getElementById('speed-slider');
const speedLabel  = document.getElementById('speed-label');

speedSlider.addEventListener('input', () => {
  const index = parseInt(speedSlider.value, 10) - 1;
  speedMultiplier = SPEED_STEPS[index];
  speedLabel.textContent = SPEED_LABELS[index];
});

function currentStepDelay() {
  return Math.max(16, Math.round(BASE_DELAY / speedMultiplier));
}

// ── File loading ──────────────────────────────────────

document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById('file-name').textContent = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      trace = JSON.parse(e.target.result);
      reset();
      advanceFrame();
    } catch {
      renderer.addLog('Error: invalid JSON file.');
    }
  };
  reader.readAsText(file);
});

// ── Playback engine ───────────────────────────────────
// Execute commands until the next "pause" boundary, then wait
// currentStepDelay() ms before continuing — always the same duration.

function advanceFrame() {
  if (cursor >= trace.length) return;

  while (cursor < trace.length) {
    const cmd = trace[cursor++];

    if (cmd.action === 'pause') break;

    renderer.execute(cmd);
  }

  updateProgress();
}

function playLoop() {
  if (!isPlaying) return;

  if (cursor < trace.length) {
    advanceFrame();
    playTimer = setTimeout(playLoop, currentStepDelay());
  } else {
    isPlaying = false;
  }
}

function reset() {
  isPlaying = false;
  clearTimeout(playTimer);
  cursor = 0;
  renderer.reset();
  updateProgress();
}

function updateProgress() {
  const pct = trace.length > 0 ? (cursor / trace.length) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}

// ── Controls ──────────────────────────────────────────

document.getElementById('btn-play').addEventListener('click', () => {
  if (!isPlaying && cursor < trace.length) {
    isPlaying = true;
    playLoop();
  }
});

document.getElementById('btn-pause').addEventListener('click', () => {
  isPlaying = false;
  clearTimeout(playTimer);
});

document.getElementById('btn-next').addEventListener('click', () => {
  if (!isPlaying && cursor < trace.length) advanceFrame();
});

document.getElementById('btn-reset').addEventListener('click', () => {
  reset();
  if (trace.length) advanceFrame();
});