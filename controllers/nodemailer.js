const nodemailer = require('nodemailer');//邮箱发送激活码
const transporter = nodemailer.createTransport({  
    service: 'qq',  
    auth: {  
      user: '781642016@qq.com',  
      pass: 'oxlkdipafxqxbffj' //授权码,通过QQ获取  
      
    }  
});
const sendMail = mail=>{
    transporter.sendMail(mail, function(error, info){
        if(error) {
          console.log(error);
          return 
        }
        // res.send('发送成功');  //res.send()后面的语句不会执行，若想要执行语句，放在res.send()语句前面；
    });
}
module.exports=sendMail