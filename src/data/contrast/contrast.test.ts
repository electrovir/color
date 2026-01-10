import {describe, itCases} from '@augment-vir/test';
import {
    calculateContrast,
    ContrastLevelName,
    contrastLevelNameMap,
    findClosestColor,
    findColorAtContrastLevel,
} from './contrast.js';

describe(calculateContrast.name, () => {
    itCases(calculateContrast, [
        {
            it: 'works on high contrast',
            input: {
                foreground: 'black',
                background: 'white',
            },
            expect: {
                contrast: 106,
                fontSizes: {
                    '100': 38,
                    '200': 25,
                    '300': 18,
                    '400': 14.5,
                    '500': 14,
                    '600': 13,
                    '700': 12,
                    '800': 16,
                    '900': 18,
                },
                contrastLevel: contrastLevelNameMap[ContrastLevelName.SmallBodyText],
            },
        },
        {
            it: 'works on no contrast',
            input: {
                foreground: 'white',
                background: 'white',
            },
            expect: {
                contrast: 0,
                fontSizes: {
                    '100': 999,
                    '200': 999,
                    '300': 999,
                    '400': 999,
                    '500': 999,
                    '600': 999,
                    '700': 999,
                    '800': 999,
                    '900': 999,
                },
                contrastLevel: contrastLevelNameMap[ContrastLevelName.Invisible],
            },
        },
    ]);
});

describe(findClosestColor.name, () => {
    itCases(findClosestColor, [
        {
            it: 'finds exact match when available',
            inputs: [
                'white',
                [
                    'white',
                    'black',
                ],
            ],
            expect: 'white',
        },
        {
            it: 'finds the closest color by contrast',
            inputs: [
                'white',
                [
                    'gray',
                    'black',
                ],
            ],
            expect: 'gray',
        },
        {
            it: 'returns last color with lowest contrast when multiple have same contrast',
            inputs: [
                '#808080',
                [
                    'white',
                    'black',
                ],
            ],
            expect: 'black',
        },
    ]);
});

describe(findColorAtContrastLevel.name, () => {
    itCases(findColorAtContrastLevel, [
        {
            it: 'finds a color at the desired contrast level with foreground array',
            inputs: [
                {
                    foreground: [
                        'black',
                        'gray',
                        'white',
                    ],
                    background: 'white',
                },
                ContrastLevelName.SmallBodyText,
            ],
            expect: 'black',
        },
        {
            it: 'finds a color at the desired contrast level with background array',
            inputs: [
                {
                    foreground: 'black',
                    background: [
                        'white',
                        'gray',
                        'black',
                    ],
                },
                ContrastLevelName.SmallBodyText,
            ],
            expect: 'white',
        },
        {
            it: 'returns undefined when no color matches the desired contrast level',
            inputs: [
                {
                    foreground: [
                        'white',
                        '#fefefe',
                    ],
                    background: 'white',
                },
                ContrastLevelName.SmallBodyText,
            ],
            expect: undefined,
        },
        {
            it: 'throws an error when no color array is provided',
            inputs: [
                {
                    foreground: 'black',
                    background: 'white',
                } as any,
                ContrastLevelName.SmallBodyText,
            ],
            throws: {
                matchConstructor: Error,
            },
        },
        {
            it: 'finds color at lower contrast level',
            inputs: [
                {
                    foreground: [
                        'black',
                        '#555555',
                        '#999999',
                    ],
                    background: 'white',
                },
                ContrastLevelName.Header,
            ],
            expect: '#999999',
        },
    ]);
});
