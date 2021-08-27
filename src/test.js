const buildIfChanged = require('./');

(async () => {
    const projectDirPath = path.resolve('E:/z/react-app');
    await buildIfChanged(projectDirPath);
})();
