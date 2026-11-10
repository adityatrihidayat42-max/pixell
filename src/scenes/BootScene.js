import Phaser from 'phaser';
import { createTextures, createAnimations } from '../game/pixels.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.spritesheet('tiles', 'assets/kenney/Tilemap/tilemap_packed.png', {
            frameWidth: 18,
            frameHeight: 18,
        });

        // indikator loading sederhana
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, 320, 18, 0x1b2430).setStrokeStyle(2, 0x6ef0ff);
        const bar = this.add.rectangle(width / 2 - 158, height / 2, 4, 12, 0x2ee6a8).setOrigin(0, 0.5);
        this.add
            .text(width / 2, height / 2 - 34, 'MEMUAT...', {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#9fb6c9',
            })
            .setOrigin(0.5);

        this.load.on('progress', (p) => {
            bar.width = 4 + p * 312;
        });
    }

    create() {
        createTextures(this);
        this.makeComposedTextures();
        createAnimations(this);
        this.scene.start('Menu');
    }

    // Susun beberapa tile Kenney menjadi satu tekstur (platform bergerak).
    makeComposedTextures() {
        const src = this.textures.get('tiles').getSourceImage();
        const frames = [84, 85, 86];
        const tex = this.textures.createCanvas('mover', frames.length * 36, 36);
        const ctx = tex.getContext();
        ctx.imageSmoothingEnabled = false;
        frames.forEach((f, i) => {
            const sx = (f % 16) * 18;
            const sy = Math.floor(f / 16) * 18;
            ctx.drawImage(src, sx, sy, 18, 18, i * 36, 0, 36, 36);
        });
        tex.refresh();
        tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
}
