/* node:coverage disable */

import {checkWrap} from '@augment-vir/assert';
import {css, defineElement, html, unsafeCSS} from 'element-vir';
import {Color, type ColorUpdate} from './color.js';
import {allExamples} from './color.mock.js';

const VirExample = defineElement<{example: string | ColorUpdate}>()({
    tagName: 'vir-example',
    styles: css`
        :host {
            display: flex;
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

            & .format-name {
                text-align: center;
                opacity: 0.4;
                position: absolute;
                bottom: 100%;
                width: 100%;
            }
        }

        .swatches {
            display: flex;
        }
    `,
    render({inputs}) {
        const colors = new Color(inputs.example).toCss();

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
            <section class="strings">
                <code>${checkWrap.isString(inputs.example) || JSON.stringify(inputs.example)}</code>
                ${cssStringTemplates}
            </section>
            <section class="swatches">${swatchTemplates}</section>
        `;
    },
});

export const VirApp = defineElement()({
    tagName: 'vir-app',
    styles: css`
        :host {
            display: flex;
            flex-wrap: wrap;
        }

        ${VirExample} {
            margin: 0 4px;
            margin-top: 16px;
        }
    `,
    render() {
        return allExamples.map((example) => {
            return html`
                <${VirExample.assign({example})}></${VirExample}>
            `;
        });
    },
});
