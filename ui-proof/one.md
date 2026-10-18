# ui-proof: package.json

Test-only fixture. Based on `ui-proof/package.json`:

- Name: `ui-proof` (version `1.0.0`, private).
- `npm test` runs `node --test slow.test.cjs` (one test that waits 120000 ms).
- `npm run test:quick` runs `node --test sum.test.cjs`.
- No dependencies are declared.
