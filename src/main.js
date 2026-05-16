import './style.css';
import { initSite } from './app.js';

const page = document.body.dataset.page ?? 'home';
initSite(document.querySelector('#app'), page);
