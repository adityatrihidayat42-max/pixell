// Data level.
// Legenda peta:
//   '#' tanah (dapat tutup logam otomatis)   '=' platform logam
//   'h' blok strip hazard                     'o' girder oranye
//   '~' permukaan limbah hijau (mematikan)    ',' isi limbah hijau
//   'b' bolt (koin)                           'w' robot patroli
//   'd' drone                                 'p' titik spawn pemain
//   'x' portal keluar
//
// Lebar semua baris 64 sel, tinggi 17 sel (1 sel = 36 px).
// Permukaan tanah utama ada di baris 12.

const d = (n) => '.'.repeat(n);
const h = (n) => '#'.repeat(n);

const LEVEL_1 = [
    d(64), // 0
    d(64), // 1
    d(64), // 2
    d(64), // 3
    d(64), // 4
    d(37) + 'bb' + d(25), // 5  bolt di atas girder
    d(36) + 'oooo' + d(24), // 6  girder gantung
    d(40) + 'd' + d(13) + 'bb' + d(8), // 7  drone + bolt
    d(26) + 'b' + d(37), // 8  bolt di atas platform
    d(25) + '===' + d(4) + 'w' + d(20) + '===' + d(2) + 'w' + d(5), // 9
    d(30) + '#####' + d(22) + 'hhh' + d(4), // 10 plateau + strip hazard
    d(3) + 'p' + d(2) + 'bbb' + d(5) + 'w' + d(28) + 'bb' + d(15) + 'x' + d(3), // 11
    h(20) + '~~~' + h(22) + '~~~' + h(16), // 12 permukaan tanah + 2 kolam limbah
    h(20) + ',,,' + h(22) + ',,,' + h(16), // 13
    h(20) + ',,,' + h(22) + ',,,' + h(16), // 14
    h(20) + ',,,' + h(22) + ',,,' + h(16), // 15
    h(20) + ',,,' + h(22) + ',,,' + h(16), // 16
];

const LEVEL_2 = [
    d(64), // 0
    d(64), // 1
    d(64), // 2
    d(64), // 3
    d(64), // 4
    d(26) + 'bbb' + d(35), // 5
    d(26) + '===' + d(35), // 6
    d(34) + 'bb' + d(9) + 'd' + d(18), // 7
    d(31) + '===' + d(14) + 'bb' + d(14), // 8
    d(21) + '===' + d(14) + 'ooo' + d(6) + '===' + d(6) + 'x' + d(7), // 9
    d(55) + 'hhhh' + d(5), // 10
    d(2) + 'p' + d(7) + 'w' + d(13) + 'w' + d(6) + 'bb' + d(22) + 'hhhh' + d(5), // 11
    h(14) + '~~~~~' + h(19) + '~~~' + h(23), // 12 (kolam 5 sel + 3 sel)
    h(14) + ',,,,,' + h(19) + ',,,' + h(23), // 13
    h(14) + ',,,,,' + h(19) + ',,,' + h(23), // 14
    h(14) + ',,,,,' + h(19) + ',,,' + h(23), // 15
    h(14) + ',,,,,' + h(19) + ',,,' + h(23), // 16
];

export const LEVELS = [
    {
        name: 'SEKTOR 01',
        title: 'GERBANG PABRIK',
        map: LEVEL_1,
        decor: [
            ['*', 1, 11],
            ['c', 16, 11],
            ['C', 17, 11],
            ['!', 19, 11],
            ['B', 24, 11],
            ['t', 19, 10],
            ['f', 36, 11],
            ['s', 42, 11],
            ['*', 48, 11],
            ['v', 53, 11],
            ['m', 59, 11],
            // rantai penyangga girder
            ['y', 36, 1], ['y', 36, 2], ['y', 36, 3], ['y', 36, 4], ['y', 36, 5],
            ['y', 39, 1], ['y', 39, 2], ['y', 39, 3], ['y', 39, 4], ['y', 39, 5],
        ],
        movers: [],
    },
    {
        name: 'SEKTOR 02',
        title: 'JALUR LEBURAN',
        map: LEVEL_2,
        decor: [
            ['*', 1, 11],
            ['t', 12, 10],
            ['!', 13, 11],
            ['c', 20, 11],
            ['q', 21, 11],
            ['B', 30, 11],
            ['!', 37, 11],
            ['s', 42, 11],
            ['v', 45, 11],
            ['C', 48, 11],
            ['f', 50, 11],
            ['m', 61, 11],
        ],
        // platform bergerak di atas kolam limbah pertama
        movers: [{ x1: 15.5, x2: 17.5, y: 11.5, speed: 70 }],
    },
];
