function AI(level, id, rooms, room, players) {
	this.level = level;
}
AI.prototype = {
	correct : function(ball) {
		var koef = ball.dX / ball.dY,
			notY = ball.X*koef/ball.Y,
			Y = notY % 290;
			return Y;
	}
}