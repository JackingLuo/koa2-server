/**
 * 博客初始返回接口
 */
const fs = require('fs');//fs模块
const insert_sql = require("../controllers/mysql.config.js");

//根路由进入
const fn_check =async (ctx, next)=>{
    let sql_update = "UPTATE statistics SET browseNum = browseNum + 1 WHERE id = 1";
    await insert_sql(sql_update);
    ctx.type="html";
    ctx.response.body=fs.createReadStream("public/view/index.html")
}
module.exports={
    "GET/":fn_check
}