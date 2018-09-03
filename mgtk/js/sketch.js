var windowWidth = 1280 / 2;
var windowHeight = 560 / 2;
var bpm = 124;
var tElapsed = 0;
var lastSeq = -1;
var seq = 0;

var frontPg;
var backPg;
var bgpg;
var fgpg;
var layerPgs;
var oscPgs;

var FuncList = function (everyNSeq, funcs) {
  this.everyNSeq = everyNSeq;
  this.funcs = funcs;
  this.execFunc;
  this.preset = [];
  this.update = function (seq) {
    if (seq % this.everyNSeq == 0 || this.execFunc == undefined) {
      let flist = [];
      for (let i in this.funcs) {
        if (this.preset == undefined || this.preset.length == 0) {
          flist.push(this.funcs[i]);
        }
        else if (this.preset.indexOf(this.funcs[i].name) >= 0) {
          flist.push(this.funcs[i]);
        }
      }
      if (flist.length > 0) {
        let index = Math.floor(Math.random() * flist.length);
        this.execFunc = flist[index];
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

var SLines = function (p) {
  this.alpha = 1.0;
  this.tween = 0.0;

  let beatFader = 1.0; // TODO: update from parent patch
  let targetII;
  let agents = [];

  let pg = fgpg;
  this.pg = fgpg;

  function Agent(ii, jj) {
    this.ii = ii;
    this.jj = jj;
    funcAssets.orderFunc.exec(this);
    this.tweenp = 4.0;

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
    // power of 16, 0 -> 1 -> 0
    this.tweenPowReturn16 = function () {
      if (tween < -0.5) {
        return p.map(tween, -1, -0.5, 0.0, 1.0);
      }
      else if (tween < 0.5) {
        return 1.0;
      }
      else {
        return p.map(tween, 0.5, 1.0, 1.0, 0.0);
      }
    }

    this.draw = function (t, tween) {
      this.t = t;
      this.tween = tween;
      let isTarget = ii == targetII && jj == 1;
      this.tweenp = 4.0;

      if (this.tween < 0) {
        this.tween = Math.pow(p.map(this.tween, -1, 0, 0, 1), this.tweenp) * 0.5;
      }
      else {
        if (isTarget) {
          this.tweenp = 1.0;
        }
        this.tween = 1.0 - Math.pow(p.map(this.tween, 0, 1, 1, 0), this.tweenp) * 0.5;
      }

      if (isTarget == false && jj == 1) return;
      pg.pushMatrix();
      pg.pushStyle();
      if (isTarget) {
        pg.stroke(255, 180 * beatFader);
      }
      else {
        pg.stroke(255, 255 * beatFader);
      }

      this.l = windowWidth / 3.0;

      pg.translate(this.ii * windowWidth / 3, 0);
      funcAssets.backgroundFunc.exec(this);

      pg.translate(-this.l / 2.0, 0);
      funcAssets.transformFunc.exec(this);
      funcAssets.lineFunc.exec(this);

      pg.popStyle();
      pg.popMatrix();
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
        pg.translate(tw * windowWidth / 3.0, 0.0);
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
        pg.translate(-tw * windowWidth / 3.0, 0.0);
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
        pg.pushMatrix();
        pg.pushStyle();
        pg.fill(255, 255 * alpha * beatFader);
        pg.noStroke();
        let pw = 1280 * 0.5 / 3.0;
        let n = pw / 10.0;
        pg.rect(-pw * 0.5, -windowHeight * 0.5, pw, windowHeight);
        pg.popStyle();
        pg.popMatrix();
      }
    },
    {
      name: "grid",
      f: function (agent) {
        let alpha = agent.tweenPowReturn();
        pg.pushMatrix();
        pg.pushStyle();
        pg.stroke(255, 255 * alpha * beatFader);
        pg.strokeWeight(1.0);
        let pw = 1280 * 0.5 / 3.0;
        let n = pw / 10.0;
        for (let j = -6; j <= 6; j++) {
          if (j >= -5 && j <= 5)
            pg.line(j * n, -windowHeight * 0.5, j * n, windowHeight * 0.5);
          pg.line(-pw * 0.5, j * n, pw * 0.5, j * n);
        }
        pg.popStyle();
        pg.popMatrix();
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
        pg.translate(0.0, agent.tweenPowReturn() * 150, 0.0);
      }
    },
    {
      name: "bounceUp",
      f: function (agent) {
        pg.translate(0.0, agent.tweenPowReturn() * -150, 0.0);
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
        pg.translate(agent.l * 0.5, 0);
        pg.scale(-1, 1);
        pg.translate(-agent.l * 0.5, 0);
        agent.l *= (1.0 - agent.tweenPowReturn());
      }
    },
    {
      name: "toDown",
      f: function (agent) {
        if (agent.tween < 0.5) {
          pg.translate(0.0, agent.tweenPowReturn() * 150, 0.0);
        }
        else {
          pg.translate(0.0, -agent.tweenPowReturn() * 150, 0.0);
        }
      }
    },
    {
      name: "toUp",
      f: function (agent) {
        if (agent.tween < 0.5) {
          pg.translate(0.0, -agent.tweenPowReturn() * 150, 0.0);
        }
        else {
          pg.translate(0.0, agent.tweenPowReturn() * 150, 0.0);
        }
      }
    },
    {
      name: "rotateY",
      f: function (agent) {
        pg.rotateY(agent.tween * Math.PI);
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
        pg.ellipse(x, y, 7, 7);
      }
    },
    {
      name: "out",
      f: function (x, y, tween) {
        pg.ellipse(x, y, 7, 7);
        pg.pushMatrix();
        pg.pushStyle();
        let r = 1.0;
        let alpha = 1.0;
        if (tween < 0.5) {
          r *= p.map(tween, 0, 0.5, 1.0, 10.0);
          alpha *= p.map(tween, 0, 0.5, 1.0, 0.0);
          pg.noFill();
          pg.stroke(255, 255 * alpha * beatFader);
          pg.strokeWeight(1.0);
          pg.ellipse(x, y, 7 * r, 7 * r);
        }
        pg.popStyle();
        pg.popMatrix();
      }
    },
    {
      name: "in",
      f: function (x, y, tween) {
        pg.ellipse(x, y, 7, 7);
        pg.pushMatrix();
        pg.pushStyle();
        let r = 1.0;
        let alpha = 1.0;
        if (tween > 0.5) {
          r *= p.map(tween, 0.5, 1.0, 10.0, 1.0);
          alpha *= p.map(tween, 0.5, 1.0, 0.0, 1.0);
          pg.noFill();
          pg.stroke(255, 255 * alpha * beatFader);
          pg.strokeWeight(1.0);
          pg.ellipse(x, y, 7 * r, 7 * r);
        }
        pg.popStyle();
        pg.popMatrix();
      }
    },
    {
      name: "inout",
      f: function (x, y, tween) {
        pg.ellipse(x, y, 7, 7);
        pg.pushMatrix();
        pg.pushStyle();
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
        pg.noFill();
        pg.stroke(255, 255 * alpha * beatFader);
        pg.strokeWeight(1.0);
        pg.ellipse(x, y, 7 * r, 7 * r);
        pg.popStyle();
        pg.popMatrix();
      }
    }]);
  funcAssets.lineFunc = new FuncList(1, [
    {
      name: "default",
      f: function (agent) {
        pg.fill(255, 255 * beatFader);
        funcAssets.pointFunc.exec(0, 0, agent.tween);
        pg.line(0, 0, agent.l, 0);
        funcAssets.pointFunc.exec(agent.l, 0, agent.tween);
      }
    },
    {
      name: "sig",
      f: function (agent) {
        pg.fill(255, 255 * beatFader);
        funcAssets.pointFunc.exec(0, 0, agent.tween);
        let tw = agent.tweenPowReturn();
        pg.noFill();
        pg.beginShape(p.POINTS);
        for (let dx = 0.0; dx < agent.l; dx += 1.0) {
          let y = Math.sin(dx / agent.l * Math.PI) * funcAssets.sigFunc.exec(dx, tw, agent.l) * tw;
          pg.vertex(dx, y * 75);
        }
        pg.endShape();
        funcAssets.pointFunc.exec(agent.l, 0, agent.tween);
      }
    },
    {
      name: "sigBar",
      f: function (agent) {
        pg.fill(255, 255 * beatFader);
        funcAssets.pointFunc.exec(0, 0, agent.tween);
        let tw = agent.tweenPowReturn();
        pg.line(0, 0, agent.l, 0);
        pg.pushMatrix();
        pg.pushStyle();
        pg.strokeWeight(1.0);
        pg.noFill();
        pg.beginShape(p.LINES);
        for (let dx = 0.0; dx < agent.l; dx += 4.0) {
          let y = Math.sin(dx / agent.l * Math.PI) * funcAssets.sigFunc.exec(dx, tw, agent.l) * tw;
          pg.vertex(dx, y * 75);
          pg.vertex(dx, 0);
        }
        pg.endShape();
        pg.popStyle();
        pg.popMatrix();
        funcAssets.pointFunc.exec(agent.l, 0, agent.tween);
      }
    },
    {
      name: "rect",
      f: function (agent) {
        pg.fill(255, 255 * beatFader);
        funcAssets.pointFunc.exec(0, 0, agent.tween);
        pg.pushMatrix();
        pg.pushStyle();
        pg.noFill();
        pg.rotateX(Math.PI * 0.5 + agent.tween * Math.PI * 2.0);
        pg.rect(0, -50, agent.l, 100);
        pg.popStyle();
        pg.popMatrix();
        funcAssets.pointFunc.exec(agent.l, 0, agent.tween);
      }
    }]);
  let functions = ["globalTransformFunc",
    "backgroundFunc",
    "orderFunc",
    "transformFunc",
    "sigFunc",
    "pointFunc",
    "lineFunc"];
  let bPreset = {
    default: {
      globalTransformFunc: ["default"],
      backgroundFunc: ["default"],
      orderFunc: ["default"],
      transformFunc: ["default"],
      sigFunc: ["default"],
      pointFunc: ["default"],
      lineFunc: ["default"]
    },
    random: {
    },
    toLeft: {
      parents: ["default"],
      transformFunc: ["bounceLeft"],
    },
    toRight: {
      parents: ["default"],
      transformFunc: ["bounceRight"],
    },
    toUp: {
      parents: ["default"],
      transformFunc: ["bounceUp"],
    },
    toDown: {
      parents: ["default"],
      transformFunc: ["bounceDown"],
    },
    flat: {
      lineFunc: ["default", "rect"]
    },
    toUpFlat: {
      parents: ["toUp", "flat"],
    },
    toDownFlat: {
      parents: ["toDown", "flat"],
    },
    sig: {
      parents: ["default"],
      sigFunc: ["sineT", "sine", "random"],
      pointFunc: ["inout"],
      lineFunc: ["sig", "sigBar"]
    },
    toLeftSig: {
      parents: ["toLeft", "sig"],
      backgroundFunc: ["default"],
    },
    justPoint: {
      parents: ["default"],
      pointFunc: ["inout"]
    }
  };
  let midiToPreset = [
    { preset: [bPreset.default, bPreset.default, bPreset.default, bPreset.default] },
    { preset: [bPreset.toUpFlat, bPreset.toDownFlat, bPreset.toUpFlat, bPreset.toDownFlat] },
    { preset: [bPreset.sig, bPreset.toDownFlat, bPreset.toUpFlat, bPreset.toDownFlat] },
    { preset: [bPreset.toLeftSig, bPreset.justPoint, bPreset.justPoint, bPreset.justPoint] },
    { preset: [bPreset.random, bPreset.random, bPreset.random, bPreset.random] },
    { preset: [bPreset.sig, bPreset.toDownFlat, bPreset.toUpFlat, bPreset.toDownFlat] },
    { preset: [bPreset.justPoint, bPreset.justPoint, bPreset.justPoint, bPreset.justPoint] },
    { preset: [bPreset.sig, bPreset.toDownFlat, bPreset.toUpFlat, bPreset.toDownFlat] },
    { preset: [bPreset.sig, bPreset.justPoint, bPreset.justPoint, bPreset.justPoint] },
    { preset: [bPreset.justPoint, bPreset.justPoint, bPreset.justPoint, bPreset.justPoint] },
    { preset: [bPreset.justPoint, bPreset.justPoint, bPreset.justPoint, bPreset.justPoint] },
  ]

  this.setup = function () {
    agents = [];
    for (let ii = -2; ii <= 2; ii++) {
      for (let jj = 0; jj < 2; jj++) {
        let agent = new Agent(ii, jj);
        agents.push(agent);
      }
    }
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    pg.beginDraw();
    let t = tElapsed * (bpm / 120.0);
    if (seq != lastSeq) {
      targetII = Math.floor(p.random(-1, 2));
      let newPreset = {};
      let depthCount = 4;
      function unwrapPreset(newp, libp) {
        if (libp.parents && libp.parents.length > 0 && depthCount >= 0) {
          for (let i = 0; i < libp.parents.length; i++) {
            unwrapPreset(newp, bPreset[libp.parents[i]]);
          }
        }
        for (let key in libp) {
          if (key != "parent") {
            newp[key] = libp[key];
          }
        }
      }
      let presetIndex = p.oscPreset;
      if (presetIndex >= midiToPreset.length) presetIndex = 0;
      unwrapPreset(newPreset, midiToPreset[presetIndex].preset[seq % 4]);
      for (let i in functions) {
        let funcTypeName = functions[i];
        funcAssets[funcTypeName].preset = newPreset[funcTypeName];
        funcAssets[funcTypeName].update(seq);
      }
    }

    pg.pushMatrix();
    pg.pushStyle();
    pg.translate(windowWidth / 2, windowHeight / 2);
    function drawBeat() {
      // beatFader = p.oscFaders[3];
      pg.stroke(255, 255 * beatFader);
      pg.strokeWeight(2);

      let tween = 0.0;
      tween = (t * 1.0 % 1.0) * 2.0 - 1.0;

      funcAssets.globalTransformFunc.exec(tween);

      for (let i in agents) {
        agents[i].draw(t, tween);
      }
    }
    drawBeat();
    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
  };
};

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
  let speed = 0;
  this.alpha = 1.0;

  function Star() {
    this.x = p.random(-windowWidth, windowWidth) / 2;
    this.y = p.random(-windowWidth, windowWidth) / 2;
    this.z = p.random(windowWidth);
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
        this.z = windowWidth;
        this.x = p.random(-windowWidth, windowWidth) / 2;
        this.y = p.random(-windowWidth, windowWidth) / 2;
        this.pz = this.z;
      }
    }

    this.show = function (pg, alpha) {
      let sx = p.map(this.x / this.z, 0, 1, 0, windowWidth);
      let sy = p.map(this.y / this.z, 0, 1, 0, windowWidth);

      for (let i = 0; i < this.tail; i++) {
        let pz = this.pz + i * 20;
        let px = p.map(this.x / (this.pz + i * 10), 0, 1, 0, windowWidth);
        let py = p.map(this.y / (this.pz + i * 10), 0, 1, 0, windowWidth);

        pg.noStroke();
        pg.fill(255, p.map(i, 0, 10, 255, 0) * alpha);
        let r = p.map(pz, 0, windowWidth, 12, 0);
        pg.ellipse(px, py, r, r);
      }
      this.pz = this.z;
    }
  }

  let stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;
    pg.beginDraw();
    pg.clear();
    pg.pushMatrix();
    pg.translate(this.tween * windowWidth / 3.0, 0);
    pg.translate(windowWidth * 0.5, windowHeight * 0.5);
    speed = 20;
    let alpha = Math.pow(1 - Math.abs(this.tween), 2.0);
    // p.translate(p.width / 2, p.height / 2);
    for (let i = 0; i < stars.length; i++) {
      stars[i].update(speed);
      stars[i].show(pg, alpha);
    }
    pg.popMatrix();
    pg.endDraw();
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

