var oBackgroundAudioPlayer = document.getElementById('Background-AudioPlayer');
oBackgroundAudioPlayer.play();

var snake = new CreateSnake();

var snakeCanvas = document.getElementById('Snake-Canvas');
var canvasContext = snakeCanvas.getContext('2d');

snake.initGame();
snake.nStatus = 1;

var oForm = document.getElementsByTagName('form')[0];
var oMode = oForm.Mode;
var oStart = oForm.Start;
var oStop = oForm.Stop;

var sUrl = decodeURI(window.location.href);
var arr = sUrl.split('=');
oMode.value = arr[1];
selectMode();

var oStartTime = new Date();
var oNowTime = null;

Timer();

var stopDirect = 0; //用来存储暂停时蛇的移动方向
var tempStart = null; //暂停后按开始的时间
var tempStop = null; //按暂停的时间
var totalStop = 0; //存储暂停的时间有多长，每次累加
var flag = false; //用来标识是否按下了暂停

//游戏循环函数
function Timer() {
	// var tag = 0;//标志是否游戏结束（0：不结束 1：结束）
	var point = new CreatePoint(snake.aBody[0].x, snake.aBody[0].y); //蛇头的坐标

	// 根据方向决定蛇头的坐标变化，并根据蛇头的坐标判断是否游戏结束
	switch (snake.nDirect) {
		case 1:
			point.x -= 5;
			if (point.x < 0) {
				snake.nStatus = 0;
			}
			break;
		case 2:
			point.y -= 5;
			if (point.y < 0) {
				snake.nStatus = 0;
			}
			break;
		case 3:
			point.x += 5;
			if (point.x > 295) {
				snake.nStatus = 0;
			}
			break;
		case 4:
			point.y += 5;
			if (point.y > 145) {
				snake.nStatus = 0;
			}
			break;
	}


	//位置重排
	if (snake.nStatus == 1) {
		//如果吃到食物
		if ((snake.aBody[0].x == snake.pTarget.x) && (snake.aBody[0].y == snake.pTarget.y)) {
			snake.nCount++;
			snake.aBody[snake.nCount + 2] = new CreatePoint(); //蛇的末尾新建一个坐标点作为新的末尾蛇节
			snake.clear(snake.pTarget.x, snake.pTarget.y); //清除吃到的食物

			var oScoreAudioPlayer = document.getElementById('Score-AudioPlayer');
			oScoreAudioPlayer.play();

			snake.initTarget(); //创建一个新的食物
		}

		//保存末尾蛇节的坐标
		var tempPoint = new CreatePoint(snake.aBody[snake.nCount + 2].x, snake.aBody[snake.nCount + 2].y);

		//重排蛇以让蛇移动，注意此处的赋值顺序
		for (var i = snake.nCount + 2; i > 0; i--) {
			snake.aBody[i].x = snake.aBody[i - 1].x;
			snake.aBody[i].y = snake.aBody[i - 1].y;
		}
		//赋予新的蛇头位置
		snake.aBody[0].x = point.x;
		snake.aBody[0].y = point.y;
		//清除上一次的末尾蛇节
		snake.clear(tempPoint.x, tempPoint.y);
	}

	//console.log(point.x,point.y,snake.aBody[0].x,snake.aBody[0].y);
	//判断蛇是否咬到自身，注意索引值i从1开始
	if (snake.nStatus == 1) {
		for (var i = 1; i < snake.aBody.length; i++) {
			if ((snake.aBody[i].x == point.x) && (snake.aBody[i].y == point.y)) {
				snake.nStatus = 0;
				break;
			}
		}
	}


	//打印游戏界面
	canvasContext.beginPath();
	//目标
	canvasContext.fillStyle = 'blue';
	canvasContext.fillRect(snake.pTarget.x, snake.pTarget.y, 5, 5);
	//蛇
	canvasContext.fillStyle = 'green';


	for (var i in snake.aBody) {
		canvasContext.fillRect(snake.aBody[i].x, snake.aBody[i].y, 5, 5);
	}

	//游戏结束的处理
	if (snake.nStatus == 0) {
		alert("啊呜~好疼啊");

		var oGameoverAudioPlayer = document.getElementById('GameOver-AudioPlayer');
		oGameoverAudioPlayer.play();
		oBackgroundAudioPlayer.pause();

		if (confirm("Game Over! Do you want to try again?")) {
			canvasContext.clearRect(0, 0, 300, 150); //清除画布内容
			oStartTime = new Date();
			totalStop = 0;

			snake.initGame();
			snake.nStatus = 1;
			selectMode();

			oBackgroundAudioPlayer.load();
			oBackgroundAudioPlayer.play();
		} else {
			window.location.href = 'index.html';
		}

	}

	//游戏统计
	oNowTime = new Date();
	//若之前按了暂停则需减去暂停的那段时间，可能多次暂停，需要累加暂停时间
	if (flag) {
		totalStop = totalStop + (tempStart - tempStop);
		flag = false;
	}
	snake.nTime = Math.floor((oNowTime - oStartTime - totalStop) / 1000);

	var oSnakeTime = document.getElementById('Snake-Time');

	oSnakeTime.innerHTML = toTwo(Math.floor((snake.nTime % 86400) / 3600)) + ':' + toTwo(Math.floor((snake.nTime % 86400) % 3600 / 60)) + ':' + toTwo(snake.nTime % 60);

	var oSnakeScore = document.getElementById('Snake-Score');
	oSnakeScore.innerHTML = snake.nCount;
	var length = snake.nCount + 3;

	var oSnakeLength = document.getElementById('Snake-Length');
	oSnakeLength.innerHTML = length;

	if (snake.nStatus) {
		snake.timer = setTimeout(Timer, snake.nSpeed);
	}
}

