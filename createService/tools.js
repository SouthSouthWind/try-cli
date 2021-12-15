const {
  getGameversionlist, //获取版本列表
  setGameVersion, //设置当前版本
  getAreaServers, //获取当前版本区服列表
  addOrUpdateAreaServer, //为当前版本添加区服
  delAreaServer, //删除区服
  getPreCreTask, //获取当前版本自动发布任务列表
  delCreateServerTask, //删除发布任务
  preCreateServer, //创建发布任务
  getServers, //获取服务器列表
  serverOnOff, //停服
  mergeServer,
  checkServer,
} = require("./api");
const moment = require("moment");
const { FormData } = require("formdata-node");
const { EXCLUDES, MERGE_EXCLUDE } = require("./staticData");
/* 获取当前版本的最后一个区服 */
async function getLastAreaServers(page = 1, rows = 50) {
  var result = await getAreaServers(page, rows);
  if (result.rows.length == rows && rows * page < result.total) {
    //如果不是最后一页，直接获取最后一页
    result = await getAreaServers(Math.ceil(result.total / rows), rows);
  }
  return result.rows[result.rows.length - 1];
}
const createTasks = async function () {
  var pageNum = 1,
    pageSize = 50,
    total = 0;
  do {
    //先获取第一页列表拿到总数，计算最后一页的页码，再获取最后一页
    var result = await getPreCreTask({ type: 0 }, { pageSize, pageNum }); //获取第一页任务
    total = result.total;
    preCreTasks = result.rows;
    if (total > pageNum * pageSize) {
      pageNum = Math.floor(total / pageSize);
    }
  } while (total > pageNum * pageSize);
  if (!preCreTasks.length) return;
  var curDay = moment(preCreTasks[preCreTasks.length - 1].createTime); //获取最新一天日期
  //var curDay = moment("2021-09-17 00:01:00"); //获取最新一天日期

  //创建任务

  do {
    preCreTasks.map(async (item, index) => {
      if (curDay.isSame(item.createTime, "day")) {
        item.taskId = -1;
        item.testStartTime = moment(item.createTime)
          .add(1, "days")
          .format("YYYY-MM-DD HH:mm:ss");
        item.formalStartTime = moment(item.toFormalTime)
          .add(1, "days")
          .format("YYYY-MM-DD HH:mm:ss");
        item.areaName = item.areaName.replace(
          /(\d+)/,
          (...args) => parseInt(args[0]) + 1
        );
        /* item.formalName = item.formalName
          .replace(/(\d)区/, (...args) => parseInt(args[0]) + 1 + "区")
          .replace("通宵区", "1区");
        item.testName = item.testName
          .replace(/(\d)区/, (...args) => parseInt(args[0]) + 1 + "区")
          .replace("通宵区", "1区"); */
        delete item.createTime;
        delete item.toFormalTime;
        delete item.id;
        delete item.curstate;
        delete item.serverVersion;
        delete item.serverId;
        console.log("itemitemitemitem", item);
        await preCreateServer(item);
      }
    });
    if (pageNum > 1) {
      pageNum -= 1;
      var result = await getPreCreTask({ type: 0 }, { pageSize, pageNum }); //获取上一页任务
      preCreTasks = result.rows;
    } else {
      preCreTasks = [];
    }
  } while (
    preCreTasks.length &&
    curDay.isSame(preCreTasks[preCreTasks.length - 1].createTime, "day")
  );
};
const changeTasks = async function (day) {
  var pageNum = 0,
    pageSize = 50,
    total = 0;
  do {
    pageNum += 1;
    var result = await getPreCreTask({ type: 0 }, { pageSize, pageNum }); //获取当前版本所有任务
    total = result.total;
    preCreTasks = result.rows;
    //修改任务
    preCreTasks.map(async (item, index) => {
      if (!day || (day && moment(day).isSame(item.createTime, "day"))) {
        /*       item.formalName = item.formalName.replace(
              /(\d+)区/,
              (...args) => parseInt(args[0]) - 1 + "区"
            );
            item.testName = item.testName.replace(
              /(\d+)区/,
              (...args) => parseInt(args[0]) - 1 + "区"
            ); */

        /* if (item.formalName.match(/1区/)) {
      
              item.formalName = item.formalName.replace("06:00开", "01:00开");
      
              item.testStartTime = item.createTime.replace("02:05:00", "00:01:00");
      
              item.formalStartTime = item.toFormalTime.replace(
                "03:00:00",
                "01:00:00"
              );
            } */

        /* item.testNotice =
          "【测试区充值赠送20%】正式开区数据会回档，请玩家通过正式反还按钮领取测试区的充值";
 */
        item.taskId = item.id;
        item.testStartTime = item.createTime;
        item.formalStartTime = item.toFormalTime;

        delete item.createTime;
        delete item.toFormalTime;
        delete item.id;
        delete item.curstate;
        delete item.serverVersion;
        delete item.serverId;
        console.log("itemitemitemitem", item);
        await preCreateServer(item);
      }
    });
  } while (total > pageNum * pageSize);
};
const delTask = async function (day, gameVersion) {
  var versionList = await getGameversionlist(),
    curVersion;

  while (versionList.length) {
    curVersion = versionList.shift();

    if (gameVersion && curVersion.gameVersion != gameVersion) continue;
    if (curVersion.gameVersion != 0) {
      await setGameVersion(curVersion.gameVersion);
      var pageNum = 0,
        pageSize = 50,
        total = 0;
      do {
        pageNum += 1;
        var result = await getPreCreTask({ type: 0 }, { pageSize, pageNum }); //获取当前版本所有任务
        total = result.total;
        preCreTasks = result.rows;
        var delDay = moment(day);
        preCreTasks.map(async (item, index) => {
          if (delDay.isSame(item.createTime, "day")) {
            console.log("createTime", item.createTime);
            delCreateServerTask({ "ids[]": item.id });
          }
        });
      } while (total > pageNum * pageSize);
    }
  }
};
/* 创建区服 */
const createArea = async function (gameVersion) {
  let lastAreaServer = await getLastAreaServers(); //获取当前版本的最后一个区
  if (gameVersion) {
    await setGameVersion(gameVersion);
  }
  if (!!lastAreaServer) {
    await addOrUpdateAreaServer(
      lastAreaServer.name.replace(/(\d+)/, (...args) => parseInt(args[0]) + 1),
      lastAreaServer.priority + 1,
      lastAreaServer.gameVersion
    ); //创建区服
  }
};
const createServiceNoDel = async function (needCreateArea = true) {
  var versionList = await getGameversionlist(),
    curVersion;
  while (versionList.length) {
    curVersion = versionList.shift();
    if (
      curVersion.gameVersion != 0 &&
      EXCLUDES.indexOf(curVersion.gameVersion) == -1
    ) {
      await setGameVersion(curVersion.gameVersion);
      needCreateArea ? await createArea(curVersion.gameVersion) : ""; //创建区服
      await createTasks(); //创建自动开服发布任务
    }
  }
};
const createServiceNoDelSingle = async function (
  gameVersion,
  num,
  needCreateArea = true
) {
  //gameVersion版本号，num创建版本天数
  while (num) {
    await setGameVersion(gameVersion);
    needCreateArea ? await createArea(gameVersion) : ""; //创建区服
    await createTasks(); //创建自动开服发布任务
    num--;
  }
};
async function createServiceNoDelByMulDay(num, needCreateArea = true) {
  while (num) {
    console.log("createServiceNoDel");
    await createServiceNoDel(needCreateArea);
    num--;
  }
}
const changeServiceNoDelSingle = async function (gameVersion) {
  //gameVersion版本号，num创建版本天数
  if (!gameVersion) {
    var versionList = await getGameversionlist(),
      curVersion;
    while (versionList.length) {
      curVersion = versionList.shift();
      if (
        curVersion.gameVersion != 0 &&
        EXCLUDES.indexOf(curVersion.gameVersion) == -1
      ) {
        await setGameVersion(curVersion.gameVersion);
        await changeTasks(); //创建自动开服发布任务
      }
    }
  } else {
    await setGameVersion(gameVersion);
    //await changeTasks(); //创建自动开服发布任务
  }
};
const mergeTool = async function (mergeData, restartData) {
  //检查
  const checkRes = await checkServer(mergeData);
  //合服
  if (checkRes.code != 0) {
    console.error("\x1B[31m%s\x1b[0m", "检查失败---->", checkRes.value);
    return;
  }
  await mergeServer(mergeData).then(async function (res) {
    //重启服务器
    if (res.code != 0) {
      console.error("\x1B[31m%s\x1b[0m", "合服失败");
      return;
    }

    await serverOnOff(restartData).then(async function (res) {
      if (res.code == 0) {
        console.log("\x1B[32m%s\x1b[0m", "服务器重启成功");
      } else {
        console.error("\x1B[31m%s\x1b[0m", "服务器重启失败");
      }
    });
  });
};
const mergeServerSingle = async function (day, version) {
  if (!!version) {
    await setGameVersion(version);
    const { total, rows } = await getServers(
      {
        showName: "",
        ip: "",
        serverState: -99,
        pageNumber: 1,
        pageSize: 100,
      },
      { type: 0 }
    );

    let newRow = rows.filter((item) => {
      if (item.createTime.match(day)) {
        return item;
      }
    });
    if (newRow.length <= 1) return;
    //停服
    let formData = new FormData(),
      restartData = new FormData(),
      mergeData = new FormData();
    needStop = false;
    formData.append("index", "-1");
    formData.append("state", 2); //1:开启，2:停服
    formData.append("serverVersion", newRow[0].version);
    formData.append("stopTime", "");

    restartData.append("index", "-1");
    restartData.append("state", 1); //1:开启，2:停服
    restartData.append("serverVersion", newRow[0].version);
    restartData.append("stopTime", "");
    newRow.map(async (item, index) => {
      // console.log("itemitemitemitemitemitem", item);
      if (item.showName.match(/\d+(?=区)/) == 1) {
        mergeData.append("master", item.uniqTag);
        restartData.append("ids[]", item.serverId);
        restartData.append("ips[]", item.serverIp);
        restartData.append("channels[]", item.channelGroup);
        restartData.append("gameVersions[]", item.gameVersion);
      } else {
        mergeData.append("slave[]", item.code);
      }
      //获取开启状态的服务器

      if (item.state == 1) {
        //state=0，处于停止状态，state=1处于开启状态
        formData.append("ids[]", item.serverId);
        formData.append("ips[]", item.serverIp);
        formData.append("channels[]", item.channelGroup);
        formData.append("gameVersions[]", item.gameVersion);
        needStop = true;
      }
    });
    /* formData.forEach((v, k) => {
      console.log("s%: s%", k, v);
    }); */
    needStop
      ? await serverOnOff(formData).then(async (res) => {
          if (res.code == 0) {
            console.log("\x1B[32m%s\x1b[0m", "服务器关闭成功");
            //检查
            await mergeTool(mergeData, restartData);
          } else {
            console.error("\x1B[31m%s\x1b[0m", "服务器关闭失败");
          }
        })
      : await mergeTool(mergeData, restartData);
  }
};
const mergeServerAll = async function (day) {
  var versionList = await getGameversionlist(),
    curVersion;
  while (versionList.length) {
    curVersion = versionList.shift();
    if (
      curVersion.gameVersion != 0 &&
      MERGE_EXCLUDE.indexOf(curVersion.gameVersion) == -1
    ) {
      await mergeServerSingle(day, curVersion.gameVersion);
    }
  }
};
module.exports = {
  delTask, //删除任务
  createArea, //创建区服
  createServiceNoDelSingle, //为指定版本创建任务
  createServiceNoDelByMulDay, //批量创建版本多天
  changeServiceNoDelSingle,
  mergeServerAll,
  mergeServerSingle,
};
