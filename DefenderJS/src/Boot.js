
BasicGame = {
  // Here we've just got some global level vars that persist regardless of State swaps
  score: 0,

  level: 0,

  // Your game can check BasicGame.orientated in internal loops to know if it should pause or not
  orientated: false,

  tileWidth: 32,

  tileHeight: 32
};

BasicGame.Boot = function (game) {
};

BasicGame.Boot.prototype = {
  preload: function () {

  },

  create: function () {
    this.game.input.maxPointers = 2;
    this.game.stage.disableVisibilityChange = false;

    if (this.game.device.desktop) {
      this.game.scaleMode =  Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.minWidth = 480;
      this.game.scale.minHeight = 260;
      this.game.scale.maxWidth = 800;
      this.game.scale.maxHeight = 600;
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.pageAlignVertically = true;
      this.game.scale.setScreenSize(true);
    } else {
      this.game.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.minWidth = 480;
      this.game.scale.minHeight = 260;
      this.game.scale.maxWidth = 800;
      this.game.scale.maxHeight = 600;
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.pageAlignVertically = true;
      this.game.scale.forceOrientation(true, false);
      this.game.scale.hasResized.add(this.gameResized, this);
      this.game.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
      this.game.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
      this.game.scale.setScreenSize(true);
    }

    this.game.state.start('Preloader');
  },

  gameResized: function (width, height) {
    //  This could be handy if you need to do any extra processing if the game resizes.
    //  A resize could happen if for example swapping orientation on a device.
  },

  enterIncorrectOrientation: function () {
    BasicGame.orientated = false;
    document.getElementById('orientation').style.display = 'block';
  },

  leaveIncorrectOrientation: function () {
    BasicGame.orientated = true;
    document.getElementById('orientation').style.display = 'none';
  }
};
