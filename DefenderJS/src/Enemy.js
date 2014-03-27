BasicGame.Enemy = function(game, x, y, key) {
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
//BasicGame.Enemy.prototype.constructor = Enemy;

BasicGame.Enemy.prototype = Object.create(Phaser.Sprite.prototype);

BasicGame.Enemy.prototype.setTargetTile = function (endTileX, endTileY) {
    this.endTileX = endTileX;
    this.endTileY = endTileY;
};

BasicGame.Enemy.prototype.getCurrentTile = function () {
  var currentTile;
  if (this.pathTiles.length) {
    currentTile = this.pathTiles[0];  
  }else{
    currentTile = { tileX: this.startTileX, tileY: this.startTileY };
  }
  return currentTile;
};

BasicGame.Enemy.prototype.moveToNextTile = function (){
  this.game.physics.moveToObject(this, this.pathTiles[0]);  
};

BasicGame.Enemy.prototype.updateMovement = function (){
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

BasicGame.Enemy.prototype.arrivedHome = function () {
  return !this.pathTiles.length;
};

BasicGame.Enemy.prototype.pathIsBlockedBy = function (tile) {
  var pathBlocked = false;

  for (var i = 0; i < this.pathTiles.length; i++) {
    if (this.pathTiles[i].tileX == tile.tileX && this.pathTiles[i].tileY == tile.tileY) {
      pathBlocked = true;
      break;
    }
  }
  
  return pathBlocked;
}