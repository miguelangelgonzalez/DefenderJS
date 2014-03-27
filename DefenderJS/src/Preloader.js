
BasicGame.Preloader = function (game) {
	
};

BasicGame.Preloader.prototype = {
	preload: function () {
  	this.stage.backgroundColor = '#000000';

    this.loadingText = this.add.text(512, 570, 'Loading', { font: "bold 32px Verdana", fill: "#FFFFFF", stroke: "#FF4136", strokeThickness: 5 });
    this.loadingText.anchor.setTo(0.5, 0.5);

	//Sprite
	this.load.spritesheet('cubo', 'assets/sprite.png', 32, 32);
	this.load.spritesheet('block', 'assets/block.png', 32, 32);
	//TileSets
	this.load.image("Lost_Garden", "assets/Lost_Garden.png");
	//Map
	this.load.tilemap("map", "assets/StoneDefence.json", null, Phaser.Tilemap.TILED_JSON);			

	},
	create: function () {
		this.game.state.start('Game');
	},
	update: function () {
		this.loadingText.setContents = 'Loading ' + this.load.progress + '%';
	}
};