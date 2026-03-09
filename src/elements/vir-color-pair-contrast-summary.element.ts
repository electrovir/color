/* node:coverage disable */

import {assertWrap} from '@augment-vir/assert';
import {getObjectTypedEntries, round} from '@augment-vir/common';
import {classMap, css, defineElement, html, unsafeCSS} from 'element-vir';
import {ViraBoldText} from 'vira/dist/elements/vira-bold-text.element.js';
import {viraFontCssVars} from 'vira/dist/styles/font.js';
import {noNativeSpacing} from 'vira/dist/styles/native-styles.js';
import {defineTable} from 'vira/dist/util/define-table.js';
import {Color} from '../data/color-class/color.js';
import {
    calculateContrast,
    calculateFontSizes,
    contrastLevelLabel,
    contrastLevels,
    fontWeightByName,
} from '../data/contrast/contrast.js';
import {VirColorSwatch} from './vir-color-swatch.element.js';
import {VirContrastIndicator} from './vir-contrast-indicator.element.js';

/**
 * A huge summary of a color pair's contrast levels, font sizes, font weights, etc.
 *
 * @category Elements
 */
export const VirColorPairContrastSummary = defineElement<{
    foregroundColor: string;
    backgroundColor: string;
}>()({
    tagName: 'vir-color-pair-contrast-summary',
    styles: css`
        :host {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 32px;
        }

        /* Color overlay styles */
        .color-overlay {
            display: flex;
            align-items: center;
            max-width: 100%;
            gap: 8px;
        }

        .constant-size-wrapper {
            display: flex;
            align-items: baseline;
            gap: 5cqmin;
            font-size: 20cqmin;
        }

        .square {
            margin: 12px 0;
            width: 20cqmin;
            height: 20cqmin;
            background-color: currentColor;
        }

        .foreground-content {
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .needed-size {
            display: flex;
            justify-content: center;
            top: 100%;
            left: 0;
            text-align: center;
            position: absolute;
            width: 100%;
        }

        ${VirContrastIndicator} {
            width: 100%;
        }

        .color-overlay td {
            padding: 4px 8px;
            font-weight: bold;
        }

        .color-overlay th {
            padding: 4px 8px;
            text-align: end;
            font-weight: normal;
        }

        /* Text weights styles */
        .text-weights td {
            padding: 4px;
        }

        .size-display {
            height: 50px;
            width: 100px;
            overflow: hidden;
            display: flex;
            align-items: center;
        }

        .cell-size {
            width: 5em;
        }

        /* Contrast levels styles */
        .contrast-levels td {
            padding: 4px;
        }

        .contrast-levels tr {
            opacity: 0.4;
        }

        .contrast-levels .selected-row {
            opacity: 1;
            font-weight: bold;
        }

        pre {
            ${noNativeSpacing};
            font-family: ${viraFontCssVars['vira-monospace'].value};
        }

        .monospace-font {
            font-family: ${viraFontCssVars['vira-monospace'].value};
        }
    `,
    render({inputs}) {
        const contrast = calculateContrast({
            background: new Color(inputs.backgroundColor).toCss().rgb,
            foreground: new Color(inputs.foregroundColor).toCss().rgb,
        });

        const {rows: colorPairRows} = defineTable(
            [
                {
                    key: 'colorLayer',
                },
                {
                    key: 'colorValue',
                },
            ],
            getObjectTypedEntries({
                'Foreground:': new Color(inputs.foregroundColor).toFormattedStrings().hexString,
                'Background:': new Color(inputs.backgroundColor).toFormattedStrings().hexString,
                'Contrast:': `${contrast.contrast} Lc`.padEnd(9, ' '),
            }),
            ([
                colorLayer,
                value,
            ]) => {
                return {
                    colorLayer,
                    colorValue: html`
                        <pre>${value}</pre>
                    `,
                };
            },
        );

        const {rows: weightRows} = defineTable(
            [
                {
                    key: 'weight',
                },
                {
                    key: 'size',
                },
            ],
            Object.entries(contrast.fontSizes).map(
                ([
                    weight,
                    size,
                ]) => {
                    return {
                        weight: Number(weight),
                        size,
                    };
                },
            ),
            ({size, weight}) => {
                return {
                    size: `${round(size, {
                        digits: 1,
                    })}px`,
                    weight: html`
                        <span
                            style=${css`
                                font-weight: ${weight};
                            `}
                        >
                            ${weight}
                        </span>
                    `,
                };
            },
        );

        const {rows: levelRows} = defineTable(
            [
                {
                    key: 'boundaryLc',
                },
                {
                    key: 'levelName',
                },
            ],
            contrastLevels,
            (contrastLevel) => {
                return {
                    boundaryLc: `${contrastLevel.min} Lc`,
                    levelName: contrastLevelLabel[contrastLevel.name],
                };
            },
        );

        return html`
            <div class="color-overlay">
                <${VirColorSwatch.assign({
                    backgroundColor: inputs.backgroundColor,
                    foregroundColor: inputs.foregroundColor,
                })}>
                    <div class="foreground-content">
                        <div class="constant-size-wrapper">
                            <div class="square"></div>
                            <b>Aa</b>
                        </div>
                        <div class="needed-size">
                            <span
                                style=${css`
                                    font-size: ${contrast.fontSizes[fontWeightByName.Normal]}px;
                                    line-height: ${contrast.fontSizes[fontWeightByName.Normal] *
                                    0.77}px;
                                    visibility: ${unsafeCSS(
                                        contrast.fontSizes[fontWeightByName.Normal] > 900
                                            ? 'hidden'
                                            : 'visible',
                                    )};
                                `}
                            >
                                Min Size
                            </span>
                        </div>
                    </div>
                </${VirColorSwatch}>
                <div class="details">
                    <table>
                        <tbody>
                            ${colorPairRows.map((row) => {
                                const cells = row.cells.map((cell, index) => {
                                    const element = index ? 'td' : 'th';

                                    return html`
                                        <${element}>${cell.content}</${element}>
                                    `;
                                });

                                return html`
                                    <tr>${cells}</tr>
                                `;
                            })}
                        </tbody>
                    </table>

                    <${VirContrastIndicator.assign({
                        contrast,
                        fontWeight: fontWeightByName.Normal,
                    })}></${VirContrastIndicator}>
                </div>
            </div>

            <table class="text-weights">
                ${weightRows.map((row) => {
                    const cells = row.cells.map((cell) => {
                        return html`
                            <td class="cell-${cell.key} monospace-font">${cell.content}</td>
                        `;
                    });

                    return html`
                        <tr>
                            ${cells}
                            <td>
                                <div
                                    class="size-display"
                                    style=${css`
                                        background-color: ${unsafeCSS(inputs.backgroundColor)};
                                        color: ${unsafeCSS(inputs.foregroundColor)};
                                        font-weight: ${row.data.weight};
                                        font-size: ${row.data.size}px;
                                    `}
                                >
                                    <span>Text</span>
                                </div>
                            </td>
                        </tr>
                    `;
                })}
            </table>

            <table class="contrast-levels">
                ${levelRows.map((row) => {
                    const isSelectedRow = contrast.contrastLevel.name === row.data.name;

                    const cells = row.cells.map((cell) => {
                        return html`
                            <td><${ViraBoldText.assign({
                                bold: isSelectedRow,
                                text: assertWrap.isString(cell.content),
                            })}><${ViraBoldText}></td>
                        `;
                    });

                    const title = [
                        row.data.description,
                        '\nFont weights to font sizes:',
                        JSON.stringify(calculateFontSizes(row.data.min), null, 4),
                    ].join('\n');

                    return html`
                        <tr
                            title=${title}
                            class=${classMap({
                                'selected-row': isSelectedRow,
                            })}
                        >
                            ${cells}
                        </tr>
                    `;
                })}
            </table>
        `;
    },
});
