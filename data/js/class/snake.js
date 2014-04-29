var Snake = function(cellule){
	this.head = new Head(cellule);
	this.dpX = 0;		this.dpY = 0; this.vitesse = 1;
	this.listeOfBody = this.listeOfBody || new Array();
};


// CHANGE DIRECTION SNAKE
Snake.prototype.direction = function(dpX,dpY){
	this.dpX = dpX;		
	this.dpY = dpY;
};




// AJOUTE BODY
Snake.prototype.addBody = function(lvl,nbBody){
	var index = this.getIndexBodySelect();
	
	// Si il n'y a pas de body de selectionne on ajoute a la fin
	if(index == null)
		for(var i=0; i<nbBody; i++){
			var newX = -99;
			var newY = -99;
			var b = new Body(newX,newY);
			b.lvl = lvl;
			this.listeOfBody.push(b);
		}
	else{
		if(lvl == 2){
			this.listeOfBody[index].lvl = this.listeOfBody[index].lvl / 2;
			if(this.listeOfBody[index].lvl == 1)
				this.listeOfBody[index].lvl = 2;
		}else
			this.listeOfBody[index].lvl = this.listeOfBody[index].lvl * 2;
		
		this.listeOfBody[index].select = false;
	}	
};


// REGARDE SI LA FUSION EST POSSIBLE
Snake.prototype.canFusion = function(){
	for(var i = 0 ; i < this.listeOfBody.length ; i++)
		if(i+1 < this.listeOfBody.length)
			if((this.listeOfBody[i+1].x != -99 && this.listeOfBody[i+1].y != -99) && (this.listeOfBody[i].lvl == this.listeOfBody[i+1].lvl) && (this.listeOfBody[i].lvl%2 == 0)){
				return true;
			}
				
	return false;
};


// DEUX A COTE MEME LVL => FUSIONNE
Snake.prototype.fusion = function(){
	for(var i = 0 ; i < this.listeOfBody.length ; i++){
		var bodyAct = this.listeOfBody[i];
		if(i+1 < this.listeOfBody.length){ // Si le i+1 existe on compare le i au i+1
			var bodyNext = this.listeOfBody[i+1];
			if( (bodyNext.x != -99 && bodyNext.y != -99) && (bodyAct.lvl == bodyNext.lvl) && (bodyAct.lvl%2 == 0)){	// Si il ont un lvl egaux on fusionneles deux et on raccole les autres
				bodyAct.lvl = bodyAct.lvl * 2;	// On multipli le lvl actuel
				
				this.listeOfBody[i].justeFusion = i+1;
				this.listeOfBody.splice(i+1,1);
				return i+1;
			}
		}
	}
	return null;
};



///////////////// 	RETOURN LE BODY SELECT \\\\\\\\\\\\\\\\\\\\\\
Snake.prototype.getIndexBodySelect = function(){
	for(var key in this.listeOfBody)
		if(this.listeOfBody[key].select == true)
			return parseInt(key);
	return null;
};
