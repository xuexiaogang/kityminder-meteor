// import angular from 'angular';
import angularMeteor from 'angular-meteor';
// 默认首页使用 测试脑图
Router.route('/', function () {
	// 设置默认的测试脑图 mindx 这
	Session.set('filename', 'mindx');
	console.log("index");
},{where:'client'});
// 根据不同的文件名打开对应的脑图
Router.route('/:filename', function () {
	console.log("mindx file");
	Session.set("filename", this.params.filename);
},{where:'client'});

console.log("client init");

angular.module('kityminderDemo', ['kityminderEditor',angularMeteor])
	.config(function (configProvider) {
		// 指定文件上传接口的路径，已经用 meteor 在服务器上实现，不再使用 原来的php接口
		configProvider.set('imageUpload', '/upload');
	})
	.controller('MainController', ['$scope',function ($scope) {

		console.log("MainController init here");
		console.log(Session.get('filename'));
		$scope.showinfo = false;
		$scope.createfilestatus = false;
		$scope.inputfilename = false;
		// 创建新文件的判断逻辑
		$scope.newfile = function () {
			if ($scope.newfilename == undefined) {
				console.log("newfilename is empty");
				$scope.inputfilename = true;
				return;
			}
			newfilestatus = Minderjs.findOne({ "mid": $scope.newfilename });
			console.log($scope.newfilename);
			// 判断文件是否已经存在
			if (newfilestatus) {
				console.log("file exist");
				$scope.showinfo = true;
			} else {
				$scope.createfilestatus = true;
				console.log("can create file");
				// 根据文件名创建新的脑图
				Meteor.call('insertmind', $scope.newfilename);
			}
		};
		// 根据当前的脑图文件名打开指定的脑图
		mind = Minderjs.find({ "mid": Session.get('filename') });
		console.log(mind.count());
		// 返回 脑图的列表
		$scope.helpers({
			mindlist() {
				// 排除掉默认的测试脑图
				return Minderjs.find({"mid":{"$ne":'mindx'}});
			}
		});
		// 监控脑图更新
		mind.observe({
			// 首次打开指定的脑图时执行 导入
			added(document) {
				opjs = window.diff($scope.oldjs, JSON.parse(document.jscode));
				if (opjs.length > 0) {
					console.log("导入");
					$scope.patchlock = true;
					window.editor.minder.importJson(JSON.parse(document.jscode));
					$scope.patchlock = false;
				}
			},
			// 接收到脑图的更新时 更新指定的脑图
			changed(newDocument, oldDocument) {
				opjs = window.diff($scope.oldjs, JSON.parse(newDocument.jscode));
				if (opjs.length > 0) {
					console.log("update local data");
					$scope.oldjs = JSON.parse(newDocument.jscode);
					// 此开关很重要，不然收到更新，再触发本地的更新，又上传到服务器，就会死循环
					$scope.patchlock = true
					// 更新远程与本地的差异更新 本地的脑图
					window.editor.minder.applyPatches(opjs);
					$scope.patchlock = false;
				}
			}
		});

		$scope.initEditor = function (editor, minder) {
			window.editor = editor;
			window.minder = minder;
			$scope.oldjs = editor.minder.exportJson();
			console.log("初始化编辑器");
			console.log(Session.get('filename'));
			// 本地修改脑图后上传更新全部到服务器，新加入的用户需要全量更新，所以不能只上传 变化的部分
			editor.minder.on('contentchange', function () {
				// 防止远程更新导致 本地再次上传重复的更新
				if ($scope.patchlock) {
					return;
				}

				$scope.jscode = editor.minder.exportJson();
				opjs = window.diff($scope.oldjs, $scope.jscode);
				// 比较下本地的变化，不知道为啥一个本地操作这里发起2次调用，暂时还没搞懂，所以用这种方式判断下
				if (opjs.length > 0) {
					console.log("need commit update");
					// 保存更新后的 jscode 数据，用于以后比较计算
					$scope.oldjs = $scope.jscode;
					// 调用服务器的方法更新指定的 脑图
					Meteor.call('updatemind', Session.get('filename'), JSON.stringify($scope.jscode));
				}
			});
		};

	}]);