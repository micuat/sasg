// var windowWidth = 1280 / 2;
// var windowHeight = 560 / 2;
var windowWidth = 1920 / 2;
var windowHeight = 840 / 2;
var bpm = 124;
var tElapsed = 0;
var lastSeq = -1;
var seq = 0;

var layerPgs;
var postPgs;
var passPg;
var mainPg;

var curPreset = 0;
var lastPreset = 0;

var reloaded = true;

var dampedFaders = new Array(20);

var linePreset = {
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

var masterPreset = [
  { // 1
    preset: [{ a: "shader", p: "slide" }]
  },
  {
    preset: [{ a: "beesAndBombs", p: "bloom", bees: ["inout"] }]
  },
  {
    preset: [{ a: "beesAndBombs", p: "bloom" },
    { a: "lines", p: "default", lines: [linePreset.justPoint, linePreset.justPoint, linePreset.toUpFlat, linePreset.toDownFlat] }]
  },
  {
    preset: [{ a: "beesAndBombs", p: "bloom" },
    { a: "lines", p: "default", lines: [linePreset.sig, linePreset.toDownFlat, linePreset.toUpFlat, linePreset.toDownFlat] }]
  },
  { // 5
    preset: [{ a: "beesAndBombs", p: "bloom" },
    { a: "lines", p: "default", lines: [linePreset.toLeftSig, linePreset.justPoint, linePreset.justPoint, linePreset.justPoint] }]
  },
  {
    preset: [{ a: "ribbons", p: ["slide", "rgbshift", "kaleid", "invert"] },
    { a: "lines", p: "default", lines: [linePreset.random, linePreset.random, linePreset.random, linePreset.random] }]
  }, //add drum effect
  {
    preset: [{ a: "ribbons", p: ["slide"] },
    { a: "lines", p: "default", lines: [linePreset.sig, linePreset.toDownFlat, linePreset.toUpFlat, linePreset.toDownFlat] }]
  },
  {
    preset: [{ a: "ribbons", p: ["slide", "rgbshift", "kaleid", "invert"] },
    { a: "lines", p: "default", lines: [linePreset.justPoint, linePreset.justPoint, linePreset.justPoint, linePreset.justPoint] }]
  },
  {
    preset: [{ a: "shader", p: "mpeg", shader: ["randomBurst"] }, { a: "ribbons", p: "slide" },
    { a: "lines", p: "default", lines: [linePreset.sig, linePreset.toDownFlat, linePreset.toUpFlat, linePreset.toDownFlat] }]
  },
  { // 10
    preset: [{ a: "shader", p: "kaleid" },
    { a: "ribbons", p: "slide" },
    { a: "lines", p: "default", lines: [linePreset.sig, linePreset.justPoint, linePreset.justPoint, linePreset.justPoint] }]
  },
  {
    preset: [{ a: "shader", p: "kaleid" },
    { a: "terrain", p: "rgbshift" },
    ]
  },
  {
    preset: [{ a: "shader", p: "default", shader: ["holo"] }]
  },
  {
    preset: [{ a: "shader", p: ["slide", "invert"], shader: ["tri", "modwave"] },
    { a: "face", p: "darktoalpha", face: ["faceDelay", "faceWireframe", "faceLost"] }]
  },
  {
    preset: [{ a: "terrain", p: ["slide", "invert"] },
    { a: "shader", p: ["slide", "invert"], shader: ["tri", "modwave", "holo", "pixelwave"] },
    { a: ["starField", "gameOfLife", "langtonAnt"], p: ["slide", "mpeg", "rgbshift"] },
    { a: "face", p: "darktoalpha", face: ["body"] },
    ]
  },
  { // 15 not used
    preset: [{ a: "shader", p: ["default", "mpeg"], shader: ["holo"] },
    { a: ["default", "gameOfLife", "langtonAnt"], p: ["rgbshift"] }]
  },
];

function getPreset(name, defaultPreset) {
  let preset = [];
  for (let i in masterPreset) {
    let found = false;
    for (let j in masterPreset[i].preset) {
      if (masterPreset[i].preset[j][name] != undefined) {
        preset.push({ preset: masterPreset[i].preset[j][name] });
        found = true;
        break;
      }
    }
    if (found == false) {
      preset.push({ preset: defaultPreset });
    }
  }
  return preset;
}

var FuncList = function (everyNSeq, funcs) {
  this.everyNSeq = everyNSeq;
  this.funcs = funcs;
  this.execFunc;
  this.preset = [];
  this.update = function (seq) {
    if (seq % this.everyNSeq == 0 || this.execFunc == undefined) {
      let flist = [];
      if (this.preset != undefined && typeof this.preset == "string") {
        this.preset = [this.preset];
      }
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

  let lastState = "none"; // we start from no lines

  let midiToPreset = getPreset("lines", [linePreset.default, linePreset.default, linePreset.default, linePreset.default]);

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
    },
    {
      name: "inFromTop",
      f: function (agent) {
        pg.translate(0.0, (1 - agent.tweenPowZO()) * -200, 0.0);
      }
    },
  ]);
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
            unwrapPreset(newp, linePreset[libp.parents[i]]);
          }
        }
        for (let key in libp) {
          if (key != "parent") {
            newp[key] = libp[key];
          }
        }
      }
      let presetIndex = curPreset;
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
    pg.translate(windowWidth / 2, windowHeight / 2 + p.map(dampedFaders[10], 0, 1, -windowHeight, 0));
    function drawBeat() {
      // beatFader = dampedFaders[3];
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
    pg.background(0); //hack
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
    cols = Math.floor(windowWidth / resolution);
    rows = Math.floor(windowHeight / resolution);
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
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    pg.beginDraw();
    pg.clear();
    pg.background(0); //hack
    pg.pushMatrix();
    pg.pushStyle();
    pg.noStroke();
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
          pg.fill(255, 255);
          // p.stroke(0);
          pg.rect(x, y, resolution - 1, resolution - 1);
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
    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
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
  let targetRotX = 0;
  let targetRotY = 0;
  let tSpeed = 0;
  let rotPower = 0;
  let isSolid = true;
  let amplitude = 0.0;
  let doRot = true;

  let funcs = [
    function(dx, y, tt) {
      return Math.sin(dx * 0.01 + y / 100.0 * Math.PI + tt);
    },
    function(dx, y, tt) {
      return Math.sin(dx * 0.01 + y / 100.0 * Math.PI + tt) * tt;
    },
    function(dx, y, tt) {
      return Math.sin(dx * 0.001 + y / 100.0 * Math.PI + tt) * 10.0;
    },
  ];
  let func = funcs[0];
  this.setup = function () {
    targetRotX = p.random(-Math.PI, Math.PI) * 2.0;
    targetRotY = p.random(-Math.PI, Math.PI) * 2.0;
    tSpeed = p.random(2.0, 8.0);
    rotPower = Math.floor(p.random(2.0, 9.0));
    isSolid = p.random(1.0) > 0.5 ? true : false;
    amplitude = Math.pow(p.random(0.5, 1.0), 2.0) * 100;
    doRot = p.random(1.0) > 0.25 ? true : false;
    func = p.random(funcs);
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
    if(doRot) {
      let rotw = 1.0 - Math.pow(tw * 0.5 + 0.5, rotPower);
      pg.rotateX(rotw * targetRotX + Math.PI * 0.5);
      pg.rotateY(rotw * targetRotY);
    }
    for (let y = -200; y < 200; y += 50) {
      pg.beginShape(p.TRIANGLE_STRIP);
      let tSpeedMod = tSpeed;
      if (y == 0) tSpeedMod *= 3;
      for (let dx = -l; dx < l; dx += 5.0) {
        let z = func(dx, y, tw * tSpeedMod);
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

  let midiToPreset = getPreset("bees", ["default"]);
  let lastState = "default";

  let funcAsset = new FuncList(4, [
    {
      name: "default",
      f: function (getName, seq, tw, x, z) {
        if (getName) return "default";
        if (lastState == "inout") {
          lastState = "inTransition";
        }

        let y = 0;
        if (lastState == "inTransition") {
          if ((seq % 4.0) < 2.0) {
            y = ((tw + 0.75) * 2 + (x + z / 2 - windowHeight * 2.0) * (1.0 / windowHeight / 2.0)) * windowHeight * 5;
            if (y > 0) y = 0;
          }
          else {
            lastState = "default";
          }
        }
        return y;
      }
    },
    {
      name: "inout",
      f: function (getName, seq, tw, x, z) {
        if (getName) return "inout";
        let y = 0;
        if ((seq % 4.0) < 2.0) {
          y = ((tw + 0.75) * 2 + (x + z / 2 - windowHeight * 2.0) * (1.0 / windowHeight / 2.0)) * windowHeight * 5;
          if (y > 0) y = 0;
        }
        else if ((seq % 4.0) >= 2.0) {
          y = ((tw + 0.25) * 2 - (x / 2 + z - windowHeight * 2.0) * (1.0 / windowHeight / 2.0)) * windowHeight * 5;
          if (y < 0) y = 0;
        }
        lastState = "inout";
        return y;
      }
    },
  ]);

  this.setup = function () {
    ma = p.atan(p.cos(p.QUARTER_PI));
    maxD = p.dist(0, 0, 300, 300);
  }

  let shapeMode = -1;
  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;
    if (seq != lastSeq) {
      let presetIndex = curPreset;
      if (presetIndex >= midiToPreset.length) presetIndex = 0;
      funcAsset.preset = midiToPreset[presetIndex].preset;
      funcAsset.update(seq);

      if (seq % 4 == 0) {
        shapeMode = Math.floor(p.random(0, 4));
      }
    }
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
    let winh = windowHeight * 1.5;
    for (let z = 0; z < winh; z += w) {
      for (let x = 0; x < winh; x += w) {
        pg.pushMatrix();
        let d = p.dist(x, z, winh / 2, winh / 2);
        let offset = p.map(d, 0, maxD, -p.PI, p.PI);
        let a = angle + -offset;
        let h = winh;//p.floor(p.map(p.sin(a), -1, 1, 0.5, 1) * winh);
        if (funcAsset.exec(true) == "inout") {
          if (shapeMode == 0) {
            // cube
          }
          else if (shapeMode == 1) {
            let c = Math.sqrt((x - winh / 2) * (x - winh / 2) + (z - winh / 2) * (z - winh / 2)) / winh;
            h *= Math.cos(c * Math.PI);
          }
          else if (shapeMode == 2) {
            h *= x / winh;
          }
          else if (shapeMode == 3) {
            h *= Math.sin(Math.sqrt((x - winh / 2) * (x - winh / 2) + (z - winh / 2) * (z - winh / 2)) * 0.1) * 1.2;
          }
        }
        //h = p.map(decay, 0, 1, winh, h);
        let y = funcAsset.exec(false, seq, this.tween, x, z);
        pg.translate(x - winh / 2, y, z - winh / 2);
        // p.normalMaterial();
        pg.box(w, h, w);
        //rect(x - width / 2 + w / 2, 0, w - 2, h);
        pg.popMatrix();
      }
    }
    pg.endDraw();
  }
};

var SFace = function (p) {
  this.alpha = 1.0;
  this.tween = 0.0;
  let faces = [0, 17, 18, 20, 23, 24, 19, 20, 24, 25, 26, 16, 26, 45, 16, 46, 14, 15, 45, 46, 15, 16, 45, 15, 35, 13, 14, 46, 35, 14, 54, 12, 13, 35, 54, 13, 35, 53, 54, 47, 35, 46, 25, 45, 26, 54, 11, 12, 44, 45, 25, 24, 44, 25, 29, 35, 47, 55, 10, 11, 54, 55, 11, 44, 46, 45, 20, 21, 23, 42, 29, 47, 43, 44, 24, 23, 43, 24, 44, 47, 46, 43, 47, 44, 29, 30, 35, 21, 22, 23, 56, 9, 10, 55, 56, 10, 35, 52, 53, 28, 29, 42, 64, 55, 54, 23, 22, 43, 43, 42, 47, 53, 64, 54, 22, 42, 43, 34, 52, 35, 56, 8, 9, 22, 27, 42, 65, 55, 64, 53, 63, 64, 27, 28, 42, 57, 8, 56, 30, 34, 35, 65, 56, 55, 52, 63, 53, 33, 52, 34, 65, 66, 56, 66, 57, 56, 51, 63, 52, 33, 51, 52, 30, 33, 34, 21, 27, 22, 58, 7, 57, 57, 7, 8, 50, 51, 33, 51, 62, 63, 30, 32, 33, 58, 57, 66, 67, 58, 66, 61, 62, 51, 31, 30, 29, 32, 50, 33, 39, 29, 28, 39, 28, 27, 21, 39, 27, 31, 32, 30, 40, 31, 29, 39, 40, 29, 50, 61, 51, 6, 7, 58, 59, 6, 58, 59, 58, 67, 49, 61, 50, 31, 49, 50, 31, 50, 32, 38, 39, 21, 60, 59, 67, 40, 41, 31, 41, 2, 31, 20, 38, 21, 2, 3, 31, 48, 49, 31, 3, 48, 31, 48, 60, 49, 3, 4, 48, 48, 5, 59, 5, 6, 59, 60, 48, 59, 19, 38, 20, 38, 40, 39, 19, 37, 38, 4, 5, 48, 1, 2, 41, 37, 41, 40, 37, 40, 38, 36, 1, 41, 18, 37, 19, 36, 41, 37, 18, 36, 37, 17, 0, 36, 0, 1, 36, 18, 17, 36, 49, 60, 61];
  let points = [[487, 298], [489, 345], [497, 392], [507, 437], [521, 481], [543, 521], [573, 555], [609, 584], [650, 591], [689, 585], [722, 555], [751, 520], [775, 479], [788, 432], [794, 385], [800, 337], [800, 290], [510, 279], [533, 259], [565, 254], [597, 258], [626, 271], [672, 273], [700, 259], [732, 254], [762, 256], [782, 277], [652, 302], [652, 332], [651, 361], [651, 392], [617, 414], [634, 419], [652, 425], [668, 421], [684, 417], [545, 307], [563, 300], [583, 301], [600, 313], [581, 317], [561, 316], [694, 313], [710, 300], [731, 300], [748, 306], [734, 316], [713, 317], [592, 484], [612, 468], [634, 458], [650, 465], [666, 461], [687, 473], [705, 489], [686, 513], [666, 522], [647, 523], [630, 520], [609, 508], [602, 485], [634, 480], [650, 482], [666, 482], [695, 490], [664, 492], [648, 492], [631, 489], [487, 298], [489, 345], [497, 392], [507, 437], [521, 481], [543, 521], [573, 555], [609, 584], [650, 591], [689, 585], [722, 555], [751, 520], [775, 479], [788, 432], [794, 385], [800, 337], [800, 290], [510, 279], [533, 259], [565, 254], [597, 258], [626, 271], [672, 273], [700, 259], [732, 254], [762, 256], [782, 277], [652, 302], [652, 332], [651, 361], [651, 392], [617, 414], [634, 419], [652, 425], [668, 421], [684, 417], [545, 307], [563, 300], [583, 301], [600, 313], [581, 317], [561, 316], [694, 313], [710, 300], [731, 300], [748, 306], [734, 316], [713, 317], [592, 484], [612, 468], [634, 458], [650, 465], [666, 461], [687, 473], [705, 489], [686, 513], [666, 522], [647, 523], [630, 520], [609, 508], [602, 485], [634, 480], [650, 482], [666, 482], [695, 490], [664, 492], [648, 492], [631, 489]];
  for (let i in points) {
    points[i][1] -= 100;
  }
  let facePg = p.createGraphics(windowWidth, windowHeight, p.P3D);

  let scaling = 1.5;
  let midiToPreset = getPreset("face", ["default"]);

  let faceRemoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 18001);

  let funcAsset = new FuncList(4, [
    {
      name: "default",
      f: function () {
      }
    },
    {
      name: "faceDelay",
      f: function (getType) {
        if (getType) return "face";
        pg.fill(255);
        pg.noStroke();
        pg.beginShape(p.TRIANGLES);
        pg.texture(facePg);
        for (let i = 0; i < faces.length; i++) {
          let idx = faces[i];
          let x = p.facePoints[idx][0] * 0.5 * 1.5;
          let y = p.facePoints[idx][1] * 0.5 * 1.5;
          pg.vertex(x, y, 0, points[idx][0] * 0.5, points[idx][1] * 0.5);
        }
        pg.endShape();
      }
    },
    {
      name: "faceWireframe",
      f: function (getType) {
        if (getType) return "face";
        let modPoints = [];
        for (let i = 0; i < p.facePoints.length; i++) {
          let tx = p.facePoints[i][0] * 0.5 * 1.5;
          let ty = p.facePoints[i][1] * 0.5 * 1.5;
          let x = tx + p.noise(tx, ty, tElapsed) * 30 - 15;
          let y = ty + p.noise(tx * 0.4, ty * 1.1, tElapsed) * 30 - 15;
          modPoints[i] = { x: x, y: y };
        }

        pg.fill(255);
        pg.noStroke();
        pg.beginShape(p.TRIANGLES);
        pg.texture(facePg);
        for (let i = 0; i < faces.length; i++) {
          let idx = faces[i];
          let x = modPoints[idx].x;
          let y = modPoints[idx].y;
          pg.vertex(x, y, 0, points[idx][0] * 0.5, points[idx][1] * 0.5);
        }
        pg.endShape();

        pg.fill(0, 255, 0);
        pg.noFill();
        pg.beginShape(p.TRIANGLES);
        for (let i = 0; i < faces.length; i++) {
          let idx = faces[i];
          let x = modPoints[idx].x;
          let y = modPoints[idx].y;
          pg.vertex(x, y, 0);
        }
        pg.endShape();
      }
    },
    {
      name: "faceLost",
      f: function (getType) {
        if (getType) return "face";
        pg.fill(255);
        pg.noStroke();
        for (let i = 0; i < faces.length; i += 3) {
          if (p.random(1.0) > 0.5) {
            pg.beginShape(p.TRIANGLES);
            pg.texture(facePg);
          }
          else {
            pg.fill(0, 255, 0);
            pg.beginShape(p.TRIANGLES);
          }
          let idx = faces[i];
          let x = p.facePoints[idx][0] * 0.5 * 1.5;
          let y = p.facePoints[idx][1] * 0.5 * 1.5;
          pg.vertex(x, y, 0, points[idx][0] * 0.5, points[idx][1] * 0.5);
          idx = faces[i + 1];
          x = p.facePoints[idx][0] * 0.5 * 1.5;
          y = p.facePoints[idx][1] * 0.5 * 1.5;
          pg.vertex(x, y, 0, points[idx][0] * 0.5, points[idx][1] * 0.5);
          idx = faces[i + 2];
          x = p.facePoints[idx][0] * 0.5 * 1.5;
          y = p.facePoints[idx][1] * 0.5 * 1.5;
          pg.vertex(x, y, 0, points[idx][0] * 0.5, points[idx][1] * 0.5);
          pg.endShape();
        }
      }
    },
    {
      name: "body",
      f: function (getType) {
        if (getType) return "body";
        for (let index = 0; index < p.posePoints.length; index++) {
          let pose = p.posePoints[index];
          for (let i = 8; i < pose.length; i++) {
            // pg.noStroke();
            // pg.fill(255, 0, 0);
            let x = p.map(pose[i][0], 0, 640, 80, 640 - 80) * 1.5;
            let y = p.map(pose[i][1], 0, 480, 0, 360) * 1.5;
            // pg.ellipse(x, y, 14, 14)

            // pg.stroke(255);
            pg.fill(255);
            pg.noStroke();
            pg.beginShape();
            pg.texture(postPgs[index % 2]);
            pg.vertex(x, y, 0, x, y);
            let x0 = p.map(pose[i - 1][0], 0, 640, 80, 640 - 80) * 1.5;
            let y0 = p.map(pose[i - 1][1], 0, 480, 0, 360) * 1.5;
            // pg.line(x, y, x0, y0)
            pg.vertex(x0, y0, 0, x0, y0);
            x0 = p.map(pose[i - 2][0], 0, 640, 80, 640 - 80) * 1.5;
            y0 = p.map(pose[i - 2][1], 0, 480, 0, 360) * 1.5;
            pg.vertex(x0, y0, 0, x0, y0);
            pg.endShape();
          }
        }
      }
    },
    {
      name: "bodyParticle",
      f: function (getType) {
        if (getType) return "body";
        for (let index = 0; index < p.posePoints.length; index++) {
          let pose = p.posePoints[index];
          for (let i = 8; i < pose.length; i++) {
            pg.noStroke();
            pg.fill(255);
            let x = p.map(pose[i][0], 0, 640, 80, 640 - 80) * 1.5;
            let y = p.map(pose[i][1], 0, 480, 0, 360) * 1.5;

            let lfo = Math.sin(tElapsed*16.0) * 0.5 + 0.5;
            for (let j = 0; j < 8; j++) {
              let nx = x + 50 * Math.cos(j/4.0*Math.PI) * lfo;
              let ny = y + 50 * Math.sin(j/4.0*Math.PI) * lfo;
              pg.beginShape();
              pg.texture(postPgs[index % 2]);
              for(let k = 0; k < 10; k++) {
                let r = 10;
                let rx = x + r * Math.cos(k/5.0*Math.PI);
                let ry = y + r * Math.sin(k/5.0*Math.PI);
                pg.vertex(rx, ry, 0, rx, ry);
              }
              pg.endShape();
            }
          }
        }
      }
    }
  ]);

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;
    if (seq != lastSeq) {
      let presetIndex = curPreset;
      if (presetIndex >= midiToPreset.length) presetIndex = 0;
      funcAsset.preset = midiToPreset[presetIndex].preset;
      funcAsset.update(seq);
    }

    if (p.cam.available() == true) {
      p.cam.read();
    }

    facePg.beginDraw();

    // face
    if (p.frameCount % 15 == 0) {
      facePg.clear();
      facePg.fill(255);
      facePg.noStroke();
      facePg.beginShape(p.TRIANGLES);
      facePg.texture(p.cam);
      let ratio = p.cam.width / 1280.0; // face tracker always 1280 width
      for (let i = 0; i < faces.length; i++) {
        let idx = faces[i];
        let x = points[idx][0] * 0.5;
        let y = points[idx][1] * 0.5;
        facePg.vertex(x, y, 0, p.facePoints[idx][0] * ratio, p.facePoints[idx][1] * ratio);
      }
      facePg.endShape();
    }
    facePg.endDraw();

    pg.beginDraw();
    pg.clear();
    pg.pushMatrix();
    pg.pushStyle();
    let camH = p.cam.height * 960 / p.cam.width;

    if (funcAsset.exec(true) == "face") {
      scaling = p.lerp(scaling, 1.5, 0.1);

      if (p.frameCount % 30 == 0) {
        let m = new Packages.oscP5.OscMessage("/face/enable");
        m.add("1");
        p.oscP5.send(m, faceRemoteLocation);
      }
    }
    else {
      scaling = p.lerp(scaling, 1.0, 0.1);

      if (p.frameCount % 30 == 0) {
        let m = new Packages.oscP5.OscMessage("/face/enable");
        m.add("0");
        p.oscP5.send(m, faceRemoteLocation);
      }
    }
    pg.translate(windowWidth / 2, windowHeight / 2);
    pg.scale(scaling, scaling);
    pg.translate(-windowWidth / 2, -windowHeight / 2);
    pg.translate(0, 80);

    pg.translate(0, (windowHeight - camH) * 0.5);
    pg.image(p.cam, 0, 0, 960, camH);

    funcAsset.exec(false);
    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
  };
};

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
      x = Math.floor(windowWidth / m - 1);
    }
    if (y > windowHeight / m - 1) {
      y = 0;
    } else if (y < 0) {
      y = Math.floor(windowHeight / m - 1);
    }
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    if (toSetup) {
      pg = this.pg;
      grid = make2DArray(Math.floor(windowWidth / m), Math.floor(windowHeight / m));
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
    pg.clear();
    pg.background(0); //hack

    for (let n = 0; n < 40; n++) {
      let state = grid[x][y];
      if (state == 0) {
        turnRight();
        grid[x][y] = 1;
      } else if (state == 1) {
        turnLeft();
        grid[x][y] = 0;
      }

      // if (grid[x][y] == 1) {
      //   pg.stroke(0);
      //   pg.point(x * m, y * m);
      // }
      // else {
      //   pg.stroke(255);
      //   pg.point(x * m, y * m);
      // }
      moveForward();
    }

    pg.fill(255);
    pg.noStroke();
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        if (grid[i][j] == 1)
          pg.rect(i * m - m / 2, j * m - m / 2, m, m);
      }
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

