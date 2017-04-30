// 将此地址修改本服务器地址
var serverUrl  ="http://localhost:3000";
// 初始化一个公共的 测试脑图，默认首页打开的时候展示
Meteor.startup(() => {
	if (Minderjs.find().count()===0) {
		console.log("init the app");
		Minderjs.insert({"mid":"mindx","jscode":'{"root":{"data":{"id":"bch5d9j98fc0","created":'+ new Date().getTime() +',"text":"mindx","priority":null},"children":[]},"template":"filetree","theme":"classic","version":"1.4.41"}'});
	}
});
// 定义 创建与更新脑图的方法
Meteor.methods({
	updatemind(midclient,jscodeclient){
		console.log("update");
		Minderjs.update({"mid":midclient},{$set:{jscode:jscodeclient}});
	},
	insertmind(midclient){
		console.log("insert");
		Minderjs.insert({"mid":midclient,"jscode":'{"root":{"data":{"id":"bch5d9j98fc0","created":'+ new Date().getTime()+',"text":"'+midclient+'","priority":null},"children":[]},"template":"filetree","theme":"classic","version":"1.4.41"}'});
	}
});
// 获取上传文件内容的包
var multer = Meteor.npmRequire('multer');
// 表单中参数 upload_file 传的图片
// .image定义文件存放路径
upload = multer({ dest: './image' }).single('upload_file');
var fs = Meteor.npmRequire('fs');


// 下面2个路由由服务器使用
// 访问上传的图片
Picker.route('/image/:imagename', function(params, req, res, next){
  	var file = fs.readFileSync("image/" + params.imagename);
  	var headers = {
        'Content-type': 'image/png',
        'Content-Disposition': "attachment; filename="+params.imagename
      };
      res.writeHead(200, headers);
      res.end(file);
}, {where: 'server'});


// 上传图片，由前端上传的网页指定的
Picker.route('/upload', function(params, req, res, next) {
	// 文件上传处理
	console.log("upload image ");
	upload(req, res, function (err) {
		// 返回的内容根据 kityminder 要的值返回
		// req.file.filename 上传后的文件名
		res.end('{"errno":0,"msg":"ok","data":{"url":"'+ serverUrl+'/image/'+req.file.filename+'"}}');
	});
});