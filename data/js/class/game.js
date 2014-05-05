//CONSTRUCTEUR
var Game = function(elem,width,height){

	this.elem = elem || this.elem || null;
	this.width = width || this.width || 5;
	this.height = height || this.height || 5;
	this.dpl =0;
	this.vgameOver = false;
	this.snake = new Snake(	this.randomCase() );

	var rand = Math.floor(Math.random()*4);
	this.snake.direction( (rand == 0 ? 1 : rand == 1 ? -1 : 0), (rand == 2 ? 1 : rand == 3 ? -1 : 0));

	this.keyStorage = "snake2048";
	this.bodyADel = new Array();
	this.listeObjet = new Array();
	
	$("#best").html(this.giveBestScore());
};


////////////////////>>>>>>>>>>>> VUE


// CLEAR TABLE
Game.prototype.clearTable = function(){
	this.elem.find("td").html("");
	$("#score").text("0");
};


//DRAW TABLE
Game.prototype.drawTable = function(){
	var content = "";
	for(var r=0; r < this.height ; r++){
		content += "<tr>";
		for(var c=0; c < this.width; c++){
			content += "<td data-row='"+r+"' data-col='"+c+"'>";
			content += "</td>";
		}
		content += "</tr>";
	}
	this.elem.html(content);

	var width = this.elem.find("td").css("width");
	var height = this.elem.find("td").css("height");
	this.elem.find("td").css({"height":height,"width":width});
};






//DRAW SNAKE
Game.prototype.drawSnake = function(){
	// DRAW HEAD
	$("#snake-head").remove();
	this.elem.find("td[data-row='"+this.snake.head.y+"'][data-col='"+this.snake.head.x+"']").html("<div id='snake-head'></div>");
	// DRAW BODY
	for(var i=0; i<this.snake.listeOfBody.length; i++){
		var x = this.snake.listeOfBody[i].x;
		var y = this.snake.listeOfBody[i].y;
		
		$("#snake-body-"+i).remove();
			
		var delAfterShow = function(){};
		// On parcourt la liste des bodys a supprimer et si on tombe sur un body fusionnée avec le actuelle alors on fait lanimation
		if(this.snake.listeOfBody[i].justeFusion != false )
			for(var keyDel in this.bodyADel)
				if(this.snake.listeOfBody[i].justeFusion == this.bodyADel[keyDel] ){ 
					
					delAfterShow = function(me,idDel,idFus){
						me.delBody(idDel,idFus);
					}(this,this.bodyADel[keyDel],i);
					
					this.bodyADel.splice(keyDel,1);
				}
					
		
		this.elem.find("td[data-row='"+y+"'][data-col='"+x+"']").html("<div data-lvl='"+this.snake.listeOfBody[i].lvl+"' data-select='"+this.snake.listeOfBody[i].select+"' class='snake-body' id='snake-body-"+i+"'><p>"+this.snake.listeOfBody[i].lvl+"</p></div>");

		if(this.snake.listeOfBody[i].justePush && (x != -99 && y != -99)){
			this.justePush($("#snake-body-"+i),delAfterShow);
			this.snake.listeOfBody[i].justePush = false;
		}
	}
	
	
	for(var keyDel in this.bodyADel)
		this.delBody(this.bodyADel[keyDel],null);
	
	
	// On MAJ la liste de bodys a sup
	this.bodyADel = new Array();
};





//DRAW OBJETS
Game.prototype.drawObjets = function(){
	for(var key in this.listeObjet){
		var objet = this.listeObjet[key];
		var elem = this.elem.find("td[data-row='"+objet.y+"'][data-col='"+objet.x+"']");
		$("#objet-"+key).remove();
		
		var elObjet = $("<div id='objet-"+key+"' class='objetType"+objet.num+"' data-lvl='"+objet.lvl+"'><p>"+objet.lvl+"</p></div>");
		if(objet.isJustePush == true){
			elObjet.css({"opacity":"0","width":"0px","height":"0px"});
			elem.html(elObjet);
			elObjet.animate({
				"width":"100%",
				"height":"100%",
				"opacity":"1"
			},500);
			
			objet.isJustePush = false;
		}else{
			elem.html(elObjet);
		}
			
		
	}
};





