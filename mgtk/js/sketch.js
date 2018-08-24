var bpm = 124;

var SCircleMorph = function (p) {
  let cirPath = [];
  let triPath = [];
  let spacing = 20;
  let theta = 0;
  let seq = 0;

  polarToCartesian = function (r, angle) {
    return p.createVector(r * p.cos(angle), r * p.sin(angle));
  }

  this.setup = function () {
    // p.createCanvas(800, 800);
    // p.angleMode(p.DEGREES);
    let radius = 200;
    let startA = 0;
    let endA = 120;
    let start = polarToCartesian(radius, p.radians(startA));
    let end = polarToCartesian(radius, p.radians(endA));
    for (let a = startA; a < 360; a += spacing) {
      let cv = polarToCartesian(radius, p.radians(a));
      cirPath.push(cv);
      let amt = (a % 120) / (endA - startA);
      let tv = p5.Vector.lerp(start, end, amt);
      triPath.push(tv);

      if ((a + spacing) % 120 === 0) {
        startA = startA + 120;
        endA = endA + 120;
        start = polarToCartesian(radius, p.radians(startA));
        end = polarToCartesian(radius, p.radians(endA));
      }
    }
  }

  this.draw = function () {
    t = p.frameCount / 30.0;
    seq = Math.floor((p.frameCount % 120) / 30);
    // p.background(255);
    p.push();
    p.scale(p.height / 800.0, p.height / 800.0);
    p.translate(p.width / 2, p.height / 2 + 50);

    let shape = p.createShape();
    shape.beginShape();
    shape.noFill();
    theta = t * p.TWO_PI;
    let amt = 1 - (p.sin(theta) + 1) / 2 / 2;
    for (let i = 0; i < cirPath.length; i++) {
      let th = -p.cos(i / cirPath.length * 6 * p.PI);
      th = p.map(th, -1, 1, 0, 8);
      th = p.lerp(8, th, amt);
      // p.strokeWeight(th);
      let cv = cirPath[i];
      let tv = triPath[i];
      let x = p.lerp(cv.x, tv.x, amt);
      let y = p.lerp(cv.y, tv.y, amt);
      shape.vertex(x, y);
    }
    shape.endShape(p.CLOSE);

    for (let i = -2; i <= 1; i++) {
      for (let j = -5; j <= 4; j++) {
        p.push();
        p.translate(j * 200 * p.sqrt(3), i * 300);
        if ((i + 10) % 2 == 1) {
          p.translate(100 * p.sqrt(3), 0);
        }
        p.rotate(p.radians(30));

        if (seq == 0 && t > 0.5) {
          p.rotate(t * p.TWO_PI * 2 / 3);
          let sc = p.cos(t * p.TWO_PI * 2);
          sc = p.map(sc, -1, 1, 0.75, 1);
          p.scale(sc, sc);
        }
        if (seq == 2 && t > 0.5) {
          p.rotate(-t * p.TWO_PI * 2 / 3);
          let sc = p.cos(t * p.TWO_PI * 2);
          sc = p.map(sc, -1, 1, 0.75, 1);
          p.scale(sc, sc);
        }
        p.shape(shape, 0, 0);
        p.pop();
      }
    }
    p.pop();
  }
};

var SStarField = function (p) {
  let stars = [];
  let speed = 0;
  this.alpha = 1.0;

  function Star() {
    this.x = p.random(-p.width, p.width) / 2;
    this.y = p.random(-p.height, p.height) / 2;
    this.z = p.random(p.width);
    this.pz = this.z;
    if (p.random(1) > 0.) {
      this.tail = 10;
    }
    else {
      this.tail = 1;
    }

    this.update = function (speed) {
      this.z = this.z - speed;
      if (this.z < 0.0) {
        this.z = p.width;
        this.x = p.random(-p.height, p.height) / 2;
        this.y = p.random(-p.height, p.height) / 2;
        this.pz = this.z;
      }
    }

    this.show = function (alpha) {
      let sx = p.map(this.x / this.z, 0, 1, 0, p.width);
      let sy = p.map(this.y / this.z, 0, 1, 0, p.height);

      for (let i = 0; i < this.tail; i++) {
        let pz = this.pz + i * 20;
        let px = p.map(this.x / (this.pz + i * 10), 0, 1, 0, p.width);
        let py = p.map(this.y / (this.pz + i * 10), 0, 1, 0, p.height);

        p.noStroke();
        p.fill(255, p.map(i, 0, 10, 255, 0) * alpha);
        let r = p.map(pz, 0, p.width, 12, 0);
        p.ellipse(px, py, r, r);
      }
      this.pz = this.z;
    }
  }

  this.setup = function () {
    for (let i = 0; i < 50; i++) {
      stars.push(new Star());
    }
  }

  this.draw = function () {
    if (p.frameCount % 30 == 0) {
      if (p.frameCount % 60 > 30) {
        speed = p.random(5, 10);
      }
      else {
        speed = p.random(25, 50);
      }
    }
    // p.translate(p.width / 2, p.height / 2);
    for (let i = 0; i < stars.length; i++) {
      stars[i].update(speed);
      stars[i].show(this.alpha);
    }
  };
};

