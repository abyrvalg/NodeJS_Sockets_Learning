function room(data, players) {		
	this.id = data.roomId;
	this.players = new Array();
	this.players.push(players[data.playerId]);
};
room.prototype = {
	connect : function(PalyerId, players) {		
		if(this.players.length <= 1) {			
			this.players.push(players[PalyerId]);
			this.players[0].socket.emit("connectToMyRoom", PalyerId);
			return true;
		}
		return false;
	},
	readyForStart : function(){
		var timeForStart = 4,
		that = this;	
		var timeWait = function() {
			setTimeout(function(){
				for(var player in that.players){				
					that.players[player].socket.emit("waitingChange", timeForStart);									
				}
				timeForStart--;
				if(timeForStart>0) {
					timeWait();
				}
				else that.start();
			}, 1000);
		};	
		timeWait();		
	},
	start : function(){
		var dx = Math.floor((Math.random()*8)+3),
			dy = Math.floor((Math.random()*8)+3);
		var i = 0;
		var that = this;
		for(var player in that.players){
			that.players[player].socket.emit("started", {dx: (i == 0 ? dx : dx*-1), dy: dy});
			(function(currentPlayer){
				currentPlayer.socket.on("moveTo", function(data){	
					that.sendAllButMe(currentPlayer.id, 'enemyMoved', data.y);			
				});	
				currentPlayer.socket.on("correct", function(data){	
					that.sendAllButMe(currentPlayer.id,'correct', data);	
				});
				currentPlayer.socket.on("goal", function(data){	
					currentPlayer.score++;
					currentPlayer.socket.emit("goal", currentPlayer.score);										
					that.sendAllButMe(currentPlayer.id,'fail', currentPlayer.score);	
					if(currentPlayer.score >= 21) {
						currentPlayer.socket.emit("won");										
						that.sendAllButMe(currentPlayer.id,'lost',{});
						for(pl in that.player) {
							that.player[pl].roomId = -1;
						}
						delete(that);
					}
				});
			}(that.players[player]));
			i=5;
		}
	},
	sendAllButMe : function(currentPlayerId, event, params) {
		var that = this;
		for(var player1 in that.players) {
			if(that.players[player1].id != currentPlayerId) { 
				that.players[player1].socket.emit(event, params);
			}
		}
	},
	onePlayerLeft : function(playerId) {
		var that = this; 
		(function(currentPlayerId){
			that.sendAllButMe(currentPlayerId, "oneUserLeft");
		}(playerId));
	}
}
exports.room = room;