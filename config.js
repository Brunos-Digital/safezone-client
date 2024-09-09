exports.default = {
  port: 3000,
  global: {
    input: 'src',
    output: 'dist',
    tmp: '.tmp'
  },
  bower: {
    input: 'bower.json',
    files: "static"
  },
  fonts: {
    input: 'src/fonts/**/*',
    output: 'dist/fonts',
    tmp: '.tmp/fonts',
    bower: '**/*.{eot,svg,ttf,woff,woff2}'
  },
  html: {
    input: 'src/templates/**/*.{html,njk}',
    pages: ['src/templates/*.{html,njk}', 'src/templates/sub/*.{html,njk}'],
    layouts: 'src/templates/layouts/*.{html,njk}',
    bower: 'src/templates/layouts',
    build: '.tmp/**/*.html',
    data: './src/data.json'
  },
  images: {
    input: 'src/images/**/*',
    output: 'dist/images',
    tmp: '.tmp/images'
  },
  scripts: {
    input: 'src/scripts/**/*.js',
    output: 'dist/scripts',
    tmp: '.tmp/scripts'
  },
  static: {
    input: ['src/*.*', '!src/*.{html,njk}', '!src/data.json'],
    size: 'dist/**/*'
  },
  styles: {
    input: 'src/scss/main.{scss,sass}',
    output: 'dist/styles',
    tmp: '.tmp/styles',
    bower: 'src/scss',
    all: 'src/scss/**/*.{scss,sass}',
    purge: {
      active: false,
      safelist: [/active$/, /show$/, /open$/],
    }
  }
}
