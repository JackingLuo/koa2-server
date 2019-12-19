/**
 * (多)文件上传到七牛云
 */
let qiniu = require('qiniu');
let formidable = require('formidable');

// 相关配置: Access Key 和 Secret Key,上传的空间,自己的域名
const myQnConfig ={
    ACCESS_KEY: 'AeYncZyDvSgJdl8EXsPKCvXcARkAhxoIZVsQiqHM',
    SECRET_KEY : 'Vh2Y9Vx9V9xScIXm58tJZuPXo3z2Y9ClBWINLoo5',
    bucket:'luojx',
    myUrl:"http://q2hxeye5d.bkt.clouddn.com"
}

//设置ACCESS_KEY和SECRET_KEY
qiniu.conf.ACCESS_KEY = myQnConfig.ACCESS_KEY;
qiniu.conf.SECRET_KEY =myQnConfig.SECRET_KEY;


//构建上传策略函数  （获取七牛上传token）
let uptoken = function() {
    //要上传的空间
    var putPolicy = new qiniu.rs.PutPolicy({ scope: myQnConfig.bucket });
    var uploadToken=putPolicy.uploadToken();
    return uploadToken;
}

const qnUpload = (files,callback)=>{
    let backInfo = {
        succ:false,
        data:[],
        code:0,
        errMsg:''
    };
    //files是form解析出来的files(资源文件)
    let myFiles = files.file;
    let count = 0;
    myFiles.forEach(function(file){
            var filePath=file.path;//本地路径
            var fileName = file.name;
            let extension = fileName.substr(fileName.lastIndexOf("."));//文件名后缀
            let key = 'tang-'+new Date().getTime()+Math.ceil(Math.random()*100)+extension;//上传到七牛后保存的文件名
            //生成上传 Token
            let token = uptoken();
            // 文件上传（以下四行代码都是七牛上传文件的配置设置）
            var config = new qiniu.conf.Config();
            config.zone = qiniu.zone.zone2;  //设置传输机房的位置根据自己的设置选择(华南是zone2)
            var formUploader = new qiniu.form_up.FormUploader(config);
            var putExtra = new qiniu.form_up.PutExtra();
            formUploader.putFile(token, key, filePath, putExtra, function(resErr,resBody, resInfo) {
                if (resErr) {
                    backInfo.errMsg = resErr;
                    return callback(backInfo);
                }
                if (resInfo.statusCode == 200) {//上传成功 
                    // 输出 JSON 格式
                    var response = {
                        "url":myQnConfig.myUrl+'/'+key
                    };
                    count++;
                    backInfo.data.push(response);
                    if(myFiles.length==count){
                        backInfo.succ = true;
                        backInfo.code =1;                                                               
                        return callback(backInfo);
                    }
                } else {//上传失败
                    backInfo.errMsg = resBody;
                    return callback(backInfo);
                }
            })
    })
}

module.exports = qnUpload;

