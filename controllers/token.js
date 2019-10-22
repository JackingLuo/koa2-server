/**
 * session和token是起到保持用户登录状态的作用,我们把登录过后的用户信息用token或者session存储起来,那么下次前端请求的时候我们就验证这个token或者session有没有过期或者有没有这个权限(鉴权),如果过期了或者没有权限,就需要重新登录或者拒绝返回
 */
const jwt = require('jsonwebtoken');
const serect = 'luojx';
//设置token
const set_token = (userInfo) => {
    let token = jwt.sign(userInfo, serect,{ expiresIn: 60 * 60 * 24 *7 });//过期时间设置7天
    return token
}
//解码,校验token
const check_token = (token) => {
    if (token) {
        //验证token,iat表示jwt签发token的时间
        return jwt.verify(token, serect,(err, decoded) => {
            if (err) {
                switch (err.name) {
                case 'JsonWebTokenError':
                    return { succ:false, errMsg: '无效的token,请重新登录' }
                    break;
                case 'TokenExpiredError':
                    return { succ:false, errMsg: 'token过期,请重新登录' }
                    break;
                default:
                    return {succ:false,errMsg:"token验证失败,建议重新登录"}
                }
            }else{
                return {succ:true,decoded}
            }
        })
    }
}
module.exports = {
    set_token,
    check_token
}
