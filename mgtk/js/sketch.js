var s = function (p) {
  let name;

  function Agent (t, tween, ii, jj, isTarget) {
    this.t = t;
    this.ii = ii;
    this.jj = jj;
    this.isTarget = isTarget;
    this.tween = tween;
    orderFunc.exec(this);
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
      if(this.isTarget) {
        p.stroke(255, 180);
      }
      else {
        p.stroke(255);
      }

      p.translate(this.ii * p.width / 3, 0);
      backgroundFunc.exec(this);

      this.l = p.width / 3.0;
      p.translate(-this.l / 2.0, 0);
      transformFunc.exec(this);
      lineFunc.exec(this);

      p.pop();
    }
  }

  let FuncList = function (funcs) {
    this.funcs = funcs;
    this.exec;
    this.update = function () {
      this.exec = p.random(this.funcs);
    }
  }

  let globalTransformFunc = new FuncList([
    function (tween) {
    }
    ,
    function (tween) {
      let tw = tween;
      if (tw < 0) {
        tw = Math.pow(p.map(tw, -1, 0, 0, 1), 4.0) * 0.5;
      }
      else {
        tw = 1.0 - Math.pow(p.map(tw, 0, 1, 1, 0), 4.0) * 0.5;
      }
      p.translate(tw * p.width / 3.0, 0.0);
    }
    ,
    function (tween) {
      let tw = tween;
      if (tw < 0) {
        tw = Math.pow(p.map(tw, -1, 0, 0, 1), 4.0) * 0.5;
      }
      else {
        tw = 1.0 - Math.pow(p.map(tw, 0, 1, 1, 0), 4.0) * 0.5;
      }
      p.translate(-tw * p.width / 3.0, 0.0);
    }
  ]);
  let backgroundFuncs = new FuncList([
    function (agent) {
    }
    ,
    function (agent) {
      let alpha = agent.tweenPowReturn();
      p.push();
      p.fill(255, 255 * alpha);
      p.noStroke();
      let pw = 1280 * 0.5 / 3.0;
      let n = pw / 10.0;
      p.rect(-pw * 0.5, -p.height * 0.5, pw, p.height);
      p.pop();
    }
    ,
    function (agent) {
      let alpha = agent.tweenPowReturn();
      p.push();
      p.stroke(255, 255 * alpha);
      p.strokeWeight(1.0);
      let pw = 1280 * 0.5 / 3.0;
      let n = pw / 10.0;
      for(let j = -6; j <= 6; j++) {
        if(j >= -5 && j <= 5)
          p.line(j * n, -p.height * 0.5, j * n, p.height * 0.5);
        p.line(-pw * 0.5, j * n, pw * 0.5, j * n);
      }
      p.pop();
    }
  ]);
  let orderFunc = new FuncList([
    function (agent) {
      agent.tween = p.constrain(agent.tween * 1.25 + agent.ii * 0.25, -1, 1);
    }
    ,
    function (agent) {
      agent.tween = p.constrain(agent.tween * 1.25 - agent.ii * 0.25, -1, 1);
    }
    ,
    function (agent) {
      agent.tween = p.constrain(agent.tween * 1.25 - Math.abs(agent.ii) * 0.25, -1, 1);
    }
    ,
    function (agent) {
    }
  ]);
  let transformFunc = new FuncList([
    function (agent) {
      p.translate(0.0, agent.tweenPowReturn() * 150, 0.0);
    }
    ,
    function (agent) {
      p.translate(0.0, agent.tweenPowReturn() * -150, 0.0);
    }
    ,
    function (agent) {
      agent.l *= (1.0 - agent.tweenPowReturn());
    }
    ,
    function (agent) {
      p.translate(agent.l * 0.5, 0);
      p.scale(-1, 1);
      p.translate(-agent.l * 0.5, 0);
      agent.l *= (1.0 - agent.tweenPowReturn());
    }
  ]);
  let sigFunc = new FuncList([
    function (dx, tw) {
      return Math.sin(dx * 0.1 + tw * 10.0);
    }
    ,
    function (dx, tw) {
      return Math.sin(dx * 0.1);
    }
    ,
    function (dx, tw) {
      return p.random(-1, 1);
    }
  ]);
  let pointFunc = new FuncList([
    function (x, y, tween) {
      p.ellipse(x, y, 7);
    }
    ,
    function (x, y, tween) {
      p.ellipse(x, y, 7);
      p.push();
      let r = 1.0;
      let alpha = 1.0;
      if (tween < 0.5) {
        r *= p.map(tween, 0, 0.5, 1.0, 10.0);
        alpha *= p.map(tween, 0, 0.5, 1.0, 0.0);
        p.noFill();
        p.stroke(255, 255 * alpha);
        p.strokeWeight(1.0);
        p.ellipse(x, y, 7 * r);
      }
      p.pop();
    }
    ,
    function (x, y, tween) {
      p.ellipse(x, y, 7);
      p.push();
      let r = 1.0;
      let alpha = 1.0;
      if (tween > 0.5) {
        r *= p.map(tween, 0.5, 1.0, 10.0, 1.0);
        alpha *= p.map(tween, 0.5, 1.0, 0.0, 1.0);
        p.noFill();
        p.stroke(255, 255 * alpha);
        p.strokeWeight(1.0);
        p.ellipse(x, y, 7 * r);
      }
      p.pop();
    }
  ]);
  let lineFunc = new FuncList([
    function (agent) {
      pointFunc.exec(0, 0, agent.tween);
      p.line(0, 0, agent.l, 0);
      pointFunc.exec(agent.l, 0, agent.tween);
    }
    ,
    function (agent) {
      pointFunc.exec(0, 0, agent.tween);
      let tw = agent.tweenPowReturn();
      p.noFill();
      p.beginShape(p.POINTS);
      for (let dx = 0.0; dx < agent.l; dx += 1.0) {
        let y = Math.sin(dx / agent.l * Math.PI) * sigFunc.exec(dx, tw, agent.l) * tw;
        p.vertex(dx, y * 50);
      }
      p.endShape();
      p.fill(255);
      pointFunc.exec(agent.l, 0, agent.tween);
    }
  ]);

  let startFrame;
  let targetII;
  let agents = [];
  let autoPilot = true;
  let doUpdate = true;

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(1280/2, 560/2);
    p.frameRate(60);
    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

  p.keyPressed = function () {
    if(!autoPilot) {
      startFrame = p.frameCount;
      doUpdate = true;
    }
  }

  p.draw = function () {
    let t = getCount() / 60.0;
    if ((autoPilot && getCount() % 60 == 0) || (!autoPilot && doUpdate)) {
      doUpdate = false;
      targetII = Math.floor(p.random(-1, 2));
      {
        globalTransformFunc.update();
        backgroundFunc.update();
        orderFunc.update();
        transformFunc.update();
        sigFunc.update();
        pointFunc.update();
        lineFunc.update();
      }
    }

    p.background(0);
    p.stroke(255);
    p.strokeWeight(2);

    p.translate(p.width / 2, p.height / 2);

    let tween = 0.0;
    if(autoPilot) {
      tween = (t * 1.0 % 1.0) * 2.0 - 1.0;
    }
    else {
      tween = p.constrain((t * 1.0) * 2.0 - 1.0, -1.0, 1.0);
    }

    globalTransformFunc.exec(tween);

    for (let ii = -2; ii <= 2; ii++) {
      for (let jj = 0; jj < 2; jj++) {
        let agent = new Agent(t, tween, ii, jj, ii == targetII && jj == 1);
        agent.draw();

        if(ii != targetII) break;
      }
    }

    p.syphonServer.sendScreen();
  }
};

var p080 = new p5(s);