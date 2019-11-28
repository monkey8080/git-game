// phina.js をグローバル領域に展開
phina.globalize();

var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 960;
var MAX_PER_LINE    = 4;
var BUTTON_WIDTH    = 140;
var BUTTON_HEIGHT   = 80;
var BOARD_PADDING  = 20;

var BOARD_WIDTH = SCREEN_WIDTH - BOARD_PADDING * 2;
var BUTTON_OFFSET_X = BOARD_PADDING + BUTTON_WIDTH / 2;
var BUTTON_OFFSET_Y = SCREEN_HEIGHT - ( BOARD_PADDING + BUTTON_HEIGHT / 2 );

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });

    this.currentIndex = "";

    this.group = DisplayElement().addChildTo(this);
    
    var gridX = Grid(BOARD_WIDTH, 4);

    var self = this;

    var buttonTexts = [ "Add", "Commit" , "merge to", "merge from" ];

    buttonTexts.each(function(index, i) {
      var xIndex = i % MAX_PER_LINE;
      var p = Text(index).addChildTo(self.group);

      p.x = gridX.span(xIndex) + BUTTON_OFFSET_X;
      p.y = BUTTON_OFFSET_Y;

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
  }
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
