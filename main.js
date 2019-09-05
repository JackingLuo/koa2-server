/**
 * app.use就是执行一个个异步的中间件，所以需要await执行完毕之后在执行，执行顺序自上而下
 * koa-bodyparser 这个必须在router之前被注册到app对象上
 * 
 * vue三大模块：
 * 1.Observer:监听者，对data做监听，通过Object.defineProperty的setter方法来监听data数据变化。
 * 2.Watcher：观察者，data数据一旦发生改变，Observer会通过dep.notify通知（遍历）Watcher，调用watcher上绑定的update方法。因为JS是单线程，所以一次只能执行一个Watcher，
 * 其他的Watcher会自动推入队列中，在下一次nextTick更新之后再执行。
 * 3.directive:指令，先于watcher创建，指令解析成模板之后，创建Watcher并绑定对应的update方法。
 * 双向数据绑定的核心方法是：Object.defineProperty可以给对象新增/修改属性，它是对象的一种（存取）描述符。在vue中的作用就是给每个data添加getter和setter（存取）方法。
 */

const Koa = require('koa');
const fs = require('fs');//fs模块
const bodyParser = require('koa-bodyparser')//post请求格式化模块
const Router = require("koa-router");//后端根据URL来进行配置的路由管理器
const path = require('path');
const views = require('koa-views');//模板引擎

const app = new Koa();
//分别创建两个不同的router实例，用于区分是返回页面还是纯粹的返回数据
const router = new Router();
// const api = new Router({
//     prefix:'/api'
// });

app.use(bodyParser());

// 加载ejs模板引擎
app.use(views(path.join(__dirname, './view'), {
    extension: 'ejs'
}))

//遍历controllers文件夹中所有的文件，过滤留下js文件
let files=fs.readdirSync(__dirname+'/controllers');
let jsFiles = files.filter((fn)=>{
    return fn.endsWith('.js');
});
for(let val of jsFiles){
    //循环导入所有文件中暴露出来的对象
    let oneFile = require(__dirname+'/controllers/'+val);
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

router.get('/',async (ctx, next) => {
    if(ctx.cookies.get('isLogin')){
        ctx.type="html";
        ctx.response.body=fs.createReadStream("view/index.html")
    }else{
        let title = "登陆页面";
        await ctx.render('login', {
            title
        })
    }
})
app.use(
    router.routes()
)
app.listen(8099);
console.log('starting at 8099');


