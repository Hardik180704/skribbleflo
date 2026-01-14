import { createRoot } from 'react-dom/client';
import styles from '../index.css?inline'; // Import styles as string

import '@fontsource/inter/400.css';
// Note: Fontsource imports inject @font-face into document.head.
// Fonts usually penetrate Shadow DOM if defined in main document, but sometimes elements inside need explicit font-family.

console.log('ScribbleFlow Content Script Injected');

// Shadow DOM Injection to isolate styles
const host = document.createElement('div');
host.id = 'scribbleflow-host';
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

// Inject Tailwind styles into Shadow DOM
const style = document.createElement('style');
style.textContent = styles;
shadow.appendChild(style);

import { Canvas } from './Canvas';

const rootContainer = document.createElement('div');
rootContainer.id = 'scribbleflow-overlay';
// Reset styles for the container to avoid inheriting from page
rootContainer.style.position = 'fixed';
rootContainer.style.top = '0';
rootContainer.style.left = '0';
rootContainer.style.width = '0'; // Let canvas inside handle width
rootContainer.style.height = '0';
rootContainer.style.zIndex = '2147483647';
shadow.appendChild(rootContainer);

const root = createRoot(rootContainer);
root.render(<Canvas />);

