import {type BookPage} from 'element-book';
import {colorExamplesPage} from './book-pages/color-examples.book.js';
import {virColorPickerBookPage} from './book-pages/vir-color-picker.element.book.js';
import {elementsBookPage, examplesBookPage} from './top-level-pages.js';

export const allBookPages: BookPage[] = [
    elementsBookPage,
    examplesBookPage,

    colorExamplesPage,
    virColorPickerBookPage,
];
