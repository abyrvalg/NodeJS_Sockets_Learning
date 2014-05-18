function player(socket, id, rooms, room, players, sendToAllRoomLess)	{
	this.id = id;
	this.roomId = -1;
	this.socket = socket;
	this.score = 0;
	socket.emit("authorizated", {id: this.id, rooms: rooms});		
	var that = this;
	socket.on("createRoom", function(data){
			that.roomId = Math.floor(Math.random() * 1000);
			rooms[that.roomId] = new room.room({playerId : data.userId, roomId: that.roomId}, players);
			socket.emit("roomCreated");
			sendToAllRoomLess("updateRooms", rooms);
	});
	socket.on("connectTo", function(data){
		if(rooms[data.roomId].connect(data.userId ,players)){		
			that.roomId = data.roomId;
			that.socket.emit("connecteSuccess");		
			rooms[data.roomId].readyForStart();
		}
	});	
	socket.on("disconnect", function(){		
		if(that.roomId != -1) {
			try {
				rooms[that.roomId].onePlayerLeft(that.id);
			}catch(e){};
			delete(rooms[that.roomId]);
			that.roomId = -1;
			sendToAllRoomLess("updateRooms", rooms);
		}
	});
};

player.prototype = {
	toJSON : function() {
		return '{"id: "'+this.id+',roomId:'+this.roomId+'"}';
	}
}
exports.player = player;