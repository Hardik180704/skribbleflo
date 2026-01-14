
import { createRoot } from 'react-dom/client';
import '../index.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';



console.log('ScribbleFlow Content Script Injected');

// Shadow DOM Injection to isolate styles
const host = document.createElement('div');
host.id = 'scribbleflow-host';
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

// We need to inject the CSS into the Shadow DOM
// Since we are using Vite, we can't just link the stylesheet easily in dev mode sometimes without complex workarounds.
// However, the cleanest way in a pure CRX setup is to rely on Vite's CSS injection or manually inserting a style tag.
// For now, we will create a container.

const rootContainer = document.createElement('div');
rootContainer.id = 'scribbleflow-overlay';
shadow.appendChild(rootContainer);

const Overlay = () => {
    return (
        <div className="fixed top-4 right-4 z-[2147483647] font-sans">
             <div className="glass p-3 rounded-xl shadow-2xl flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs font-semibold text-slate-700">ScribbleFlow Active</span>
             </div>
        </div>
    );
}

const root = createRoot(rootContainer);
root.render(<Overlay />);

// Inject Tailwind styles into Shadow DOM
// In production, we fetch the CSS file from chrome.runtime.getURL.
// In dev (HMR), it's trickier.
// For now, we'll try to insert a style tag.
async function injectStyles() {
    const style = document.createElement('style');
    // This is a placeholder. Real style injection requires fetching the bundled CSS.
    // In Vite dev mode, styles are JS driven.
    shadow.appendChild(style);
}
injectStyles();
