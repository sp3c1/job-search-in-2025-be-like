const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

// ** APPS HERE
const projectsConfig = {
  sequencess: {
    root: 'apps/sequencess',
    entryFile: 'main',
    tsConfigPath: 'apps/sequencess/tsconfig.app.json',
    outputPath: 'dist/apps/sequencess',
  },
};

module.exports = (options) => {
  // Determine the current project based on the context (you may need to adjust this logic)
  let tmp = [];

  console.log(`WEBPACK BUILDER`, options);

  try {
    tmp = options.entry.split('\\');
    if (tmp.length > 1 && tmp[tmp.length - 3]) {
      // fix windows
      options.context = tmp[tmp.length - 3];
    } else {
      // fix mac/linux
      tmp = options.entry.split('/');
      options.context = tmp[tmp.length - 3];
    }
  } catch (err) {
    throw new Error('Can not webpack project');
  }

  const currentProjectConfig = projectsConfig[options.context];

  if (!currentProjectConfig) {
    throw new Error(`Configuration for project '${options.context}' not found`);
  }
  const plugins = [];

  const cfg = {
    devtool: 'source-map',
    context: path.resolve(__dirname),
    entry: {
      [options.context]: path.join(
        __dirname,
        currentProjectConfig.root,
        'src',
        currentProjectConfig.entryFile + '.ts'
      ),
    },
    target: 'node',
    externals: [nodeExternals({})],
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        // ** LIBS HERE
        // Add other aliases as needed
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, currentProjectConfig.tsConfigPath),
              },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, currentProjectConfig.outputPath),
      filename: 'main.js',
    },
    plugins,
  };

  console.dir(`RUNNING ON`, cfg, { depth: null });

  return cfg;
};
