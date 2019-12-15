/**
 * 文件上传到七牛云
 */
let qiniu = require('qiniu');
let formidable = require('formidable');

// 相关配置: Access Key 和 Secret Key,上传的空间,自己的域名
const myQnConfig ={
    ACCESS_KEY: 'AeYncZyDvSgJdl8EXsPKCvXcARkAhxoIZVsQiqHM',
    SECRET_KEY : 'Vh2Y9Vx9V9xScIXm58tJZuPXo3z2Y9ClBWINLoo5',
    bucket:'luojx',
    myUrl:"http://luojiaxin.com"
}

//设置ACCESS_KEY和SECRET_KEY
qiniu.conf.ACCESS_KEY = myQnConfig.ACCESS_KEY;
qiniu.conf.SECRET_KEY =myQnConfig.SECRET_KEY;


let qn = {};


//构建上传策略函数   （获取七牛上传token）
qn.uptoken = function() {
    //要上传的空间
    var putPolicy = new qiniu.rs.PutPolicy({ scope: myQnConfig.bucket });
    var uploadToken=putPolicy.uploadToken();
    return uploadToken;
}

qn.uploadImg = function(req,callback){
    let callbackObj = {
        succ:false,
        status:0,
        errMsg:''
    };
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    //form.uploadDir = '../../uploadimg';     //设置上传目录 设置则会存储在中控服务器，不设置则建立一个临时文件 最后要上传到七牛，所以不用设置
    form.keepExtensions = true;     //保留后缀
    form.maxFieldsSize =10* 1024 * 1024;   //文件大小10M    报错413上传文件太大了
    form.parse(req, function(err, fields, files) {
        if (err) {
            callbackObj.errMsg = err;
            return callback(callbackObj);
        }
        //上传到七牛后保存的文件名
        let key = new Date().getTime()+Math.ceil(Math.random()*10);
        //生成上传 Token
        let token = qn.uptoken();
        //要上传文件的本地图片路径
        let filePath = files.file.path;     //如果是表单的数据提交会存储在fields中，图片文件提交会存储在files中 files.file中的file指的是前端设定input的name一般设置为file
        
        //构造上传函数
        // 文件上传（以下四行代码都是七牛上传文件的配置设置）
        var config = new qiniu.conf.Config();
        config.zone = qiniu.zone.zone2;  //设置传输机房的位置根据自己的设置选择(华南是zone2)
        var formUploader = new qiniu.form_up.FormUploader(config);
        var putExtra = new qiniu.form_up.PutExtra();
        formUploader.putFile(token, key, filePath, putExtra, function(respErr,respBody, respInfo) {
            if (respErr) {
                callbackObj.errMsg = respErr;
                return callback(callbackObj);
            }
            if (respInfo.statusCode == 200) {//上传成功 
                // 输出 JSON 格式  xxx填写自己在七牛中设置的自定义域名
                var response = {
                    "url":myQnConfig.myUrl+'/'+key
                };
                callbackObj.succ = true;
                callbackObj.status =1;
                callbackObj.data = response;
                return callback(callbackObj);
            } else {//上传失败
                callbackObj.errMsg = respBody;
                return callback(callbackObj);
            }
        });
    });
}

module.exports = qn;

