const fs = require('fs');
const del = require('del');
const gulp = require('gulp');
const size = require('gulp-size');
const gulpif = require('gulp-if');
const cache = require('gulp-cache');
const useref = require('gulp-useref');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const htmlBeautify = require('gulp-html-beautify');
const browserSync = require('browser-sync').create();

// Nunjucks
const data = require('gulp-data');
const plumber = require('gulp-plumber');
const nunjucksRender = require('gulp-nunjucks-render');

// Styles
const lazypipe = require('lazypipe');
const cached = require('gulp-cached');
const postcss = require('gulp-postcss');
const cssnano = require('gulp-cssnano');
const purgecss = require('gulp-purgecss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const dependents = require('gulp-dependents');
const sass = require('gulp-sass')(require('sass'));
const mergequeries = require('gulp-merge-media-queries');

// Bower
const wiredep = require('wiredep').stream;
const mainBowerFiles = require('main-bower-files');

/* VARIABLES
 * --------------------------------------------------
 *  Variables and project paths
 * -------------------------------------------------- */
const config = require('./config.js').default;
const reload = browserSync.reload;

/* SERVE TASK
 * --------------------------------------------------
 *  Livereload with browserSync, watch files on
 *  change and execute tasks accordingly
 * -------------------------------------------------- */
gulp.task('serve', function() {
  browserSync.init({
    port: config.port,
    server: {
      baseDir: [config.global.tmp],
      routes: {
        '/static': config.bower.files
      },
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    notify: false,
    tunnel: true,
  });

  gulp.parallel('nunjucks', 'styles', 'scripts', 'images', 'fonts');
  gulp.watch([config.html.input, config.html.data], gulp.parallel('nunjucks'));
  gulp.watch(config.styles.all, gulp.parallel('styles'));
  gulp.watch(config.scripts.input, gulp.parallel('scripts'));
  gulp.watch(config.images.input, gulp.parallel('images'));
  gulp.watch(config.fonts.input, gulp.parallel('fonts'));
  gulp.watch(config.bower.input, gulp.parallel('wiredep', 'fonts'));
});

/* NUNJUCKS TASK
 * --------------------------------------------------
 *  Render Nunjucks template(s) to HTML and sync
 *  data from data.json on change
 * -------------------------------------------------- */
gulp.task('nunjucks', function() {
  return gulp.src(config.html.pages, { base: 'src/templates' })
    .pipe(plumber())
    .pipe(data(function() {
      if (fs.existsSync(config.html.data))
        return JSON.parse(fs.readFileSync(config.html.data) || "{}")

      return {}
    }))
    .pipe(nunjucksRender({
      data: {},
      path: ['src/templates']
    }))
    .pipe(gulp.dest(config.global.tmp))
    .pipe(reload({ stream: true }));
});

/* STYLES TASK
 * --------------------------------------------------
 *  Compile SCSS, autoprefix and make sourcemap
 * -------------------------------------------------- */
gulp.task('styles', function() {
  let plugins = [
    autoprefixer({
      cascade: false
    })
  ];

  return gulp.src(config.styles.all)
    .pipe(plumber())
    .pipe(cached('sasscache'))
    .pipe(dependents())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.styles.tmp))
    .pipe(reload({ stream: true }));
});

/* SCRIPTS TASK
 * --------------------------------------------------
 *  Lint JS file(s) and report errors in console
 * -------------------------------------------------- */
gulp.task('scripts', function() {
  return gulp.src(config.scripts.input)
    .pipe(plumber())
    .pipe(gulp.dest(config.scripts.tmp))
    .pipe(reload({ stream: true, once: true }));
});

/* FONTS TASK
 * --------------------------------------------------
 *  Get fonts for bower dependencies that need them
 *  and move them to dist and .tmp folder. Concat
 *  own fonts to mainBowerFiles array if needed
 * -------------------------------------------------- */
gulp.task('fonts', function() {
  return gulp.src(mainBowerFiles(config.fonts.bower, () => {}).concat(config.fonts.input))
    .pipe(gulp.dest(config.fonts.output))
    .pipe(gulp.dest(config.fonts.tmp))
    .pipe(reload({ stream: true }));
});

/* IMAGES TASK
 * --------------------------------------------------
 *  Compress images - PNG, JPG, GIF and SVG
 *  Doesn't remove IDs from SVG files
 * -------------------------------------------------- */
