import { getPageNumberFromUrl, getThreadIdFromUrl, safeAlert } from '../utils';
const page = getPageNumberFromUrl(window.location.pathname);
const threadId = getThreadIdFromUrl(window.location.pathname);
console.log('page:', page, 'threadId:', threadId); 