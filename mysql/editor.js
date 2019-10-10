let insert_sql = require("../controllers/mysql.config.js");
const fn_storageeditor = async(ctx,next)=>{
    let title = ctx.request.body.title || '';
    let editor = ctx.request.body.editor || '';
    let userId= ctx.request.body.userId || '';
    let upDate= ctx.request.body.upDate || '';
    if(userId==''){
       ctx.response.body={succ:false,errMsg:"请您先登录"};
    }else{
        let editor_sql = "INSERT INTO articles(userId,title,articleText,upDate) VALUE(?,?,?,?)";
        let values = [userId,title,editor,upDate];
        console.log(values)
        let addBack = await insert_sql(editor_sql,values);
        console.log(addBack)
        if(addBack){
            ctx.response.body={succ:true};
        }else{
            ctx.response.body={succ:false,errMsg:"服务器原因,文章发表失败了 "};
        }
    }
}
module.exports={
    "POST/api/storageeditor":fn_storageeditor
}