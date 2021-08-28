const path = require('path');
const fs = require('fs');
const { cacheRepo, getDirFilePaths, checksum, spawnAsync, log, multiLog } = require('./utils');

const defaultIncludeDirs = ['src'];
const packageFileName = 'package.json';

const buildIfChanged = async (projectDirPath, forceBuild) => {
    const startTime = Date.now();
    multiLog([
        { message: 'Project Dir:', color: 'brightCyan' },
        { message: projectDirPath, color: 'cyan' },
    ]);
    const packageFilePath = path.join(projectDirPath, packageFileName);
    if (!fs.existsSync(packageFilePath)) {
        throw new Error(`> package.json File Doesn't Exist! (${packageFilePath})`);
    }
    const package = require(packageFilePath);
    if (!package.scripts || !package.scripts.build) {
        throw new Error("> package.json doesn't include build script");
    }

    if (typeof package.bic === 'boolean') {
        if (!package.bic) {
            log('bic is disabled!', 'brightRed');
            log('running build script!', 'brightYellow');
            await spawnAsync(`cd ${projectDirPath} && npm run build`);
            return;
        }
        log('Update your bic config in package.json (example - "bic": ["src"]). Refer Readme.md for help.', 'brightYellow');
        log('Using default bic config.', 'yellow');
    }

    const includeDirs = [...(Array.isArray(package.bic) ? package.bic : defaultIncludeDirs)]
        .reduce((acc, includeDir) => {
            includeDir = path.join(projectDirPath, includeDir);
            if (fs.existsSync(includeDir)) {
                acc.push(includeDir);
            }
            return acc;
        }, []);

    multiLog([
        { message: 'Directories under watch:', color: 'brightCyan' },
        {
            message: `["${includeDirs.map(dir => '.' + dir.replace(projectDirPath, '')
                .replace(/\\/g, '/')).join('", "')}"]`,
            color: 'cyan'
        },
    ]);

    const projectFilePaths = includeDirs
        .reduce((acc, includeDir) => {
            const includeDirFilePaths = getDirFilePaths(includeDir, true);
            return acc.concat(includeDirFilePaths);
        }, [])
        .sort((a, b) => a.localeCompare(b));

    const projectData = projectFilePaths.join('')
        + projectFilePaths.reduce((acc, filePath) => {
            const fileData = fs.readFileSync(filePath).toString('hex');
            return `${acc}${fileData}`;
        }, '');

    const projectChecksum = checksum(projectData);

    const cacheFileName = checksum(projectDirPath);
    const cachedChecksumFilePath = path.join(cacheRepo, cacheFileName);

    let oldChecksum = null;
    if (fs.existsSync(cachedChecksumFilePath)) {
        oldChecksum = fs.readFileSync(cachedChecksumFilePath, 'utf-8');
    }

    if (!forceBuild && oldChecksum === projectChecksum) {
        log('No New Changes! Skipping Build and using previous build!', 'brightYellow');
        multiLog([
            { message: 'Done in', color: 'brightCyan' },
            { message: `${((Date.now() - startTime) / 1000).toFixed(2)}s.`, color: 'brightGreen' },
        ]);
        return;
    }

    if (forceBuild) {
        log('No New Changes! But Force Building!', 'brightYellow');
    } else {
        log('New Changes! Build Needed!', 'brightYellow');
    }

    await spawnAsync(`cd ${projectDirPath} && npm run build`);
    fs.writeFileSync(cachedChecksumFilePath, projectChecksum, 'utf-8');
    multiLog([
        { message: 'Done in', color: 'brightCyan' },
        { message: `${((Date.now() - startTime) / 1000).toFixed(2)}s.`, color: 'brightGreen' },
    ]);
};

module.exports = buildIfChanged;