var SShader = function (p) {
  let pg;
  let shaders = {};
  let fpgs = [];
  let bpgs = [];
  let npgs = 2;
  let params = {};
  this.curName = "spread";
  let names = ["spread", "pixelwave", "modwave", "tri", "holo"];
  this.fader8 = 0.0;
  this.fader9 = 0.0;

  let midiToPreset = getPreset("shader", ["default"]);

  let funcAsset = new FuncList(4, [
    {
      name: "default",
      f: function (self) {
        self.curName = "spread";
      }
    },
    {
      name: "random",
      f: function (self, seq) {
        if (seq != lastSeq && seq % 4.0 < 1.0) {
          let mynames = ["pixelwave", "modwave", "tri"];
          let index = Math.floor(Math.random() * mynames.length);
          self.curName = mynames[index];
        }
      }
    },
    {
      name: "randomBurst",
      f: function (self, seq) {
        self.curName = "spread";
        if (seq % 4.0 < 2.0 && p.frameCount % 15 == 0) {
          let index = Math.floor(Math.random() * names.length);
          self.curName = names[index];
        }
      }
    },
    {
      name: "holo",
      f: function (self, seq) {
        self.curName = "holo";
      }
    },
    {
      name: "tri",
      f: function (self, seq) {
        self.curName = "tri";
      }
    },
    {
      name: "modwave",
      f: function (self, seq) {
        self.curName = "modwave";
      }
    },
  ]);
  for (let i = 0; i < npgs; i++) {
    fpgs[i] = p.createGraphics(windowWidth, windowWidth, p.P3D);
    bpgs[i] = p.createGraphics(windowWidth, windowWidth, p.P3D);
    fpgs[i].beginDraw();
    fpgs[i].background(0);
    fpgs[i].endDraw();
    bpgs[i].beginDraw();
    bpgs[i].background(0);
    bpgs[i].endDraw();
  }
  params["spread"] = [
    {
      "tex17": "bpgs[1]",
      "sides1": 1000,
      "radius2": 0.3,
      "smoothing3": 0.01,
      "frequency4": 2,
      "sync5": 0.3,
      "offset6": 1,
      "amount7": 0.1,
      "amount9": 1,
      "amount10": 0.5,
      "xMult11": 1,
      "yMult12": 1,
      "amount18": 0.975,
      "r13": "this.fader8",
      "g14": "this.fader8",
      "b15": "this.fader8",
      "render": 0
    },
    {
      "tex19": "bpgs[0]",
      "amount20": 1.05,
      "xMult21": 1,
      "yMult22": 1,
      "scale23": "p.map(Math.pow(this.fader9,2.0), 0.0, 1.0, 2.0, 20.0)",
      "offset24": 0.5,
      "scale25": 3,
      "offset26": 0.1,
      "amount28": 0.5,
      "amount30": 0.05,
      "angle31": 0.15,
      "speed32": 0,
      "r33": 0.995,
      "g34": 0.995,
      "b35": 0.995,
      "a36": 1,
      "amount38": 1
    }
  ];
  params["pixelwave"] = [
    {
      "render": 0
    }
  ];
  params["modwave"] = [
    {
      "tex9": "bpgs[1]",
      "frequency1": 30,
      "sync2": 0.1,
      "offset3": 1,
      "r4": 1,
      "g5": 0,
      "b6": 1,
      "amount7": "Math.sin(tElapsed * 0.1)",//0.03,
      "amount10": 0.1,
      "render": 0
    },
    {
      "tex11": "bpgs[0]",
      "angle12": 0.1,
      "speed13": 0.2,
      "frequency14": 2,
      "sync15": 1,
      "offset16": 0,
      "amount18": 0.6
    }
  ];
  params["tri"] = [
    {
      "tex9": "bpgs[1]",
      "sides1": 3,
      "radius2": 0.3,
      "smoothing3": 0.01,
      "scrollX4": 0.1,
      "speed5": 1,
      "r6": 0.5,
      "g7": 2,
      "b8": 0.5,
      "xMult11": 1,
      "yMult12": 1,
      "r13": "0.2+0.2*Math.sin(tElapsed * 0.1)",
      "g14": 0.4,
      "b15": 0.2,
      "angle17": 0.1,
      "speed18": 0.05,
      "amount10": "0.99*Math.sin(tElapsed * 1.0)",
      "render": 1
    },
    {
      "tex19": "bpgs[0]",
      "tex25": "bpgs[1]",
      "r20": 1.7,
      "g21": 0.4,
      "b22": 1,
      "amount23": 0.2,
      "amount26": 0.5
    }
  ];
  params["holo"] = [
    {
      "tex19": "bpgs[0]",
      "frequency1": 10,
      "sync2": 0.2,
      "offset3": 0.1,
      "nSides4": 4,
      "nSides5": 4,
      "amount6": 2,
      "scale7": 100,
      "offset8": 1,
      "threshold9": 0.8,
      "tolerance10": 0.04,
      "amount12": 0.5,
      "pixelX13": 10,
      "pixelY14": 10,
      "r15": 2,
      "g16": 2,
      "b17": 2,
      "amount20": "p.map(Math.pow(1-dampedFaders[13],4.0), 0, 1, 0.5, 1.0)",//0.5,
      "amount21": 0.001,
      "amount22": "p.map(Math.pow(1-dampedFaders[13],4.0), 0, 1, 0.5, 0.99)",//0.5
      "xMult23": 1,
      "yMult24": 1,
      "render": 0
    }
  ]

  function loadShaders() {
    for (let i in names) {
      let name = names[i];
      shaders[name] = [];
      for (let i = 0; i < npgs && i < params[name].length; i++) {
        shaders[name][i] = p.loadShader(p.sketchPath("shaders/" + name + "/frag" + i + ".glsl"));
      }
    }
  }
  loadShaders();

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    if (seq != lastSeq) {
      let presetIndex = curPreset;
      if (presetIndex >= midiToPreset.length) presetIndex = 0;
      funcAsset.preset = midiToPreset[presetIndex].preset;
      funcAsset.update(seq);
    }
    funcAsset.exec(this, seq);

    if (p.frameCount % 60 == 0) {
      // loadShaders();
    }

    for (let i = 0; i < npgs && i < params[this.curName].length; i++) {
      fpgs[i].beginDraw();
      shaders[this.curName][i].set("time", tElapsed);
      for (let key in params[this.curName][i]) {
        if (typeof params[this.curName][i][key] == "string") {
          shaders[this.curName][i].set(key, eval(params[this.curName][i][key]));
        }
        else {
          shaders[this.curName][i].set(key, parseFloat(params[this.curName][i][key]));
        }
      }
      fpgs[i].filter(shaders[this.curName][i]);
      fpgs[i].endDraw();
    }

    pg.beginDraw();
    pg.pushMatrix();
    pg.pushStyle();

    pg.image(fpgs[params[this.curName][0].render], 0, -(windowWidth - windowHeight) * 0.5);

    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();

    // swap pgs
    for (let i = 0; i < npgs; i++) {
      let temppg = fpgs[i];
      fpgs[i] = bpgs[i];
      bpgs[i] = temppg;
    }
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

var STerrain = function (p) {
  this.tween = 0;
  this.alpha = 0;

  let cols, rows;
  let scl = 20;
  let w = 1200;
  let h = 500;
  cols = w / scl;
  rows = h / scl;

  let flying = 0;

  let terrain = [];
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0; //specify a default value for now
    }
  }

  let midiToPreset = getPreset("terrain", ["default"]);

  let funcAsset = new FuncList(4, [
    {
      name: "default",
      f: function () {
        return 0;
      }
    },
  ]);

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;
    if (seq != lastSeq) {
      let presetIndex = curPreset;
      if (presetIndex >= midiToPreset.length) presetIndex = 0;
      funcAsset.preset = midiToPreset[presetIndex].preset;
      funcAsset.update(seq);
    }
    pg.beginDraw();
    pg.clear();
    pg.pushMatrix();
    pg.pushStyle();
    pg.translate(p.width / 2, p.height / 2 + p.map(dampedFaders[10], 0, 1, windowHeight, 0));

    pg.directionalLight(90, 195, 126, -1, 0, 0);
    pg.pointLight(140, 135, 196, 300, -100, 1000);

    flying -= 0.1;
    let yoff = flying;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        terrain[x][y] = p.map(p.noise(xoff, yoff), 0, 1, -100, 100);
        terrain[x][y] = p.lerp(terrain[x][y], Math.cos(x * 0.1) * 200, dampedFaders[12] * (Math.sin(tElapsed * (bpm / 120.0) * Math.PI * 0.5) * 0.5 + 0.5));
        xoff += 0.2;
      }
      yoff += 0.2;
    }

    pg.translate(0, 100);
    pg.rotateX(p.PI / 2.2);

    pg.fill(200, 200, 200);
    pg.stroke(255);
    // pg.noFill();
    pg.translate(-w / 2, -h / 2);
    for (let y = 0; y < rows - 1; y++) {
      pg.beginShape(p.TRIANGLE_STRIP);
      for (let x = 0; x < cols; x++) {
        pg.vertex(x * scl, y * scl, terrain[x][y]);
        pg.vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
      }
      pg.endShape();
    }

    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
  }
};

