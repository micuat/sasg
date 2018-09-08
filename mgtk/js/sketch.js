var windowWidth = 1280 / 2;
var windowHeight = 560 / 2;
var bpm = 124;
var tElapsed = 0;
var lastSeq = -1;
var seq = 0;

var layerPgs;
var postPgs;
var passPg;
var mainPg;

var curPreset = 0;

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
    { a: "lines", p: "default", lines: [linePreset.toUpFlat, linePreset.toDownFlat, linePreset.toUpFlat, linePreset.toDownFlat] }]
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
    preset: [{ a: "shader", p: "mpeg", shader: ["random"] }, { a: "ribbons", p: "slide" },
    { a: "lines", p: "default", lines: [linePreset.sig, linePreset.toDownFlat, linePreset.toUpFlat, linePreset.toDownFlat] }]
  },
  { // 10
    preset: [{ a: "shader", p: "kaleid" }, { a: "terrain", p: "rgbshift" }, { a: "ribbons", p: "slide" },
    { a: "lines", p: "default", lines: [linePreset.sig, linePreset.justPoint, linePreset.justPoint, linePreset.justPoint] }]
  },
  {
    preset: [{ a: "shader", p: "kaleid" },
    { a: "lines", p: "default", lines: [linePreset.justPoint, linePreset.justPoint, linePreset.justPoint, linePreset.justPoint] }]
  },
  {
    preset: [{ a: "shader", p: "kaleid" }]
  },
  {
    preset: [{ a: "face", p: ["slide", "rgbshift"] }]
  },
  {
    preset: ["starField", "ribbons", "brown"]
  },
  { // 15
    preset: ["langtonAnt", "ribbons"]
  },
  {
    preset: ["brown", "doublePendulum"]
  },
  {
    preset: [{ a: "shader", p: "kaleid" }, { a: "ribbons", p: "rgbshift" }]
  },
  {
    preset: ["warehouse", "brown"]
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

  let midiToPreset = getPreset("bees", ["default"]);
  let lastState = "default";

  let funcAsset = new FuncList(4, [
    {
      name: "default",
      f: function (seq, tw, x, z) {
        if(lastState == "inout") {
          lastState = "inTransition";
        }

        let y = 0;
        if(lastState == "inTransition") {
          if ((seq % 4.0) < 2.0) {
            y = (tw * 2 + (x + z / 2 - windowHeight * 2.0) * (1.0 / windowHeight / 2.0)) * windowHeight * 5;
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
      f: function (seq, tw, x, z) {
        let y = 0;
        if ((seq % 4.0) < 2.0) {
          y = (tw * 2 + (x + z / 2 - windowHeight * 2.0) * (1.0 / windowHeight / 2.0)) * windowHeight * 5;
          if (y > 0) y = 0;
        }
        else if ((seq % 4.0) >= 2.0) {
          y = (tw * 2 - (x / 2 + z - windowHeight * 2.0) * (1.0 / windowHeight / 2.0)) * windowHeight * 5;
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
    let winh = windowHeight * 2.0;
    for (let z = 0; z < winh; z += w) {
      for (let x = 0; x < winh; x += w) {
        pg.pushMatrix();
        let d = p.dist(x, z, winh / 2, winh / 2);
        let offset = p.map(d, 0, maxD, -p.PI, p.PI);
        let a = angle + -offset;
        let h = p.floor(p.map(p.sin(a), -1, 1, 0.5, 1) * winh);
        h = p.map(decay, 0, 1, winh, h);
        let y = funcAsset.exec(seq, this.tween, x, z);
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

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

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
    let camH = p.cam.height * 640.0 / p.cam.width;
    pg.translate(0, (windowHeight - camH) * 0.5);
    pg.image(p.cam, 0, 0, 640, camH);
    // pg.image(p.cam, 0, 0, 1280 / 2, 720 / 2);

    // body
    {
      pg.noStroke();
      pg.fill(255, 0, 0);
      for (let i = 0; i < p.posePoints.length; i++) {
        // let x = p.facePoints[i][0] * 0.5;
        // let y = p.facePoints[i][1] * 0.5;
        let x = p.map(p.posePoints[i][0], 0, 640, 80, 640 - 80);
        let y = p.map(p.posePoints[i][1], 0, 480, 0, 360);
        pg.ellipse(x, y, 14, 14)
      }
    }

    // face
    {
      pg.fill(255);
      pg.noStroke();
      pg.beginShape(p.TRIANGLES);
      pg.texture(facePg)
      for (let i = 0; i < faces.length; i++) {
        let idx = faces[i];
        let x = p.facePoints[idx][0] * 0.5;
        let y = p.facePoints[idx][1] * 0.5;
        pg.vertex(x, y, 0, points[idx][0] * 0.5, points[idx][1] * 0.5);
      }
      pg.endShape();
    }
    // pg.blendMode(p.BLEND);
    // pg.image(facePg, 0, 0);
    pg.popStyle();
    pg.popMatrix();
    pg.endDraw();
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
  let shaders = {};
  let fpgs = [];
  let bpgs = [];
  let npgs = 2;
  let params = {};
  this.curName = "spread";
  let names = ["spread", "pixelwave", "modwave", "tri"];
  this.fader = 0.0;

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
        self.curName = "spread";
        if (seq % 4.0 < 2.0 && p.frameCount % 4 == 0) {
          let index = Math.floor(Math.random() * names.length);
          self.curName = names[index];
        }
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
      "sides1": 10,
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
      "r13": "this.fader",
      "g14": "this.fader",
      "b15": "this.fader",
      "render": 0
    },
    {
      "tex19": "bpgs[0]",
      "amount20": 1.05,
      "xMult21": 1,
      "yMult22": 1,
      "scale23": 20,
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
      "amount7": 0.03,
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
      "r13": 0.1,
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

var SFeedbackShader = function (p) {
  let pg;
  let frontPg;
  let backPg;
  var oscPgs;
  let texShader, levelShader, oscShader;
  let curCol = [0, 0, 0];

  if (frontPg == undefined)
    frontPg = p.createGraphics(windowWidth, windowHeight, p.P3D);
  if (backPg == undefined)
    backPg = p.createGraphics(windowWidth, windowHeight, p.P3D);
  if (oscPgs == undefined) {
    oscPgs = [];
    for (let i = 0; i < 3; i++) {
      oscPgs.push(p.createGraphics(windowWidth, windowHeight, p.P3D));
    }
  }

  function loadShaders() {
    texShader = p.loadShader(p.sketchPath("shaders/frag.glsl"));
    levelShader = p.loadShader(p.sketchPath("shaders/level.glsl"));
    oscShader = p.loadShader(p.sketchPath("shaders/osc.glsl"));
  }
  loadShaders();

  this.setup = function () {
  }

  this.draw = function () {
    if (this.pg == undefined || this.pg == null) return;
    pg = this.pg;

    if (p.frameCount % 60 == 0) {
      loadShaders();
    }

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
      let backColIdx = Math.floor(tElapsed % 2) * 2 + 1;
      let backCol = [colorSc[backColIdx][0] / 255.0,
      colorSc[backColIdx][1] / 255.0,
      colorSc[backColIdx][2] / 255.0];
      backCol = [0, 0, 0];
      for (let i = 0; i < oscPgs.length; i++) {
        oscShader.set("iTime", tElapsed);
        let frontColIdx = Math.floor(tElapsed % 2) * 2;
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

      texShader.set("iTime", tElapsed);
      texShader.set("bgColor0", curCol[0], curCol[1], curCol[2]);
      texShader.set("bgColor1", colorSc[backColIdx][0] / 255.0,
        colorSc[backColIdx][1] / 255.0,
        colorSc[backColIdx][2] / 255.0);
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

      let intermediatePg = frontPg;
      frontPg = backPg;
      backPg = intermediatePg;
    }
    drawShader();

    pg.beginDraw();
    pg.pushMatrix();
    pg.pushStyle();

    levelShader.set("pgTexture", frontPg);
    levelShader.set("masterFader", p.oscFaders[0] * 1.0);
    levelShader.set("seq", seq % 4.0);
    if (true || shaderUpdated == false) {
      pg.filter(levelShader);
      pg.resetShader();
    }

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
    pg.translate(p.width / 2, p.height / 2);

    pg.directionalLight(90, 195, 126, -1, 0, 0);
    pg.pointLight(140, 135, 196, 300, -100, 1000);

    flying -= 0.1;
    let yoff = flying;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        terrain[x][y] = p.map(p.noise(xoff, yoff), 0, 1, -100, 100);
        xoff += 0.2;
      }
      yoff += 0.2;
    }

    pg.translate(0, 50);
    pg.rotateX(p.PI / 2.5);

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
  let sCircleMorph = new SCircleMorph(p);
  let sStarField = new SStarField(p);
  let sGameOfLife = new SGameOfLife(p);
  let sRibbons = new SRibbons(p);
  let sBeesAndBombs = new SBeesAndBombs(p);
  let sFace = new SFace(p);
  let sBrown = new SBrown(p);
  let sLangtonAnt = new SLangtonAnt(p);
  let sDoublePendulum = new SDoublePendulum(p);
  let sShader = new SShader(p);
  let sFeedbackShader = new SFeedbackShader(p);
  let sWarehouse = new SWarehouse(p);
  let sTerrain = new STerrain(p);

  let startFrame;
  let beatFader = 1;
  let postShaders = {};

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
          sShader.fader = p.oscFaders[3];
          sShader.draw();
        },
        setup: function () {
          sShader.setup();
        }
      },
      {
        name: "feedbackShader",
        f: function (tween, pg) {
          pg.beginDraw();
          pg.clear();
          pg.endDraw();
          let alpha = 1.0 - tween;
          sFeedbackShader.pg = pg;
          sFeedbackShader.tween = tween;
          sFeedbackShader.alpha = alpha * beatFader;
          sFeedbackShader.draw();
        },
        setup: function () {
          sFeedbackShader.setup();
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
      },
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
          postShaders["rgbshift"].set("delta", 300.0 * p.oscFaders[2]);
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
          postShaders["slide"].set("delta", 0.1 * p.oscFaders[2]);
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
            postShaders["bloom"].set("delta", 0.1 * p.oscFaders[2]);
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
          postShaders["invert"].set("delta", Math.min(1.0, p.oscFaders[2] * 5.0));
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

    let shaderTypes = ["kaleid", "rgbshift", "slide", "bloom", "invert", "mpeg"];
    for (let i in shaderTypes) {
      postShaders[shaderTypes[i]] = p.loadShader(p.sketchPath("shaders/post/" + shaderTypes[i] + ".glsl"));
    }
  }

  p.getCount = function () { return p.frameCount - startFrame + Math.floor(p.oscFaders[1] * 60) };

  p.keyPressed = function () {
  }

  let activeLayerNum = 2;

  p.draw = function () {
    p.background(0);
    tElapsed = p.millis() * 0.001 + p.oscFaders[1];
    let t = tElapsed * (bpm / 120.0);
    seq = Math.floor(tElapsed * (bpm / 120.0)) + p.seqOffset;

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
  }
};

var pMgtk = new p5(s);