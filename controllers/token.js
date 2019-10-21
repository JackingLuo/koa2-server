/**
 * session和token是起到保持用户登录状态的作用,我们把登录过后的用户信息用token或者session存储起来,那么下次前端请求的时候我们就验证这个token或者session有没有过期或者有没有这个权限(鉴权),如果过期了或者没有权限,就需要重新登录或者拒绝返回
 */
const jwt = require('jsonwebtoken');
const serect = 'luojx';
const set_token = (userInfo)=>{
    let token = jwt.sign(userInfo, serect);
    return token
}
const get_info = (token)=>{
    if (token){
        // 解析,iat表示jwt的签发时间
        let decoded = jwt.verify(token,serect)
        return decoded;
      }
}
module.exports= {
    set_token,
    get_info
}
