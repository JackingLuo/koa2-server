/**
 * uniapp的模拟视频刷新
 */
let insert_sql = require("../controllers/mysql.config.js");
const fn_getVideo= async(ctx,next)=>{
    //分页查询需要知道总数和当前是第几列,一列多少行数据
    let currentPage = ctx.request.body.currentPage || 1;
    let nums = ctx.request.body.nums || 2;

    let start = (currentPage - 1) * nums;//从第 start 条记录开始, 返回 nums 条记录
    let sql_query = `SELECT * FROM uniapp_video limit ${nums} offset ${start}`;
    let backInfo = await insert_sql(sql_query);
    for(let val of backInfo){
        let sql_danmu  = `SELECT * FROM uniapp_danmu where uniapp_danmu.videoId=${val.id}`;
        let danmuList = await insert_sql(sql_danmu);
        val.danmuList = danmuList;
    }
    ctx.response.body = { succ: true, data: backInfo }
}

module.exports={
    "POST/api/uniapp/getVideo":fn_getVideo
}