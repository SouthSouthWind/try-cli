#!/usr/bin/env node
var _ = require('loadsh');
var program = require('commander');
var inquirer = require('inquirer');
var fs = require('fs');
var { getGameversionlist } = require('./createService/api');
var staticData = require('./createService/staticData.json');
console.log(staticData);
//staticData = JSON.parse(staticData);
program
  .command('serve')
  .option('-i, init <init>')
  .action(function (options) {
    console.log(111);
    console.log('serve', options);
  });
program.command('list').action(function () {
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
      await fs.readFile(
        './createService/staticData.json',
        'utf-8',
        function (err, data) {
          var data = JSON.parse(data);
          data = Object.assign(data, res);
          fs.writeFile(
            './createService/staticData.json',
            JSON.stringify(data),
            function (err, data) {
              if (err) {
                console.log('文件写入失败');
              } else {
                console.log('文件写入成功');
                getGameversionlist();
              }
            }
          );
        }
      );
      //await setTimeout(console.log(res), 5000);
    });
});
program.command('login').action(function () {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'username',
        message: '输入姓名',
        default: '',
      },
      {
        type: 'input',
        name: 'passWord',
        message: '输入密码',
        when: function (res) {
          return res.username === '111';
        },
        default: '',
      },
    ])
    .then(async (res) => {
      console.log(res);
      //await setTimeout(console.log(res), 5000);
    });
});

console.log('program', program.login);
if (_.isEmpty(program.parse(process.argv).args) && process.argv.length === 2) {
  program.help();
}
if (program.init) {
  console.log(222);
}
