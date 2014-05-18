window.onload = function () {
	var socket = io.connect('http://localhost:3000/');
	socket.on("authorizated", function(data){
		document.getElementById("palay-with-bot").onclick = function() {
		var dx = Math.floor((Math.random()*8)+3),
			dy = Math.floor((Math.random()*8)+3);
			startGame(0, {dx: dx, dy: dy}, 0);
		}
		var userId = data.id,
			rooms = function(roomsArray){
				var roomsArray = roomsArray;
				return{					
					updateRooms : function(rooms) {					
						roomsArray = rooms; 
						document.getElementById("roomList").innerHTML = "";
						for(room in roomsArray) {
							document.getElementById("roomList").innerHTML += "<div name='room' id='"+roomsArray[room].id+"'>"+roomsArray[room].id+"- "+roomsArray[room].players.length+" players</div>";
						}
					}
				}
			}(data.rooms);		
		if(data.rooms)
			rooms.updateRooms(data.rooms);
		socket.on('updateRooms', function(data){		
			rooms.updateRooms(data);
		});
		document.getElementById("roomList").onclick = function() {
		
		}
		document.getElementById("roomList").onclick = function(e){
			socket.emit("connectTo", {"userId":userId, "roomId":e.target.getAttribute("id")});
			socket.on("connecteSuccess", function(data){
				wait();
			});
		};
		document.getElementById("start").onclick = function() {	
		document.getElementById("start").style.display = "none";
			socket.emit("createRoom", {userId: userId});			
			socket.on("roomCreated", function(room){
				document.getElementById("roomList").innerHTML = "room was created, waiting for another player...";				
				socket.on("connectToMyRoom", function(){
					wait();
				});
			});			
		}	
		var wait = function(){
			document.getElementById("roomList").innerHTML = "someone joined starting for <span id='waitingForStart'>5</span>";
			socket.on("waitingChange", function(sec){
				document.getElementById("waitingForStart").innerHTML = sec;
			});
			
			socket.on("started", function(data){
				startGame(socket, data, userId);
							
				
			});
		}		
	});
}

var AI = function(ball) {		
	var notY = ((570-ball.x)*ball.dY)/ball.dX+ball.y, mod = notY % 290;
	return Math.abs((((notY - mod) / 290) % 2) == 0 ? mod : (notY > 0 ? 290 - mod : 290 + mod));
}
function startGame (socket, data, userId) {
	if(socket){
		socket.on("enemyMoved", function(y){
			enemy.y = y;
		});				
		socket.on("oneUserLeft", function(data){
			alert("your opponent has left, room will be destroyed");
			location.reload();
		});
		socket.on("won", function(){
			alert("You won");
			location.reload();
		});
		socket.on("lost", function(){
			location.reload();
			alert("You lost");					
		});
		socket.on("correct", function(data){
			ball.x = data.x+570;
			ball.y = data.y;
			ball.dX = data.dX*-1;
		});
		socket.on("fail", function(score){
			Crafty("RightPoints").each(function () {								
				this.text(score + " Points") });
		});
		socket.on("goal", function(score2){
			Crafty("LeftPoints").each(function () {								
				this.text("YOU "+score2 + " Points") });
		});	
	}	
	Crafty.init(600, 300);
	Crafty.background('rgb(127,127,127)');			
	//Paddles
	var myPlayer = Crafty.e("Paddle, 2D, DOM, Color, Multiway, Collision")
		.color('rgb(255,0,0)')
		.attr({ x: 20, y: 100, w: 10, h: 100 })
		.multiway(4, { W: -90, S: 90 }).bind('Moved', function (e) {
			if(socket) socket.emit('moveTo', {y:e.y, "userId" : userId});
		}).onHit("Paddle", function(){
			ball.dX *= -1;
			if(socket) {
				socket.emit("correct", {x: ball.x, y: ball.y, dX: ball.dX});
			}
			else {
				enemy.y = AI({x: ball.x, y: ball.y, dX: ball.dX, dY: ball.dY});
	        }
		});
	var enemy = Crafty.e("Paddle, 2D, DOM, Color, Multiway, Collision")
		.color('rgb(0,255,0)')
		.attr({ x: 580, y: 100, w: 10, h: 100 });
	if(!socket) 
	enemy.onHit("Paddle", function(){
			ball.dX *= -1;});

	//Ball
	var ball = Crafty.e("Paddle, 2D, DOM, Color, Collision")
		.color('rgb(0,0,255)')
		.attr({ x: 300, y: 150, w: 10, h: 10,
				dX: data.dx, 
				dY: data.dy })
		.bind('EnterFrame', function () {
			//hit floor or roof
			if (this.y <= 0 || this.y >= 290)
				this.dY *= -1;

			if (this.x > 600) {
				this.x = 300;
				if(socket) {
					socket.emit("goal");
                }
                else {
                    enemy.y = AI({x: ball.x, y: ball.y, dX: ball.dX, dY: ball.dY});
                }
			}
			if (this.x < 10) {
				this.x = 300;
				if(!socket)
				enemy.y = AI({x: ball.x, y: ball.y, dX: ball.dX, dY: ball.dY});
			}
			this.x += this.dX;
			this.y += this.dY;
		});
	if(!socket) enemy.y = AI({x: ball.x, y: ball.y, dX: ball.dX, dY: ball.dY});

	//Score boards
	Crafty.e("LeftPoints, DOM, 2D, Text")
		.attr({ x: 20, y: 20, w: 100, h: 20, points: 0 })
		.text("YOU 0 Points");
	Crafty.e("RightPoints, DOM, 2D, Text")
		.attr({ x: 515, y: 20, w: 100, h: 20, points: 0 })
		.text("0 Points");
}
