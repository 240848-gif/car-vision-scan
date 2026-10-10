module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo already includes the Reanimated/worklets plugin.
  return { presets: ['babel-preset-expo'] };
};
