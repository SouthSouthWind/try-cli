#!/usr/bin/env node
/* env可以在系统的PATH目录中查找到node */

var _ = require('loadsh');
var { Command, Option } = require('commander');
var inquirer = require('inquirer');
var fs = require('fs');
var { getGameversionlist } = require('./createService/api');
var staticData = require('./createService/staticData.json');
var { upDateJSON } = require('./utils');
var program = new Command();
program
  .option('-t --test [test]', '')
  .addOption(
    new Option('-d, --drink [size]', 'drink size')
      .choices(['small', 'medium', 'large'])
      .default('medium', 'one minute')
  )
  .action((res) => {
    console.log('res', res);
  });
program
  .usage('aaaa')
  .command('list')
  .option('-a all <all>', '查看全部')
  .action(function () {
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
  });

program.command('list1', '单独可执行文件作为子命令');
program.parse(process.argv); // 解析命令行参数argv
