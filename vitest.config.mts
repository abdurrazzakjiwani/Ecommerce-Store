import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // DOM matchers (toBeInTheDocument and friends), plus cleanup between tests.
    // Imported centrally so component tests carry no setup boilerplate.
    setupFiles: ['./vitest.setup.ts'],
    // Unit tests cover src/lib only, per the constitution's Testing Discipline.
    // Every file under src/lib/ that performs pure computation is mandatory.
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      reporter: ['text', 'html'],
    },
  },
})
