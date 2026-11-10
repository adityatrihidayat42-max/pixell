// Aturan tile & pembacaan level
// Sheet Kenney "Pixel Platformer - Industrial Expansion": 18px, 16 kolom x 7 baris.

export const SRC = 18;              // ukuran 1 tile di sheet asli
export const SCALE = 2;             // diperbesar 2x saat digambar
export const TS = SRC * SCALE;      // 36 px per tile di dunia game

export const SOLID = '#=ho';
export const GOO = '~,';

export function isSolid(ch) {
    return typeof ch === 'string' && ch.length === 1 && SOLID.indexOf(ch) !== -1;
}

export function isGoo(ch) {
    return typeof ch === 'string' && ch.length === 1 && GOO.indexOf(ch) !== -1;
}

// hiasan latar: huruf -> index frame di sheet Kenney
export const DECOR = {
    '*': 64,   // lampu beacon merah
    'B': 65,   // lampu beacon biru
    '!': 41,   // rambu hazard
    'v': 66,   // segitiga peringatan
    's': 73,   // papan tulis hijau
    'c': 9,    // kotak kayu/logam oranye
    'C': 10,   // kotak campuran
    'm': 92,   // peti logam besar
    'f': 99,   // kipas / turbin
    't': 75,   // pipa vertikal
    'n': 27,   // panel mesin
    'q': 28,   // mesin merah
    'y': 8,    // rantai gantung
    'z': 62,   // blok strip hazard (dekorasi)
    'p': 107,  // pipa horizontal
    'h': 57,   // kotak kuning
    'j': 76,   // peti logam bulat
};

/**
 * Pilih index frame sheet Kenney untuk satu sel peta.
 * @param {(r:number,c:number)=>string} at  akses sel peta (di luar batas = ' ')
 */
export function tileFrameAt(at, r, c, ch) {
    const solidL = isSolid(at(r, c - 1));
    const solidR = isSolid(at(r, c + 1));

    switch (ch) {
        case '#': {
            // tanah: permukaan atas dapat tutup logam
            const covered = isSolid(at(r - 1, c));
            if (!covered) {
                if (!solidL) return 0;              // tepi kiri
                if (!solidR) return 3;              // tepi kanan
                return (r + c) % 2 ? 1 : 2;         // tengah
            }
            if (!solidL) return 32;
            if (!solidR) return 35;
            return (r + c) % 2 ? 33 : 34;
        }
        case '=':
            if (!solidL) return 84;
            if (!solidR) return 86;
            return 85;
        case 'h': {
            const stacked = at(r + 1, c) === 'h';
            if (!stacked) {
                if (!solidL) return 87;
                if (!solidR) return 90;
                return (r + c) % 2 ? 88 : 89;
            }
            if (!solidL) return 103;
            if (!solidR) return 106;
            return (r + c) % 2 ? 104 : 105;
        }
        case 'o':
            if (!solidL) return 4;
            if (!solidR) return 6;
            return 5;
        case '~':
        case ',': {
            const gooUp = isGoo(at(r - 1, c));
            const gooL = isGoo(at(r, c - 1));
            const gooR = isGoo(at(r, c + 1));
            if (!gooUp) {
                if (!gooL) return 13;
                if (!gooR) return 15;
                return 14;
            }
            // isi limbah lebih dalam (tanpa pita putih di tiap baris)
            if (!gooL) return 29;
            if (!gooR) return 31;
            return 30;
        }
        default:
            return -1;
    }
}
