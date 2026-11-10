import Phaser from 'phaser';
import { TS, SCALE, tileFrameAt, DECOR, isSolid, isGoo } from '../game/tiles.js';
import { LEVELS } from '../game/levels.js';
import { sfx } from '../game/sfx.js';
import { saveBest } from '../game/storage.js';

const GRAVITY = 1500;
const MOVE = 230;
const JUMP = -700;
const MAX_FALL = 950;
const SOLID_DECOR = new Set(['c', 'C', 'm', 'j', 'h', 'n', 'q']);

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init(data = {}) {
        this.levelIndex = data.level ?? 0;
        this.score = data.score ?? 0;
        this.lives = data.lives ?? 3;
        this.dead = false;
        this.finished = false;
        this.bolts = 0;
        this.boltsTotal = 0;
        this.invulnUntil = 0;
        this.ride = null;
        this.rideAt = -9999;
        this.coyote = 0;
        this.jumpBuffer = 0;
        this.jumpHeld = false;
        this.wasGround = true;
        this.spawn = null;
        this.level = LEVELS[this.levelIndex];
    }

    create() {
        this.map = this.level.map;
        this.rows = this.map.length;
        this.cols = Math.max(...this.map.map((row) => row.length));
        this.worldW = this.cols * TS;
        this.worldH = this.rows * TS;

        this.at = (r, c) => {
            if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return ' ';
            const row = this.map[r];
            return c < row.length ? row[c] : ' ';
        };

        this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
        this.physics.world.gravity.y = GRAVITY;

        this.buildBackdrop();
        this.buildTiles();
        this.buildDecor();
        this.buildCoins();
        this.buildExit();
        this.buildMovers();
        this.buildEnemies();
        this.buildPlayer();
        this.buildColliders();
        this.buildCamera();
        this.buildHud();
        this.buildInput();
        this.showIntro();

        this.cameras.main.fadeIn(300, 12, 20, 30);
    }

    /* ---------------------------------------------------------------- LATAR */
    buildBackdrop() {
        const W = this.scale.width;
        const groundTop = (this.rows - 5) * TS;

        this.add.image(0, 0, 'sky').setOrigin(0).setDisplaySize(W, this.scale.height).setScrollFactor(0).setDepth(-30);
        this.bgFar = this.add
            .tileSprite(0, groundTop - 200, W, 200, 'far')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(-21);
        this.bgMid = this.add
            .tileSprite(0, groundTop - 160, W, 160, 'mid')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(-20);
    }

    /* ---------------------------------------------------------------- TILE */
    buildTiles() {
        this.solids = this.physics.add.staticGroup();
        this.hazards = this.physics.add.staticGroup();

        for (let r = 0; r < this.rows; r++) {
            let solidStart = -1;
            let gooStart = -1;

            for (let c = 0; c <= this.cols; c++) {
                const ch = this.at(r, c);

                if (c < this.cols) {
                    if (isSolid(ch) || isGoo(ch)) {
                        const frame = tileFrameAt(this.at, r, c, ch);
                        this.add
                            .image(c * TS + TS / 2, r * TS + TS / 2, 'tiles', frame)
                            .setScale(SCALE)
                            .setDepth(0);
                    }
                    if (ch === 'p') {
                        this.spawn = { r, c };
                    }
                }

                // jalur tabrakan untuk tile padat (digabung per baris)
                if (isSolid(ch)) {
                    if (solidStart < 0) solidStart = c;
                } else if (solidStart >= 0) {
                    this.addSolidRun(r, solidStart, c - 1);
                    solidStart = -1;
                }

                // zona mematikan untuk limbah hijau
                if (isGoo(ch)) {
                    if (gooStart < 0) gooStart = c;
                } else if (gooStart >= 0) {
                    this.addHazardRun(r, gooStart, c - 1);
                    gooStart = -1;
                }
            }
        }
    }

    addSolidRun(r, c1, c2) {
        const x = c1 * TS;
        const w = (c2 - c1 + 1) * TS;
        const rect = this.add.rectangle(x + w / 2, r * TS + TS / 2, w, TS).setVisible(false);
        this.solids.add(rect);
    }

    addHazardRun(r, c1, c2) {
        const x = c1 * TS;
        const w = (c2 - c1 + 1) * TS;
        const above = this.at(r - 1, Math.floor((c1 + c2) / 2));
        const inset = isGoo(above) ? 0 : 10; // beri ampun sedikit di permukaan
        const h = TS - inset;
        const rect = this.add.rectangle(x + w / 2, r * TS + inset + h / 2, w, h).setVisible(false);
        this.hazards.add(rect);
    }

    buildDecor() {
        for (const [type, c, r] of this.level.decor || []) {
            const frame = DECOR[type];
            if (frame === undefined) continue;
            const x = c * TS + TS / 2;
            const y = r * TS + TS / 2;
            this.add.image(x, y, 'tiles', frame).setScale(SCALE).setDepth(1);
            if (SOLID_DECOR.has(type)) {
                this.solids.add(this.add.rectangle(x, y, TS, TS).setVisible(false));
            }
        }
    }

    /* -------------------------------------------------------------- KOIN */
    buildCoins() {
        this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.at(r, c) !== 'b') continue;
                const coin = this.coins.create(c * TS + TS / 2, r * TS + TS / 2, 'coin');
                coin.setScale(SCALE);
                coin.setDepth(3);
                coin.body.setSize(10, 10);
                coin.body.setOffset(1, 1);
                coin.play('coin-spin');
                this.boltsTotal += 1;
            }
        }
    }

    /* -------------------------------------------------------------- EXIT */
    buildExit() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.at(r, c) !== 'x') continue;
                const x = c * TS + TS / 2;
                const y = (r + 1) * TS - 36;
                const glow = this.add.circle(x, y, 54, 0x2ee6a8, 0.1).setDepth(1);
                this.tweens.add({ targets: glow, alpha: 0.02, scale: 1.2, duration: 1000, yoyo: true, repeat: -1 });
                this.portal = this.physics.add.staticSprite(x, y, 'portal').setScale(SCALE).setDepth(3);
                this.portal.play('portal-glow');
                this.portal.body.setSize(30, 66);
                this.add
                    .text(x, y - 58, 'EXIT', {
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#9dfae2',
                        stroke: '#0e1117',
                        strokeThickness: 4,
                    })
                    .setOrigin(0.5)
                    .setDepth(4);
            }
        }
    }

    /* ------------------------------------------------------ PLATFORM GERAK */
    buildMovers() {
        this.movers = this.physics.add.group({ allowGravity: false, immovable: true });
        for (const m of this.level.movers || []) {
            const p = this.movers.create(m.x1 * TS, m.y * TS, 'mover');
            p.setDepth(2);
            p.body.allowGravity = false;
            p.body.immovable = true;
            p.body.directControl = true; // digerakkan tween, tetap bisa ditabrak
            p.moverMin = m.x1 * TS;
            p.moverMax = m.x2 * TS;
            p.moverSpeed = m.speed;
            this.tweens.add({
                targets: p,
                x: m.x2 * TS,
                duration: (((m.x2 - m.x1) * TS) / m.speed) * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut',
            });
        }
    }

    /* ------------------------------------------------------------- MUSUH */
    buildEnemies() {
        this.walkers = this.physics.add.group();
        this.drones = this.physics.add.group({ allowGravity: false });

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const ch = this.at(r, c);
                const x = c * TS + TS / 2;

                if (ch === 'w') {
                    const bot = this.walkers.create(x, (r + 1) * TS - 14, 'bot');
                    bot.setScale(SCALE);
                    bot.setDepth(5);
                    bot.body.setSize(10, 9);
                    bot.body.setOffset(3, 5);
                    bot.play('bot-walk');
                    const [lo, hi] = this.groundRun(r + 1, c, 4);
                    bot.patrolMin = lo * TS + 16;
                    bot.patrolMax = (hi + 1) * TS - 16;
                    bot.dir = c % 2 === 0 ? 1 : -1;
                    bot.body.setVelocityX(bot.dir * 55);
                    bot.setFlipX(bot.dir > 0);
                }

                if (ch === 'd') {
                    const drone = this.drones.create(x, r * TS + TS / 2, 'drone');
                    drone.setScale(SCALE);
                    drone.setDepth(5);
                    drone.body.setSize(13, 8);
                    drone.body.setOffset(1.5, 2);
                    drone.play('drone-fly');
                    drone.baseX = x;
                    drone.baseY = drone.y;
                    drone.range = 3 * TS;
                    drone.phase = c * 0.7;
                }
            }
        }
    }

    groundRun(r, c, maxSpan) {
        let lo = c;
        let hi = c;
        while (lo > 0 && isSolid(this.at(r, lo - 1))) lo -= 1;
        while (hi < this.cols - 1 && isSolid(this.at(r, hi + 1))) hi += 1;
        lo = Math.max(lo, c - maxSpan);
        hi = Math.min(hi, c + maxSpan);
        return [lo, hi];
    }

    /* ------------------------------------------------------------ PEMAIN */
    buildPlayer() {
        const spawn = this.spawn || { r: 11, c: 2 };
        this.spawnPoint = {
            x: spawn.c * TS + TS / 2,
            y: (spawn.r + 1) * TS - 30,
        };

        this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'hero', 0);
        this.player.setScale(SCALE);
        this.player.setDepth(6);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(8, 13);
        this.player.body.setOffset(4, 3);
        this.player.setMaxVelocity(420, MAX_FALL);
        this.player.play('hero-idle');
    }

    buildColliders() {
        this.physics.add.collider(this.player, this.solids);
        this.physics.add.collider(this.walkers, this.solids);
        this.physics.add.collider(this.player, this.movers, (player, mover) => {
            this.ride = mover;
            this.rideAt = this.time.now;
        });

        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
        this.physics.add.overlap(this.player, this.hazards, this.hitHazard, undefined, this);
        this.physics.add.overlap(this.player, this.walkers, this.touchEnemy, undefined, this);
        this.physics.add.overlap(this.player, this.drones, this.touchEnemy, undefined, this);
        if (this.portal) {
            this.physics.add.overlap(this.player, this.portal, this.reachExit, undefined, this);
        }
    }

    buildCamera() {
        const cam = this.cameras.main;
        cam.setBackgroundColor('#16273d');
        cam.setBounds(0, 0, this.worldW, this.worldH);
        cam.startFollow(this.player, true, 0.14, 0.25);
    }

    buildHud() {
        const D = 100;
        const W = this.scale.width;
        this.add.rectangle(0, 0, W, 44, 0x0e1117, 0.62).setOrigin(0).setScrollFactor(0).setDepth(D);
        this.add.rectangle(0, 44, W, 2, 0x2ee6a8, 0.35).setOrigin(0).setScrollFactor(0).setDepth(D);

        const style = { fontFamily: 'monospace', fontSize: '16px', color: '#f4f8fc' };
        this.hudScore = this.add.text(14, 13, '', style).setScrollFactor(0).setDepth(D + 1);
        this.hudBolts = this.add
            .text(180, 13, '', { ...style, color: '#ffd479' })
            .setScrollFactor(0)
            .setDepth(D + 1);
        this.hudLives = this.add
            .text(320, 13, '', { ...style, color: '#ff8073' })
            .setScrollFactor(0)
            .setDepth(D + 1);
        this.hudLevel = this.add
            .text(W - 14, 13, '', style)
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(D + 1);
        this.updateHud();
    }

    buildInput() {
        const KC = Phaser.Input.Keyboard.KeyCodes;
        this.key = this.input.keyboard.addKeys({
            left: KC.LEFT,
            right: KC.RIGHT,
            up: KC.UP,
            A: KC.A,
            D: KC.D,
            W: KC.W,
            space: KC.SPACE,
        });

        this.input.keyboard.on('keydown-R', () => {
            if (this.finished || this.dead) return;
            this.scene.restart({ level: this.levelIndex, score: this.score, lives: this.lives });
        });
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
    }

    showIntro() {
        const t = this.add
            .text(this.scale.width / 2, 186, this.level.name + '\n' + this.level.title, {
                fontFamily: 'monospace',
                fontSize: '32px',
                align: 'center',
                color: '#ffd479',
                stroke: '#191d26',
                strokeThickness: 8,
                lineSpacing: 6,
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(150)
            .setAlpha(0);

        this.tweens.add({
            targets: t,
            alpha: 1,
            duration: 260,
            hold: 1000,
            yoyo: true,
            onComplete: () => t.destroy(),
        });
    }

    /* ------------------------------------------------------------- UPDATE */
    update(time, delta) {
        const cam = this.cameras.main;
        if (this.bgFar) this.bgFar.tilePositionX = cam.scrollX * 0.25;
        if (this.bgMid) this.bgMid.tilePositionX = cam.scrollX * 0.55;

        if (this.dead || this.finished) return;

        this.handleInput(time, delta);
        this.updateEnemies(delta);
        this.updateRide(delta);
        this.updatePlayerAnim();

        if (this.player.y > this.worldH + 80) this.damage();
    }

    handleInput(time, delta) {
        const body = this.player.body;
        const onGround = body.blocked.down || body.touching.down;

        if (onGround) {
            this.coyote = 140;
            if (!this.wasGround) {
                sfx.land();
                this.burst(this.player.x, this.player.y + 14, 0xcfd9e4, 4, 26);
            }
        } else {
            this.coyote -= delta;
        }
        this.wasGround = onGround;

        const left = this.key.left.isDown || this.key.A.isDown;
        const right = this.key.right.isDown || this.key.D.isDown;
        const jumpDown = this.key.space.isDown || this.key.up.isDown || this.key.W.isDown;

        if (left) {
            this.player.setVelocityX(-MOVE);
            this.player.setFlipX(true);
        } else if (right) {
            this.player.setVelocityX(MOVE);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        const jumpPressed =
            Phaser.Input.Keyboard.JustDown(this.key.space) ||
            Phaser.Input.Keyboard.JustDown(this.key.up) ||
            Phaser.Input.Keyboard.JustDown(this.key.W);
        if (jumpPressed) this.jumpBuffer = 130;
        else this.jumpBuffer -= delta;

        if (this.jumpBuffer > 0 && this.coyote > 0) {
            this.player.setVelocityY(JUMP);
            this.jumpHeld = true;
            this.jumpBuffer = 0;
            this.coyote = 0;
            sfx.jump();
            this.burst(this.player.x, this.player.y + 14, 0xf4f8fc, 4, 22);
        }

        // lompatan variabel: lepas tombol lebih awal -> lompat lebih pendek
        if (this.jumpHeld && !jumpDown && body.velocity.y < -220) {
            this.player.setVelocityY(body.velocity.y * 0.45);
            this.jumpHeld = false;
        }
        if (body.velocity.y >= 0) this.jumpHeld = false;
    }

    updateRide(delta) {
        if (!this.ride || !this.ride.active) return;
        if (this.time.now - this.rideAt > 160) return;
        const body = this.player.body;
        if (body.blocked.down || body.touching.down) {
            this.player.x += (this.ride.body.velocity.x * delta) / 1000;
        }
    }

    updateEnemies() {
        for (const bot of this.walkers.getChildren()) {
            if (!bot || !bot.active || !bot.body) continue;
            if (bot.body.blocked.left) bot.dir = 1;
            else if (bot.body.blocked.right) bot.dir = -1;

            if (bot.x <= bot.patrolMin) bot.dir = 1;
            else if (bot.x >= bot.patrolMax) bot.dir = -1;

            bot.body.setVelocityX(bot.dir * 55);
            bot.setFlipX(bot.dir > 0);
        }

        const t = this.time.now / 1000;
        for (const drone of this.drones.getChildren()) {
            if (!drone || !drone.active) continue;
            const nx = drone.baseX + Math.sin(t * 1.1 + drone.phase) * drone.range;
            drone.setFlipX(nx < drone.x);
            drone.x = nx;
            drone.y = drone.baseY + Math.sin(t * 2.1 + drone.phase) * 16;
        }
    }

    updatePlayerAnim() {
        const body = this.player.body;
        let key = 'hero-idle';
        if (!(body.blocked.down || body.touching.down)) key = 'hero-jump';
        else if (Math.abs(body.velocity.x) > 20) key = 'hero-run';

        const current = this.player.anims.currentAnim;
        if (!current || current.key !== key) this.player.play(key, true);
    }

    /* ------------------------------------------------------------- EVENT */
    collectCoin(player, coin) {
        if (!coin.active) return;
        coin.disableBody(true, true);
        this.bolts += 1;
        this.score += 10;
        sfx.coin();
        this.burst(coin.x, coin.y, 0xffd23f, 6, 46);
        this.floatText('+10', coin.x, coin.y - 6, '#ffd23f');
        this.updateHud();
    }

    hitHazard() {
        this.damage();
    }

    touchEnemy(player, enemy) {
        if (!enemy.active || this.dead || this.finished) return;
        const stomping = player.body.velocity.y > 40 && player.body.bottom <= enemy.body.top + 16;
        if (stomping) {
            enemy.disableBody(true, false);
            this.tweens.add({
                targets: enemy,
                y: enemy.y - 22,
                alpha: 0,
                angle: 40,
                duration: 380,
                onComplete: () => enemy.destroy(),
            });
            this.player.setVelocityY(-470);
            this.score += 200;
            this.updateHud();
            sfx.stomp();
            this.burst(enemy.x, enemy.y, 0x9aa8b8, 8, 60);
            this.floatText('+200', enemy.x, enemy.y - 10, '#9dfae2');
            this.cameras.main.shake(90, 0.004);
        } else {
            this.damage();
        }
    }

    reachExit() {
        if (this.finished || this.dead) return;
        this.finished = true;
        this.player.setVelocity(0, 0);
        this.score += 300;
        this.updateHud();
        sfx.portal();
        this.burst(this.portal.x, this.portal.y, 0x2ee6a8, 18, 130);
        this.cameras.main.flash(260, 46, 230, 168);
        this.player.play('hero-jump', true);

        this.time.delayedCall(850, () => {
            if (this.levelIndex + 1 < LEVELS.length) {
                this.scene.restart({ level: this.levelIndex + 1, score: this.score, lives: this.lives });
                return;
            }
            const bonus = this.lives * 250;
            this.score += bonus;
            saveBest(this.score);
            this.scene.start('End', {
                win: true,
                score: this.score,
                bonus,
                level: LEVELS.length,
            });
        });
    }

    damage() {
        if (this.dead || this.finished) return;
        const now = this.time.now;
        if (now < this.invulnUntil) return;

        this.lives -= 1;
        this.invulnUntil = now + 1700;
        this.updateHud();
        sfx.hurt();
        this.cameras.main.shake(190, 0.009);
        this.cameras.main.flash(190, 226, 80, 62);
        this.burst(this.player.x, this.player.y, 0xe2503f, 10, 70);

        if (this.lives <= 0) {
            this.gameOver();
            return;
        }

        this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.player.body.setVelocity(0, 0);
        this.tweens.killTweensOf(this.player);
        this.player.setAlpha(1);
        this.tweens.add({
            targets: this.player,
            alpha: 0.25,
            duration: 110,
            yoyo: true,
            repeat: 6,
            onComplete: () => this.player.setAlpha(1),
        });
    }

    gameOver() {
        this.dead = true;
        this.lives = 0;
        this.updateHud();
        this.physics.pause();
        this.player.setAlpha(0.35);
        this.player.play('hero-hurt', true);
        this.cameras.main.shake(320, 0.01);
        sfx.over();

        const best = saveBest(this.score);
        this.registry.set('best', best);

        this.time.delayedCall(1200, () => {
            this.scene.start('End', { win: false, score: this.score, level: this.levelIndex + 1 });
        });
    }

    /* ------------------------------------------------------------- EFEK */
    updateHud() {
        if (!this.hudScore) return;
        this.hudScore.setText('SKOR ' + String(this.score).padStart(6, '0'));
        this.hudBolts.setText('BOLT ' + this.bolts + '/' + this.boltsTotal);
        this.hudLives.setText('NYAWA ' + this.lives);
        this.hudLevel.setText(this.level.name + ' \u2022 ' + this.level.title);
    }

    burst(x, y, color, count = 6, spread = 60) {
        for (let i = 0; i < count; i++) {
            const p = this.add
                .rectangle(x + Phaser.Math.Between(-6, 6), y + Phaser.Math.Between(-6, 6), 4, 4, color)
                .setDepth(15);
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const dist = Phaser.Math.Between(spread * 0.35, spread);
            this.tweens.add({
                targets: p,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist - 12,
                alpha: 0,
                scale: 0.2,
                duration: Phaser.Math.Between(280, 520),
                ease: 'Cubic.out',
                onComplete: () => p.destroy(),
            });
        }
    }

    floatText(msg, x, y, color) {
        const t = this.add
            .text(x, y, msg, {
                fontFamily: 'monospace',
                fontSize: '15px',
                color,
                stroke: '#0e1117',
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(20);
        this.tweens.add({
            targets: t,
            y: y - 28,
            alpha: 0,
            duration: 680,
            ease: 'Cubic.out',
            onComplete: () => t.destroy(),
        });
    }
}
