#!/usr/bin/env node
var program = require('commander');
var inquirer = require('inquirer');
var { getGameversionlist } = require('./createService/api');
var { upDateJSON } = require('./utils');
var staticData = require('./createService/staticData.json');
var args = program.args;
console.log('args', args);
inquirer
  .prompt([
    {
      type: 'input',
      name: 'COOKIE',
      message: '输入Cookie',
      default: staticData.COOKIE,
    },
  ])
  .then(async (res) => {
    upDateJSON(res, './createService/staticData.json', async function () {
      var versionList = await getGameversionlist();
      for (let version of versionList) {
        console.log(version?.gameVersion);
      }
    });
  });
