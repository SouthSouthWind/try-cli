const {
  delTask,
  createArea,
  createServiceNoDelSingle,
  createServiceNoDelByMulDay,
  changeServiceNoDelSingle,
  mergeServerAll,
  mergeServerSingle,
} = require("./tools");

//createArea()//为所有版本创建区服
//createArea("mirserverezss-杀神无限刀"); //为单独某一个版本创建区服

//delTask("2021-12-12"); //删除所有版本某一天定时任务
//delTask("2021-10-14", "mirserverezss-杀神无限刀"); //删除指定版本某一天的定时任务
//createServiceNoDelSingle("mirserveryjzz-异界之战", 3, true); //为单独某一个版本创建预发布任务
//createServiceNoDelByMulDay(2, true); //为所有版本创建区服和任务
//changeServiceNoDelSingle();
mergeServerAll("2021-12-14");
//mergeServerSingle("2021-09-29", "mirserverezss-杀神无限刀");
//mergeServerSingle("2021-09-29", "mirservertx2-新宝宝专属[第二季]");
//console.error("\x1B[47m\x1B[30m%s\x1b[0m", "检查失败---->");
