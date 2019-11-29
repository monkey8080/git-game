// phina.js をグローバル領域に展開
phina.globalize();


var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 960;
var MAX_PER_LINE    = 4;
var BUTTON_WIDTH    = 140;
var BUTTON_HEIGHT   = 80;
var BOARD_PADDING   = 20;

var BOARD_WIDTH     = SCREEN_WIDTH - BOARD_PADDING * 2;
var BUTTON_OFFSET_X = BOARD_PADDING + BUTTON_WIDTH / 2;
var BUTTON_OFFSET_Y = SCREEN_HEIGHT - ( BOARD_PADDING + BUTTON_HEIGHT / 2 );

var CIRCLE_RADIUS   = 32;
var COMMIT_START_X  = SCREEN_WIDTH / 2;
var COMMIT_START_Y  = 60;

// コミットの制御
phina.define('Circle', {
  superClass: 'CircleShape',

  init: function(options) {
    options = (options || {}).$safe({
      fill: 'red',
      stroke: null,
      radius: CIRCLE_RADIUS,
    });
    this.superInit(options);

    this.blendMode = 'lighter';
  },

  // コミットの挙動
  update: function(app) {
    //this.x = 100;
    //this.y = 100;
  }
})

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });

    // 背景色
    this.background = '#222';

    this.currentIndex = "";

    this.commitPosX = COMMIT_START_X;
    this.commitPosY = COMMIT_START_Y;

    this.group = DisplayElement().addChildTo(this);
    
    var gridX = Grid(BOARD_WIDTH, 4);
    var gridY = Grid(BOARD_WIDTH, 2);

    var self = this;

    var buttonTexts = [ "barnch", "checkout", "add", "commit", "merge to", "merge from", "branch -D", "reset --hard" ];

    buttonTexts.each(function(index, i) {
      var xIndex = i % MAX_PER_LINE;
      var yIndex = Math.floor(i / MAX_PER_LINE);
      var p = Text(index).addChildTo(self.group);

      p.x = gridX.span(xIndex) + BUTTON_OFFSET_X;
      p.y = gridY.span(yIndex)+150;

      p.onpointstart = function() {
        self.check(this);
      };

      p.onpointend = function() {
        this.alpha = 1;
        this.currentIndex = "";
      };
    });

    this.onpointstart = function(e) {
      var p = e.pointer;
      var wave = Wave().addChildTo(this);
      wave.x = p.x;
      wave.y = p.y;
    };
  },

  check: function(button) {
      button.alpha = 0.5;
      this.currentIndex = button.index;
      if (button.index == "Commit") {
        var x = this.commitPosX;
        var y = this.commitPosY;
        this.addCircle(x, y);
        this.commitPosY += 90;
      }
  },

  addCircle: function(x, y) {
    var color = "hsla({0}, 75%, 50%, 0.75)".format(Math.randint(0, 360));
    var circle = Circle({
      fill: color,
      x: x,
      y: y,
    }).addChildTo(this);
  },
});

phina.define('Text', {
  superClass: 'Button',

  init: function(index) {
    this.superInit({
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      text: index+'',
      fontSize: 20,
    });

    this.index = index;
  }
});

// メイン処理
phina.main(function() {
  // アプリケーション生成
  var app = GameApp({
    startLabel: 'main', // メインシーンから開始する
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });

  app.enableStats();
  
  // アプリケーション実行
  app.run();
});
