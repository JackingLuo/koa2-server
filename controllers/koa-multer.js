const multer=require('koa-multer');
//文件上传
//配置
const storage = multer.diskStorage({
    //文件保存路径
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    //修改文件名称
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
        cb(null,Date.now() + Math.random()*10+"." + fileFormat[fileFormat.length - 1]);
    }
})
let fileFilter = (ctx, file ,cb)=>{
    //过滤上传的后缀为txt的文件
    if (file.originalname.split('.').splice(-1) == 'txt'){
        cb(null, false); 
    }else {
        cb(null, true); 
    }
}
//加载配置
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports=upload;