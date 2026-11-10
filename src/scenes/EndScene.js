import Phaser from 'phaser';
import { sfx } from '../game/sfx.js';
import { loadBest, saveBest } from '../game/storage.js';

export default class EndScene extends Phaser.Scene {
    constructor() {
        super('End');
    }

    init(data = {}) {
        this.win = !!data.win;
        this.score = data.score ?? 0;
        this.bonus = data.bonus ?? 0;
        this.level = data.level ?? 1;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.started = false;

        this.add.image(0, 0, 'sky').setOrigin(0).setDisplaySize(W, H).setDepth(-30);
        this.add.tileSprite(0, 232, W, 200, 'far').setOrigin(0).setDepth(-20).setAlpha(0.7);
        this.add.tileSprite(0, 272, W, 160, 'mid').setOrigin(0).setDepth(-19).setAlpha(0.7);
        this.add.rectangle(0, 0, W, H, 0x0b1220, 0.55).setOrigin(0).setDepth(-10);

        const best = saveBest(this.score);

        const title = this.win ? 'MISI SELESAI!' : 'GAME OVER';
        const color = this.win ? '#2ee6a8' : '#ff8073';

        if (this.win) {
            sfx.win();
        } else {
            sfx.over();
        }

        const hero = this.add
            .sprite(W / 2, 300, 'hero')
            .setScale(3)
            .setDepth(5);
        hero.play(this.win ? 'hero-idle' : 'hero-hurt');
        if (!this.win) hero.setAngle(90);

        this.add
            .text(W / 2, 120, title, {
                fontFamily: 'monospace',
                fontSize: '54px',
                fontStyle: 'bold',
                color,
                stroke: '#191d26',
                strokeThickness: 12,
            })
            .setOrigin(0.5)
            .setDepth(10);

        this.add
            .text(W / 2, 186, this.win ? 'Semua sektor berhasil dilewati!' : 'Robotmu kehabisan tenaga...', {
                fontFamily: 'monospace',
                fontSize: '17px',
                color: '#dbe6f2',
                stroke: '#191d26',
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(10);

        this.add
            .text(W / 2, 380, 'SKOR AKHIR  ' + String(this.score).padStart(6, '0'), {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffd479',
                stroke: '#191d26',
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setDepth(10);

        if (this.win && this.bonus > 0) {
            this.add
                .text(W / 2, 414, 'BONUS NYAWA  +' + this.bonus, {
                    fontFamily: 'monospace',
                    fontSize: '15px',
                    color: '#9dfae2',
                    stroke: '#191d26',
                    strokeThickness: 4,
                })
                .setOrigin(0.5)
                .setDepth(10);
        }

        this.add
            .text(W / 2, 452, 'REKOR  ' + String(best).padStart(6, '0'), {
                fontFamily: 'monospace',
                fontSize: '17px',
                color: '#f4f8fc',
                stroke: '#191d26',
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(10);

        const prompt = this.add
            .text(W / 2, 520, 'ENTER / SPASI  :  MENU        R  :  MAIN LAGI', {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#dbe6f2',
                stroke: '#191d26',
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(10);
        this.tweens.add({ targets: prompt, alpha: 0.3, duration: 620, yoyo: true, repeat: -1 });

        if (this.win) this.celebrate();

        this.input.keyboard.on('keydown', (ev) => {
            if (ev.code === 'Enter' || ev.code === 'Space' || ev.code === 'NumpadEnter') this.toMenu();
            else if (ev.code === 'KeyR') this.replay();
        });
        this.input.on('pointerdown', () => this.toMenu());

        this.cameras.main.fadeIn(300, 12, 20, 30);
    }

    celebrate() {
        const colors = [0x2ee6a8, 0xffd479, 0x6ef0ff, 0xff8073, 0xf4f8fc];
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(60, this.scale.width - 60);
            const p = this.add.rectangle(x, Phaser.Math.Between(-40, 120), 6, 6, colors[i % colors.length]).setDepth(8);
            this.tweens.add({
                targets: p,
                y: Phaser.Math.Between(420, 620),
                x: p.x + Phaser.Math.Between(-60, 60),
                angle: Phaser.Math.Between(-360, 360),
                alpha: 0.2,
                duration: Phaser.Math.Between(1600, 3200),
                delay: Phaser.Math.Between(0, 900),
                repeat: -1,
                ease: 'Sine.in',
            });
        }
    }

    toMenu() {
        if (this.started) return;
        this.started = true;
        sfx.select();
        this.scene.start('Menu');
    }

    replay() {
        if (this.started) return;
        this.started = true;
        sfx.select();
        this.scene.start('Game', { level: 0, score: 0, lives: 3 });
    }
}
