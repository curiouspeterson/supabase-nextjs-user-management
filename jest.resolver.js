module.exports = (path, options) => {
  // Call the default resolver
  return options.defaultResolver(path, {
    ...options,
    // Ensure package.json is properly resolved
    packageFilter: pkg => {
      // Handle ESM modules that don't have a main field
      if (pkg.type === 'module' && !pkg.main && pkg.module) {
        pkg.main = pkg.module;
      }
      // Handle packages that use exports field
      if (pkg.exports && !pkg.main) {
        pkg.main = pkg.exports['.']?.default || 
                  pkg.exports['.']?.require ||
                  pkg.exports['.'];
      }
      return pkg;
    },
  });
}; 