const { getLoader } = require('@craco/craco');

module.exports = {
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ context, webpackConfig }) => {
          const { isFound, match: fileLoaderMatch } = getLoader(
            webpackConfig,
            rule => rule.type === 'asset/resource'
          );
          if (!isFound) {
            throw { message: `Can't find file-loader in the ${context.env} webpack config!` };
          }

          fileLoaderMatch.loader.exclude.push(/\.ya?ml$/);

          const yamlLoader = {
            use: 'yaml-loader',
            test: /\.(ya?ml)$/,
          };
          webpackConfig.module.rules.push(yamlLoader);
          return webpackConfig;
        },
      }
    },
  ],
}
