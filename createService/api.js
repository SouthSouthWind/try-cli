const Promise = require('bluebird');
const { COOKIE } = require('./staticData.json');
const superagent = Promise.promisifyAll(require('superagent'));

superagent.Request.prototype.cancellable = function () {
  return this.endAsync().cancellable();
};
superagent.Request.prototype.then = function (done) {
  return this.endAsync().then(done);
};

function request(options) {
  const { url, params, query, acceptType, type } = options;
  console.log('COOKIE', COOKIE);
  var result = superagent['post'](`http://103.216.153.71:9221/${url}`)
    .timeout(10000)
    .type(type || 'json')
    .set({
      Cookie: COOKIE,
      'Content-type': acceptType || 'application/x-www-form-urlencoded',
    })
    .query(query || {});
  if (type == 'form') {
    params.forEach((value, key) => {
      result = result.send(key + '=' + value);
      //console.log("%s: %s", key, value);
    });
  } else {
    result.send(params);
  }

  return result
    .then((res) => {
      if (res.res.text.match(/^<script/)) {
        console.log('服务错误，检查Cookie是否过期');
        return {
          code: '-1',
          message: '服务错误，检查Cookie是否过期',
        };
      }
      return res;
    })
    .catch((ex) => {
      return {
        code: '-1',
        message: '服务错误，检查Cookie是否过期',
      };
    });
}

/* 获取版本列表 */
const getGameversionlist = async function () {
  console.log('getGameversionlist');
  var versionList = [];
  await request({
    url: 'gm/gameversionlist/getGameVersionListCombox.jhtml?type=index',
  }).then(function (res, err) {
    if (!!res && !!res.res && !!res.res.text)
      versionList = JSON.parse(res.res.text);
  });
  console.log('versionList', versionList);
  return versionList;
};

/* 设置当前的版本 */
function setGameVersion(gameVersion) {
  console.log(
    '\x1B[47m\x1B[30m%s\x1b[0m',
    `设置当前版本为--->${gameVersion}start`
  );
  let options = {
    url: 'gm/login/setGameVersion.jhtml?type=index',
    params: {
      gameVersion: gameVersion,
    },
    acceptType: 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  return request(options).then(function (res, err) {
    if (!!res && !!res.res && !!res.res.text) {
      var result = JSON.parse(res.res.text);
      if (result.code == 0) {
        console.log(
          '\x1B[32m%s\x1b[0m',
          `设置当前版本为--->${gameVersion}success`
        );
      }
      return result;
    } else {
    }
  });
}
/* 获取当前版本的区服列表 */
async function getAreaServers(page = 1, rows = 50) {
  //
  var result,
    options = {
      url: 'gm/servermanager/getAreaServers.jhtml',
      params: {
        page,
        rows,
      },
      acceptType: 'application/x-www-form-urlencoded; charset=UTF-8',
    };
  await request(options).then(async function (res, err) {
    if (!!res && !!res.res && !!res.res.text) {
      result = JSON.parse(res.res.text);
      console.log(`获取区服第${page}页--->success`);
    }
  });
  return result;
}

/* 添加区服 */
function addOrUpdateAreaServer(areaName, priority, gameVersion) {
  var options = {
    url: 'gm/servermanager/addOrUpdateAreaServer.jhtml',
    params: {
      areaId: -1,
      areaName: areaName,
      priority: priority,
      serverlist: '',
      gameVersion: gameVersion,
    },
    acceptType: 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  return request(options).then(function (res, err) {
    if (!!res && !!res.res && !!res.res.text) {
      var result = JSON.parse(res.res.text);
    } else {
    }
  });
}

function delAreaServer(ids) {
  //删除区服
  var options = {
    url: 'gm/servermanager/delAreaServer.jhtml',
    params: ids,
    acceptType: 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  return request(options).then(function (res, err) {
    if (!!res && !!res.res && !!res.res.text) {
      var result = JSON.parse(res.res.text);
      console.log(result);
    } else {
    }
  });
}
async function getPreCreTask(
  params = { type: 0 },
  query = { pageSize: 20, pageNum: 1 }
) {
  //获取预发布任务列表
  console.log('获取任务列表---->');
  var result,
    options = {
      url: 'gm/servermanager/getPreCreTask.jhtml',
      params,
      query,
      acceptType: 'application/x-www-form-urlencoded; charset=UTF-8',
    };
  await request(options).then(function (res, err) {
    //console.log("query", query);
    //console.log("resresresres", res.res.text);
    if (!!res && !!res.res && !!res.res.text) {
      result = JSON.parse(res.res.text);
    }
  });
  return result;
}
async function delCreateServerTask(ids) {
  //删除预发布任务
  var options = {
    url: 'gm/servermanager/delCreateServerTask.jhtml',
    params: ids,
    acceptType: 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  return request(options).then(function (res, err) {
    if (!!res && !!res.res && !!res.res.text) {
      result = JSON.parse(res.res.text);
    }
  });
}
function preCreateServer(params) {
  var options = {
    url: 'gm/servermanager/preCreateServer.jhtml',
    params,
    acceptType: 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  return request(options).then(function (res, err) {
    if (!!res && !!res.res && !!res.res.text) {
      result = JSON.parse(res.res.text);
    }
  });
}

function getServers(params, query) {
  var options = {
    url: 'gm/servermanager/getservers.jhtml',
    params,
    query,
    acceptType: 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  return request(options).then(function (res, err) {
    if (!!res && !!res.res && !!res.res.text) {
      var result = JSON.parse(res.res.text);
      //console.log(result);
      return result;
    }
  });
}

//停服
function serverOnOff(params) {
  var options = {
    url: 'gm/servermanager/serveronoff.jhtml',
    params,
    type: 'form',
  };
  return request(options).then(function (res, err) {
    if (!!res && !!res.res && !!res.res.text) {
      var result = JSON.parse(res.res.text);

      return result;
    }
  });
}
function mergeServer(params) {
  var options = {
    url: 'gm/servermanager/mergeserver.jhtml',
    params,
    type: 'form',
  };
  return request(options).then(function (res, err) {
    //console.log("res.res.text", res.res.text);

    if (!!res && !!res.res && !!res.res.text) {
      var result = JSON.parse(res.res.text);
      return result;
    }
  });
}
function checkServer(params) {
  var options = {
    url: 'gm/servermanager/checkserver.jhtml',
    params,
    type: 'form',
  };
  return request(options).then(function (res, err) {
    console.log('res.res.text', res.res.text);

    if (!!res && !!res.res && !!res.res.text) {
      var result = JSON.parse(res.res.text);
      return result;
    }
  });
}
module.exports = {
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
  mergeServer, //合服
  checkServer,
};
