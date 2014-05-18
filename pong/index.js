exports.start = function(server){
	var rooms = {},
		players = {},
		sendToAllRoomLess = function(event, params) {
			for(var player in players){
				if(players[player].roomId == -1)
				players[player].socket.emit(event, params);
			}
		},
		io = require('socket.io'),
		sio = io.listen(server),
		player = require("./../pong/player"),
		room = require("./../pong/room");
		
    sio.sockets.on('connection', function (socket) {
        var playerId = Math.floor(Math.random() * 1000);
            players[playerId] = new player.player(socket, playerId, rooms, room, players, sendToAllRoomLess);
    });
};
