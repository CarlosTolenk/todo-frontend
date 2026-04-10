import '@angular/material/prebuilt-themes/indigo-pink.css';
import '@analogjs/vitest-angular/setup-zone';
import { vi } from 'vitest';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

const originalConsoleWarn = console.warn;

vi.spyOn(console, 'warn').mockImplementation((message?: unknown, ...args: unknown[]) => {
  if (typeof message === 'string' && message.includes('Could not find Angular Material core theme')) {
    return;
  }

  originalConsoleWarn.call(console, message, ...args);
});
