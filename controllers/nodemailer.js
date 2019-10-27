const nodemailer = require('nodemailer');//邮箱发送激活码
const transporter = nodemailer.createTransport({  
    service: 'qq', 
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {  
      user: '781642016@qq.com',  
      pass: 'pidzpnzirxpobdjc' //授权码,通过QQ获取  
      
    }  
});
const sendMail = mail=>{
        transporter.sendMail(mail, function(error, info){
            if(error) {
                console.log("邮件发送失败")
                return error
            }else{
                res.send('发送成功');  //res.send()后面的语句不会执行，若想要执行语句，放在res.send()语句前面；
            }
        })
}
module.exports=sendMail