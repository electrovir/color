/* node:coverage disable */

import {defineBookPage} from 'element-book';
import {html} from 'element-vir';
import {defineCssVars} from 'lit-css-vars';
import type {ColorPair} from '../data/color-css.js';
import {elementsBookPage} from '../demo/top-level-pages.js';
import {VirColorPair} from './vir-color-pair.element.js';

const mockColors = defineCssVars({
    'mock-foreground': '#1a1a2e',
    'mock-background': '#eaeaea',
});

const mockColorPair: ColorPair = {
    foreground: mockColors['mock-foreground'],
    background: mockColors['mock-background'],
};

const mockColorsLowContrast = defineCssVars({
    'low-contrast-foreground': '#888888',
    'low-contrast-background': '#aaaaaa',
});

const mockColorPairLowContrast: ColorPair = {
    foreground: mockColorsLowContrast['low-contrast-foreground'],
    background: mockColorsLowContrast['low-contrast-background'],
};

export const virColorPairBookPage = defineBookPage({
    parent: elementsBookPage,
    title: VirColorPair.tagName,
    defineExamples({defineExample}) {
        defineExample({
            title: 'basic',
            render() {
                return html`
                    <${VirColorPair.assign({
                        color: mockColorPair,
                        showVarValues: false,
                        showVarNames: false,
                        showContrast: false,
                        fontWeight: 400,
                    })}></${VirColorPair}>
                `;
            },
        });

        defineExample({
            title: 'with var names',
            render() {
                return html`
                    <${VirColorPair.assign({
                        color: mockColorPair,
                        showVarValues: false,
                        showVarNames: true,
                        showContrast: false,
                        fontWeight: 400,
                    })}></${VirColorPair}>
                `;
            },
        });

        defineExample({
            title: 'with var names and values',
            render() {
                return html`
                    <${VirColorPair.assign({
                        color: mockColorPair,
                        showVarValues: true,
                        showVarNames: true,
                        showContrast: false,
                        fontWeight: 400,
                    })}></${VirColorPair}>
                `;
            },
        });

        defineExample({
            title: 'with contrast',
            render() {
                return html`
                    <${VirColorPair.assign({
                        color: mockColorPair,
                        showVarValues: false,
                        showVarNames: false,
                        showContrast: true,
                        fontWeight: 400,
                    })}></${VirColorPair}>
                `;
            },
        });

        defineExample({
            title: 'bold font weight',
            render() {
                return html`
                    <${VirColorPair.assign({
                        color: mockColorPair,
                        showVarValues: false,
                        showVarNames: false,
                        showContrast: true,
                        fontWeight: 700,
                    })}></${VirColorPair}>
                `;
            },
        });

        defineExample({
            title: 'low contrast',
            render() {
                return html`
                    <${VirColorPair.assign({
                        color: mockColorPairLowContrast,
                        showVarValues: false,
                        showVarNames: false,
                        showContrast: true,
                        fontWeight: 400,
                    })}></${VirColorPair}>
                `;
            },
        });

        defineExample({
            title: 'all options enabled',
            render() {
                return html`
                    <${VirColorPair.assign({
                        color: mockColorPair,
                        showVarValues: true,
                        showVarNames: true,
                        showContrast: true,
                        fontWeight: 400,
                    })}></${VirColorPair}>
                `;
            },
        });
    },
});
