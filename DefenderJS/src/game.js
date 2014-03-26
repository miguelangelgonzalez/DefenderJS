var Enemy = function(game, x, y, key) {
    Phaser.Sprite.call(this, game, x, y, key);
    game.add.existing(this);
        this.body.collideWorldBounds = true;
};
Enemy.prototype = Object.create(Phaser.Sprite.prototype); 
Enemy.prototype.constructor = Enemy;

BasicGame.Game = function (game) {
  this.map;
  this.sprite;
  this.pathfinder;
  this.pathSprite=[];
  this.layer;
  this.pathLayer;
  this.block;
  this.isBlocked;
  this.priorDistance=0;
  this.once = true;
};

BasicGame.Game.prototype = {
  create: function () {
    this.map = this.game.add.tilemap('map');
    this.map.addTilesetImage('Lost_Garden');
        
    this.pathLayer = this.map.createLayer('bounds');  
    this.layer = this.map.createLayer('background');  
  
    this.sprite = new Enemy(this.game, 0, 320, 'cubo');
    this.addNewBlock();
      
    this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
    this.findPathTo(0, 10, 24, 13);

    this.game.physics.moveToObject(this.sprite, this.pathSprite[0]);
  },
  update: function () {
    var nextPoint = this.pathSprite[0];

    while(nextPoint)
    {
      if (this.game.physics.distanceBetween(nextPoint, this.sprite) > 1) break;
      this.pathSprite = this.pathSprite.splice(1);
      nextPoint = this.pathfinder[0];
    }

    if (nextPoint) {
      this.game.physics.moveToObject(this.sprite, this.pathSprite[0], 60);
    } else {
        this.sprite.body.velocity.x = 0;
        this.sprite.body.velocity.y = 0;
    } 
  }, 
  render: function () {
    if (this.sprite) {
        this.game.debug.renderSpriteInfo(this.sprite, 32, 32);    
    }      
  },
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
      //check if the path is blocked
      if(_.findWhere(self.pathSprite, { tileX: tile.x, tileY: tile.y })) {
          //console.log('new path-> from x='+pathSprite[0].tileX+' y='+pathSprite[0].tileY+' TO x=24 y=13');
          self.findPathTo(self.pathSprite[0].tileX, self.pathSprite[0].tileY, 24, 13);    
      }
    });
    //block.events.onDragStart(fixLocation);
  },
  blockSpriteSpeed: function () {
    this.isBlocked = true;
  },
  findPathTo: function (startTileX, startTileY, endTileX, endTileY) {
    var walkables = [80];
    this.blockSpriteSpeed();
    
    var self = this;
    this.pathfinder.setCallbackFunction(function (path) {
      self.pathSprite = [];
      path = path || [];
      for(var i = 0, ilen = path.length; i < ilen; i++) {
          self.map.putTile(168, path[i].x, path[i].y, self.layer);
          self.pathSprite[i] = new Phaser.Point(path[i].x * 32, path[i].y * 32);
          self.pathSprite[i].tileX = path[i].x;
          self.pathSprite[i].tileY = path[i].y;
      }
      self.isBlocked = false;
    });
    this.pathfinder.setGrid(this.pathLayer.layer.data, walkables, null);
    this.pathfinder.preparePathCalculation([startTileX,startTileY], [endTileX,endTileY]);
    this.pathfinder.calculatePath();
  }
};