var SGameOfLife = function (p) {

  function make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(rows);
    }
    return arr;
  }

  let grid;
  let cols;
  let rows;
  let resolution = 8;
  let gap = 16;
  this.alpha = 1.0;

  this.setup = function () {
    cols = p.width / resolution;
    rows = p.height / resolution;
    grid = make2DArray(cols, rows);

    let doRandom = gap == 16;//p.random(1) < 0.2 ? true : false;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        //grid[i][j] = p.floor(p.random(2));
        if (p.random(1) < 0.01) {
          grid[i][j] = 1;
          grid[i][j] = 1;
        }
        else if (i % 2 == 0 && j > 1 && j < rows - 1 && i > 5 && i < cols - 5) {
          grid[i][j] = 1;
        }
        else {
          grid[i][j] = 0;
        }

      }
    }
    // let bloc = [[10, 10], [11, 10], [12, 10], [13, 7], [13, 8], [13, 9], [10, 5], [11, 5], [12, 5], [8, 7], [8, 8], [8, 9]];
    // for (let i in bloc) {
    //   for (let y = 0; y < 1; y++) {
    //     for (let x = 0; x < 1; x++) {
    //       let dx = 10;
    //       let dy = 0;
    //       grid[bloc[i][0] + dx][bloc[i][1] + dy] = 1;
    //       grid[28 - bloc[i][0] + dx][bloc[i][1] + dy] = 1;
    //       grid[bloc[i][0] + dx][22 - bloc[i][1] + dy] = 1;
    //       grid[28 - bloc[i][0] + dx][22 - bloc[i][1] + dy] = 1;
    //     }
    //   }
    // }
  }

  this.draw = function () {
    p.noStroke();
    p.translate(-p.width / 2, -p.height / 2);
    if (p.getCount() % bpm == 0) {
      gap = gap - 1;
      if (gap < 12) gap = 16;
    }

    // if(p.frameCount % 60 < 15) {
    //   p.background(255);
    // }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * resolution;
        let y = j * resolution;
        if (grid[i][j] == 1) {
          p.fill(255, 255 * this.alpha);
          // p.stroke(0);
          p.rect(x, y, resolution - 1, resolution - 1);
        }
      }
    }

    if (p.frameCount % 2 == 0) {
      let next = make2DArray(cols, rows);

      // Compute next based on grid
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let state = grid[i][j];
          // Count live neighbors!
          let sum = 0;
          let neighbors = countNeighbors(grid, i, j);

          if (state == 0 && neighbors == 3) {
            next[i][j] = 1;
          } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
            next[i][j] = 0;
          } else {
            next[i][j] = state;
          }

        }
      }

      grid = next;
    }
  }


  function countNeighbors(grid, x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let col = (x + i + cols) % cols;
        let row = (y + j + rows) % rows;
        sum += grid[col][row];
      }
    }
    sum -= grid[x][y];
    return sum;
  }
};

var frontPg;
var backPg;
var wavePg;