var SRibbons = function (p) {
  let pg = fgpg;
  this.pg = fgpg;
  let targetRotX = 0;
  let targetRotY = 0;
  let tSpeed = 0;
  let rotPower = 0;
  let isSolid = true;
  let amplitude = 0.0;

  this.setup = function () {
    targetRotX = p.random(-Math.PI, Math.PI) * 2.0;
    targetRotY = p.random(-Math.PI, Math.PI) * 2.0;
    tSpeed = p.random(2.0, 8.0);
    rotPower = Math.floor(p.random(2.0, 9.0));
    isSolid = p.random(1.0) > 0.5 ? true : false;
    amplitude = Math.pow(p.random(0.5, 1.0), 2.0) * 100;
  }
  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    pg.beginDraw();
    pg.clear();
    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2);
    let tw = ((tElapsed * (bpm / 120.0)) % 4.0) * 0.5 - 1.0;
    let l = p.width * 2.0;
    if (isSolid) {
      pg.lights();
      pg.noStroke();
      pg.fill(255, 255);// * this.alpha);
    }
    else {
      pg.noFill();
      pg.stroke(255, 255);// * this.alpha);
    }
    let rotw = 1.0 - Math.pow(tw * 0.5 + 0.5, rotPower);
    pg.rotateX(rotw * targetRotX + Math.PI * 0.5);
    pg.rotateY(rotw * targetRotY);
    for (let y = -200; y < 200; y += 50) {
      pg.beginShape(p.TRIANGLE_STRIP);
      let tSpeedMod = tSpeed;
      if (y == 0) tSpeedMod *= 3;
      for (let dx = -l; dx < l; dx += 5.0) {
        let z = Math.sin(dx * 0.01 + y / 100.0 * Math.PI + tw * tSpeedMod);
        pg.vertex(dx, y, z * amplitude);
        pg.vertex(dx, y + 10, z * amplitude);
      }
      pg.endShape();
    }
    pg.popMatrix();
    pg.endDraw();
  }
}

