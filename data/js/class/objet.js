var Objet = function(cellule,num){
	this.x = cellule.x || this.x || 0;
	this.y = cellule.y || this.y || 0;
	this.num = num || this.num || 1;
	this.lvl = this.lvl || 1;
	this.isJustePush = this.isJustePush || true;
};



Objet.prototype.randLvl = function(){
	
	if(this.num == 1){
		this.lvl = (Math.floor((Math.random()*2)+1) == 1 ? 2 : 4);
	}else if(this.num==2){
		this.lvl = Math.floor((Math.random()*4)+1);;
	}
	
};