var s = function (p) {
  let name;
  let sCircleMorph = new SCircleMorph(p);
  let sStarField = new SStarField(p);
  let sGameOfLife = new SGameOfLife(p);

  function Agent(t, tween, ii, jj, isTarget) {
    this.t = t;
    this.ii = ii;
    this.jj = jj;
    this.isTarget = isTarget;
    this.tween = tween;
    funcAssets.orderFunc.exec(this);
    let tweenp = 4.0;
    if (this.tween < 0) {
      this.tween = Math.pow(p.map(this.tween, -1, 0, 0, 1), tweenp) * 0.5;
    }
    else {
      if (this.isTarget) {
        tweenp = 1.0;
      }
      this.tween = 1.0 - Math.pow(p.map(this.tween, 0, 1, 1, 0), tweenp) * 0.5;
    }

    // power, [0, 1]
    this.tweenPowZO = function () { return this.tween; }
    // power, 0 -> 1 -> 0
    this.tweenPowReturn = function () {
      if (this.tween < 0.5) {
        return p.map(this.tween, 0, 0.5, 0.0, 1.0);
      }
      else {
        return p.map(this.tween, 0.5, 1.0, 1.0, 0.0);
      }
    }

    this.draw = function () {
      p.push();
      if (this.isTarget) {
        p.stroke(255, 180 * beatFader);
      }
      else {
        p.stroke(255, 255 * beatFader);
      }

      p.translate(this.ii * p.width / 3, 0);
      funcAssets.backgroundFunc.exec(this);

      this.l = p.width / 3.0;
      p.translate(-this.l / 2.0, 0);
      funcAssets.transformFunc.exec(this);
      funcAssets.lineFunc.exec(this);

      p.pop();
    }
  }

  let FuncList = function (everyNSeq, funcs) {
    this.everyNSeq = everyNSeq;
    this.funcs = funcs;
    this.execFunc;
    this.preset = [];
    this.update = function (seq) {
      if (seq % this.everyNSeq == 0 || this.execFunc == undefined) {
        let flist = [];
        for (let i in this.funcs) {
          if (this.preset.length == 0) {
            flist.push(this.funcs[i]);
          }
          else if (this.preset.indexOf(this.funcs[i].name) >= 0) {
            flist.push(this.funcs[i]);
          }
        }
        if (flist.length > 0) {
          this.execFunc = p.random(flist);
        }
        else {
          this.execFunc = this.funcs[0];
        }
        if (this.execFunc.setup != undefined) {
          this.execFunc.setup();
        }
      }
    }
    this.exec = function (a, b, c, d, e, f, g) {
      if (this.execFunc != undefined)
        return this.execFunc.f(a, b, c, d, e, f, g);
    }
  }

  let funcAssets = {};
  funcAssets.globalTransformFunc = new FuncList(1, [
    {
      name: "default",
      f: function (tween) {
      }
    }
    ,
    {
      name: "leftToRight",
      f: function (tween) {
        let tw = tween;
        if (tw < 0) {
          tw = Math.pow(p.map(tw, -1, 0, 0, 1), 4.0) * 0.5;
        }
        else {
          tw = 1.0 - Math.pow(p.map(tw, 0, 1, 1, 0), 4.0) * 0.5;
        }
        p.translate(tw * p.width / 3.0, 0.0);
      }
    }
    ,
    {
      name: "rightToLeft",
      f: function (tween) {
        let tw = tween;
        if (tw < 0) {
          tw = Math.pow(p.map(tw, -1, 0, 0, 1), 4.0) * 0.5;
        }
        else {
          tw = 1.0 - Math.pow(p.map(tw, 0, 1, 1, 0), 4.0) * 0.5;
        }
        p.translate(-tw * p.width / 3.0, 0.0);
      }
    }]);
  funcAssets.backdropFunc = new FuncList(2, [
    {
      name: "default",
      f: function (tween) {
      }
    },
    {
      name: "circleMorph",
      f: function (tween) {
        let alpha = 1.0 - tween;
        p.push();
        p.stroke(255, beatFader * alpha * 255);
        sCircleMorph.draw();
        p.pop();
      }
    },
    {
      name: "starField",
      f: function (tween) {
        let alpha = 1.0 - tween;
        p.push();
        p.translate(tween * p.width / 3.0, 0);
        sStarField.alpha = alpha * beatFader;
        sStarField.draw();
        p.pop();
      }
    },
    {
      name: "gameOfLife",
      f: function (tween) {
        let alpha = 1.0 - tween;
        p.push();
        sGameOfLife.alpha = alpha * beatFader;
        sGameOfLife.draw();
        p.pop();
      },
      setup: function () {
        sGameOfLife.setup();
      }
    }]);
  funcAssets.backgroundFunc = new FuncList(1, [
    {
      name: "default",
      f: function (agent) {
      }
    },
    {
      name: "blink",
      f: function (agent) {
        let alpha = agent.tweenPowReturn();
        p.push();
        p.fill(255, 255 * alpha * beatFader);
        p.noStroke();
        let pw = 1280 * 0.5 / 3.0;
        let n = pw / 10.0;
        p.rect(-pw * 0.5, -p.height * 0.5, pw, p.height);
        p.pop();
      }
    },
    {
      name: "grid",
      f: function (agent) {
        let alpha = agent.tweenPowReturn();
        p.push();
        p.stroke(255, 255 * alpha * beatFader);
        p.strokeWeight(1.0);
        let pw = 1280 * 0.5 / 3.0;
        let n = pw / 10.0;
        for (let j = -6; j <= 6; j++) {
          if (j >= -5 && j <= 5)
            p.line(j * n, -p.height * 0.5, j * n, p.height * 0.5);
          p.line(-pw * 0.5, j * n, pw * 0.5, j * n);
        }
        p.pop();
      }
    }]);
  funcAssets.orderFunc = new FuncList(1, [
    {
      name: "rightToLeft",
      f: function (agent) {
        agent.tween = p.constrain(agent.tween * 1.25 + agent.ii * 0.25, -1, 1);
      }
    },
    {
      name: "leftToRight",
      f: function (agent) {
        agent.tween = p.constrain(agent.tween * 1.25 - agent.ii * 0.25, -1, 1);
      }
    },
    {
      name: "centerToSide",
      f: function (agent) {
        agent.tween = p.constrain(agent.tween * 1.25 - Math.abs(agent.ii) * 0.25, -1, 1);
      }
    },
    {
      name: "default",
      f: function (agent) {
      }
    }]);
  funcAssets.transformFunc = new FuncList(1, [
    {
      name: "default",
      f: function (agent) {
      }
    },
    {
      name: "bounceDown",
      f: function (agent) {
        p.translate(0.0, agent.tweenPowReturn() * 150, 0.0);
      }
    },
    {
      name: "bounceUp",
      f: function (agent) {
        p.translate(0.0, agent.tweenPowReturn() * -150, 0.0);
      }
    },
    {
      name: "bounceLeft",
      f: function (agent) {
        agent.l *= (1.0 - agent.tweenPowReturn());
      }
    },
    {
      name: "bounceRight",
      f: function (agent) {
        p.translate(agent.l * 0.5, 0);
        p.scale(-1, 1);
        p.translate(-agent.l * 0.5, 0);
        agent.l *= (1.0 - agent.tweenPowReturn());
      }
    },
    {
      name: "toDown",
      f: function (agent) {
        if (agent.tween < 0.5) {
          p.translate(0.0, agent.tweenPowReturn() * 150, 0.0);
        }
        else {
          p.translate(0.0, -agent.tweenPowReturn() * 150, 0.0);
        }
      }
    },
    {
      name: "toUp",
      f: function (agent) {
        if (agent.tween < 0.5) {
          p.translate(0.0, -agent.tweenPowReturn() * 150, 0.0);
        }
        else {
          p.translate(0.0, agent.tweenPowReturn() * 150, 0.0);
        }
      }
    },
    {
      name: "rotateY",
      f: function (agent) {
        p.rotateY(agent.tween * Math.PI);
      }
    }]);
  funcAssets.sigFunc = new FuncList(1, [
    {
      name: "default",
      f: function (dx, tw) {
        return 0.0;
      }
    },
    {
      name: "sineT",
      f: function (dx, tw) {
        return Math.sin(dx * 0.1 + tw * 10.0);
      }
    },
    {
      name: "sine",
      f: function (dx, tw) {
        return Math.sin(dx * 0.1);
      }
    },
    {
      name: "random",
      f: function (dx, tw) {
        return p.random(-1, 1);
      }
    }]);
  funcAssets.pointFunc = new FuncList(1, [
    {
      name: "default",
      f: function (x, y, tween) {
        p.ellipse(x, y, 7);
      }
    },
    {
      name: "out",
      f: function (x, y, tween) {
        p.ellipse(x, y, 7);
        p.push();
        let r = 1.0;
        let alpha = 1.0;
        if (tween < 0.5) {
          r *= p.map(tween, 0, 0.5, 1.0, 10.0);
          alpha *= p.map(tween, 0, 0.5, 1.0, 0.0);
          p.noFill();
          p.stroke(255, 255 * alpha * beatFader);
          p.strokeWeight(1.0);
          p.ellipse(x, y, 7 * r);
        }
        p.pop();
      }
    },
    {
      name: "in",
      f: function (x, y, tween) {
        p.ellipse(x, y, 7);
        p.push();
        let r = 1.0;
        let alpha = 1.0;
        if (tween > 0.5) {
          r *= p.map(tween, 0.5, 1.0, 10.0, 1.0);
          alpha *= p.map(tween, 0.5, 1.0, 0.0, 1.0);
          p.noFill();
          p.stroke(255, 255 * alpha * beatFader);
          p.strokeWeight(1.0);
          p.ellipse(x, y, 7 * r);
        }
        p.pop();
      }
    },
    {
      name: "inout",
      f: function (x, y, tween) {
        p.ellipse(x, y, 7);
        p.push();
        let r = 1.0;
        let alpha = 1.0;
        if (tween < 0.5) {
          r *= p.map(tween, 0, 0.5, 1.0, 10.0);
          alpha *= p.map(tween, 0, 0.5, 1.0, 0.0);
        }
        else {
          r *= p.map(tween, 0.5, 1.0, 10.0, 1.0);
          alpha *= p.map(tween, 0.5, 1.0, 0.0, 1.0);
        }
        p.noFill();
        p.stroke(255, 255 * alpha * beatFader);
        p.strokeWeight(1.0);
        p.ellipse(x, y, 7 * r);
        p.pop();
      }
    }]);
  funcAssets.lineFunc = new FuncList(1, [
    {
      name: "default",
      f: function (agent) {
        p.fill(255, 255 * beatFader);
        funcAssets.pointFunc.exec(0, 0, agent.tween);
        p.line(0, 0, agent.l, 0);
        funcAssets.pointFunc.exec(agent.l, 0, agent.tween);
      }
    },
    {
      name: "sig",
      f: function (agent) {
        p.fill(255, 255 * beatFader);
        funcAssets.pointFunc.exec(0, 0, agent.tween);
        let tw = agent.tweenPowReturn();
        p.noFill();
        p.beginShape(p.POINTS);
        for (let dx = 0.0; dx < agent.l; dx += 1.0) {
          let y = Math.sin(dx / agent.l * Math.PI) * funcAssets.sigFunc.exec(dx, tw, agent.l) * tw;
          p.vertex(dx, y * 75);
        }
        p.endShape();
        funcAssets.pointFunc.exec(agent.l, 0, agent.tween);
      }
    },
    {
      name: "sigBar",
      f: function (agent) {
        p.fill(255, 255 * beatFader);
        funcAssets.pointFunc.exec(0, 0, agent.tween);
        let tw = agent.tweenPowReturn();
        p.line(0, 0, agent.l, 0);
        p.push();
        p.strokeWeight(1.0);
        p.noFill();
        p.beginShape(p.LINES);
        for (let dx = 0.0; dx < agent.l; dx += 4.0) {
          let y = Math.sin(dx / agent.l * Math.PI) * funcAssets.sigFunc.exec(dx, tw, agent.l) * tw;
          p.vertex(dx, y * 75);
          p.vertex(dx, 0);
        }
        p.endShape();
        p.pop();
        funcAssets.pointFunc.exec(agent.l, 0, agent.tween);
      }
    },
    {
      name: "rect",
      f: function (agent) {
        p.fill(255, 255 * beatFader);
        funcAssets.pointFunc.exec(0, 0, agent.tween);
        p.push();
        p.noFill();
        p.rotateX(Math.PI * 0.5 + agent.tween * Math.PI * 2.0);
        p.rect(0, -50, agent.l, 100);
        p.pop();
        funcAssets.pointFunc.exec(agent.l, 0, agent.tween);
      }
    }]);
  let functions = ["globalTransformFunc",
    "backdropFunc",
    "backgroundFunc",
    "orderFunc",
    "transformFunc",
    "sigFunc",
    "pointFunc",
    "lineFunc"];
  let bPreset = {
    default: {
      globalTransformFunc: ["default"],
      backdropFunc: ["default"],
      backgroundFunc: ["default"],
      orderFunc: ["default"],
      transformFunc: ["default"],
      sigFunc: ["default"],
      pointFunc: ["default"],
      lineFunc: ["default"]
    },
    toLeft: {
      globalTransformFunc: ["default"],
      backdropFunc: ["default"],
      backgroundFunc: [],
      orderFunc: ["default"],
      transformFunc: ["bounceLeft"],
      sigFunc: [],
      pointFunc: [],
      lineFunc: []
    },
    toRight: {
      globalTransformFunc: ["default"],
      backdropFunc: ["default"],
      backgroundFunc: [],
      orderFunc: ["default"],
      transformFunc: ["bounceRight"],
      sigFunc: [],
      pointFunc: [],
      lineFunc: []
    },
    toUp: {
      globalTransformFunc: ["default"],
      backdropFunc: ["default"],
      backgroundFunc: [],
      orderFunc: ["default"],
      transformFunc: ["bounceUp"],
      sigFunc: [],
      pointFunc: [],
      lineFunc: []
    },
    toDown: {
      globalTransformFunc: ["default"],
      backdropFunc: ["default"],
      backgroundFunc: [],
      orderFunc: ["default"],
      transformFunc: ["bounceDown"],
      sigFunc: [],
      pointFunc: [],
      lineFunc: []
    },
    gameOfLife: {
      globalTransformFunc: ["default"],
      backdropFunc: ["gameOfLife"],
      backgroundFunc: ["default"],
      orderFunc: ["default"],
      transformFunc: ["default"],
      sigFunc: ["default"],
      pointFunc: ["default"],
      lineFunc: ["default"]
    }
  };
  let midiToPreset = [
    [bPreset.default, bPreset.default, bPreset.default, bPreset.default],
    [bPreset.toLeft, bPreset.toRight, bPreset.toLeft, bPreset.toRight],
    [bPreset.toLeft, bPreset.toRight, bPreset.toUp, bPreset.toDown],
    [bPreset.gameOfLife, bPreset.gameOfLife, bPreset.default, bPreset.default]
  ]

  let startFrame;
  let targetII;
  let agents = [];
  let autoPilot = true;
  let doUpdate = true;
  let curCol = [0, 0, 0];
  let lastSeq = -1;
  let beatFader = 1;
  let texShader, levelShader;

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(1280 / 2, 560 / 2);
    p.frameRate(60);
    startFrame = p.frameCount;

    pg = p.createGraphics(p.width, p.height, p.P3D);
    if (frontPg == undefined)
      frontPg = p.createGraphics(p.width, p.height, p.P3D);
    if (backPg == undefined)
      backPg = p.createGraphics(p.width, p.height, p.P3D);
    if (wavePg == undefined)
      wavePg = p.createGraphics(100, 100);
    texShader = p.loadShader(p.sketchPath(name + "/frag.glsl"));
    levelShader = p.loadShader(p.sketchPath(name + "/level.glsl"));

    sCircleMorph.setup();
    sStarField.setup();
    sGameOfLife.setup();

    funcAssets.backdropFunc.update();
  }

  p.getCount = function () { return p.frameCount - startFrame + Math.floor(p.oscFaders[1] * 60) };

  p.keyPressed = function () {
    if (!autoPilot) {
      startFrame = p.frameCount;
      doUpdate = true;
    }
  }

  p.draw = function () {
    // let t = p.getCount() / 60.0 * (bpm / 120.0);
    let tElapsed = p.millis() * 0.001 + p.oscFaders[1];
    let t = tElapsed * (bpm / 120.0);
    let seq = Math.floor(tElapsed * (bpm / 120.0));

    if (p.getCount() % 60 == 0) {
      texShader = p.loadShader(p.sketchPath(name + "/frag.glsl"));
      levelShader = p.loadShader(p.sketchPath(name + "/level.glsl"));
    }

    if ((seq != lastSeq) || (!autoPilot && doUpdate)) {
      doUpdate = false;
      targetII = Math.floor(p.random(-1, 2));
      for (let i in functions) {
        let funcTypeName = functions[i];
        let curPreset = midiToPreset[p.oscButton][seq % 4];
        funcAssets[funcTypeName].preset = curPreset[funcTypeName];
        funcAssets[funcTypeName].update(seq);
      }
    }
    lastSeq = seq;

    let colorSc = [
      [0, 255, 150],
      [0, 155, 50],
      [50, 100, 255],
      [0, 70, 155],
      [230, 230, 100],
      [205, 70, 0],
      [20, 205, 200],
      [135, 30, 0]
    ]

    function drawShader() {
      wavePg.beginDraw();
      wavePg.strokeWeight(2);
      for (let i = 0; i < 100; i++) {
        let y = Math.pow((p.noise(((i * 0.1 - t * (2.0))), t * -0.0)), 4.0) * 250;
        wavePg.stroke(y);
        wavePg.line(i, 0, i, 100);
      }
      wavePg.endDraw();

      let lfo0 = 1.0;//Math.cos(t * Math.PI * 0.25) * 0.5 + 0.5;
      texShader.set("iTime", t);
      texShader.set("lfo0", lfo0);
      let frontColIdx = Math.floor(t % 3) * 2;
      let backColIdx = Math.floor(t % 3) * 2 + 1;
      curCol[0] = p.lerp(curCol[0], colorSc[frontColIdx][0] / 255.0, 0.05);
      curCol[1] = p.lerp(curCol[1], colorSc[frontColIdx][1] / 255.0, 0.05);
      curCol[2] = p.lerp(curCol[2], colorSc[frontColIdx][2] / 255.0, 0.05);
      texShader.set("bgColor0", curCol[0], curCol[1], curCol[2]);
      // rgb = HSVtoRGB((t + 0.5) % 1.0, 1.0, 1.0);
      // texShader.set("bgColor1", rgb.r, rgb.g, rgb.b);
      texShader.set("bgColor1", colorSc[backColIdx][0] / 255.0,
        colorSc[backColIdx][1] / 255.0,
        colorSc[backColIdx][2] / 255.0);
      texShader.set("pgTex", pg);
      texShader.set("waveTex", wavePg);
      texShader.set("backTex", backPg);
      texShader.set("feedbackFader", 1.0 - Math.pow(1.0 - p.oscFaders[4], 4.0));
      texShader.set("phaseFader", p.oscFaders[5]);
      texShader.set("xFader", p.oscFaders[6] * 10.0);
      texShader.set("rAmountFader", p.oscFaders[7] * 1.0);
      frontPg.beginDraw();
      frontPg.filter(texShader);
      frontPg.endDraw();

      p.resetShader();

      let intermediatePg = frontPg;
      frontPg = backPg;
      backPg = intermediatePg;
    }
    drawShader();
    // p.tint(255 * p.oscFaders[0]);
    // p.image(frontPg, 0, 0);
    levelShader.set("pgTexture", frontPg);
    levelShader.set("masterFader", p.oscFaders[0] * 1.0);
    p.filter(levelShader);
    p.syphonServer.sendImage(frontPg);

    function drawBeat() {
      beatFader = p.oscFaders[3];
      p.blendMode(p.BLEND);
      // p.background(0);
      p.stroke(255, 255 * beatFader);
      p.strokeWeight(2);

      p.translate(p.width / 2, p.height / 2);

      let tween = 0.0;
      if (autoPilot) {
        tween = (t * 1.0 % 1.0) * 2.0 - 1.0;
      }
      else {
        tween = p.constrain((t * 1.0) * 2.0 - 1.0, -1.0, 1.0);
      }

      let tween2 = 0.0;
      if (autoPilot) {
        tween2 = (t * 0.5 % 1.0) * 2.0 - 1.0;
      }
      else {
        tween2 = p.constrain((t * 0.5) * 2.0 - 1.0, -1.0, 1.0);
      }
      funcAssets.backdropFunc.exec(tween2);

      funcAssets.globalTransformFunc.exec(tween);

      for (let ii = -2; ii <= 2; ii++) {
        for (let jj = 0; jj < 2; jj++) {
          let agent = new Agent(t, tween, ii, jj, ii == targetII && jj == 1);
          agent.draw();

          if (ii != targetII) break;
        }
      }
    }
    drawBeat();
    p.syphonServer.sendScreen();
  }
};

var pMgtk = new p5(s);