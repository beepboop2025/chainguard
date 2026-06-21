import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: [
        'src/utils/formatters.ts',
        'src/utils/riskCalculations.ts',
        'src/services/cache.ts',
        'src/services/connectionManager.ts',
        'src/services/apiConfig.ts',
      ],
    },
  },
})