var SBeesAndBombs = function (p) {
  let angle = 0;
  let w = 40;
  let ma;
  let maxD;
  this.tween = 0;
  this.alpha = 0;

  this.setup = function () {
    ma = p.atan(p.cos(p.QUARTER_PI));
    maxD = p.dist(0, 0, 300, 300);
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    pg.beginDraw();
    pg.clear();
    pg.noStroke();
    pg.fill(255);
    // p.ortho(-400, 400, 400, -400, 0, 1000);

    pg.translate(p.width / 2, p.height / 2, -650);
    pg.directionalLight(90, 95, 226, -1, 0, 0);
    pg.pointLight(200, 95, 96, 300, -100, 1000);
    // pg.pointLight(200, 200, 200, 0, -1000, 0);
    pg.rotateX(-p.QUARTER_PI * 0.8);
    pg.rotateY(-p.QUARTER_PI * tElapsed)

    angle = p.millis() * 0.001 * p.TWO_PI;
    let decay = p.sin(p.millis() * 0.0005);
    decay = p.constrain(p.map(decay, -1, 1, -0.02, 1), 0, 1);
    let winh = 560;
    for (let z = 0; z < winh; z += w) {
      for (let x = 0; x < winh; x += w) {
        pg.pushMatrix();
        let d = p.dist(x, z, winh / 2, winh / 2);
        let offset = p.map(d, 0, maxD, -p.PI, p.PI);
        let a = angle + -offset;
        let h = p.floor(p.map(p.sin(a), -1, 1, 0.5, 1) * winh);
        h = p.map(decay, 0, 1, winh, h);
        pg.translate(x - winh / 2, 0, z - winh / 2);
        // p.normalMaterial();
        pg.box(w, h, w);
        //rect(x - width / 2 + w / 2, 0, w - 2, h);
        pg.popMatrix();
      }
    }
    pg.endDraw();
  }
};

