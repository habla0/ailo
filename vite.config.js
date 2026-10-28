import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE is set by the GitHub Actions workflow (e.g. /ailo/)
export default defineConfig({ plugins: [react()], base: process.env.VITE_BASE || '/' });
