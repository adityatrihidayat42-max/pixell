// Pembuat tekstur pixel-art (karakter, musuh, koin, portal, latar)
// Semua digambar langsung ke canvas -> tidak butuh file gambar tambahan.
import Phaser from 'phaser';

const NEAREST = Phaser.Textures.FilterMode.NEAREST;

const P = {
    k: '#191d26', // outline
    n: '#0e1117', // hitam pekat
    v: '#243244', // visor
    c: '#6ef0ff', // mata cyan
    w: '#f4f8fc', // putih
    o: '#f0942c', // badan oranye
    O: '#c9722a', // bayangan oranye
    y: '#ffd479', // highlight
    g: '#9aa8b8', // logam
    G: '#65717f', // bayangan logam
    r: '#e2503f', // merah
    R: '#a6352b', // merah gelap
    b: '#3f8efc', // biru
    t: '#2ee6a8', // portal terang
    T: '#1c9b7a', // portal gelap
    gold: '#ffd23f',
    goldD: '#e09b1a',
};

function rect(ctx, ox, oy, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(ox + x, oy + y, w, h);
}

/* ------------------------------------------------------------------ HERO */
const HERO_W = 16;
const HERO_H = 16;
// frame: 0-1 idle | 2-5 lari | 6 lompat | 7 terluka
const HERO_FRAMES = 8;

function drawHero(ctx, ox, frame) {
    let bob = 0;
    let legs = [[4, 13, 3, 3], [9, 13, 3, 3]];
    let armsUp = false;
    let hurt = false;
    let blink = false;

    if (frame <= 1) {
        bob = frame === 1 ? 1 : 0;
        blink = frame === 1;
    } else if (frame <= 5) {
        const phase = frame - 2;
        bob = phase % 2 === 1 ? -1 : 0;
        legs = [
            [[3, 13, 3, 3], [10, 13, 3, 3]],
            [[5, 13, 3, 3], [8, 13, 3, 2]],
            [[4, 13, 3, 3], [9, 13, 3, 3]],
            [[5, 13, 3, 2], [8, 13, 3, 3]],
        ][phase];
    } else if (frame === 6) {
        armsUp = true;
        legs = [[4, 13, 3, 2], [9, 13, 3, 2]];
    } else {
        hurt = true;
    }

    // lengan (di belakang badan)
    const armY = armsUp ? 5 : 7;
    rect(ctx, ox, 0, 0, armY, 2, 3, P.g);
    rect(ctx, ox, 0, 14, armY, 2, 3, P.g);

    // kaki (tetap di tanah, tidak ikut bob)
    for (const [lx, ly, lw, lh] of legs) {
        rect(ctx, ox, 0, lx, ly, lw, lh, P.g);
        rect(ctx, ox, 0, lx, ly + lh - 1, lw, 1, P.G);
    }

    // badan + kepala
    const oy = bob;
    rect(ctx, ox, oy, 7, 0, 2, 2, P.G);      // antena
    rect(ctx, ox, oy, 7, 0, 1, 1, hurt ? P.w : P.r);
    rect(ctx, ox, oy, 2, 2, 12, 11, P.k);    // outline
    rect(ctx, ox, oy, 3, 3, 10, 9, hurt ? P.R : P.o);
    rect(ctx, ox, oy, 3, 3, 10, 1, hurt ? P.r : P.y);
    rect(ctx, ox, oy, 3, 10, 10, 2, hurt ? P.n : P.O);
    rect(ctx, ox, oy, 4, 5, 8, 4, P.v);      // visor

    if (hurt) {
        rect(ctx, ox, oy, 5, 6, 2, 2, P.w);
        rect(ctx, ox, oy, 9, 6, 2, 2, P.w);
    } else if (blink) {
        rect(ctx, ox, oy, 5, 7, 2, 1, P.c);
        rect(ctx, ox, oy, 9, 7, 2, 1, P.c);
    } else {
        rect(ctx, ox, oy, 5, 6, 2, 2, P.c);
        rect(ctx, ox, oy, 9, 6, 2, 2, P.c);
    }
}

/* ------------------------------------------------------------- BOT JALAN */
const BOT_W = 16;
const BOT_H = 14;
const BOT_FRAMES = 2;

function drawBot(ctx, ox, frame) {
    const spread = frame === 0;
    // kaki
    rect(ctx, ox, 0, spread ? 3 : 5, 12, 3, 2, P.G);
    rect(ctx, ox, 0, spread ? 10 : 8, 12, 3, 2, P.G);
    // antena
    rect(ctx, ox, 0, 7, 0, 2, 2, P.G);
    rect(ctx, ox, 0, 7, 0, 1, 1, P.r);
    // badan
    rect(ctx, ox, 0, 1, 2, 14, 10, P.k);
    rect(ctx, ox, 0, 2, 3, 12, 8, P.g);
    rect(ctx, ox, 0, 2, 9, 12, 2, P.G);
    rect(ctx, ox, 0, 4, 4, 8, 4, P.v);
    rect(ctx, ox, 0, 6, 5, 4, 2, P.r);   // mata merah
    rect(ctx, ox, 0, 6, 5, 1, 1, P.w);
    // pelat depan
    rect(ctx, ox, 0, 6, 10, 4, 1, P.k);
}