gulp.task('images', function() {
  return gulp.src(config.images.input)
    .pipe(plumber())
    // .pipe(cache(imagemin([
    //   imagemin.optipng({ optimizationLevel: 6 }),
    //   imagemin.jpegtran({ progressive: true }),
    //   imagemin.gifsicle({ interlaced: true }),
    //   imagemin.svgo({
    //     plugins: [{ cleanupIDs: false }]
    //   })
    // ])))
    .pipe(gulp.dest(config.images.output))
    .pipe(gulp.dest(config.images.tmp))
    .pipe(reload({ stream: true }));
});

/* BUILD TASK
 * --------------------------------------------------
 *  - Uglify JS
 *  - Optimize CSS
 *  - Minify HTML
 * -------------------------------------------------- */
gulp.task('build', gulp.series('nunjucks', 'styles', 'scripts', function() {
  let optimizeCss = lazypipe()
    .pipe(cssnano, {
      safe: true,
      autoprefixer: false,
      mergeLonghand: false,
      discardComments: {
        removeAll: true
      }
    })
    .pipe(purgecss, {
      content: [config.html.build],
      ...config.styles.purge,
      safelist: config.styles.purge.active ? config.styles.purge.safelist  : [/^/]
    })
    // .pipe(mergequeries, {
    //   log: false
    // })
  let optimizeHtml = lazypipe()
    .pipe(htmlmin, {
      useShortDoctype: true,
      preserveLineBreaks: true,
      removeComments: false
    })
    .pipe(htmlBeautify, {
      indent_size: 2,
      extra_liners: [],
      indent_inner_html: true,
      indent_with_tabs: false,
      preserve_newlines: true,
      max_preserve_newlines: 1,
      wrap_attributes_indent_size: false
    })

  return gulp.src(config.html.build)
    .pipe(plumber())
    .pipe(useref({
      searchPath: ['.tmp', '.']
    }))
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', optimizeCss()))
    .pipe(gulpif('*.html', optimizeHtml()))
    .pipe(gulp.dest(config.global.output));
}));

/* STATIC TASK
 * --------------------------------------------------
 *  Move static files to dist/ folder (robots.txt,
 *  humans.txt, favicon). Hidden files will be
 *  ignored (.git for example)
 * -------------------------------------------------- */
gulp.task('static', function() {
  return gulp.src(config.static.input, {
    dot: true
  }).pipe(gulp.dest(config.global.output));
});

/* SIZE TASK
 * --------------------------------------------------
 *  Display size of dist folder
 * -------------------------------------------------- */
gulp.task('size', function() {
  return gulp.src(config.static.size)
    .pipe(size({
      title: 'Deployment build:',
      gzip: true
    }));
});

/* WIREDEP TASK
 * --------------------------------------------------
 *  Inject bower dependencies in SCSS and NJK files
 * -------------------------------------------------- */
gulp.task('wiredep', function() {
  gulp.src(config.styles.input)
    .pipe(plumber())
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest(config.styles.bower));

  return gulp.src(config.html.layouts)
    .pipe(plumber())
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./,
      fileTypes: {
        njk: {
          block: /(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
          detect: {
            js: /<script.*src=['"]([^'"]+)/gi,
            css: /<link.*href=['"]([^'"]+)/gi
          },
          replace: {
            js: '<script src="{{filePath}}"></script>',
            css: '<link rel="stylesheet" href="{{filePath}}" />'
          }
        }
      }
    }))
    .pipe(gulp.dest(config.html.bower));
});

/* CLEAR TASK
 * --------------------------------------------------
 *  Clear cache if needed
 * -------------------------------------------------- */
gulp.task('clear', function(done) {
  return cache.clearAll(done);
});

/* CLEAN TASK
 * --------------------------------------------------
 *  Deletes dist/ and .tmp/ folder
 * -------------------------------------------------- */
gulp.task('clean:dist', del.bind(null, config.global.output));
gulp.task('clean:tmp', del.bind(null, config.global.tmp));
gulp.task('clean', gulp.parallel('clean:dist', 'clean:tmp'));

/* DEV TASK
 * --------------------------------------------------
 *  Start developing by running this task.
 * -------------------------------------------------- */
gulp.task('run', gulp.parallel('nunjucks', 'styles', 'scripts', gulp.series('images', 'fonts')));
gulp.task('dev', gulp.series('run', 'serve'));

/* DEFAULT TASK
 * --------------------------------------------------
 *  Creates a production-ready build
 *  located in the dist/ folder
 * -------------------------------------------------- */
gulp.task('default', gulp.series(
  gulp.series('clean:dist', 'wiredep'), 'build',
  gulp.series('images', 'fonts', 'static'), 'size'
));