var SDots = function (p) {
  this.tween = 0;
  this.alpha = 0;
  let points = [];
  let lastMiniSeq = -1;
  let mc = 20.0;

  function newPoint() {
    let x = Math.floor(p.random(0, windowWidth) / mc) * mc;
    let y = p.random(1.0) > 0.5 ? -10 : windowHeight + 10;
    let targetX = x;
    let targetY = Math.floor(p.random(windowHeight * 0.25, windowHeight) / mc) * mc;
    return { x: x, y: y, targetX: targetX, targetY: targetY, decay: 0.5 };
  }
  for (let i = 0; i < 8; i++) {
    points.push(newPoint());
  }
  this.setup = function () {
  }

  this.draw = function () {
    let miniSeq = Math.floor(tElapsed * (bpm / 60.0));
    let fract = tElapsed * (bpm / 60.0) - miniSeq;

    if (miniSeq != lastMiniSeq) {
      points.splice(0, 1);
      points.push(newPoint());
    }
    lastMiniSeq = miniSeq;

    fgpg.beginDraw();
    fgpg.clear();
    fgpg.noStroke();
    fgpg.fill(255);
    for (let i in points) {
      let pt = points[i];
      // pt.y = p.lerp(pt.y, pt.targetY, 0.1);
      pt.y = pt.targetY * (1.0 - Math.pow((Math.sin(fract * Math.PI * 2.0) * pt.decay + 0.5), 2.0));
      pt.decay *= 0.925;
      let x = pt.x;
      let y = pt.y;
      // fgpg.ellipse(x, y, 20, 20);
    }
    fgpg.endDraw();

    bgpg.beginDraw();
    bgpg.clear();
    bgpg.noStroke();
    bgpg.fill(255);
    for (let i in points) {
      let x = points[i].x;
      let y = points[i].y;
      bgpg.ellipse(x, y, 20, 20);
    }
    bgpg.endDraw();
  }
};