//Snake构造函数
function CreateSnake() {
	this.aBody = null; //蛇 aBody[0]为蛇头

	this.nCount = 0; //吃的食物数目
	this.pTarget = new CreatePoint(0, 0); //食物坐标

	this.nSpeed = 300; //速度
	this.nTime = 0; //用时
	this.nDirect = 3; //当前方向（left:1 top:2 right:3 down:4 )
	this.nStatus = 1; //游戏状态 (stop:0 start:1)


	//clear方法
	//清除蛇节或者食物
	this.clear = function(x, y) {
		canvasContext.clearRect(x, y, 5, 5);
	}

	//initTarget方法
	//初始化目标食物坐标
	this.initTarget = function() {
		var tarX, tarY;

		tarX = Math.round(Math.random() * 295); //画布大小为宽300，取0~295的随机数
		tarY = Math.round(Math.random() * 145); //画布大小为高150，取0~145的随机数

		//确保食物的坐标为5的倍数或者为0
		if (tarX % 5 != 0) {
			tarX = tarX - tarX % 5;
		}
		if (tarY % 5 != 0) {
			tarY = tarY - tarY % 5;
		}

		this.pTarget.x = tarX;
		this.pTarget.y = tarY;
	}

	//initGame方法
	//初始化游戏
	this.initGame = function() {
		this.aBody = new Array();
		this.aBody[0] = new CreatePoint(20, 10); //初始时蛇有三节
		this.aBody[1] = new CreatePoint(15, 10);
		this.aBody[2] = new CreatePoint(10, 10);

		this.nCount = 0; //吃的食物数目
		this.pTarget = new CreatePoint(0, 0); //食物坐标

		this.nSpeed = 300; //速度
		this.nTime = 0; //用时
		this.nDirect = 3; //当前方向（left:1 top:2 right:3 down:4 )
		this.nStatus = 1; //游戏状态 (stop:0 start:1)

		this.initTarget(); //初始化食物坐标
	}



}

//坐标的构造函数
function CreatePoint(x, y) {
	this.x = x;
	this.y = y;
}

//时间显示为两位
function toTwo(n) {
	return n < 10 ? '0' + n : '' + n;
}

//按键响应函数
document.body.onkeydown = function(ev) {
	var ev = ev || event;
	switch (ev.keyCode) {
		case 37:
			snake.nDirect = 1; //左
			break;
		case 38:
			snake.nDirect = 2; //上
			break;
		case 39:
			snake.nDirect = 3; //右
			break;
		case 40:
			snake.nDirect = 4; //下
			break;
	}
	return false; //阻止事件默认行为
}

//移动端触摸移动
var startX = 0,
	startY = 0,
	endX = 0,
	endY = 0;
snakeCanvas.addEventListener("touchstart", function (event) {
	startX = event.touches[0].pageX;
	startY = event.touches[0].pageY;
	event.preventDefault();
});
snakeCanvas.addEventListener("touchmove", function (event) {
	endX = event.touches[0].pageX;
	endY = event.touches[0].pageY;
	event.preventDefault();
});
snakeCanvas.addEventListener("touchend", function (event) {
	event.preventDefault();
	var disX = endX - startX;
	var disY = endY - startY;
	if (Math.abs(disX) > Math.abs(disY) && disX < 0) { //左
		snake.nDirect = 1;
	} else if (Math.abs(disX) < Math.abs(disY) && disY < 0) { //上
		snake.nDirect = 2;
	} else if (Math.abs(disX) > Math.abs(disY) && disX > 0) { //右
		snake.nDirect = 3;
	} else if (Math.abs(disX) < Math.abs(disY) && disY > 0) { //下
		snake.nDirect = 4;
	} else { //未滑动
		console.log('未滑动')
	}
});


//游戏模式选择

oMode.onchange = selectMode;

function selectMode() {
	switch (oMode.value) {
		case '极速':
			snake.nSpeed = 50;
			break;
		case '快速':
			snake.nSpeed = 100;
			break;
		case '正常':
			snake.nSpeed = 300;
			break;
		case '慢速':
			snake.nSpeed = 600;
			break;
	}

	return snake.nSpeed;
}

oStart.onclick = function() {
	clearTimeout(snake.timer);
	snake.nDirect = stopDirect;
	tempStart = new Date();
	Timer();
}

oStop.onclick = function() {
	flag = true;
	stopDirect = snake.nDirect;
	tempStop = new Date();
	clearTimeout(snake.timer);
}