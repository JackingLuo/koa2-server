//数据库操作
const mysql = require('mysql');
//mysql配置
const pool = mysql.createPool({
	host:'127.0.0.1',
	user:'root',
	password:'123456',  
	database:'mydata'
})
const myQuery = (sql, values) => {
    return new Promise((resolve, reject) => {
        //创建连接池
        pool.getConnection(function (err, connection) {
            if (err) {
                //连接失败
                reject(err)
            } else {
                connection.query(sql, values, async (err, results) => {
                    resolve({ succ: true, res: results })
                })
            }
            //释放连接
            connection.release()
        })
    })
}
const fn_website = async (ctx, next) => {
    // let sql = "INSERT INTO website(name,address) VALUE(?,?);";
    // let sql = "SELECT * FROM website";
    let sql = "UPDATE website SET name=?,address=? WHERE id=2";
    let values = ["WB","www.weibo.com"];
    let res = await myQuery(sql, values);
    //直接在query方法里面返回res会因为异步问题报错，所以这里创建一个promise，主要是为了利用await让异步变成同步，最后返回res
    ctx.response.body = res;
}
module.exports = {
    "GET/website": fn_website
}