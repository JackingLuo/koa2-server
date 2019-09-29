const fs = require('fs');//fs模块
const insert_sql = require("../controllers/mysql.config.js");

const fn_signin=async (ctx, next) => {
    let name = ctx.request.body.name || '';
    let password = ctx.request.body.password || '';
    let sql_select = `SELECT password FROM users WHERE name='${name}'`;
    const [psd] = await insert_sql(sql_select);
    if(psd){
        if(psd.password===password){
            ctx.cookies.set('isLogin','this is cont',{
                domain:'127.0.0.1', // 写cookie所在的域名
                path:'/',       // 写cookie所在的路径
                maxAge:1000*60*60,   // cookie有效时长
                expires:new Date('2019-12-31'), // cookie失效时间
                httpOnly:false,  // 是否只用于http请求中获取
                overwrite:false  // 是否允许重写
            })
            //登陆成功重定向到'/'路由
            ctx.response.redirect('/');
        }else{
            let title = "密码错误，请重新登陆";
            await ctx.render('login', {
                title
            })
        }
    }else{
        let title = "用户名不存在，请重新登陆";
        await ctx.render('login', {
            title
        })
    }
    await next();
}
//根路由进入
const fn_check =async (ctx, next)=>{
    // if(ctx.cookies.get('isLogin')){
        ctx.type="html";
        ctx.response.body=fs.createReadStream("public/view/index.html")
    // }else{
    //     let title = "登陆页面";
    //     await ctx.render('login', {
    //         title
    //     })
    // }
}
//校验用户的密码
const fn_checkPsd=async (ctx,next)=>{
    let password=ctx.request.body.password || '';
    let sql_select = "SELECT password FROM users WHERE name='koa2'";
    const [pasd]=await insert_sql(sql_select);
    if(pasd){
        if(pasd.password===password){
            ctx.response.body={succ:true}
        }else{
            ctx.response.body={succ:false,err:'1',msg:'密码错误'}
        }
    }else{
        ctx.response.body={succ:false,err:'2',msg:'用户名不存在'}
    }
}
module.exports={
    "POST/signin":fn_signin,
    "GET/":fn_check,
    "POST/checkPsd":fn_checkPsd
}