/* ---------------------------------------------------------------- DRONE */
const DRONE_W = 16;
const DRONE_H = 12;
const DRONE_FRAMES = 2;

function drawDrone(ctx, ox, frame) {
    const propW = frame === 0 ? 14 : 8;
    rect(ctx, ox, 0, 8 - propW / 2, 1, propW, 1, P.g); // baling-baling
    rect(ctx, ox, 0, 7, 1, 2, 3, P.G);                  // hub
    rect(ctx, ox, 0, 3, 3, 10, 7, P.k);
    rect(ctx, ox, 0, 4, 4, 8, 5, P.G);
    rect(ctx, ox, 0, 5, 5, 6, 3, P.v);
    rect(ctx, ox, 0, 6, 6, 4, 2, P.c);   // mata
    rect(ctx, ox, 0, 4, 9, 3, 1, P.k);   // ski
    rect(ctx, ox, 0, 9, 9, 3, 1, P.k);
    rect(ctx, ox, 0, 6, 10, 4, 1, P.b);  // thruster
    rect(ctx, ox, 0, 6, 11, 4, 1, frame === 0 ? P.b : P.c);
}

/* ----------------------------------------------------------------- KOIN */
const COIN_W = 12;
const COIN_H = 12;
const COIN_FRAMES = 4;

function drawCoin(ctx, ox, frame) {
    const squash = [1, 0.62, 0.22, 0.62][frame];
    const rx = (COIN_W / 2 - 0.5) * squash;
    const ry = COIN_H / 2 - 0.5;
    for (let y = 0; y < COIN_H; y++) {
        for (let x = 0; x < COIN_W; x++) {
            const nx = (x + 0.5 - COIN_W / 2) / rx;
            const ny = (y + 0.5 - COIN_H / 2) / ry;
            const d = nx * nx + ny * ny;
            if (d > 1) continue;
            let col = P.gold;
            if (d > 0.82) col = P.k;
            else if (d > 0.6) col = P.goldD;
            else if (nx < -0.25 && ny < 0.15) col = P.w;
            else if (ny > 0.5) col = P.goldD;
            ctx.fillStyle = col;
            ctx.fillRect(ox + x, y, 1, 1);
        }
    }
    // lubang baut di tengah -> terlihat seperti mur/bolt
    if (squash > 0.5) {
        ctx.fillStyle = P.k;
        ctx.fillRect(ox + COIN_W / 2 - 1, COIN_H / 2 - 1, 2, 2);
        ctx.fillStyle = P.goldD;
        ctx.fillRect(ox + COIN_W / 2, COIN_H / 2, 1, 1);
    }
}

/* --------------------------------------------------------------- PORTAL */
const PORTAL_W = 18;
const PORTAL_H = 36;
const PORTAL_FRAMES = 2;

function drawPortal(ctx, ox, frame) {
    rect(ctx, ox, 0, 0, 0, 18, 36, P.k);
    rect(ctx, ox, 0, 1, 1, 16, 34, P.G);
    rect(ctx, ox, 0, 3, 3, 12, 30, P.T);
    rect(ctx, ox, 0, 4, 4, 10, 28, frame === 0 ? '#25b48d' : '#3ee0b0');
    const bandY = frame === 0 ? 7 : 19;
    rect(ctx, ox, 0, 4, bandY, 10, 5, '#9dfae2');
    rect(ctx, ox, 0, 4, bandY + 5, 10, 1, '#ffffff');
    // panel bawah
    rect(ctx, ox, 0, 0, 33, 18, 3, P.g);
    rect(ctx, ox, 0, 2, 34, 14, 1, P.G);
    rect(ctx, ox, 0, 8, 34, 2, 2, P.c);
    // baut kiri/kanan
    rect(ctx, ox, 0, 1, 4, 1, 3, P.n);
    rect(ctx, ox, 0, 16, 4, 1, 3, P.n);
}

/* ------------------------------------------------------------- LATAR SKY */
function makeSky(scene) {
    const tex = scene.textures.createCanvas('sky', 8, 600);
    const ctx = tex.getContext();
    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, '#16273d');
    grad.addColorStop(0.45, '#3d6a90');
    grad.addColorStop(0.8, '#8fb6c9');
    grad.addColorStop(1, '#c8d9d6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 8, 600);
    tex.refresh();
    tex.setFilter(NEAREST);
}

