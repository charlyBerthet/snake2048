var Body = function(x,y){
	this.x = x || this.x || 0;
	this.y = y || this.y || 0;
	this.lvl = this.lvl || 1;
	this.select = this.select || false;
	this.justePush = this.justePush || true;
	this.justeFusion = this.justeFusion || false;
};