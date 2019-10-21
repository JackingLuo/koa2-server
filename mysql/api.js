/**
 * 其他的api请求(注意:get请求获取入参是用ctx.query,post用的是ctx.request.body)
 */
const insert_sql = require("../controllers/mysql.config.js");
let tokenConfig = require("../controllers/token.js");

//查询所有文章列表接口
const all_article = async (ctx, next) => {
    //后期加一个说明字段,再不返回所有的内容
    let sql_select = "SELECT articles.*,users.userName FROM articles left join users on articles.userId=users.id;";
    let backInfo =  await insert_sql(sql_select);
    if(backInfo){
        //解码
        // let token = ctx.request.headers["token"];
        // let payload = tokenConfig.get_info(token);
        // console.log(payload)
        ctx.response.body = {succ:true,data:backInfo}
    }else{
        ctx.response.body={succ:false,errMsg:'文章列表为空',errCode:222};
    }
}

//查询文章详情接口
const query_article=async (ctx,next)=>{
    let id = ctx.query.id || '';
    //查询文章详情
    let sql_select =`SELECT articles.*,users.userName FROM articles left join users on articles.userId=users.id WHERE articles.id=${id}`;
    //添加阅读量
    let add_read = `UPDATE articles SET readNum = readNum + 1 WHERE id=${id}`;
    let [backInfo] =  await insert_sql(sql_select);
    if(backInfo){
        let updateSucc =  await insert_sql(add_read);
        if(updateSucc){
            ctx.response.body = {succ:true,data:backInfo}
        }
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
    //查询所有激活的点赞数
    let sql_goods = "SELECT * FROM msg_goods WHERE isOk!=0";

    //查询数据量总数
    let sql_total = "SELECT COUNT(*) as total FROM messages WHERE messages.parent_id=0";
    let backInfo =  await insert_sql(sql_query);
    if(backInfo){
        let allGoods = await insert_sql(sql_goods);
        if(allGoods){
            for(let parentVal of backInfo){
                parentVal.children =[];
                parentVal.goods = 0;
                for(let num of allGoods){
                    if(num.msgId==parentVal.id)parentVal.goods++;
                }
                
            }
            let childrenList =  await insert_sql(sql_child);
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
        }else{
            ctx.response.body = {succ:false,errMsg:'查询点赞数失败'}
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
    let msgId = ctx.request.body.msgId || '';
    let userId = ctx.request.body.userId || '';
    //先去查询当前用户有没有给该文章点赞
    let sql_select = `SELECT * FROM msg_goods WHERE userId=${userId} and msgId=${msgId}`;
    let sql_add = "INSERT INTO msg_goods(userId,msgId,isOk) VALUE(?,?,?)";
    let [isFinish] = await insert_sql(sql_select);
    if(isFinish){//有点赞记录
        let finish = 1;
        if(isFinish.isOk)finish = 0;
        //取消还是点赞都做处理
        let update_sql = `UPDATE msg_goods SET isOk=${finish} WHERE msg_goods.id = ${isFinish.id}`;
        let myUpdate = await insert_sql(update_sql);
        if(myUpdate){
            ctx.response.body = {succ:true} 
        }else{
            ctx.response.body = {succ:false,errMsg:'点赞失败'} 
        }
    }else{//没有记录就是新增点赞
        let values = [userId,msgId,1]
        let backInfo = await insert_sql(sql_add,values);
        if(backInfo){
            ctx.response.body = {succ:true} 
        }else{
            ctx.response.body = {succ:false,errMsg:'点赞失败'} 
        }
    }
}
//查询数据统计接口
const get_statistics = async (ctx,next)=>{
    let sql_browse ="SELECT s.browseNum FROM statistics s";
    let sql_articles = "SELECT COUNT(*) as nums FROM articles";
    let sql_msg = "SELECT COUNT(*) nums FROM messages";
    let [articlesNum] = await insert_sql(sql_articles);
    let backInfo = [];
    if(articlesNum){
        backInfo.push({
            num:articlesNum.nums,
            title:"文章数量",
            path:"/article"
        })
        let [msgNum] = await insert_sql(sql_msg);
        if(msgNum){
            backInfo.push({
                num:msgNum.nums,
                title:"留言数量",
                path:"/mailbox"
            })
            let [browseNum] = await insert_sql(sql_browse);
            if(browseNum){
                backInfo.push({
                    num:browseNum.browseNum,
                    title:"总访问量",
                    path:''
                })
                ctx.response.body = {succ:true,data:backInfo}
            }else{
                ctx.response.body = {succ:false,errMsg:"获取浏览量失败"}
            }
        }else{
            ctx.response.body = {succ:false,errMsg:"获取留言数量失败"}
        }
    }else{
        ctx.response.body = {succ:false,errMsg:"获取文章数量失败"}
    }
}
//修改浏览量
let add_browseNum = async (ctx,next)=>{
    let sql_update = "UPDATE statistics SET browseNum = browseNum + 1 WHERE id = 1";
    let addSucc = await insert_sql(sql_update);
    if(addSucc){
        ctx.response.body = {succ:true}
    }
}
module.exports={
    "GET/api/allArticle":all_article,
    "GET/api/queryArticle":query_article,
    "POST/api/addReply":add_reply,
    "POST/api/queryReply":query_reply,
    "POST/api/goods":post_goods,
    "GET/api/statistics":get_statistics,
    "GET/api/browse":add_browseNum
}