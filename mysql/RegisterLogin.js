/**
 * 注册邮箱校验,用户登录,用户注册
 */
let insert_sql = require("../controllers/mysql.config.js");
const sendMail = require("../controllers/nodemailer.js");//邮箱发送注册码
let tokenConfig = require("../controllers/token.js");

//接收邮箱激活,激活账号
const fn_regischeck=async(ctx,next)=>{
    let userName=ctx.query.userName || '';
    let sql_activeUser= `UPDATE users SET isActive = 1 WHERE userName = '${userName}'`;
    let [res] = await insert_sql(sql_activeUser);
    if(res){
        ctx.response.body={succ:true,msg:"激活成功,请您继续登录"};
    }else{
        ctx.response.body={succ:false,msg:"激活失败,请重新点击链接进行激活"};
    }
}
//用户登录
const fn_login=async(ctx,next)=>{
    let userName=ctx.request.body.userName || '';
    let password=ctx.request.body.password || '';
    //这里要新增一个是否激活的状态
    let sql_select = `SELECT * FROM users WHERE userName='${userName}'`;
    let [backInfo] = await insert_sql(sql_select);
    if(backInfo){
        if(backInfo.isActive){
            if(backInfo.password===password){
                let data = {userId:backInfo.id,userName:backInfo.userName,email:backInfo.email};
                //使用token
                let token = tokenConfig.set_token({userName:backInfo.userName,time:new Date().getTime(),timeout:1000*60*60})
                ctx.response.body={succ:true,data,token}
            }else{
                ctx.response.body={succ:false,err:'1',errMsg:'密码错误'}
            }
        }else{
            ctx.response.body={succ:false,err:'2',errMsg:'该用户还没有激活,请进入申请邮箱激活账号'}
            
        }
    }else{
        ctx.response.body={succ:false,err:'2',errMsg:'用户名不存在'}
    }
    
}
//用户注册,存储账号但未激活
const fn_register=async(ctx,next)=>{
    //先给邮箱发送激活链接,让用户点击激活
    let userName=ctx.request.body.userName || '';
    let email = ctx.request.body.email || '';
    let password=ctx.request.body.password || '';
    //校验账号或者邮箱是否已存在
    let sql_userName = `SELECT email FROM users WHERE userName='${userName}'`;
    let sql_email = `SELECT userName FROM users WHERE email ='${email}'`;
    let [backInfo] = await insert_sql(sql_userName);
    if(backInfo){
        ctx.response.body={succ:false,errMsg:'该用户名已被注册'};
    }else{
        let [backInfo2] = await insert_sql(sql_email);
        if(backInfo2){
            ctx.response.body={succ:false,errMsg:'该邮箱已被注册'};
        }else{
            //发送邮件,让用户激活账号
            let mailOptions = {  
                from: '781642016@qq.com', // 发送者  
                to: email, // 接受者,可以同时发送多个,以逗号隔开  
                subject: '用户激活邮件', // 标题  
                text: '感谢您注册鄙人博客的账号!', // 文本  
                html: `<h2>请点击下面链接用以激活</h2> 
                <a href="http://localhost:8099/api/regischeck?userName=${userName}">激活邮箱账号</a>`   
            };
            sendMail(mailOptions);
            let sql_addUser= "INSERT INTO users(userName,email,password,isActive) VALUE(?,?,?,?)";
            let values = [userName,email,password,0];
            let myRes = await insert_sql(sql_addUser,values);
            ctx.response.body={succ:true,errMsg:"请去注册邮箱激活您的账号"};
        }
    }
}
module.exports={
    "GET/api/regischeck":fn_regischeck,
    "POST/api/login":fn_login,
    "POST/api/register":fn_register 
}