function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function makeFar(scene) {
    const W = 640;
    const H = 200;
    const tex = scene.textures.createCanvas('far', W, H);
    const ctx = tex.getContext();
    const rnd = mulberry32(1337);
    ctx.clearRect(0, 0, W, H);
    let x = 0;
    while (x < W) {
        const w = 28 + Math.floor(rnd() * 52);
        const h = 55 + Math.floor(rnd() * 135);
        ctx.fillStyle = '#2c4463';
        ctx.fillRect(x, H - h, w, h);
        if (rnd() > 0.55) {
            ctx.fillRect(x + Math.floor(w * 0.2), H - h - 22, 9, 22);
            ctx.fillStyle = '#22364f';
            ctx.fillRect(x + Math.floor(w * 0.2), H - h - 22, 9, 4);
            ctx.fillStyle = '#2c4463';
        }
        for (let wy = H - h + 9; wy < H - 10; wy += 13) {
            for (let wx = x + 6; wx < x + w - 7; wx += 13) {
                if (rnd() > 0.5) {
                    ctx.fillStyle = rnd() > 0.72 ? '#f5c86b' : '#3d5f86';
                    ctx.fillRect(wx, wy, 5, 6);
                }
            }
        }
        x += w + 5;
    }
    tex.refresh();
}

function makeMid(scene) {
    const W = 640;
    const H = 160;
    const tex = scene.textures.createCanvas('mid', W, H);
    const ctx = tex.getContext();
    const rnd = mulberry32(90210);
    ctx.clearRect(0, 0, W, H);
    let x = 0;
    while (x < W) {
        if (rnd() < 0.5) {
            // tangki / gedung bulat
            const w = 38 + Math.floor(rnd() * 34);
            const h = 65 + Math.floor(rnd() * 75);
            ctx.fillStyle = '#20344e';
            ctx.fillRect(x, H - h, w, h);
            ctx.fillStyle = '#2a4364';
            ctx.fillRect(x, H - h, w, 7);
            ctx.fillRect(x, H - 12, w, 4);
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(x + 5 + Math.floor((i * (w - 12)) / 3), H - h + 14, 3, 3);
            }
            x += w + 18;
        } else {
            // pipa horizontal
            const w = 70 + Math.floor(rnd() * 70);
            const y = H - 46;
            ctx.fillStyle = '#20344e';
            ctx.fillRect(x, y, w, 16);
            ctx.fillStyle = '#2a4364';
            ctx.fillRect(x + 7, y, 7, 16);
            ctx.fillRect(x + w - 16, y, 7, 16);
            ctx.fillRect(x, y, w, 3);
            // penyangga
            ctx.fillStyle = '#1a2a40';
            ctx.fillRect(x + 20, y + 16, 5, H - y - 16);
            ctx.fillRect(x + w - 30, y + 16, 5, H - y - 16);
            x += w + 18;
        }
    }
    tex.refresh();
}

/* ------------------------------------------------------------- REGISTRASI */
function spriteSheet(scene, key, w, h, frames, drawFn) {
    const tex = scene.textures.createCanvas(key, w * frames, h);
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i < frames; i++) {
        drawFn(ctx, i * w, i);
        tex.add(i, 0, i * w, 0, w, h);
    }
    tex.refresh();
    tex.setFilter(NEAREST);
}

export function createTextures(scene) {
    if (scene.textures.exists('hero')) return;

    spriteSheet(scene, 'hero', HERO_W, HERO_H, HERO_FRAMES, drawHero);
    spriteSheet(scene, 'bot', BOT_W, BOT_H, BOT_FRAMES, drawBot);
    spriteSheet(scene, 'drone', DRONE_W, DRONE_H, DRONE_FRAMES, drawDrone);
    spriteSheet(scene, 'coin', COIN_W, COIN_H, COIN_FRAMES, drawCoin);
    spriteSheet(scene, 'portal', PORTAL_W, PORTAL_H, PORTAL_FRAMES, drawPortal);

    makeSky(scene);
    makeFar(scene);
    makeMid(scene);
}

export function createAnimations(scene) {
    if (scene.anims.exists('hero-idle')) return;

    scene.anims.create({
        key: 'hero-idle',
        frames: [{ key: 'hero', frame: 0 }, { key: 'hero', frame: 1 }],
        frameRate: 3,
        repeat: -1,
    });
    scene.anims.create({
        key: 'hero-run',
        frames: [2, 3, 4, 5].map((f) => ({ key: 'hero', frame: f })),
        frameRate: 11,
        repeat: -1,
    });
    scene.anims.create({
        key: 'hero-jump',
        frames: [{ key: 'hero', frame: 6 }],
        frameRate: 1,
    });
    scene.anims.create({
        key: 'hero-hurt',
        frames: [{ key: 'hero', frame: 7 }],
        frameRate: 1,
    });
    scene.anims.create({
        key: 'bot-walk',
        frames: [{ key: 'bot', frame: 0 }, { key: 'bot', frame: 1 }],
        frameRate: 6,
        repeat: -1,
    });
    scene.anims.create({
        key: 'drone-fly',
        frames: [{ key: 'drone', frame: 0 }, { key: 'drone', frame: 1 }],
        frameRate: 12,
        repeat: -1,
    });
    scene.anims.create({
        key: 'coin-spin',
        frames: [0, 1, 2, 3].map((f) => ({ key: 'coin', frame: f })),
        frameRate: 8,
        repeat: -1,
    });
    scene.anims.create({
        key: 'portal-glow',
        frames: [{ key: 'portal', frame: 0 }, { key: 'portal', frame: 1 }],
        frameRate: 3,
        repeat: -1,
    });
}
