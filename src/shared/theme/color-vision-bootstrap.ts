export const colorVisionStorageKey = 'vasco-color-vision';

export const colorVisionBootstrapScript = `try{var m=localStorage.getItem('${colorVisionStorageKey}');document.documentElement.dataset.colorVision=m==='accessible'?'accessible':'standard'}catch(e){document.documentElement.dataset.colorVision='standard'}`;
