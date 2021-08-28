#!/usr/bin/env node

const hasFlag = require('has-flag');

require('../src')(process.cwd(), hasFlag('-force') || hasFlag('-F'))
    .catch(console.error);