var STemplate = function (p) {
  this.tween = 0;
  this.alpha = 0;

  let midiToPreset = getPreset("template", ["default"]);

  let funcAsset = new FuncList(4, [
    {
      name: "default",
      f: function () {
        return 0;
      }
    },
  ]);

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;
    if (seq != lastSeq) {
      let presetIndex = curPreset;
      if (presetIndex >= midiToPreset.length) presetIndex = 0;
      funcAsset.preset = midiToPreset[presetIndex].preset;
      funcAsset.update(seq);
    }
    pg.beginDraw();
    pg.clear();
    pg.pushMatrix();
    pg.pushStyle();

    pg.translate(p.width / 2, p.height / 2);

    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
  }
};

var s = function (p) {
  let name;
  let sLines = new SLines(p);
  let sStarField = new SStarField(p);
  let sGameOfLife = new SGameOfLife(p);
  let sRibbons = new SRibbons(p);
  let sBeesAndBombs = new SBeesAndBombs(p);
  let sFace = new SFace(p);
  let sLangtonAnt = new SLangtonAnt(p);
  let sShader = new SShader(p);
  // let sWarehouse = new SWarehouse(p);
  let sTerrain = new STerrain(p);

  let startFrame;
  let beatFader = 1;
  let postShaders = {};

  let startTime = p.millis();

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
          sGameOfLife.pg = pg;
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
        name: "shader",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          sShader.pg = pg;
          sShader.fader8 = dampedFaders[8];
          sShader.fader9 = dampedFaders[9];
          sShader.draw();
        },
        setup: function () {
          sShader.setup();
        }
      },
      // {
      //   name: "warehouse",
      //   f: function (tween, pg) {
      //     pg.beginDraw();
      //     pg.clear();
      //     pg.endDraw();
      //     let alpha = 1.0 - tween;
      //     sWarehouse.pg = pg;
      //     sWarehouse.tween = tween;
      //     sWarehouse.alpha = alpha * beatFader;
      //     sWarehouse.draw();
      //   },
      //   setup: function () {
      //     sWarehouse.setup();
      //   }
      // },
      {
        name: "terrain",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          sTerrain.pg = pg;
          sTerrain.tween = tween;
          sTerrain.alpha = alpha * beatFader;
          sTerrain.draw();
        },
        setup: function () {
          sTerrain.setup();
        }
      }
    ]));
  }
  let postAssets = [];
  for (let i = 0; i < 16; i++) {
    postAssets.push(new FuncList(4, [
      {
        name: "default",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          ppg.resetShader();
          ppg.image(lpg, 0, 0);
          ppg.endDraw();
        }
      },
      {
        name: "kaleid",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["kaleid"]);
          ppg.endDraw();
        }
      },
      {
        name: "rgbshift",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          postShaders["rgbshift"].set("delta", 300.0 * dampedFaders[2] * (Math.sin(tElapsed * (bpm / 120.0) * Math.PI * 1.0) * 0.5 + 0.5));
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["rgbshift"]);
          ppg.endDraw();
        }
      },
      {
        name: "slide",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          postShaders["slide"].set("time", tElapsed);
          postShaders["slide"].set("delta", 0.1 * dampedFaders[2] * (Math.sin(tElapsed * (bpm / 120.0) * Math.PI * 1.0) * 0.5 + 0.5));
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["slide"]);
          ppg.endDraw();
        }
      },
      {
        name: "bloom",
        f: function (lpg, ppg) {
          passPg.beginDraw();
          passPg.clear();
          passPg.image(lpg, 0, 0);
          passPg.endDraw();
          for (let i = 0; i < 10; i++) {
            ppg.beginDraw();
            ppg.clear();
            postShaders["bloom"].set("delta", 0.1 * dampedFaders[2] * (-Math.cos(tElapsed * (bpm / 120.0) * Math.PI * 0.5) * 0.5 + 0.5));
            ppg.image(lpg, 0, 0);
            ppg.filter(postShaders["bloom"]);
            ppg.endDraw();
            let temppg = ppg;
            ppg = lpg;
            lpg = temppg;
          }
          ppg.beginDraw();
          ppg.blendMode(p.ADD);
          ppg.image(passPg, 0, 0);
          ppg.endDraw();
        }
      },
      {
        name: "invert",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          postShaders["invert"].set("delta", Math.min(1.0, dampedFaders[2] * 5.0 * (Math.cos(tElapsed * (bpm / 120.0) * Math.PI * 1.0) * 0.5 + 0.5)));
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["invert"]);
          ppg.endDraw();
        }
      },
      {
        name: "mpeg",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          postShaders["mpeg"].set("time", tElapsed);
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["mpeg"]);
          ppg.endDraw();
        }
      },
      {
        name: "radial",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          postShaders["radial"].set("delta", 3.0);
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["radial"]);
          ppg.endDraw();
        }
      },
      {
        name: "darktoalpha",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          postShaders["darktoalpha"].set("delta", 3.0);
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["darktoalpha"]);
          ppg.endDraw();
        }
      },
      {
        name: "pixelate",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          postShaders["pixelate"].set("delta", 3.0);
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["pixelate"]);
          ppg.endDraw();
        }
      },
      {
        name: "fillalpha",
        f: function (lpg, ppg) {
          ppg.beginDraw();
          ppg.clear();
          postShaders["fillalpha"].set("delta", 3.0);
          ppg.image(lpg, 0, 0);
          ppg.filter(postShaders["fillalpha"]);
          ppg.endDraw();
        }
      },
    ]))
  }

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(windowWidth, windowHeight);
    p.frameRate(60);
    startFrame = p.frameCount;

    if (mainPg == undefined)
      mainPg = p.createGraphics(windowWidth, windowHeight, p.P3D);
    if (passPg == undefined)
      passPg = p.createGraphics(windowWidth, windowHeight, p.P3D);
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
    if (postPgs == undefined) {
      postPgs = [];
      for (let i = 0; i < 16; i++) {
        let pg = p.createGraphics(windowWidth, windowHeight, p.P3D);
        postPgs.push(pg);
      }
    }
    for (let i = 0; i < funcAssets.length; i++) {
      funcAssets[i].update();
    }
    for (let i = 0; i < postAssets.length; i++) {
      postAssets[i].update();
    }

    let shaderTypes = ["kaleid", "rgbshift", "slide", "bloom", "invert", "mpeg", "radial", "darktoalpha", "pixelate", "fillalpha"];
    for (let i in shaderTypes) {
      postShaders[shaderTypes[i]] = p.loadShader(p.sketchPath("shaders/post/" + shaderTypes[i] + ".glsl"));
    }

    for (let i = 0; i < dampedFaders.length; i++) {
      dampedFaders[i] = p.oscFaders[i];
    }
  }

  p.getCount = function () { return p.frameCount - startFrame + Math.floor(dampedFaders[1] * 60) };

  p.keyPressed = function () {
    if (p.key == 'a') {
      startTime = p.millis();
    }
  }

  let activeLayerNum = 2;
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 6667);

  function sendOsc() {
    let amount = 255;
    // if(tElapsed * (bpm / 120.0) % 1.0 > dampedFaders[3]) amount = 0;
    amount = Math.floor((Math.sin(tElapsed * (bpm / 120.0) * Math.PI * 2.0) * 128 + 128) * dampedFaders[3]);
    let m = new Packages.oscP5.OscMessage("/tw/ABCD/k/" + amount);
    p.oscP5.send(m, remoteLocation);

    if(p.frameCount % 5 == 0) {
      m = new Packages.oscP5.OscMessage("/tw/QRSTUVWXYZ/u/0");
      p.oscP5.send(m, remoteLocation);
      let targets = [];
      let modes = ["Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
      for(let i = 0; i < 3; i++) {
        let target = p.random(modes);
        amount = Math.floor((-Math.sin(tElapsed * (bpm / 120.0) * Math.PI * 2.0) * 128 + 128) * dampedFaders[7]);
        m = new Packages.oscP5.OscMessage("/tw/"+target+"/l/" + amount);
        p.oscP5.send(m, remoteLocation);
        m = new Packages.oscP5.OscMessage("/tw/"+target+"/u/1");
        p.oscP5.send(m, remoteLocation);
  
        targets.push(target);
      }
    }
    if (seq != lastSeq) {
      // m = new Packages.oscP5.OscMessage("/tw/ABCD/a/" + 1);
      m = new Packages.oscP5.OscMessage("/tw/ABCD/b/" + Math.floor(p.random(1)));
      p.oscP5.send(m, remoteLocation);
      m = new Packages.oscP5.OscMessage("/tw/ABCD/a/" + Math.floor(p.random(2)));
      p.oscP5.send(m, remoteLocation);

      m = new Packages.oscP5.OscMessage("/tw/ABCD/b/" + 1);
      p.oscP5.send(m, remoteLocation);
      m = new Packages.oscP5.OscMessage("/tw/ABCD/x/" + 2);
      p.oscP5.send(m, remoteLocation);

      m = new Packages.oscP5.OscMessage("/tw/QRSTUVWXYZ/b/3");
      p.oscP5.send(m, remoteLocation);
      m = new Packages.oscP5.OscMessage("/tw/QRSTUVWXYZ/f/1");//21 hsb fade
      p.oscP5.send(m, remoteLocation);
      m = new Packages.oscP5.OscMessage("/tw/QRSTUVWXYZ/k/0");
      p.oscP5.send(m, remoteLocation);
      m = new Packages.oscP5.OscMessage("/tw/QRSTUVWXYZ/a/1");
      p.oscP5.send(m, remoteLocation);
    }
  }

  p.draw = function () {
    for (let i = 0; i < dampedFaders.length; i++) {
      dampedFaders[i] = p.lerp(dampedFaders[i], p.oscFaders[i], 0.1);
    }
    if (p.frameCount > 10 && reloaded) {
      ss = [sLines, sGameOfLife, sRibbons, sBeesAndBombs, sFace, sLangtonAnt, sShader, sTerrain]
      for (let i in ss) {
        ss[i].setup();
        ss[i].setup();
        ss[i].pg = layerPgs[0];
        for (let j = 0; j < 10; j++) {
          ss[i].draw();
        }
        ss[i].setup();
      }
      layerPgs[0].beginDraw();
      layerPgs[0].clear();
      layerPgs[0].endDraw();

      reloaded = false;
    }
    p.background(0);
    tElapsed = (p.millis() - startTime) * 0.001 + dampedFaders[1];
    let t = tElapsed * (bpm / 120.0);
    seq = Math.floor(tElapsed * (bpm / 120.0));// + p.seqOffset;

    sendOsc();

    if (seq != lastSeq) {
      if (seq % funcAssets[0].everyNSeq == 0) {
        curPreset = p.oscPreset;
        activeLayerNum = masterPreset[curPreset].preset.length;
      }
      for (let i = 0; i < funcAssets.length; i++) {
        if (i < activeLayerNum) {
          let lp = masterPreset[curPreset].preset[i];
          if (lp == undefined) continue;
          if (lp.a != undefined) {
            funcAssets[i].preset = lp.a;
            postAssets[i].preset = lp.p;
          }
          else {
            funcAssets[i].preset = lp;
            postAssets[i].preset = "default";
          }
          funcAssets[i].update(seq);
          postAssets[i].update(seq);
        }
      }
    }

    let tween2 = (t * 0.5 % 1.0) * 2.0 - 1.0;
    for (let i = 0; i < funcAssets.length; i++) {
      if (i < activeLayerNum) {
        funcAssets[i].exec(tween2, layerPgs[i]);
        postAssets[i].exec(layerPgs[i], postPgs[i]);
      }
    }

    mainPg.beginDraw();
    mainPg.background(0);

    mainPg.blendMode(p.BLEND);
    for (let i = 0; i < funcAssets.length; i++) {
      if (i < activeLayerNum) {
        mainPg.image(postPgs[i], 0, 0);
      }
    }
    mainPg.endDraw();
    p.image(mainPg, 0, 0);

    p.syphonServer.sendImage(mainPg);

    p.translate(p.width / 2, p.height / 2);
    p.fill(255);
    p.text(p.str(seq % 4.0), -p.width / 2.0 + 20, p.height / 2.0 - 50);
    p.text(p.str(tElapsed % 1.0), -p.width / 2.0 + 20, p.height / 2.0 - 35);
    p.text("cur  preset: " + p.str(1 + curPreset), -p.width / 2.0 + 20, p.height / 2.0 - 20);
    p.text("next preset: " + p.str(1 + p.oscPreset), -p.width / 2.0 + 20, p.height / 2.0 - 5);

    // p.syphonServer.sendScreen();
    lastSeq = seq;
    lastPreset = curPreset;
  }
};

var pMgtk = new p5(s);