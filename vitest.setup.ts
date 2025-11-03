import { expect, afterEach } from 'vitest'; 
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react'; 

// Estende o expect do Vitest com os matchers do jest-dom
expect.extend(matchers);


afterEach(() => {
  cleanup();
});