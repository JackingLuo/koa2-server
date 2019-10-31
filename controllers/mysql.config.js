//数据库操作
const　mysql = require('mysql');
//数据库基本配置
const pool = mysql.createPool({
	host:'localhost',//放到服务器也是localhost
	user:'root',
	password:'123456', //服务器上面数据库的密码需要小数点和大小写
	database:'myblog'
})
//增
const insert_sql=(sql,values)=>{
    return new Promise((resolve,reject)=>{
        //创建连接池
        pool.getConnection(function(err, connection) {
            if (err) {
              //连接失败
              reject( err )
            } else {
                connection.query(sql,values,async(err,results)=>{
                    resolve(results)
                })
            }
            //释放连接
            connection.release()
        })     
    })
}
module.exports=insert_sql;
