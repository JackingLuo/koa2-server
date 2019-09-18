
/**
 * app.use就是执行一个个异步的中间件，所以需要await执行完毕之后在执行，执行顺序自上而下
 * koa-bodyparser 这个必须在router之前被注册到app对象上
 */

const Koa = require('koa');
const fs = require('fs');//fs模块
const bodyParser = require('koa-bodyparser')//post请求格式化模块
const staticServer=require('koa-static');
const path = require('path');
const views = require('koa-views');//模板引擎
const router = require("./controllers/router");


const app = new Koa();

app.use(bodyParser());
app.use(staticServer(path.join(__dirname,'./view'))); //设置静态文件，也可以说是设置服务的根目录（可直接在浏览器中访问，如图片）
// 加载ejs模板引擎
app.use(views(path.join(__dirname, './view'), {
    extension: 'ejs'
}))



//遍历mysql文件夹中所有的文件——为所有的路由和api注册相应的方法，过滤留下js文件
let files=fs.readdirSync(__dirname+'/mysql');
let jsFiles = files.filter((fn)=>{
    return fn.endsWith('.js');
});
for(let val of jsFiles){
    //循环导入所有文件中暴露出来的对象
    let oneFile = require(__dirname+'/mysql/'+val);
    for(let key in oneFile){
        //判断请求类型，并注册对应的路由
        if(key.startsWith("GET")){
            let path = key.substr('3');
            router.get(path,oneFile[key])
        }else if(key.startsWith("POST")){
            let path = key.substr('4');
            router.post(path,oneFile[key])
        }
    }
}

// router.get('/',async (ctx, next) => {
//     console.log(ctx.cookies.get('isLogin'))
//     if(ctx.cookies.get('isLogin')){
//         ctx.type="html";
//         ctx.response.body=fs.createReadStream("view/index.html")
//     }else{
//         let title = "登陆页面";
//         await ctx.render('login', {
//             title
//         })
//     }
// })

app.use(
    router.routes()
)
app.listen(8099);

console.log('starting at 8099');
