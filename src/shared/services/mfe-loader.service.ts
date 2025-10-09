import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MfeLoaderService {
  private loaded = new Set<string>();

  loadAssets(name: string, jsUrl: string, cssUrl: string): Promise<void> {
  if (this.loaded.has(name)) {
    return Promise.resolve();
  }

  // 🔥 Cleanup existing MFE scripts/styles
  const existingScripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
    .filter(script => script.src.includes('management-mfe'));
  existingScripts.forEach(script => script.remove());

  const existingLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[href]'))
    .filter(link => link.href.includes('management-mfe'));
  existingLinks.forEach(link => link.remove());

  return new Promise((resolve, reject) => {
    // Load JS
    const script = document.createElement('script');
    script.src = jsUrl;
    script.type = 'module';
    script.onload = () => {
      // Load CSS only after JS is loaded
      if (cssUrl) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        link.onload = () => resolve();
        link.onerror = (err) => reject(err);
        document.head.appendChild(link);
      } else {
        resolve();
      }
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

}
