//let replace = require('gulp-replace'); //.pipe(replace('bar', 'foo'))
const { src, dest } = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer"),
    babel = require("gulp-babel"),
    browsersync = require("browser-sync").create(),
    clean_css = require("gulp-clean-css"),
    del = require("del"),
    fileinclude = require("gulp-file-include"),
    fonter = require("gulp-fonter"),
    fs = require("fs"),
    group_media = require("gulp-group-css-media-queries"),
    imagemin = require("gulp-imagemin"),
    include = require("gulp-include"),
    newer = require("gulp-newer"),
    path = require("path"),
    plumber = require("gulp-plumber"),
    rename = require("gulp-rename"),
    scss = require("gulp-sass")(require("sass")),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    uglify = require("gulp-uglify-es").default,
    version = require("gulp-version-number"),
    watchFilesItem = require("gulp-watch"),
    webp = require("imagemin-webp"),
    webpcss = require("gulp-webpcss"),
    webphtml = require("gulp-webp-html");

const project_name = path.basename(__dirname);
const src_folder = "#src";

let pathes = {
    build: {
        html: project_name + "/",
        js: project_name + "/js/",
        css: project_name + "/css/",
        images: project_name + "/img/",
        fonts: project_name + "/fonts/",
        json: project_name + "/json/",
    },
    src: {
        favicon: src_folder + "/img/favicon.{jpg,png,svg,gif,ico,webp}",
        html: [src_folder + "/**/*.html", "!" + src_folder + "/_*.html"],
        js: [src_folder + "/js/app.js", src_folder + "/js/vendors.js"],
        css: src_folder + "/scss/style.scss",
        images: [src_folder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", "!**/favicon.*"],
        fonts: src_folder + "/fonts/*.ttf",
        json: src_folder + "/json/**/*.*",
    },
    watch: {
        html: src_folder + "/**/*.html",
        js: src_folder + "/**/*.js",
        css: src_folder + "/scss/**/*.scss",
        images: src_folder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        json: src_folder + "/json/**/*.*",
    },
    clean: "./" + project_name + "/",
};

console.log(pathes);

// Пишем папки которые нужно копировать через запятую
let foldersArray = ["videos"]; // 'videos', 'files' ...
function copyFolders() {
    foldersArray.forEach((folder) => {
        src(src_folder + "/" + folder + "/**/*.*", {})
            .pipe(newer(project_name + "/" + folder + "/"))
            .pipe(dest(project_name + "/" + folder + "/"));
    });

    return src(pathes.src.html).pipe(browsersync.stream());
}

function browserSync(done) {
    browsersync.init({
        server: { baseDir: project_name },
        notify: false,
        port: 3000,
    });
}

function html() {
    return src(pathes.src.html, {})
        .pipe(fileinclude({ prefix: "<!--=", suffix: "-->" }))
        .on("error", (err) => console.error("Error!", err.message))
        .pipe(dest(pathes.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src(pathes.src.css, {})
        .pipe(scss({ outputStyle: "expanded" }).on("error", scss.logError))
        .pipe(rename({ extname: ".min.css" }))
        .pipe(dest(pathes.build.css))
        .pipe(browsersync.stream());
}

function json() {
    return src(pathes.src.json, {}).pipe(dest(pathes.build.json)).pipe(browsersync.stream());
}

function js() {
    return (
        src(pathes.src.js, {})
            // .pipe(fileinclude())
            .pipe(include())
            .on("error", (err) => console.error("Error!", err.message))
            .pipe(rename({ suffix: ".min", extname: ".js" }))
            .pipe(dest(pathes.build.js))
            .pipe(browsersync.stream())
    );
}

function images() {
    return src(pathes.src.images).pipe(newer(pathes.build.images)).pipe(dest(pathes.build.images));
}

function favicon() {
    return src(pathes.src.favicon)
        .pipe(plumber())
        .pipe(rename({ extname: ".ico" }))
        .pipe(dest(pathes.build.html));
}

function fonts_otf() {
    return src("./" + src_folder + "/fonts/*.otf")
        .pipe(plumber())
        .pipe(fonter({ formats: ["ttf"] }))
        .pipe(dest("./" + src_folder + "/fonts/"));
}

function fonts() {
    src(pathes.src.fonts).pipe(plumber()).pipe(ttf2woff()).pipe(dest(pathes.build.fonts));
    return src(pathes.src.fonts).pipe(ttf2woff2()).pipe(dest(pathes.build.fonts)).pipe(browsersync.stream());
}

function fontstyle() {
    let file_content = fs.readFileSync(src_folder + "/scss/fonts.scss");
    if (file_content == "") {
        fs.writeFile(src_folder + "/scss/fonts.scss", "", cb);
        fs.readdir(pathes.build.fonts, (err, items) => {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split(".");
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(
                            src_folder + "/scss/fonts.scss",
                            `@include font("${fontname}", "${fontname}", "400", "normal");\r\n`,
                            cb
                        );
                    }
                    c_fontname = fontname;
                }
            }
        });
    }
    return src(pathes.src.html).pipe(browsersync.stream());
}

