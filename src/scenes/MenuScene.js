import Phaser from 'phaser';
import { sfx } from '../game/sfx.js';
import { loadBest } from '../game/storage.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.started = false;

        this.add.image(0, 0, 'sky').setOrigin(0).setDisplaySize(W, H).setDepth(-30);
        this.far = this.add.tileSprite(0, 232, W, 200, 'far').setOrigin(0).setDepth(-20);
        this.mid = this.add.tileSprite(0, 272, W, 160, 'mid').setOrigin(0).setDepth(-19);

        // lantai pabrik
        const groundY = 492;
        for (let x = 0; x < W + 36; x += 36) {
            const col = Math.round(x / 36);
            this.add.image(x + 18, groundY + 18, 'tiles', col % 2 ? 1 : 2).setScale(2).setDepth(-1);
            this.add.image(x + 18, groundY + 54, 'tiles', col % 2 ? 33 : 34).setScale(2).setDepth(-1);
            this.add.image(x + 18, groundY + 90, 'tiles', col % 2 ? 34 : 33).setScale(2).setDepth(-1);
        }

        // properti pabrik
        [
            ['*', 90, groundY - 18],
            ['c', 190, groundY - 18],
            ['C', 226, groundY - 18],
            ['f', 630, groundY - 18],
            ['s', 706, groundY - 18],
            ['t', 760, groundY - 54],
        ].forEach(([t, x, y]) => {
            const frame = { '*': 64, c: 9, C: 10, f: 99, s: 73, t: 75 }[t];
            this.add.image(x, y, 'tiles', frame).setScale(2).setDepth(0);
        });

        // karakter demo
        this.hero = this.add.sprite(400, groundY - 16, 'hero').setScale(2).setDepth(5);
        this.hero.play('hero-run');

        const bot = this.add.sprite(250, groundY - 14, 'bot').setScale(2).setDepth(5);
        bot.play('bot-walk');
        this.tweens.add({ targets: bot, x: 320, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

        const drone = this.add.sprite(560, 330, 'drone').setScale(2).setDepth(5);
        drone.play('drone-fly');
        this.tweens.add({ targets: drone, y: 300, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.tweens.add({ targets: drone, x: 640, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

        const coin = this.add.sprite(470, 428, 'coin').setScale(1.6).setDepth(5);
        coin.play('coin-spin');
        this.tweens.add({ targets: coin, y: 414, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

        // judul
        this.add
            .text(W / 2, 128, 'PIXEL ADVENTURE', {
                fontFamily: 'monospace',
                fontSize: '54px',
                fontStyle: 'bold',
                color: '#ffd479',
                stroke: '#191d26',
                strokeThickness: 12,
            })
            .setOrigin(0.5)
            .setDepth(10);

        this.add
            .text(W / 2, 188, 'I N D U S T R I A L   S H I F T', {
                fontFamily: 'monospace',
                fontSize: '19px',
                color: '#6ef0ff',
                stroke: '#191d26',
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setDepth(10);

        this.prompt = this.add
            .text(W / 2, 268, 'TEKAN ENTER / SPASI UNTUK MULAI', {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#f4f8fc',
                stroke: '#191d26',
                strokeThickness: 5,
            })
            .setOrigin(0.5)
            .setDepth(10);
        this.tweens.add({ targets: this.prompt, alpha: 0.25, duration: 620, yoyo: true, repeat: -1 });

        this.add
            .text(W / 2, 336, 'GERAK  :  A / D  atau  \u2190 \u2192\nLOMPAT :  SPASI / W / \u2191', {
                fontFamily: 'monospace',
                fontSize: '15px',
                color: '#e3eef7',
                align: 'center',
                lineSpacing: 8,
                stroke: '#191d26',
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(10);

        const best = loadBest();
        this.add
            .text(W - 16, 16, 'REKOR  ' + String(best).padStart(6, '0'), {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffd479',
                stroke: '#191d26',
                strokeThickness: 4,
            })
            .setOrigin(1, 0)
            .setDepth(10);

        this.add
            .text(W / 2, H - 20, 'Aset tile: Kenney \u2022 Pixel Platformer Industrial Expansion (CC0)', {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#c8d9e6',
                stroke: '#191d26',
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(10);

        // input
        this.input.keyboard.on('keydown', (ev) => {
            if (ev.code === 'Enter' || ev.code === 'Space' || ev.code === 'NumpadEnter') this.startGame();
        });
        this.input.on('pointerdown', () => this.startGame());

        this.cameras.main.fadeIn(300, 12, 20, 30);
    }

    startGame() {
        if (this.started) return;
        this.started = true;
        sfx.select();
        this.cameras.main.fadeOut(260, 12, 20, 30);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Game', { level: 0, score: 0, lives: 3 });
        });
    }

    update() {
        this.far.tilePositionX += 0.12;
        this.mid.tilePositionX += 0.28;
    }
}
