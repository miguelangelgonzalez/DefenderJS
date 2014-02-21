
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'content', { preload: preload, create: create, update: update, render: render });

function preload() {

	//Sprite
	game.load.spritesheet('simon', 'assets/simon.png', 32, 32, 8);

	//TileSets
	game.load.image("tileset", "assets/TileSet.png");

	//Map
	game.load.tilemap("map", "assets/level1.json", null, Phaser.Tilemap.TILED_JSON);			
}

var map;
var tileset;

var blocked = false;
var pathfinder;

var collisionLayer;
var layer;
var pathLayer;

function create() {

//tileset = new Phaser.Tileset('tileset', 1, 32, 32, 0, 0, null);
//game.add.tileset('tileset');

    map = new Phaser.Tilemap(game, 'map');
	map.addTilesetImage('TileSet', 'tileset');
	

	//collisionLayer = map.createLayer('WallsCollision', 800, 600);
	//map.setCollision(45, true, collisionLayer);
	pathLayer = map.createLayer('Path', 800, 600);	
	//layer = map.createLayer('Background', 800, 608);
	
	var walkables = [56];
	
	pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
	
	var grid = [];
	var data = pathLayer.layer.data;
	for(var x=0; x<data.length;x++){
		grid[x] = [];
		for(var y=0; y<data[x].length;y++){
			grid[x][y] = data[x][y].index;
		}
	}
	
	pathfinder.setGrid(grid, walkables, null);
	
	findPathTo(0, 0, 24, 18);

}

function findPathTo(startTileX, startTileY, endTileX, endTileY) {

    pathfinder.setCallbackFunction(function(path) {
        path = path || [];
        for(var i = 0, ilen = path.length; i < ilen; i++) {
            map.putTile(12, path[i].x, path[i].y, pathLayer);
			//console.log('x=' + path[i].x + ' y=' + path[i].y);
        }
        blocked = false;
		
    });

    pathfinder.preparePathCalculation([startTileX,startTileY], [endTileX,endTileY]);
    pathfinder.calculatePath();
}

function update() {

//findPathTo(0, 0, 5, 15);
}

function render() {

}


