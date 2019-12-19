/**
 * 图片(包括富文本编辑器的图片)资源上传到本地服务器
 */
const upload = require("../controllers/koa-multer");
const qnUpload = require("../controllers/qiniu");
let formidable = require('formidable');
let insert_sql = require("../controllers/mysql.config.js");

const fn_uploadImg=async(ctx,next)=>{
    let err = await upload.single('file')(ctx, next)
                .then(res=>{res})
                .catch(err=>err)
    if(err){
        ctx.body = {
            code:0,
            msg : err.message
        }
    }else{
        // CKEditor5上传完照片必须返回json数据
        ctx.body = {
            'code':'1',
            'url': 'http://luojiaxin.com/uploads/'+ctx.req.file.filename//返回文件名
        }
    }  
}
/**
 * 解析form表单数据
 */
let getFormData =(ctx)=>{
    return new Promise((resolve, reject)=>{
        let form = new formidable.IncomingForm({//创建上传表单
            encoding:'utf-8',//编码
            multiples:true,//支持多图片上传
            // uploadDir:"public/files",//服务器的上传目录,要上传到七牛，不用设置
            keepExtensions:true,//保留后缀
            maxFieldsSize:10* 1024 * 1024 //文件大小限制
        });
        form.parse(ctx.req,(err,fields,files)=>{
            if (err)console.log(err)
            let userId = fields.userId;
            let takeTime = fields.takeTime;
            let upTime = fields.upTime;
            resolve({userId,takeTime,upTime,files})
        })
    })
}
/**
 * 上传图片(资源)到七牛云
 */
const fn_uploadQn=async(ctx,next)=>{
    // console.log(ctx.request.body)//空对象,说明node不能直接解析form表单
    let formData = await getFormData(ctx);
    //先校验上传人有没有权限
    let sql_power = `SELECT tang_user.power FROM tang_user WHERE tang_user.id=${formData.userId}`;
    let [backInfo] =await insert_sql(sql_power);
    if(backInfo.power!='1'){
        ctx.response.body = {succ:false,errMsg:"对不起,您没有上传权限"}
    }else{
        let myUpload=()=>{
            return new Promise((resolve, reject)=>{
                qnUpload(formData.files,(res)=>{
                    resolve(res)
                    //在这里直接返回ctx.body会报错404
                })
            })
        }
        let res = await myUpload();//等待这个异步方法执行完,返回的是照片在七牛云的路径
        //将返回的信息添加到数据库
        let sql_add = "INSERT INTO tang_photos(user_id,up_time,take_time,path) VALUE(?,?,?,?)";
        let count = 0;
        for(let val of res.data){
            let values = [formData.userId, formData.upTime, formData.takeTime, val.url];
            let back = await insert_sql(sql_add, values);
            if(back){
                count++;
                if(count==res.data.length){
                    ctx.response.body = {succ:true,data:res}
                }
            }
        }                                                           
    }
}
module.exports={
    "POST/upload/image":fn_uploadImg,
    "POST/api/qiniuUp":fn_uploadQn
}
