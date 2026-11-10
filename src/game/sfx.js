// SFX sederhana berbasis WebAudio (tanpa file audio eksternal)
let ctx = null;

function ac() {
    if (!ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function tone({ from = 440, to = from, dur = 0.12, type = 'square', vol = 0.1, delay = 0 }) {
    const a = ac();
    if (!a) return;
    try {
        const t0 = a.currentTime + delay;
        const osc = a.createOscillator();
        const gain = a.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(from, t0);
        if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain);
        gain.connect(a.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.03);
    } catch (e) {
        /* audio tidak tersedia - diamkan */
    }
}

export const sfx = {
    jump() {
        tone({ from: 320, to: 720, dur: 0.16, type: 'square', vol: 0.07 });
    },
    coin() {
        tone({ from: 880, dur: 0.06, type: 'triangle', vol: 0.1 });
        tone({ from: 1320, dur: 0.12, type: 'triangle', vol: 0.1, delay: 0.055 });
    },
    stomp() {
        tone({ from: 240, to: 60, dur: 0.14, type: 'square', vol: 0.1 });
    },
    hurt() {
        tone({ from: 320, to: 70, dur: 0.32, type: 'sawtooth', vol: 0.1 });
    },
    land() {
        tone({ from: 150, to: 80, dur: 0.06, type: 'square', vol: 0.04 });
    },
    portal() {
        [523, 659, 784, 1047].forEach((f, i) =>
            tone({ from: f, dur: 0.16, type: 'triangle', vol: 0.09, delay: i * 0.09 })
        );
    },
    select() {
        tone({ from: 660, dur: 0.07, type: 'square', vol: 0.06 });
        tone({ from: 990, dur: 0.1, type: 'square', vol: 0.06, delay: 0.07 });
    },
    over() {
        [392, 330, 262, 196].forEach((f, i) =>
            tone({ from: f, dur: 0.24, type: 'sawtooth', vol: 0.08, delay: i * 0.17 })
        );
    },
    win() {
        [523, 659, 784, 1047, 1319].forEach((f, i) =>
            tone({ from: f, dur: 0.2, type: 'square', vol: 0.07, delay: i * 0.11 })
        );
    },
};
