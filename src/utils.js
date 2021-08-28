const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const colors = require('colors/safe');

const cacheRepo = path.resolve(path.join(__dirname, '../cache'));
if (!fs.existsSync(cacheRepo)) {
    fs.mkdirSync(cacheRepo);
}

const log = (msg, color = 'brightCyan') => console.log(colors[color](`> ${msg}`));
const multiLog = (msgs) => {
    const msg = msgs.map(({ color = 'brightCyan', message }) => colors[color](message)).join(' ');
    log(msg);
}

const utils = {
    cacheRepo,
    log,
    multiLog,
};

utils.getDirFilePaths = (startPath, recursive = true) => {
    let result = [];
    if (!fs.existsSync(startPath)) {
        return result;
    }
    const files = fs.readdirSync(startPath);
    for (const file of files) {
        const filename = path.join(startPath, file);
        const stat = fs.statSync(filename);
        if (recursive && stat.isDirectory()) {
            result = result.concat(utils.getDirFilePaths(filename, recursive));
        } else {
            result.push(filename);
        }
    }
    return result;
};

utils.checksum = (data, options = {}) => {
    const { algorithm = 'sha1', encoding = 'hex' } = options;
    const hash = crypto.createHash(algorithm);
    hash.setEncoding(encoding);
    return hash.update(data).digest('hex');
}

utils.spawnAsync = async (command, onEndFunc) => {
    return new Promise((res, rej) => {
        const child = spawn(command, { shell: true });

        child.stdout.on('data', (data) => {
            log(data, 'brightBlue');
        });

        child.stderr.on('data', (data) => {
            log(data, 'brightRed');
            rej(data);
        });

        child.on('error', (e) => {
            rej(e);
        });

        child.on('close', (code) => {
            // log(`child process exited with code ${code}`, 'green');
            if (typeof onEndFunc === 'function') {
                onEndFunc();
            }
            res(child);
        });
    });
}

module.exports = Object.freeze(utils);
