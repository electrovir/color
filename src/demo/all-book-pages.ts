import {type BookPage} from 'element-book';
import {virColorPickerBookPage} from '../elements/vir-color-picker.element.book.js';
import {colorExamplesPage} from './color-examples.book.js';
import {elementsBookPage, examplesBookPage} from './top-level-pages.js';

export const allBookPages: BookPage[] = [
    elementsBookPage,
    examplesBookPage,

    colorExamplesPage,
    virColorPickerBookPage,
];
