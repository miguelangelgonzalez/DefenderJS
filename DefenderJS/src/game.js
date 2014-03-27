var Enemy = function(game, x, y, key) {
    Phaser.Sprite.call(this, game, x, y, key);
    game.add.existing(this);
    this.body.collideWorldBounds = true;
    this.pathTiles = [];
    this.startTileX = x / 32;
    this.startTileY = y / 32;
    this.endTileX = 0;
    this.endTileY = 0;
    this.isBlocked = false;
};
Enemy.prototype.constructor = Enemy;

Enemy.prototype = Object.create(Phaser.Sprite.prototype);

Enemy.prototype.setTargetTile = function (endTileX, endTileY) {
    this.endTileX = endTileX;
    this.endTileY = endTileY;
};

Enemy.prototype.getCurrentTile = function () {
  var currentTile;
  if (this.pathTiles.length) {
    currentTile = this.pathTiles[0];  
  }else{
    currentTile = { tileX: this.startTileX, tileY: this.startTileY };
  }
  return currentTile;
};

Enemy.prototype.moveToNextTile = function (){
  this.game.physics.moveToObject(this, this.pathTiles[0]);  
};

Enemy.prototype.updateMovement = function (){
  if (!this.isBlocked){
    var nextTile = this.pathTiles[0];

    while(nextTile)
    {
      if (this.game.physics.distanceBetween(nextTile, this) > 1) break;
      this.pathTiles = this.pathTiles.splice(1);
      nextTile = this.pathTiles[0];
    }

    if (nextTile) {
      this.moveToNextTile();
    } else {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
    }
  }   
};
 

BasicGame.Game = function (game) {
  this.map;
  this.pathfinder;
  this.layer;
  this.pathLayer;
  this.block;
  this.enemies = [];
};

BasicGame.Game.prototype = {
  create: function () {
    this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
    this.map = this.game.add.tilemap('map');
    this.map.addTilesetImage('Lost_Garden');
        
    this.pathLayer = this.map.createLayer('bounds');  
    this.layer = this.map.createLayer('background');  

    for (var i = 0; i < 4; i++) {
      var y = (32 * i) + 320;
      var enemy = new Enemy(this.game, 0, y, 'cubo');
      enemy.setTargetTile(24, 13);
      this.enemies[i] =  enemy;  
    };

    var self = this;
    _.each(this.enemies, function (enemy) {  
      self.findPathFor(enemy);
      enemy.moveToNextTile();
    });

    this.addNewBlock();
  },
  update: function () {
    _.each(this.enemies, function (enemy) {
      enemy.updateMovement();
    });
  }, 
/*  render: function () {
    if (this.sprite) {
        this.game.debug.renderSpriteInfo(this.sprite, 32, 32);    
    }      
  },*/
  addNewBlock: function () {
    this.block = this.game.add.sprite(22*32, 15*32, 'block');
    this.block.body.collideWorldBounds = true;
    this.block.inputEnabled = true;

    // Make this item draggable.
    this.block.input.enableDrag();
    
    // Then we make it snap to left and right side,
    // also we make it only snap when released.
    this.block.input.enableSnap(32, 32, false, true);
    var self = this;
    // Limit drop location to only the 2 columns.
    this.block.events.onDragStop.add(function (item) {
      var tile = self.map.getTileWorldXY(item.x, item.y, 32, 32, self.pathLayer);
      self.map.putTile(16, tile.x, tile.y, self.pathLayer);
      self.map.putTile(16, tile.x, tile.y, self.layer);
      
      _.each(self.enemies, function (enemy){
        if(_.findWhere(enemy.pathTiles, { tileX: tile.x, tileY: tile.y })) {
          self.findPathFor(enemy);    
        }
      });
    });
    //block.events.onDragStart(fixLocation);
  },
  findPathFor: function (sprite) {
    var walkables = [80];
    var self = this;

    sprite.isBlocked = true;
    this.pathfinder.setGrid(this.pathLayer.layer.data, walkables, null);
    
    this.pathfinder.setCallbackFunction(function (path) {
      var newPath = [];
      path = path || [];
      for(var i = 0, ilen = path.length; i < ilen; i++) {
          self.map.putTile(168, path[i].x, path[i].y, self.layer);
          newPath[i] = new Phaser.Point(path[i].x * 32, path[i].y * 32);
          newPath[i].tileX = path[i].x;
          newPath[i].tileY = path[i].y;
      }
      sprite.pathTiles = newPath;
      sprite.isBlocked = false;
    });

    var startTileX = sprite.getCurrentTile().tileX;
    var startTileY = sprite.getCurrentTile().tileY;
    var endTileX = sprite.endTileX;
    var endTileY = sprite.endTileY;

    this.pathfinder.preparePathCalculation([startTileX,startTileY], [endTileX,endTileY]);
    this.pathfinder.calculatePath();

  }
};