var SFace = function (p) {
  this.alpha = 1.0;
  this.tween = 0.0;
  let faces = [0, 17, 18, 20, 23, 24, 19, 20, 24, 25, 26, 16, 26, 45, 16, 46, 14, 15, 45, 46, 15, 16, 45, 15, 35, 13, 14, 46, 35, 14, 54, 12, 13, 35, 54, 13, 35, 53, 54, 47, 35, 46, 25, 45, 26, 54, 11, 12, 44, 45, 25, 24, 44, 25, 29, 35, 47, 55, 10, 11, 54, 55, 11, 44, 46, 45, 20, 21, 23, 42, 29, 47, 43, 44, 24, 23, 43, 24, 44, 47, 46, 43, 47, 44, 29, 30, 35, 21, 22, 23, 56, 9, 10, 55, 56, 10, 35, 52, 53, 28, 29, 42, 64, 55, 54, 23, 22, 43, 43, 42, 47, 53, 64, 54, 22, 42, 43, 34, 52, 35, 56, 8, 9, 22, 27, 42, 65, 55, 64, 53, 63, 64, 27, 28, 42, 57, 8, 56, 30, 34, 35, 65, 56, 55, 52, 63, 53, 33, 52, 34, 65, 66, 56, 66, 57, 56, 51, 63, 52, 33, 51, 52, 30, 33, 34, 21, 27, 22, 58, 7, 57, 57, 7, 8, 50, 51, 33, 51, 62, 63, 30, 32, 33, 58, 57, 66, 67, 58, 66, 61, 62, 51, 31, 30, 29, 32, 50, 33, 39, 29, 28, 39, 28, 27, 21, 39, 27, 31, 32, 30, 40, 31, 29, 39, 40, 29, 50, 61, 51, 6, 7, 58, 59, 6, 58, 59, 58, 67, 49, 61, 50, 31, 49, 50, 31, 50, 32, 38, 39, 21, 60, 59, 67, 40, 41, 31, 41, 2, 31, 20, 38, 21, 2, 3, 31, 48, 49, 31, 3, 48, 31, 48, 60, 49, 3, 4, 48, 48, 5, 59, 5, 6, 59, 60, 48, 59, 19, 38, 20, 38, 40, 39, 19, 37, 38, 4, 5, 48, 1, 2, 41, 37, 41, 40, 37, 40, 38, 36, 1, 41, 18, 37, 19, 36, 41, 37, 18, 36, 37, 17, 0, 36, 0, 1, 36, 18, 17, 36, 49, 60, 61];
  this.setup = function () {
  }

  this.draw = function () {
    if (p.cam.available() == true) {
      p.cam.read();
    }

    bgpg.beginDraw();
    bgpg.clear();
    bgpg.image(p.cam, 0, 0, 1280 / 2, 720 / 2);

    bgpg.noStroke();
    bgpg.fill(255, 0, 0);
    for (let i = 0; i < p.posePoints.length; i++) {
      // let x = p.facePoints[i][0] * 0.5;
      // let y = p.facePoints[i][1] * 0.5;
      let x = p.map(p.posePoints[i][0], 0, 640, 80, 640 - 80);
      let y = p.map(p.posePoints[i][1], 0, 480, 0, 360);
      bgpg.ellipse(x, y, 14, 14)
    }
    bgpg.noFill();
    bgpg.stroke(255);
    bgpg.beginShape(p.TRIANGLES);
    for (let i = 0; i < faces.length; i++) {
      let idx = faces[i];
      let x = p.facePoints[idx][0] * 0.5;
      let y = p.facePoints[idx][1] * 0.5;
      bgpg.vertex(x, y);
    }
    bgpg.endShape();
    bgpg.endDraw();
  };
};

var SBrown = function (p) {
  let shape = p.loadShape("data/models/line_brown.obj");

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    pg.beginDraw();
    pg.clear();
    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2);
    pg.directionalLight(255, 255, 255, 1.5, 0.5, 1);
    pg.directionalLight(255, 255, 255, -1.5, -0.5, 1);
    for (let i = -1; i <= 1; i++) {
      pg.pushMatrix();
      pg.translate(windowWidth / 3 * i, 0);
      pg.scale(5, -5, 5);
      if (this.tween < 0) {
        pg.rotateZ(-Math.pow(this.tween, 4.0) * Math.PI);
      }
      else {
        pg.rotateZ(Math.pow(this.tween, 4.0) * Math.PI);
      }
      pg.shape(shape, 0, 0);
      pg.popMatrix();
    }
    pg.popMatrix();
    pg.endDraw();
  }
}

var SLangtonAnt = function (p) {
  let pg;
  let grid;
  let x;
  let y;
  let dir;

  let ANTUP = 0;
  let ANTRIGHT = 1;
  let ANTDOWN = 2;
  let ANTLEFT = 3;

  let m = 8;
  let toSetup = true;

  x = windowWidth / m / 2;
  y = windowHeight / m / 2;
  dir = ANTUP;
  this.setup = function () {
    toSetup = true;
  }

  function turnRight() {
    dir++;
    if (dir > ANTLEFT) {
      dir = ANTUP;
    }
  }

  function turnLeft() {
    dir--;
    if (dir < ANTUP) {
      dir = ANTLEFT;
    }
  }

  function moveForward() {
    if (dir == ANTUP) {
      y--;
    } else if (dir == ANTRIGHT) {
      x++;
    } else if (dir == ANTDOWN) {
      y++;
    } else if (dir == ANTLEFT) {
      x--;
    }

    if (x > windowWidth / m - 1) {
      x = 0;
    } else if (x < 0) {
      x = windowWidth / m - 1;
    }
    if (y > windowHeight / m - 1) {
      y = 0;
    } else if (y < 0) {
      y = windowHeight / m - 1;
    }
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    if (toSetup) {
      pg = this.pg;
      grid = make2DArray(windowWidth / m, windowHeight / m);
      pg.beginDraw();
      pg.clear();
      pg.endDraw();
      toSetup = false;
    }

    pg.beginDraw();
    pg.pushMatrix();
    pg.pushStyle();
    pg.strokeWeight(m);
    pg.fill(0);

    for (let n = 0; n < 40; n++) {
      let state = grid[x][y];
      if (state == 0) {
        turnRight();
        grid[x][y] = 1;
      } else if (state == 1) {
        turnLeft();
        grid[x][y] = 0;
      }

      if (grid[x][y] == 1) {
        pg.stroke(0);
        pg.point(x * m, y * m);
      }
      else {
        pg.stroke(255);
        pg.point(x * m, y * m);
      }
      moveForward();
    }
    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
  }

  function make2DArray(cols, rows, mode) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(rows);
      for (let j = 0; j < arr[i].length; j++) {
        arr[i][j] = 0;
      }
    }
    return arr;
  }
};

