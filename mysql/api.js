/**
 * 其他的api请求(注意:get请求获取入参是用ctx.query,post用的是ctx.request.body)
 */
const insert_sql = require("../controllers/mysql.config.js");

//查询所有文章列表接口
const all_article = async (ctx, next) => {
    //后期加一个说明字段,再不返回所有的内容
    let sql_select = "SELECT articles.*,users.userName FROM articles left join users on articles.userId=users.id;";
    let backInfo =  await insert_sql(sql_select);
    if(backInfo){
        ctx.response.body = {succ:true,data:backInfo}
    }else{
        ctx.response.body={succ:false,errMsg:'文章列表为空',errCode:222};
    }
}

//查询文章详情接口
const query_article=async (ctx,next)=>{
    let id = ctx.query.id || '';
    let sql_select =`SELECT articles.*,users.userName FROM articles left join users on articles.userId=users.id WHERE articles.id=${id}`;
    let [backInfo] =  await insert_sql(sql_select);
    if(backInfo){
        ctx.response.body = {succ:true,data:backInfo}
    }else{
        ctx.response.body={succ:false,errMsg:'抱歉,没有查询到当前文章'};
    }
}
module.exports={
    "GET/api/allArticle":all_article,
    "GET/api/queryArticle":query_article
}