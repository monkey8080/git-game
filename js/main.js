// phina.js をグローバル領域に展開
phina.globalize();


var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 960;
var MAX_PER_LINE    = 4;
var BUTTON_WIDTH    = 140;
var BUTTON_HEIGHT   = 80;
var BOARD_PADDING   = 20;

var BOARD_WIDTH     = SCREEN_WIDTH - BOARD_PADDING * 2;
var BOARD_HEIGHT    = SCREEN_HEIGHT - BOARD_PADDING * 2;
var BUTTON_OFFSET_X = BOARD_PADDING + BUTTON_WIDTH / 2;
var BUTTON_OFFSET_Y = SCREEN_HEIGHT - ( BOARD_PADDING * 2 + BUTTON_HEIGHT * 3 / 2 );

var FILE_WIDTH      = 64;
var FILE_HEIGHT     = 32;
var FILE_START_X    = SCREEN_WIDTH / 4;
var FILE_START_Y    = 60;
var FILE_SPAN       = 40;

var COMMIT_RADIUS   = 32;
var COMMIT_START_X  = SCREEN_WIDTH / 2;
var COMMIT_START_Y  = 60;
var COMMIT_SPAN     = 90;

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });

    this.background = '#222';
    
    this.group = DisplayElement().addChildTo(this);
    this.line = DisplayElement().addChildTo(this);
    this.file = DisplayElement().addChildTo(this);
    this.tree = DisplayElement().addChildTo(this);
    this.commit = DisplayElement().addChildTo(this);

    this.currentIndex = "";

    this.addStatus = false;

    this.filePosX = FILE_START_X;
    this.filePosY = FILE_START_Y;
    this.fileCount = 0;
    
    this.commitPosX = COMMIT_START_X;
    this.commitPosY = COMMIT_START_Y;
    this.commitCount = 0;
    
    var gridX = Grid(BOARD_WIDTH, 4);
    var gridY = Grid(BOARD_HEIGHT, 10);

    var self = this;

    var buttonTexts = [ "branch", "checkout", "add", "commit", "merge to", "merge from", "branch -D", "clear" ];

    // ボタンの設置
    buttonTexts.each(function(index, i) {
      var xIndex = i % MAX_PER_LINE;
      var yIndex = Math.floor(i / MAX_PER_LINE);
      var p = Text(index).addChildTo(self.group);

      p.x = gridX.span(xIndex) + BUTTON_OFFSET_X;
      p.y = gridY.span(yIndex) + BUTTON_OFFSET_Y;

      p.onpointstart = function() {
        self.check(this);
      };

      p.onpointend = function() {
        this.alpha = 1;
        this.currentIndex = "";
      };
    });

    this.group.children[2].fill = "hsla(200, 80%, 60%, 1.0)";

    this.onpointstart = function(e) {
      var p = e.pointer;
      var wave = Wave().addChildTo(this);
      wave.x = p.x;
      wave.y = p.y;
    };
  },

  // ボタンが押された時の処理
  check: function(button) {
    this.currentIndex = button.index;
    if (button.index == "commit") {
      if (this.addStatus) {
        if (this.commitCount != 8) {
          this.line.children.clear();
          this.file.children.clear();
          this.filePosY = FILE_START_Y + (this.commitCount + 1) * COMMIT_SPAN;
          this.fileCount = 0;
          this.commit.children.last.remove();
          var x = this.commitPosX;
          var y = this.commitPosY;
          this.addCommit(x, y);
          if (this.commitCount != 0) {
            this.addTree(x, y);
          }
          if (this.commitCount != 7 ){
            this.commitPosY += COMMIT_SPAN;
          } else {
            this.group.children[2].fill = "hsla(0, 0%, 60%, 0.5)";
          }
          this.commitCount++;
        }
        this.addStatus = false;
        button.fill = "hsla(0, 0%, 60%, 0.5)";
      }
    } else {
      if (button.index == "add") {
        if (this.commitCount != 8) {
          button.alpha = 0.5;
          this.addStatus = true;
          this.group.children[3].fill = "hsla(200, 80%, 60%, 1.0)";
          this.group.children[7].fill = "hsla(200, 80%, 60%, 1.0)";
          console.log(this.commitCount, this.fileCount);
          if (this.commitCount < 5 && this.fileCount < 8 || this.commitCount >= 5 && this.fileCount < 8 - (this.commitCount % 4) * 2) {
            if (this.fileCount == 0) {
              var x = this.commitPosX;
              var y = this.commitPosY;
              this.addPreCommit(x, y);
            }
            var x = this.filePosX;
            var y = this.filePosY;
            this.addLine(x + FILE_WIDTH / 2, y, this.commitPosX - COMMIT_RADIUS, this.commitPosY);
            this.addFile(x, y);
            this.filePosY += FILE_SPAN;
            this.fileCount++;
          }
        }
      } else if (button.index == "clear") {
        if (this.addStatus || this.commitCount != 0) {
          this.line.children.clear();
          this.file.children.clear();
          this.tree.children.clear();
          this.commit.children.clear();
          this.addStatus = false;
          this.group.children[2].fill = "hsla(200, 80%, 60%, 1.0)";
          this.group.children[3].fill = "hsla(0, 0%, 60%, 0.5)";
          this.group.children[7].fill = "hsla(0, 0%, 60%, 0.5)";
          this.filePosY = FILE_START_Y;
          this.fileCount = 0;
          this.commitPosY = COMMIT_START_Y;
          this.commitCount = 0;
        }
      }
    }
  },

  // ファイルの追加
  addFile: function(x, y) {
    var rect = Rect({
      fill: "hsla(200, 50%, 70%, 1.0)",
      stroke: "hsla(0, 0%, 60%, 1.0)",
      x: x,
      y: y,
    }).addChildTo(this.file);
  },

  // 仮想コミットの追加
  addPreCommit: function(x, y) {
    var circle = Circle({
      fill: "#FFF",
      stroke: "hsla(0, 0%, 60%, 1.0)",
      x: x,
      y: y,
    }).addChildTo(this.commit);
  },

  // 線の追加
  addLine: function(x, y, cx, cy) {
    var line = PathShape({
      stroke: "hsla(0, 0%, 60%, 1.0)",
      strokeWidth: 2,
      paths: [
        Vector2(x, y),
        Vector2(cx, cy),
      ],
    }).addChildTo(this.line);
  },

  // コミットの追加
  addCommit: function(x, y) {
    var circle = Circle({
      fill: "hsla(203, 92%, 75%, 1.0)",
      stroke: "hsla(0, 0%, 60%, 1.0)",
      x: x,
      y: y,
    }).addChildTo(this.commit);
  },

  // ツリーの追加
  addTree: function(x, y) {
    var line = PathShape({
      stroke: "hsla(0, 0%, 60%, 1.0)",
      paths: [
        Vector2(x, y - COMMIT_SPAN),
        Vector2(x, y)
      ],
    }).addChildTo(this.tree);
  },

  // 全削除
  clearAll: function() {
    this.commit.children.clear();
    this.tree.children.clear();
  },
});

// ボタンのデザイン
phina.define('Text', {
  superClass: 'Button',
  init: function(index) {
    this.superInit({
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      text: index+'',
      fontSize: 20,
      fill: "hsla(0, 0%, 60%, 0.5)",
    });

    this.index = index;
  },
});

// ファイルのデザイン
phina.define('Rect', {
  superClass: 'RectangleShape',
  init: function(options) {
    options = (options || {}).$safe({
      width: FILE_WIDTH,
      height: FILE_HEIGHT,
      fill: 'red',
      stroke: null,
    });

    this.superInit(options);
  },
});

// コミットのデザイン
phina.define('Circle', {
  superClass: 'CircleShape',
  init: function(options) {
    options = (options || {}).$safe({
      radius: COMMIT_RADIUS,
      fill: 'red',
      stroke: null,
    });

    this.superInit(options);

    //this.blendMode = 'lighter';
  },
});

// メイン処理
phina.main(function() {
  var app = GameApp({
    startLabel: 'main',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });

  app.enableStats();
  
  app.run();
});