var SDoublePendulum = function (p) {
  function DP() {
    this.r1 = 200;
    this.r2 = 400;
    this.m1 = 40;
    this.m2 = 5;
    this.a1 = 0;
    this.a2 = 0;
    this.a1_v = 0;
    this.a2_v = 0;
    this.g = 1;

    this.a1 = Math.PI / 3;
    this.a2 = Math.PI / 3;
    this.cx = windowWidth / 2;
    this.cy = 50;

    this.px = [];
    this.py = [];
  }

  DP.prototype.update = function () {
    let num1 = -this.g * (2 * this.m1 + this.m2) * Math.sin(this.a1);
    let num2 = -this.m2 * this.g * Math.sin(this.a1 - 2 * this.a2);
    let num3 = -2 * Math.sin(this.a1 - this.a2) * this.m2;
    let num4 = this.a2_v * this.a2_v * this.r2 + this.a1_v * this.a1_v * this.r1 * Math.cos(this.a1 - this.a2);
    let den = this.r1 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.a1 - 2 * this.a2));
    let a1_a = (num1 + num2 + num3 * num4) / den;

    num1 = 2 * Math.sin(this.a1 - this.a2);
    num2 = (this.a1_v * this.a1_v * this.r1 * (this.m1 + this.m2));
    num3 = this.g * (this.m1 + this.m2) * Math.cos(this.a1);
    num4 = this.a2_v * this.a2_v * this.r2 * this.m2 * Math.cos(this.a1 - this.a2);
    den = this.r2 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.a1 - 2 * this.a2));
    let a2_a = (num1 * (num2 + num3 + num4)) / den;

    pg.pushMatrix();
    pg.pushStyle();
    pg.translate(this.cx, this.cy);
    pg.stroke(255, 200);
    pg.strokeWeight(2);

    let x1 = this.r1 * Math.sin(this.a1);
    let y1 = this.r1 * Math.cos(this.a1);

    let x2 = x1 + this.r2 * Math.sin(this.a2);
    let y2 = y1 + this.r2 * Math.cos(this.a2);


    pg.line(0, 0, x1, y1);
    pg.line(x1, y1, x2, y2);
    pg.noStroke();
    pg.fill(255, 150);
    pg.ellipse(x2, y2, 15, 15);
    this.px.push(x2);
    this.py.push(y2);
    if (this.px.length > 10) this.px.shift();
    if (this.py.length > 10) this.py.shift();

    for (let i in this.px) {
      pg.ellipse(this.px[i], this.py[i], 15, 15);
    }
    pg.popStyle();
    pg.popMatrix();

    this.a1_v += a1_a;
    this.a2_v += a2_a;
    this.a1 += this.a1_v;
    this.a2 += this.a2_v;
  }

  let dp;
  this.setup = function () {
    dp = [];
    for (let i = 0; i < 3; i++) {
      let d = new DP();
      d.r1 = p.random(100, 102);
      d.r2 = 200 - d.r1;
      dp.push(d);
    }
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    pg.beginDraw();
    pg.pushMatrix();
    pg.pushStyle();

    for (let i = 0; i < dp.length; i++) {
      let d = dp[i];
      pg.pushMatrix();
      pg.translate((i - 1) * windowWidth / 3.0, 0);
      d.update();
      pg.popMatrix();
    }
    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
  }

};

var SShader = function (p) {
  let pg;
  let shader;
  shader = p.loadShader(p.sketchPath("shaders/hydra0.glsl"));

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    if(p.frameCount % 60 == 0) {
      shader = p.loadShader(p.sketchPath("shaders/hydra0.glsl"));
    }
    pg.beginDraw();
    pg.pushMatrix();
    pg.pushStyle();

    shader.set("time", tElapsed);
    pg.filter(shader);

    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
  }
};

var SWarehouse = function (p) {
  let pg;

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    pg.beginDraw();
    pg.pushMatrix();
    pg.pushStyle();

    pg.translate(windowWidth / 2, windowHeight / 2);
    pg.translate(0, 50, 400 * this.tween + 200)
    pg.scale(-50, -50, -50);
    pg.shape(p.warehouseShape);

    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
  }
};

