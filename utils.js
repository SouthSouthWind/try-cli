const fs = require('fs');
module.exports = {
  async upDateJSON(upDateData, source, callback) {
    await fs.readFile(
      './createService/staticData.json',
      'utf-8',
      function (err, data) {
        try {
          var data = JSON.parse(data);
          data = Object.assign(data, upDateData);
          fs.writeFile(
            './createService/staticData.json',
            JSON.stringify(data),
            function (err) {
              if (err) {
                console.error('\x1B[31m%s\x1b[0m', '文件写入失败');
              } else {
                console.log('文件写入成功');
                callback();
              }
            }
          );
        } catch (e) {
          console.error('\x1B[31m%s\x1b[0m', '文件读取失败', e);
        }
      }
    );
  },
};
