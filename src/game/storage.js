const KEY = 'pixel-adventure-best';

export function loadBest() {
    try {
        const raw = window.localStorage.getItem(KEY);
        return parseInt(raw || '0', 10) || 0;
    } catch (e) {
        return 0;
    }
}

export function saveBest(score) {
    try {
        const best = loadBest();
        if (score > best) window.localStorage.setItem(KEY, String(score));
        return Math.max(best, score);
    } catch (e) {
        return score;
    }
}
