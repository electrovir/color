/* node:coverage disable */

import {checkWrap} from '@augment-vir/assert';
import {defineBookPage} from 'element-book';
import {css, html, unsafeCSS} from 'element-vir';
import {Color, type ColorUpdate} from '../../color-class/color.js';
import {allExamples} from '../../color-class/color.mock.js';
import {examplesBookPage} from '../top-level-pages.js';

function renderColorExample(example: string | ColorUpdate) {
    const colors = new Color(example).toCss();

    const cssStringTemplates = Object.values(colors).map((cssString) => {
        return html`
            <code>${cssString || '-'}</code>
        `;
    });

    const swatchTemplates = Object.entries(colors).map(
        ([
            formatName,
            cssString,
        ]) => {
            if (!cssString) {
                return html`
                    <div class="swatch"></div>
                `;
            }

            return html`
                <div
                    class="swatch"
                    style=${css`
                        background-color: ${unsafeCSS(cssString)};
                    `}
                >
                    <span class="format-name">${formatName}</span>
                </div>
            `;
        },
    );

    return html`
        <div class="example">
            <section class="strings">
                <code>${checkWrap.isString(example) || JSON.stringify(example)}</code>
                ${cssStringTemplates}
            </section>
            <section class="swatches">${swatchTemplates}</section>
        </div>
    `;
}

export const colorExamplesPage = defineBookPage({
    parent: examplesBookPage,
    title: 'Conversions',
    defineExamples({defineExample}) {
        defineExample({
            title: 'All Color Formats',
            styles: css`
                :host {
                    display: flex;
                    flex-wrap: wrap;
                }

                .example {
                    display: flex;
                    margin: 0 4px;
                    margin-top: 16px;
                }

                .strings {
                    display: flex;
                    flex-direction: column;
                    width: 256px;
                }

                .swatch {
                    height: 100px;
                    width: 100px;
                    position: relative;
                }

                .swatch .format-name {
                    text-align: center;
                    opacity: 0.4;
                    position: absolute;
                    bottom: 100%;
                    width: 100%;
                }

                .swatches {
                    display: flex;
                }
            `,
            render() {
                return allExamples.map((example) => renderColorExample(example));
            },
        });
    },
});
