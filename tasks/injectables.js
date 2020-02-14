import gulp from 'gulp'
const fs = require('fs');
const path = require('path');
const Axios = require('axios');

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

gulp.task('injectables', () => {
  const scripts = [
    {
      url: 'https://thamus-injectables.netlify.com/scripts/generalLoader.js',
      path: path.join(__dirname, '../dist/chrome/scripts/general.js'),
    },
  ];
  
  for (let script of scripts) {
    Axios.get(script.url).then(r => {
      ensureDirectoryExistence(script.path)
      fs.writeFileSync(script.path, r.data, 'utf8');
    });
  }
})


