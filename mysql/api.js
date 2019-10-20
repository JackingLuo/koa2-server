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
//存储留言接口
const add_reply= async (ctx,next)=>{
    let userId = ctx.request.body.userId || '';
    let message = ctx.request.body.message || '';
    let uploadTime = ctx.request.body.uploadTime || '';
    let parentId = ctx.request.body.parentId || '0';
    let sql_insert = "INSERT INTO messages(user_id,message,upload_time,parent_id) VALUE(?,?,?,?)";
    let values =[userId,message,uploadTime,parentId];
    let backInfo =  await insert_sql(sql_insert,values);
    if(backInfo){
        ctx.response.body = {succ:true}
    }else{
        ctx.response.body = {succ:false,errMsg:'留言存储失败'} 
    }
}
//查询留言接口
 const query_reply = async (ctx,next)=>{
     //分页查询需要知道总数和当前是第几列,一列多少行数据
     let currentPage = ctx.request.body.currentPage || '';
     let nums = ctx.request.body.nums || '';

     //查询对应页的nums条数据的一级留言数据
     let start = (currentPage-1)*nums;//从第 start 条记录开始, 返回 nums 条记录
    let sql_query = `SELECT messages.*,users.userName,users.email,users.head_img FROM messages left join users on messages.user_id=users.id where messages.parent_id=0 limit ${nums} offset ${start}`;

    //查询所有回复留言数据
    let sql_child = "SELECT messages.*,users.userName,users.email,users.head_img FROM messages left join users on messages.user_id=users.id WHERE messages.parent_id!=0";

    //查询数据量总数
    let sql_total = "SELECT COUNT(*) as total FROM messages WHERE messages.parent_id=0";
    let backInfo =  await insert_sql(sql_query);
    if(backInfo){
        let childrenList =  await insert_sql(sql_child);
        for(let parentVal of backInfo){
            parentVal.children =[]
        }
        if(childrenList){
            for(let val of childrenList){
                for(let parentVal of backInfo){
                    if(val.parent_id==parentVal.id)parentVal.children.push(val)
                }
            }
            let [total] = await insert_sql(sql_total);
            if(total){
                ctx.response.body = {succ:true,data:{backInfo,currentPage,nums,total:total.total}}
            }else{
                ctx.response.body = {succ:false,errMsg:'查询留言总数失败'} 
            }
        }else{
            ctx.response.body = {succ:false,errMsg:'查询回复留言失败'} 
        }
        //查询所有留言(包括回复)
        // let classOne = [];//一级留言列表
        // for(let i= 0;i<backInfo.length;i++){
        //     if(backInfo[i].parent_id=='0'){
        //         backInfo[i].children = [];
        //         classOne.push(backInfo[i])
        //     }else{//回复留言
        //         let parentId = backInfo[i].parent_id;
        //         //用parent_id去一级留言列表找它的父级
        //         for(let j=0;j<classOne.length;j++){
        //             if(classOne[j].id==parentId){
        //                 classOne[j].children.push(backInfo[i]);
        //             }
        //         }
        //     }
        // }
        // let total = classOne.length;//总留言数量
        // ctx.response.body = {succ:true,data:classOne}
    }else{
        ctx.response.body = {succ:false,errMsg:'分页查询失败'} 
    }
    


 }
 //留言点赞接口
const post_goods=async (ctx,next)=>{
    
}
module.exports={
    "GET/api/allArticle":all_article,
    "GET/api/queryArticle":query_article,
    "POST/api/addReply":add_reply,
    "POST/api/queryReply":query_reply,
    "POST/api/goods":post_goods
}