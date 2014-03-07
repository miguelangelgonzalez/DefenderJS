var map;
var sprite;
var pathfinder;
var pathSprite=[];
var layer;
var pathLayer;
var block;
var isBlocked;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'content', { preload: preload, create: create, update: update, render: render });

function preload() {

	//Sprite
	game.load.spritesheet('cubo', 'assets/sprite.png', 32, 32);
    game.load.spritesheet('block', 'assets/block.png', 32, 32);
	//TileSets
	game.load.image("Lost_Garden", "assets/Lost_Garden.png");
	//Map
	game.load.tilemap("map", "assets/StoneDefence.json", null, Phaser.Tilemap.TILED_JSON);			
}

function create() {
    
    map = game.add.tilemap('map');
	map.addTilesetImage('Lost_Garden');
        
    pathLayer = map.createLayer('bounds');	
    layer = map.createLayer('background');	
	
	sprite = game.add.sprite(0, 320, 'cubo');
    sprite.body.collideWorldBounds = true;
	addNewBlock();
    
	pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
    findPathTo(0, 10, 24, 13);

    game.physics.moveToObject(sprite, pathSprite[0]);
    
}



function addNewBlock() {
        block = game.add.sprite(22*32, 15*32, 'block');
    block.body.collideWorldBounds = true;
    block.inputEnabled = true;
        // Make this item draggable.
        block.input.enableDrag();
        
        // Then we make it snap to left and right side,
        // also we make it only snap when released.
        block.input.enableSnap(32, 32, false, true);

        // Limit drop location to only the 2 columns.
        block.events.onDragStop.add(fixLocation);
    //block.events.onDragStart(fixLocation);

}

function fixLocation(item) {
    var tile = map.getTileWorldXY(item.x, item.y, 32, 32, pathLayer);
    map.putTile(16, tile.x, tile.y, pathLayer);
    map.putTile(16, tile.x, tile.y, layer);
    //check if the path is blocked
    if(_.findWhere(pathSprite, { tileX: tile.x, tileY: tile.y })) {
        console.log('new path-> from x='+pathSprite[0].tileX+' y='+pathSprite[0].tileY+' TO x=24 y=13');
        findPathTo(pathSprite[0].tileX, pathSprite[0].tileY, 24, 13);    
    }
    
    //addNewBlock();
}

function blockSpriteSpeed() {
    isBlocked = true;
}
function unBlockSpriteSpeed() {
    isBlocked = false;
}

function findPathTo(startTileX, startTileY, endTileX, endTileY) {
    
	var walkables = [80];
    blockSpriteSpeed();
    
    pathfinder.setCallbackFunction(callBackFindPath);
    pathfinder.setGrid(pathLayer.layer.data, walkables, null);
    pathfinder.preparePathCalculation([startTileX,startTileY], [endTileX,endTileY]);
    pathfinder.calculatePath();
}

function callBackFindPath(path) {
    pathSprite = [];
    path = path || [];
    for(var i = 0, ilen = path.length; i < ilen; i++) {
        map.putTile(168, path[i].x, path[i].y, layer);
        pathSprite[i] = new Phaser.Point(path[i].x * 32, path[i].y * 32);
        pathSprite[i].tileX = path[i].x;
        pathSprite[i].tileY = path[i].y;
    }
    unBlockSpriteSpeed();
}

 function distanceBetween(source, target) {
     this._dx = Math.abs(source.x - target.x);
     this._dy = Math.abs(source.y - target.y);
     
     return Math.sqrt(this._dx * this._dx + this._dy * this._dy);
}
 
function update() {
    
        //game.physics.collide(sprite, pathLayer, collisionHandler, null, this);
    if (isBlocked) {
        sprite.body.speed.x = 0;
        sprite.body.speed.y = 0;
    } else {
        if (pathSprite.length) {

            var distance = Math.floor(game.physics.distanceBetween(sprite, pathSprite[0]));

            if (distance <= 1) {

                pathSprite.splice(0, 1);
                console.log(pathSprite.length);
                if (pathSprite.length) {
                    console.log('move...');
                    game.physics.moveToObject(sprite, pathSprite[0]);
                }
            }
        } else {
            if (sprite) {
                sprite.destroy();
                sprite = null;
            }
        }        
    }
}
    
function collisionHandler (o1, o2) {


}

function render() {
    if (sprite) {
        game.debug.renderSpriteInfo(sprite, 32, 32);    
    }
    
}