function cb() {}

function clean() {
    return del(pathes.clean);
}

function watchFiles() {
    gulp.watch([pathes.watch.html], html);
    gulp.watch([pathes.watch.css], css);
    gulp.watch([pathes.watch.js], js);
    gulp.watch([pathes.watch.json], json);
    gulp.watch([pathes.watch.images], images);
}

function cssBuild() {
    return src(pathes.src.css, {})
        .pipe(plumber())
        .pipe(scss({ outputStyle: "expanded" }).on("error", scss.logError))
        .pipe(group_media())
        .pipe(autoprefixer({ grid: true, overrideBrowserslist: ["last 5 versions"], cascade: true }))
        .pipe(webpcss({ webpClass: "._webp", noWebpClass: "._no-webp" }))
        .pipe(dest(pathes.build.css))
        .pipe(clean_css())
        .pipe(rename({ extname: ".min.css" }))
        .pipe(dest(pathes.build.css))
        .pipe(browsersync.stream());
}

function jsBuild() {
    console.log(pathes.build.js + "app.min.js");
    console.log(pathes.build.js + "vendo.min.js");
    del(pathes.build.js + "app.min.js");
    del(pathes.build.js + "vendors.min.js");
    return src(pathes.src.js, {})
        .pipe(plumber())
        .pipe(include())
        .pipe(dest(pathes.build.js))
        .pipe(babel({ presets: ["@babel/env"] }))
        .pipe(uglify(/* options */))
        .on("error", (err) => {
            console.log(err.toString());
            this.emit("end");
        })
        .pipe(rename({ extname: ".min.js" }))
        .pipe(dest(pathes.build.js))
        .pipe(browsersync.stream());
}

function imagesBuild() {
    return (
        src(pathes.src.images)
            //.pipe(newer(pathes.build.images))
            .pipe(imagemin([webp({ quality: 85 })]))
            .pipe(rename({ extname: ".webp" }))
            .pipe(dest(pathes.build.images))
            .pipe(src(pathes.src.images))
            //.pipe(newer(pathes.build.images))
            .pipe(
                imagemin({
                    progressive: true,
                    svgoPlugins: [{ removeViewBox: false }],
                    interlaced: true,
                    optimizationLevel: 3, // 0 to 7
                })
            )
            .pipe(dest(pathes.build.images))
    );
}

function htmlBuild() {
    return src(pathes.src.html, {})
        .pipe(plumber())
        .pipe(fileinclude({ prefix: "<!--=", suffix: "-->" }))
        .pipe(webphtml())
        .pipe(
            version({
                value: "%DT%",
                replaces: ["#{VERSION_REPlACE}#", [/#{VERSION_REPlACE}#/g, "%TS%"]],
                append: {
                    key: "_v",
                    cover: 0,
                    to: [
                        "css",
                        ["image", "%TS%"],
                        {
                            type: "js",
                            attr: ["src", "custom-src"], // String or Array, undefined this will use default. css: "href", js: ...
                            key: "_v",
                            value: "%DT%",
                            cover: 1,
                            files: ["app.min.js", "vendors.min.js"], // Array [{String|Regex}] of explicit files to append to
                        },
                    ],
                },
                output: {
                    file: "version.json",
                },
            })
        )
        .pipe(dest(pathes.build.html))
        .pipe(browsersync.stream());
}

let fontsBuild = gulp.series(fonts_otf, fonts, fontstyle);
let buildDev = gulp.series(clean, gulp.parallel(fontsBuild, copyFolders, json, html, css, js, favicon, images));
let watchDev = gulp.series(buildDev, gulp.parallel(watchFiles, browserSync));
let build = gulp.series(clean, gulp.parallel(fontsBuild, htmlBuild, cssBuild, jsBuild, imagesBuild));

exports.copy = copyFolders;
exports.fonts = fontsBuild;
exports.build = build;
exports.watch = watchDev;
exports.default = watchDev;
