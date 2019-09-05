const fn_signin=async (ctx, next) => {
    let name = ctx.request.body.name || '';
    let password = ctx.request.body.password || '';
    if (name === 'koa' && password === '12345') {
        ctx.response.body = `<h1>Welcome, ${name}!</h1>`;
        ctx.cookies.set('isLogin','cont',{
            domain:'127.0.0.1', // 写cookie所在的域名
            path:'/',       // 写cookie所在的路径
            maxAge:1000*60*60*24,   // cookie有效时长
            expires:new Date('2019-12-31'), // cookie失效时间
            httpOnly:false,  // 是否只用于http请求中获取
            overwrite:false  // 是否允许重写
        })
    } else {
        ctx.response.body = `<h1>登陆失败!</h1>
        <p><a href="/">重新登录</a></p>`;
    }
    await next();
}
module.exports={
    "POST/signin":fn_signin
}