// DEL BODY
Game.prototype.delBody = function(numDel,numFus){
	try{
		$("#snake-body-"+numDel).animate({
			"opacity":"0",
			"width":"0",
			"height":"0"
			},500,
			function(){
				$("#snake-body-"+numDel).remove();
		});
		
	}catch(e){
		$("#snake-body-"+numDel).remove();
	};
	
	
	
};


// AFFICHE SCORE
Game.prototype.showScore = function(){
	var score = 0;
	for(var k in this.snake.listeOfBody)
		score += parseInt(this.snake.listeOfBody[k].lvl);
	$("#score").text(score);
};



//////////////////////	ANIMATIONS			\\\\\\\\\\\\\\\\\\\\\\\\\
Game.prototype.justePush = function(elem,callback){
	elem.css({"opacity":"0"});
	elem.animate({"opacity":"1"},400,function(){
		callback();
	});
};



//////////////		GAME OVER 		\\\\\\\\\\\\\\\\\\\\\
Game.prototype.gameOver = function(){
	this.snake.vgameOver = true;
	$(this).css("display","none");
	$("#gameOver").fadeTo("slow",1);
	var score = 0;
	for(var k in this.snake.listeOfBody)
		score += parseInt(this.snake.listeOfBody[k].lvl);
	$("#gameOverScore").html(score);
	this.saveBestScore();
};





////////////////////>>>>>>>>>>>> CONTROLE

//DEPLACEMENT
Game.prototype.deplacement = function(){
	if(this.vgameOver == false){
		
		
		// Bouge snake
		this.moveSnake();
		// Snake mange Objet ?
		this.snakeMangeObjet();
		
		// Affiche snake
		this.drawSnake();
		
		
		
		// On fusion temps qu'on peut
		this.fusionBodyWhileYouCan();
		
		// Ajoute objet
		if(this.dpl % 3 == 0){
			if(this.dpl != 0 && this.dpl % 18 == 0){
				this.addObjet(2);
			}else{
				this.addObjet(1);
			}
			
		}
	
		// Affiche objet
		this.drawObjets();
		
		
		// AFFICHE LE SCORE
		this.showScore();
		
		
		// CHECK SI SE MORD LA QUEUE
		if(this.mordQueue())
			this.gameOver();
		
		// CHECK BLOQUE
		if(this.isBloque())
			this.gameOver();
			
		// On dpl ++
		this.dpl++;
	}
};



// cHECK SI SE MORD LA QUEUE
Game.prototype.mordQueue = function(){
	for(var k in this.snake.listeOfBody){
		if(this.snake.listeOfBody[k].x == this.snake.head.x && this.snake.listeOfBody[k].y == this.snake.head.y){
			return true;
		}
	}
	return false;
};




// CHECK SI LE SNAKE EST BLOQUE
Game.prototype.isBloque = function(){
	var left = false, right = false,  top = false, bottom = false;
	for(var k in this.snake.listeOfBody){
		if(this.snake.listeOfBody[k].x == this.snake.head.x && this.snake.listeOfBody[k].y == this.snake.head.y - 1)// TOP
			top = true;
		else if(this.snake.listeOfBody[k].x == this.snake.head.x && this.snake.listeOfBody[k].y == this.snake.head.y + 1)// BOTTOM
			bottom = true;
		else if(this.snake.listeOfBody[k].x == this.snake.head.x - 1 && this.snake.listeOfBody[k].y == this.snake.head.y)// LEFT
			left = true;
		else if(this.snake.listeOfBody[k].x == this.snake.head.x + 1 && this.snake.listeOfBody[k].y == this.snake.head.y)// RIGHT
			right = true;
	}
	if(left && right && top && bottom)
		return true;
	return false;
};



// FUSION BODY SI POSSIBLE 
Game.prototype.fusionBodyWhileYouCan = function(){
	var cpt = 0;
	while(this.snake.canFusion()){
		
		var numDel = this.snake.fusion();

		if(numDel != null)
			this.bodyADel.push(numDel);
		cpt ++;
		if(cpt > 80)
			break;
	}
};



