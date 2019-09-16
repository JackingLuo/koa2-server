/**
 * app.use就是执行一个个异步的中间件，所以需要await执行完毕之后在执行，执行顺序自上而下
 * koa-bodyparser 这个必须在router之前被注册到app对象上
 */

const Koa = require('koa');
const mysql = require('mysql');
const fs = require('fs');//fs模块
const bodyParser = require('koa-bodyparser')//post请求格式化模块
const Router = require("koa-router");//后端根据URL来进行配置的路由管理器
const path = require('path');
const views = require('koa-views');//模板引擎

const app = new Koa();
//分别创建两个不同的router实例，用于区分是返回页面还是纯粹的返回数据
const router = new Router();

//数据库操作
const connection = mysql.createConnection({
	host:'127.0.0.1',
	user:'root',
	password:'123456',  
	database:'mydata'
})
let mysql_add = "SELECT * FROM website";
function getWebsite(){
    connection.connect(function (err) {
        if(err){
            console.log(err);
            setTimeout(getWebsite,1000);  //经过1秒后尝试重新连接
            return;
        }
    });
}

router.get('/website',async(ctx,next)=>{
    getWebsite();
    connection.query(mysql_add,function(error,results,fields){
        if (error) throw error;
        console.log('The solution is:', results);
        ctx.body=results;
    })
})

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


