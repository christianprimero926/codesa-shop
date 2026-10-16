import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

registerLocaleData(localeEsCo);

bootstrapApplication(App, appConfig).catch((error: unknown) => {
  document.body.textContent = 'No pudimos iniciar Codesa Shop. Recarga la página.';
  throw error;
});