//SNAKE MANGE OBJET ?
Game.prototype.snakeMangeObjet = function(){
	// On parcourt la liste d'objet
	for(var key in this.listeObjet){
		var objet = this.listeObjet[key];
		// Si le snake est a l'emplacement d'un objet, on le supprime
		if(objet.x == this.snake.head.x && objet.y == this.snake.head.y){
			// num = 1 => Ajoute body
			if(objet.num == 1){
				this.snake.addBody(objet.lvl,1);
			}
			// num = 2 => Body up
			else if(objet.num == 2){
				
				for(var i = 0; i < objet.lvl; i++)
					this.selectNextBody();
			}

			this.listeObjet.splice(key,1);
		}
	}
};













//SELECT NEXT BODY
Game.prototype.selectNextBody = function(){	
	if(this.snake.listeOfBody.length >= 1){
		
		var index = this.snake.getIndexBodySelect();


		// Si il n'y en a pas de select on select le premier
		if(index == null)
			this.snake.listeOfBody[0].select = true;
		// Si on est au dernier indice on retourne au premier
		else if(index == this.snake.listeOfBody.length-1){
			this.snake.listeOfBody[index].select = false;
			this.snake.listeOfBody[0].select = true;
		}			
		// sinon on passe au suivant
		else{
			this.snake.listeOfBody[index].select = false;
			this.snake.listeOfBody[parseInt(index)+1].select = true;
		}
			

	}
};





//START MOVE 
Game.prototype.moveSnake = function(){
	// On parcourt le snake a l'envers
	// MOVE BODY
	for(var i=(this.snake.listeOfBody.length-1); i>=0; i--){
		// Si on est le premier on prend la tete, sinon on prend le body davant
		if(i==0){
			this.snake.listeOfBody[i].x = this.snake.head.x;
			this.snake.listeOfBody[i].y = this.snake.head.y;
		}else{
			this.snake.listeOfBody[i].x = this.snake.listeOfBody[i-1].x;
			this.snake.listeOfBody[i].y = this.snake.listeOfBody[i-1].y;
		}

	}

	// MOVE HEAD
	this.snake.head.x = this.gereBordure(	this.snake.head.x + (this.snake.dpX * this.snake.vitesse) , this.width );
	this.snake.head.y = this.gereBordure( 	this.snake.head.y + (this.snake.dpY * this.snake.vitesse) , this.height );
};





//GERE BORDURE
Game.prototype.gereBordure = function(val,width){
	if(val > width-1)
		return 0;
	if(val < 0)
		return width-1;
	return val;
};



//RANDOM CASE
Game.prototype.randomCase = function(){
	var cell = new Cellule (Math.floor((Math.random()*(this.width))), Math.floor((Math.random()*(this.height))));

	var cpt = 0;
	while(this.isDispo(cell) == false){
		cell = new Cellule (Math.floor((Math.random()*(this.width))), Math.floor((Math.random()*(this.height))));
		cpt++;
		if(cpt > 500)
			break;
	}


	return cell;
};




//IS CASE DISPO
Game.prototype.isDispo = function(cellule){
	var cel = this.elem.find("td[data-row='"+cellule.y+"'][data-col='"+cellule.x+"']");
	if(	cel.html() == "" || cel.html() == undefined || cel.html == "undefined")
		return true;

	return false;
};



//ADD OBJET
Game.prototype.addObjet = function(type){
	var cell = this.randomCase(); 
	var o = new Objet(cell,type);
	o.randLvl();
	this.listeObjet.push(o);
};



// GIVE BEST SCORE
Game.prototype.giveBestScore = function(){
	if(localStorage){
		if(localStorage[this.keyStorage] != undefined && localStorage[this.keyStorage] != "undefined" && localStorage[this.keyStorage] != null && localStorage[this.keyStorage] != "")
			return localStorage[this.keyStorage];
	}
	return "0";
};

//SAVE BEST SCORE
Game.prototype.saveBestScore = function(){
	var score = 0;
	for(var k in this.snake.listeOfBody)
		score += parseInt(this.snake.listeOfBody[k].lvl);
	if(localStorage){
		
		if(parseInt(localStorage[this.keyStorage]) < score){
			localStorage[this.keyStorage] = score;
			$("#best").html(score);
			
		}else if(localStorage[this.keyStorage] == "undefined" || localStorage[this.keyStorage] == undefined || localStorage[this.keyStorage] == null || localStorage[this.keyStorage] == ""){
			localStorage[this.keyStorage] = score;
			$("#best").html(score);
		}else{
			console.log(localStorage[this.keyStorage]);
		}
	}
};