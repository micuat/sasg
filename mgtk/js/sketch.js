var s = function (p) {
  let name;

  function Agent (t, tween, ii, jj, isTarget) {
    this.t = t;
    this.ii = ii;
    this.jj = jj;
    this.isTarget = isTarget;
    this.tween = tween;
    this.tween = orderFunc(this);
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
      backgroundFunc(this);

      this.l = p.width / 3.0;
      p.translate(-this.l / 2.0, 0);
      this.l = transformFunc(this);
      lineFunc(this);

      p.pop();
    }
  }

  let globalTransformFunc;
  let backgroundFunc;
  let orderFunc;
  let transformFunc;
  let lineFunc;
  let sigFunc;
  let pointFunc;
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
        globalTransformFunc = p.random([
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
        ])
        backgroundFunc = p.random([
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
        orderFunc = p.random([
          function (agent) {
            return p.constrain(agent.tween * 1.25 + agent.ii * 0.25, -1, 1);
          }
          ,
          function (agent) {
            return p.constrain(agent.tween * 1.25 - agent.ii * 0.25, -1, 1);
          }
          ,
          function (agent) {
            return p.constrain(agent.tween * 1.25 - Math.abs(agent.ii) * 0.25, -1, 1);
          }
          ,
          function (agent) {
            return agent.tween;
          }
        ]);
        transformFunc = p.random([
          function (agent) {
            p.translate(0.0, agent.tweenPowReturn() * 150, 0.0);
            return agent.l;
          }
          ,
          function (agent) {
            p.translate(0.0, agent.tweenPowReturn() * -150, 0.0);
            return agent.l;
          }
          ,
          function (agent) {
            return (1.0 - agent.tweenPowReturn()) * agent.l;
          }
          ,
          function (agent) {
            p.translate(agent.l * 0.5, 0);
            p.scale(-1, 1);
            p.translate(-agent.l * 0.5, 0);
            return (1.0 - agent.tweenPowReturn()) * agent.l;
          }
        ]);

        sigFunc = p.random([
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
        pointFunc = p.random([
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
        lineFunc = p.random([
          function (agent) {
            pointFunc(0, 0, agent.tween);
            p.line(0, 0, agent.l, 0);
            pointFunc(agent.l, 0, agent.tween);
          }
          ,
          function (agent) {
            pointFunc(0, 0, agent.tween);
            let tw = agent.tweenPowReturn();
            p.noFill();
            p.beginShape(p.POINTS);
            for (let dx = 0.0; dx < agent.l; dx += 1.0) {
              let y = Math.sin(dx / agent.l * Math.PI) * sigFunc(dx, tw, agent.l) * tw;
              p.vertex(dx, y * 50);
            }
            p.endShape();
            p.fill(255);
            pointFunc(agent.l, 0, agent.tween);
          }
        ]);
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

    globalTransformFunc(tween);

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