import { IMAGE_LOADER } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';
import { picsumImageLoader } from './core/images/picsum-loader';
import { PageTitleStrategy } from './core/routing/page-title.strategy';
import { CodesaPreset } from './core/theme/codesa-preset';
import { PRIMENG_ES } from './core/theme/primeng-es';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: { preset: CodesaPreset, options: { darkModeSelector: false } },
      translation: PRIMENG_ES,
    }),
    MessageService,
    ConfirmationService,
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: IMAGE_LOADER, useValue: picsumImageLoader },
    { provide: TitleStrategy, useClass: PageTitleStrategy },
  ],
};
