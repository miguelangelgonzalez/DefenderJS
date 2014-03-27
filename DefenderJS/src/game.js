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
      var enemy = new BasicGame.Enemy(this.game, 0, y, 'cubo');
      enemy.setTargetTile(24, 13);
      this.findPathFor(enemy);
      enemy.moveToNextTile();

      this.enemies[i] =  enemy;  
    };

    this.addNewBlock();
  },
  update: function () {
    for (var i = 0; i < this.enemies.length; i++) {
      var enemy = this.enemies[i];
      if(enemy.arrivedHome()) {
        enemy.destroy();
        this.enemies.splice(i,1);
      } else {
        enemy.updateMovement(); 
      }
    }

    /*if(!this.enemies.length){
      this.destroy();
    }*/
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
      
      var tile = { tileX: tile.x, tileY: tile.y };
      for (var i = 0; i < self.enemies.length; i++) {
        var enemy = self.enemies[i];
        if(enemy.pathIsBlockedBy(tile)){
          self.findPathFor(enemy);  
        }
      };
    });
    //block.events.onDragStart(fixLocation);
  },
  findPathFor: function (sprite) {
    var walkables = [80];
    var self = this;

    sprite.isBlocked = true;
    this.pathfinder.setGrid(this.pathLayer.layer.data, walkables, null);
    
    this.pathfinder.setCallbackFunction(function (path) {
      var newPathTiles = [];
      path = path || [];
      for(var i = 0, ilen = path.length; i < ilen; i++) {
          self.map.putTile(168, path[i].x, path[i].y, self.layer);
          newPathTiles[i] = new Phaser.Point(path[i].x * 32, path[i].y * 32);
          newPathTiles[i].tileX = path[i].x;
          newPathTiles[i].tileY = path[i].y;
      }
      sprite.pathTiles = newPathTiles;
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
