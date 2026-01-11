/* node:coverage disable */

import {defineBookPage} from 'element-book';
import {html} from 'element-vir';
import {elementsBookPage} from '../demo/top-level-pages.js';
import {VirColorPairContrastSummary} from './vir-color-pair-contrast-summary.element.js';

export const virColorPairContrastSummaryBookPage = defineBookPage({
    parent: elementsBookPage,
    title: VirColorPairContrastSummary.tagName,
    defineExamples({defineExample}) {
        defineExample({
            title: 'basic',
            render() {
                return html`
                    <${VirColorPairContrastSummary.assign({
                        foregroundColor: '#1a1a2e',
                        backgroundColor: '#eaeaea',
                    })}></${VirColorPairContrastSummary}>
                `;
            },
        });
    },
});
