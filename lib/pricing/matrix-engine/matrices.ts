import type { HeightBreakpoint } from "./breakpoints";

/**
 * LOCKED — verified source data (vendor retail, in whole dollars). Do not
 * alter any value, including the Group E / H74 / W42 = 264 anomaly (see
 * fabricCatalog.ts / engine.ts for the associated warning). Transcribed
 * exactly from the verified specification; changes here must go through
 * the same vendor re-verification the original data went through.
 *
 * Each row has exactly 10 values, positionally aligned to
 * WIDTH_BREAKPOINTS: [30, 36, 42, 48, 60, 72, 84, 96, 120, 140].
 */
export type MatrixRow = readonly [number, number, number, number, number, number, number, number, number, number];

export type Matrix = Readonly<Record<HeightBreakpoint, MatrixRow>>;

export type PriceGroupLetter = "A" | "B" | "C" | "D" | "E";

const GROUP_A: Matrix = {
  40: [108, 130, 146, 170, 186, 200, 250, 304, 384, 504],
  50: [126, 144, 158, 184, 196, 212, 276, 326, 408, 530],
  60: [144, 158, 178, 198, 212, 232, 292, 348, 430, 580],
  74: [162, 178, 198, 216, 230, 244, 316, 366, 460, 620],
  84: [178, 188, 216, 228, 242, 278, 338, 380, 480, 680],
  96: [192, 204, 234, 246, 266, 302, 364, 400, 504, 720],
  120: [212, 216, 266, 280, 304, 320, 390, 416, 580, 760],
  140: [236, 252, 296, 314, 356, 358, 450, 470, 740, 808],
  160: [258, 280, 322, 350, 390, 410, 478, 496, 770, 930],
  190: [296, 318, 362, 392, 470, 490, 508, 528, 830, 980],
};

const GROUP_B: Matrix = {
  40: [116, 140, 157, 183, 200, 216, 270, 328, 414, 544],
  50: [136, 155, 170, 198, 211, 228, 298, 352, 440, 572],
  60: [155, 170, 192, 213, 228, 250, 315, 375, 464, 626],
  74: [174, 192, 213, 233, 248, 263, 341, 395, 496, 669],
  84: [192, 203, 233, 246, 261, 300, 365, 410, 518, 734],
  96: [207, 220, 252, 265, 287, 326, 393, 432, 544, 777],
  120: [228, 233, 287, 302, 328, 345, 421, 449, 626, 820],
  140: [254, 250, 319, 339, 384, 386, 486, 507, 799, 872],
  160: [278, 302, 347, 378, 421, 442, 516, 535, 831, 1004],
  190: [319, 343, 390, 423, 507, 529, 548, 570, 896, 1058],
};

const GROUP_C: Matrix = {
  40: [133, 161, 180, 210, 230, 248, 310, 377, 476, 625],
  50: [156, 178, 195, 227, 242, 262, 342, 404, 506, 657],
  60: [178, 195, 220, 244, 262, 287, 362, 431, 533, 719],
  74: [200, 220, 244, 267, 285, 302, 392, 454, 570, 769],
  84: [220, 233, 267, 282, 300, 345, 419, 471, 595, 844],
  96: [238, 253, 289, 304, 330, 374, 451, 496, 625, 893],
  120: [262, 267, 330, 347, 377, 396, 484, 516, 719, 943],
  140: [292, 287, 366, 389, 441, 443, 558, 583, 918, 1002],
  160: [319, 347, 399, 434, 484, 508, 615, 615, 955, 1154],
  190: [366, 394, 448, 486, 583, 608, 630, 655, 1030, 1216],
};

const GROUP_D: Matrix = {
  40: [152, 185, 207, 241, 264, 285, 356, 433, 547, 718],
  50: [179, 204, 224, 261, 278, 301, 393, 464, 581, 755],
  60: [204, 224, 253, 280, 301, 330, 416, 495, 612, 826],
  74: [230, 253, 280, 307, 327, 347, 450, 522, 655, 884],
  84: [253, 267, 307, 324, 345, 396, 481, 514, 684, 970],
  96: [273, 290, 332, 349, 379, 430, 518, 570, 718, 1026],
  120: [301, 307, 379, 399, 433, 455, 556, 593, 826, 1084],
  140: [335, 330, 420, 447, 507, 509, 641, 670, 1055, 1152],
  160: [366, 399, 458, 499, 556, 584, 707, 707, 1098, 1327],
  190: [420, 453, 515, 558, 670, 699, 724, 753, 1184, 1398],
};

/**
 * Group E, height 74 row: the third value (width 42) is 264 — this is the
 * verified-but-unusual source anomaly. See PRICE_ANOMALIES below and
 * SOURCE_DATA_WARNING in engine.ts. Do not "fix" it.
 */
const GROUP_E: Matrix = {
  40: [197, 240, 269, 313, 343, 370, 462, 562, 711, 933],
  50: [232, 265, 291, 339, 361, 391, 510, 603, 755, 981],
  60: [265, 291, 328, 364, 391, 429, 540, 643, 795, 1073],
  74: [299, 328, 264, 399, 425, 451, 585, 678, 851, 1149],
  84: [328, 347, 399, 421, 448, 514, 638, 668, 889, 1261],
  96: [362, 377, 431, 453, 492, 559, 673, 741, 933, 1333],
  120: [391, 399, 492, 518, 562, 591, 722, 770, 1073, 1409],
  140: [435, 429, 546, 581, 659, 661, 833, 871, 1371, 1497],
  160: [475, 518, 595, 648, 722, 759, 919, 919, 1427, 1725],
  190: [546, 588, 669, 725, 871, 908, 941, 978, 1539, 1817],
};

export const PRICE_MATRICES: Readonly<Record<PriceGroupLetter, Matrix>> = {
  A: GROUP_A,
  B: GROUP_B,
  C: GROUP_C,
  D: GROUP_D,
  E: GROUP_E,
};

/**
 * Known verified-but-unusual source values that must remain unchanged
 * until confirmed with the vendor. Any pricing result landing exactly on
 * one of these cells gets the associated warning attached — see engine.ts.
 */
export const PRICE_ANOMALIES: ReadonlyArray<{
  priceGroup: PriceGroupLetter;
  widthTier: number;
  heightTier: number;
  warning: string;
}> = [
  {
    priceGroup: "E",
    widthTier: 42,
    heightTier: 74,
    warning: "SOURCE DATA WARNING: H74/W42 VALUE SHOULD BE HUMAN-VERIFIED",
  },
];
