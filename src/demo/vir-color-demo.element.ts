/* node:coverage disable */

import {ElementBookApp} from 'element-book';
import {css, defineElement, html} from 'element-vir';
import {allBookPages} from './all-book-pages.js';

export const VirColorDemo = defineElement()({
    tagName: 'vir-color-demo',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
        }

        ${ElementBookApp} {
            flex-grow: 1;
            max-width: 100%;
            box-sizing: border-box;
        }
    `,
    render() {
        return html`
            <${ElementBookApp.assign({
                pages: allBookPages,
            })}></${ElementBookApp}>
        `;
    },
});
