#!/usr/bin/env node

require('../src')(process.cwd())
    .catch(console.error);