var s = function (p) {
  let name;
  let sLines = new SLines(p);
  let sCircleMorph = new SCircleMorph(p);
  let sStarField = new SStarField(p);
  let sGameOfLife = new SGameOfLife(p);
  let sRibbons = new SRibbons(p);
  let sBeesAndBombs = new SBeesAndBombs(p);
  let sDots = new SDots(p);
  let sFace = new SFace(p);
  let sBrown = new SBrown(p);
  let sLangtonAnt = new SLangtonAnt(p);
  let sDoublePendulum = new SDoublePendulum(p);
  let sShader = new SShader(p);
  let sWarehouse = new SWarehouse(p);

  let startFrame;
  let doUpdate = true;
  let curCol = [0, 0, 0];
  let beatFader = 1;
  let texShader, levelShader;

  let funcAssets = [];
  for (let i = 0; i < 16; i++) {
    funcAssets.push(new FuncList(4, [
      {
        name: "default",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
        }
      },
      {
        name: "lines",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          sLines.pg = pg;
          sLines.draw();
        },
        setup: function () {
          sLines.setup();
        }
      },
      {
        name: "circleMorph",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          p.push();
          p.stroke(255, beatFader * alpha * 255);
          sCircleMorph.draw();
          p.pop();
        }
      },
      {
        name: "starField",
        f: function (tween, pg) {
          sStarField.pg = pg;
          sStarField.tween = tween;
          let alpha = 1.0 - tween;
          sStarField.alpha = alpha * beatFader;
          sStarField.draw();
        }
      },
      {
        name: "gameOfLife",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          p.push();
          sGameOfLife.alpha = alpha * beatFader;
          sGameOfLife.draw();
          p.pop();
        },
        setup: function () {
          sGameOfLife.setup();
        }
      },
      {
        name: "ribbons",
        f: function (tween, pg) {
          let alpha = 1.0 - tween;
          sRibbons.pg = pg;
          sRibbons.tween = tween;
          sRibbons.alpha = alpha * beatFader;
          sRibbons.draw();
        },
        setup: function () {
          sRibbons.setup();
        }
      },
      {
        name: "beesAndBombs",
        f: function (tween, pg) {
          let alpha = 1.0 - tween;
          sBeesAndBombs.pg = pg;
          sBeesAndBombs.tween = tween;
          sBeesAndBombs.alpha = alpha * beatFader;
          sBeesAndBombs.draw();
        },
        setup: function () {
          sBeesAndBombs.setup();
        }
      },
      {
        name: "dots",
        f: function (tween, pg) {
          let alpha = 1.0 - tween;
          p.push();
          sDots.tween = tween;
          sDots.alpha = alpha * beatFader;
          sDots.draw();
          p.pop();
        },
        setup: function () {
          sDots.setup();
        }
      },
      {
        name: "face",
        f: function (tween, pg) {
          let alpha = 1.0 - tween;
          sFace.pg = pg;
          sFace.tween = tween;
          sFace.alpha = alpha * beatFader;
          sFace.draw();
        },
        setup: function () {
          sFace.setup();
        }
      },
      {
        name: "brown",
        f: function (tween, pg) {
          let alpha = 1.0 - tween;
          sBrown.pg = pg;
          sBrown.tween = tween;
          sBrown.alpha = alpha * beatFader;
          sBrown.draw();
        },
        setup: function () {
          sBrown.setup();
        }
      },
      {
        name: "langtonAnt",
        f: function (tween, pg) {
          let alpha = 1.0 - tween;
          sLangtonAnt.pg = pg;
          sLangtonAnt.tween = tween;
          sLangtonAnt.alpha = alpha * beatFader;
          sLangtonAnt.draw();
        },
        setup: function () {
          sLangtonAnt.setup();
        }
      },
      {
        name: "doublePendulum",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          sDoublePendulum.pg = pg;
          sDoublePendulum.tween = tween;
          sDoublePendulum.alpha = alpha * beatFader;
          sDoublePendulum.draw();
        },
        setup: function () {
          sDoublePendulum.setup();
        }
      },
      {
        name: "shader",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          sShader.pg = pg;
          sShader.tween = tween;
          sShader.alpha = alpha * beatFader;
          sShader.draw();
        },
        setup: function () {
          sShader.setup();
        }
      },
      {
        name: "warehouse",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          sWarehouse.pg = pg;
          sWarehouse.tween = tween;
          sWarehouse.alpha = alpha * beatFader;
          sWarehouse.draw();
        },
        setup: function () {
          sWarehouse.setup();
        }
      }
    ]));
  }

  let midiToPreset = [
    { preset: ["default"] }, // 1
    { preset: ["beesAndBombs", "lines"] },
    { preset: ["beesAndBombs", "lines"] },
    { preset: ["beesAndBombs", "lines"] },
    { preset: ["ribbons", "lines"] },
    { preset: ["ribbons", "lines"] },
    { preset: ["ribbons", "lines"] },
    { preset: ["ribbons", "lines"] },
    { preset: ["ribbons", "lines"] },
    { preset: ["ribbons", "lines"] }, // 10
    { preset: ["face"] },
    { preset: ["starField", "ribbons", "brown"] },
    { preset: ["langtonAnt", "ribbons"] },
    { preset: ["brown", "doublePendulum"] },
    { preset: ["default", "shader", "ribbons"] },
    { preset: ["default", "warehouse", "brown"] },
  ];

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(windowWidth, windowHeight);
    p.frameRate(60);
    startFrame = p.frameCount;

    if (frontPg == undefined)
      frontPg = p.createGraphics(windowWidth, windowHeight, p.P3D);
    if (backPg == undefined)
      backPg = p.createGraphics(windowWidth, windowHeight, p.P3D);
    if (layerPgs == undefined) {
      layerPgs = [];
      for (let i = 0; i < 16; i++) {
        let pg = p.createGraphics(windowWidth, windowHeight, p.P3D);
        pg.beginDraw();
        pg.clear();
        pg.endDraw();
        layerPgs.push(pg);
      }
    }
    bgpg = layerPgs[0];
    fgpg = layerPgs[1];

    if (oscPgs == undefined) {
      oscPgs = [];
      for (let i = 0; i < 3; i++) {
        oscPgs.push(p.createGraphics(windowWidth, windowHeight, p.P3D));
      }
    }
    texShader = p.loadShader(p.sketchPath("shaders/frag.glsl"));
    levelShader = p.loadShader(p.sketchPath("shaders/level.glsl"));
    oscShader = p.loadShader(p.sketchPath("shaders/osc.glsl"));

    for (let i = 0; i < funcAssets.length; i++) {
      funcAssets[i].update();
    }
  }

  p.getCount = function () { return p.frameCount - startFrame + Math.floor(p.oscFaders[1] * 60) };

  p.keyPressed = function () {
  }

  let activeLayerNum = 2;

  p.draw = function () {
    p.background(0);
    let shaderUpdated = false;
    // let t = p.getCount() / 60.0 * (bpm / 120.0);
    tElapsed = p.millis() * 0.001 + p.oscFaders[1];
    let t = tElapsed * (bpm / 120.0);
    seq = Math.floor(tElapsed * (bpm / 120.0)) + p.seqOffset;

    if (p.getCount() % 60 == 0) {
      texShader = p.loadShader(p.sketchPath("shaders/frag.glsl"));
      levelShader = p.loadShader(p.sketchPath("shaders/level.glsl"));
      oscShader = p.loadShader(p.sketchPath("shaders/osc.glsl"));
      shaderUpdated = true;
    }

    if (seq != lastSeq) {
      if (seq % funcAssets[0].everyNSeq == 0)
        activeLayerNum = midiToPreset[p.oscPreset].preset.length;
      for (let i = 0; i < funcAssets.length; i++) {
        if (i < activeLayerNum) {
          funcAssets[i].preset = midiToPreset[p.oscPreset].preset[i];
          funcAssets[i].update(seq);
        }
      }
    }

    let tween2 = (t * 0.5 % 1.0) * 2.0 - 1.0;
    fgpg.beginDraw();
    fgpg.clear();
    fgpg.endDraw();
    for (let i = 0; i < funcAssets.length; i++) {
      if (i < activeLayerNum) {
        funcAssets[i].exec(tween2, layerPgs[i]);
      }
    }

    // runwayml test
    // let human = JSON.parse(p.openPose).results.humans[0];
    // if(human != undefined) {
    //   fgpg.beginDraw();
    //   fgpg.fill(255);
    //   for(let i = 0; i < human.length; i++) {
    //     let x = human[i][1] * 640 * 0.5;
    //     let y = human[i][2] * 480 * 0.5;
    //     fgpg.ellipse(x, y, 10, 10);
    //   }
    //   fgpg.endDraw();
    // }

    let colorSc = [
      [0, 255, 150],
      [0, 155, 50],
      [230, 230, 100],
      [205, 70, 0],
      [50, 100, 255],
      [0, 70, 155],
      [20, 205, 200],
      [135, 30, 0]
    ]

    function drawShader() {
      let backColIdx = Math.floor(t % 2) * 2 + 1;
      let backCol = [colorSc[backColIdx][0] / 255.0,
      colorSc[backColIdx][1] / 255.0,
      colorSc[backColIdx][2] / 255.0];
      backCol = [0, 0, 0];
      for (let i = 0; i < oscPgs.length; i++) {
        oscShader.set("iTime", t);
        let frontColIdx = Math.floor(t % 2) * 2;
        curCol[0] = p.lerp(curCol[0], colorSc[frontColIdx][0] / 255.0, 0.05);
        curCol[1] = p.lerp(curCol[1], colorSc[frontColIdx][1] / 255.0, 0.05);
        curCol[2] = p.lerp(curCol[2], colorSc[frontColIdx][2] / 255.0, 0.05);
        oscShader.set("bgColor0", curCol[0], curCol[1], curCol[2]);
        oscShader.set("bgColor1", backCol[0], backCol[1], backCol[2]);
        oscShader.set("phaseFader", p.oscFaders[5]);
        oscShader.set("xFader", p.oscFaders[6] * 10.0);
        oscShader.set("oscNum", i * 1.0);
        oscShader.set("backTex", backPg);
        let oscPg = oscPgs[i];
        oscPg.beginDraw();
        oscPg.filter(oscShader);
        oscPg.endDraw();
      }

      texShader.set("iTime", t);
      texShader.set("bgColor0", curCol[0], curCol[1], curCol[2]);
      texShader.set("bgColor1", colorSc[backColIdx][0] / 255.0,
        colorSc[backColIdx][1] / 255.0,
        colorSc[backColIdx][2] / 255.0);
      if (bgpg != undefined)
        texShader.set("pgTex", bgpg);
      texShader.set("osc0Tex", oscPgs[0]);
      texShader.set("osc1Tex", oscPgs[1]);
      texShader.set("osc2Tex", oscPgs[2]);
      texShader.set("backTex", backPg);
      texShader.set("feedbackFader", 1.0 - Math.pow(1.0 - p.oscFaders[4], 4.0));
      texShader.set("phaseFader", p.oscFaders[5]);
      texShader.set("xFader", p.oscFaders[6] * 10.0);
      texShader.set("rAmountFader", p.oscFaders[7] * 1.0);
      texShader.set("modulationFader", p.oscFaders[19] * 1.0);
      frontPg.beginDraw();
      frontPg.filter(texShader);
      frontPg.endDraw();

      p.resetShader();

      let intermediatePg = frontPg;
      frontPg = backPg;
      backPg = intermediatePg;
    }
    drawShader();
    levelShader.set("pgTexture", frontPg);
    levelShader.set("backgroundTexture", bgpg);
    levelShader.set("foregroundTexture", fgpg);
    levelShader.set("masterFader", p.oscFaders[0] * 1.0);
    levelShader.set("seq", seq % 4.0);
    if (true || shaderUpdated == false) {
      p.filter(levelShader);
    }
    p.syphonServer.sendImage(frontPg);

    p.blendMode(p.BLEND);
    for (let i = 2; i < funcAssets.length; i++) {
      if (i < activeLayerNum) {
        p.image(layerPgs[i], 0, 0);
      }
    }

    p.syphonServer.sendScreen();

    p.translate(p.width / 2, p.height / 2);
    p.fill(255);
    p.text(p.str(seq % 4.0), -p.width / 2.0 + 20, p.height / 2.0 - 50);
    p.text(p.str(tElapsed % 1.0), -p.width / 2.0 + 20, p.height / 2.0 - 35);
    p.text("cur preset: " + p.str(1 + p.oscPreset), -p.width / 2.0 + 20, p.height / 2.0 - 20);
    lastSeq = seq;
  }
};

var pMgtk = new p5(s);