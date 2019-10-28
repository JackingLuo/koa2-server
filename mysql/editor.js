/**
 * 文章发表(富文本信息存储)接口(验证token)
 */
let insert_sql = require("../controllers/mysql.config.js");
let tokenConfig = require("../controllers/token.js");
const fn_storageeditor = async (ctx, next) => {
    let token = ctx.request.headers["token"];
    if(!token){
        ctx.response.body = { succ: false, errMsg: "token值不存在",errCode:666 };
        return
    }
    let checkBack = tokenConfig.check_token(token);
    if (checkBack.succ) {
        let title = ctx.request.body.title || '';
        let editor = ctx.request.body.editor || '';
        let userId = ctx.request.body.userId || '';
        let uploadDate = ctx.request.body.upDate || '';
        if (userId == '') {
            ctx.response.body = { succ: false, errMsg: "请您先登录" };
        } else {
            let editor_sql = "INSERT INTO articles(userId,title,articleHtml,uploadDate) VALUE(?,?,?,?)";
            let values = [userId, title, editor, uploadDate];
            let addBack = await insert_sql(editor_sql, values);
            if (addBack) {
                ctx.response.body = { succ: true };
            } else {
                ctx.response.body = { succ: false, errMsg: "服务器原因,文章发表失败了 " };
            }
        }
    } else {
        ctx.response.body = checkBack
    }
}
module.exports = {
    "POST/api/storageeditor": fn_storageeditor
}