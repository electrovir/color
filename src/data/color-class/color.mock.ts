import {ColorSyntaxName} from './color-formats.js';
import {type ColorUpdate} from './color.js';

export const namedExamples = {
    hwbSet: {hwb: {h: 0, w: 10, b: 0}},
    red: 'red',
    fromHex: '#583758',
    fromUnsupportedFormat: 'color(--hsv 200 0.75 0.90)',
} as const satisfies Record<string, ColorUpdate | string>;

export const exampleConversions: (ColorUpdate | string)[] = [
    'lch(80 150 12)',
    {[ColorSyntaxName.lab]: {l: 100, a: 0, b: 127}},
    'lab(75 -20 95)',
    {[ColorSyntaxName.hexString]: '#f81'},
    {[ColorSyntaxName.name]: 'dodgerblue'},
    {[ColorSyntaxName.hex]: {r: 42, g: 180, b: 210}},
    {[ColorSyntaxName.rgb]: {r: 42, g: 180, b: 210}},
    {[ColorSyntaxName.hsl]: {h: 200, s: 80, l: 60}},
    {[ColorSyntaxName.hwb]: {h: 50, w: 20, b: 30}},
    {[ColorSyntaxName.lch]: {l: 80, c: 150, h: 120}},
    {[ColorSyntaxName.oklab]: {l: 0.821, a: 0.234, b: -0.119}},
    {[ColorSyntaxName.oklch]: {l: 0.901, c: 0.315, h: 250.5}},
    'oklab(0.421 0.165 -0.5)',
];

export const allExamples = [
    ...Object.values(namedExamples),
    ...exampleConversions,
];
