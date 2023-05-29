module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 0.2%, not dead', 'not IE 11'],
        },
        modules: false,
        loose: true,
      },
    ],
  ],
}
