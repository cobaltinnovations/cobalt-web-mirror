## Overrides

For each customized bundle, a folder is expected (by `build.js` and `vite.config.mts`) to exist here.

Current build/Webpack configuration will replace imported modules files from main source code with files located here (only if they exist).

#### Example:

If there's only a `institution-overrides/custom/src/pages/on-your-time.tsx` file in this folder, then Webpack will generate _two_ separate bundles:

- `build/cobalt` (default)
- `build/custom` (named after the child folder of `institution-overrides`)

The only difference between both would be that the default bundle will include the `src/pages/on-your-time.tsx` page, while the custom one will include the override.

This enables swapping files at-will and generating as many bundles as necessary during the build step.

The only caveat is to ensure that the overriden modules _do_ export the exact same variables as the original ones.
