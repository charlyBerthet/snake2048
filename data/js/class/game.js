//CONSTRUCTEUR
var Game = function(elem,width,height){

	this.elem = elem || this.elem || null;
	this.width = width || this.width || 5;
	this.height = height || this.height || 5;
	this.dpl =99;

	this.snake = new Snake(	this.randomCase() );

	var rand = Math.floor(Math.random()*4);
	this.snake.direction( (rand == 0 ? 1 : rand == 1 ? -1 : 0), (rand == 2 ? 1 : rand == 3 ? -1 : 0));

	this.bodyADel = new Array();
	this.listeObjet = new Array();
};


////////////////////>>>>>>>>>>>> VUE

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
		elem.html("<div id='objet-"+key+"' class='objetType"+objet.num+"' data-lvl='"+objet.lvl+"'><p>"+objet.lvl+"</p></div>");
	}
};





// DEL BODY
Game.prototype.delBody = function(numDel,numFus){
	$("#snake-body-"+numDel).animate({"opacity":"0"},1500);

	var cpt = 0;
	var time = setInterval(function(){
		$("#snake-body-"+numDel).css({"transform": "rotate("+cpt+"deg)"});
		cpt = cpt +  2;
		
		if(cpt > 360){
			$("#snake-body-"+numDel).css({"transform": "rotate(360deg)"});
			$("#snake-body-"+numDel).remove();
			clearInterval(time);
		}
			
	},1);
	
	if(numFus != null){
		this.animText(numFus);
	}
	
	
};



Game.prototype.animText = function(num){
	var cptTimeShow = 0;
	var sens = 1;
	var timeShow = setInterval(function(){
		$("#snake-body-"+num).css({"font-size":((cptTimeShow)+13)+"pt"});
		cptTimeShow = cptTimeShow  + (1* sens) ;
		if(cptTimeShow > 7)
			sens = sens * -1;
		else if(cptTimeShow <= 0){
			$("#snake-body-"+num).css({"font-size":(13)+"pt"});
			clearInterval(timeShow);
		}
	},30);
};



//////////////////////	ANIMATIONS			\\\\\\\\\\\\\\\\\\\\\\\\\
Game.prototype.justePush = function(elem,callback){
	elem.css({"opacity":"0"});
	elem.animate({"opacity":"1"},400,function(){
		callback();
	});
};


////////////////////>>>>>>>>>>>> CONTROLE

//DEPLACEMENT
Game.prototype.deplacement = function(){
	// Bouge snake
	this.moveSnake();
	// Snake mange Objet ?
	this.snakeMangeObjet();
	
	// Affiche snake
	this.drawSnake();
	
	// On fusion temps qu'on peut
	this.fusionBodyWhileYouCan();
	
	// Ajoute objet
	if(this.dpl >= 3){
		this.addObjet();
		this.dpl = 0;
	}

	// Affiche objet
	this.drawObjets();
	// On dpl ++
	this.dpl++;
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
Game.prototype.addObjet = function(){
	var cell = this.randomCase(); 
	var rand = Math.floor((Math.random()*9)+1);
	var o = new Objet(cell,(rand == 4 ? 2 : 1));
	o.randLvl();
	this.listeObjet.push(o);
};