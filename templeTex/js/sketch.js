// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: r,
      g: g,
      b: b
  };
}

var frontPg;
var backPg;
var wavePg;

var s = function (p) {
  let name;
  let transformFunc;
  let startFrame;
  let shader, feedbackShader;
  let pg;
  let targetI;
  let autoPilot = true;
  let doUpdate = true;
  let curCol = [0, 0, 0];

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(1280/2, 560/2);
    p.frameRate(60);
    startFrame = p.frameCount;

    pg = p.createGraphics(p.width, p.height, p.P3D);
    if(frontPg == undefined)
      frontPg = p.createGraphics(p.width, p.height, p.P3D);
    if(backPg == undefined)
      backPg = p.createGraphics(p.width, p.height, p.P3D);
    if(wavePg == undefined)
      wavePg = p.createGraphics(100, 100);
    shader = p.loadShader(p.sketchPath(name + "/frag.glsl"));
  }

  function getCount() { return p.frameCount - startFrame };

  p.keyPressed = function () {
    if(!autoPilot) {
      startFrame = p.frameCount;
      doUpdate = true;
    }
  }

  p.draw = function () {
    p.background(0);
    p.stroke(255);

    if(getCount() % 60 == 0) {
      shader = p.loadShader(p.sketchPath(name + "/frag.glsl"));
    }
    if ((autoPilot && getCount() % 60 == 0) || (!autoPilot && doUpdate)) {
      doUpdate = false;
      targetI = Math.floor(p.random(0, 6));
    }

    let t = getCount() / 60.0;

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
    function fillAt(i) {
      pg.fill(colorSc[i][0], colorSc[i][1], colorSc[i][2]);
    }
    function strokeAt(i) {
      pg.stroke(colorSc[i][0], colorSc[i][1], colorSc[i][2]);
    }

    let lfo0 = 1.0;//Math.cos(t * Math.PI * 0.25) * 0.5 + 0.5;
    let tween;
    if(autoPilot) {
      tween = (t * 0.25 % 1.0) * 2.0 - 1.0;
    }
    else {
      tween = p.constrain(t * 0.25, 0.0, 1.0) * 2.0 - 1.0;
    }
    let tweenp = 2.0;
    if (tween < 0) {
      tween = Math.pow(p.map(tween, -1, 0, 0, 1), tweenp) * 0.5;
    }
    else {
      tween = 1.0 - Math.pow(p.map(tween, 0, 1, 1, 0), tweenp) * 0.5;
    }
    function tweenPowReturn () {
      if (tween < 0.5) {
        return p.map(tween, 0, 0.5, 0.0, 1.0);
      }
      else {
        return p.map(tween, 0.5, 1.0, 1.0, 0.0);
      }
    }

    pg.beginDraw();
    pg.noStroke();

    fillAt(7);
    pg.rect(0, 0, p.width, p.height);
    pg.translate(p.width / 2.0, p.height / 2.0);

    // let shape = p.createShape();
    for(let j = -4; j <= 4; j++) {
      pg.pushMatrix();
      pg.translate(j * 77, 0);
      if(j % 2 == 0)
        pg.rotate(tween * Math.PI * 2.0 + j * Math.PI / 6.0);
      else
        pg.rotate(-tween * Math.PI * 2.0 + (j+2) * Math.PI / 6.0);
      for(let icolor = 0; icolor < 2; icolor++) {
        if(icolor == 0)
          fillAt(((j+4) % 2) % 2 * 2 + 1);
        else {
          fillAt(((j+4) % 2) % 2 * 2);
        }
        let n = 3;
        if((j+2) % 2 == 0) n = 6;
        for(let i = 0; i < n; i++) {
          let tw = 0;
          if(i == targetI) tw = tweenPowReturn();

          pg.pushMatrix();
          pg.rotate(i / n * p.TWO_PI);

          if(icolor == 1)
          pg.scale(0.6, 0.95);

          pg.pushMatrix();
          pg.rotate(1.5 / 6.0 * p.TWO_PI);
          pg.translate(p.map(tw, 0.0, 1.0, -0.0, -40.0), 0);
          pg.beginShape();
          let da = 0.15;
          let r = 50;
          let angle = 0.0;
          r = 50;
          pg.vertex(r * Math.cos(angle - da), r * Math.sin(angle - da));
          r = 54;
          if(icolor == 1) r = 52;
          pg.vertex(r * Math.cos(angle), r * Math.sin(angle));
          r = 50;
          pg.vertex(r * Math.cos(angle + da), r * Math.sin(angle + da));
          r = 15;
          angle = (i + 0.5) / 6.0 * p.TWO_PI;

          pg.endShape();
          pg.popMatrix();
          // pg.rotate(-1.5 / 6.0 * p.TWO_PI);
          let w = p.map(tw, 0.0, 1.0, 40.0, -0.0);
          pg.rect(-7.5, 10, 15, w);
          pg.rect(-7.5, 10, 15, -10);
          pg.popMatrix();
        }
      }
      pg.popMatrix();
    }
    // pg.shape(shape, 0, 0);
    // p.image(pg, 0, 0);
    pg.endDraw();

    wavePg.beginDraw();
    wavePg.strokeWeight(2);
    for(let i = 0; i < 100; i++) {
      let y = Math.pow((p.noise(((i*0.1 - t * (2.0))), t * -0.0)), 4.0) * 250;
      wavePg.stroke(y);
      wavePg.line(i, 0, i, 100);
    }
    wavePg.endDraw();

    shader.set("iTime", t);
    shader.set("lfo0", lfo0);
    shader.set("lfo1", Math.cos(t * 1.0) * 0.5 + 0.5);
    shader.set("lfo2", Math.pow(Math.sin(t) * 0.5 + 0.5, 4.0));
    shader.set("vMirror", p.mouseX/800.0);
    let centerDirection = 0.99;//p.map(Math.sin(t * 0.1), -1, 1, 0.99, 1.0);
    shader.set("centerDirection", centerDirection);
    // let rgb = HSVtoRGB((t * 0.1) % 1.0, 1.0, 1.0);
    // shader.set("bgColor0", rgb.r, rgb.g, rgb.b);
    let frontColIdx = Math.floor(t % 3) * 2;
    let backColIdx = Math.floor(t % 3) * 2 + 1;
    curCol[0] = p.lerp(curCol[0], colorSc[frontColIdx][0] / 255.0, 0.05);
    curCol[1] = p.lerp(curCol[1], colorSc[frontColIdx][1] / 255.0, 0.05);
    curCol[2] = p.lerp(curCol[2], colorSc[frontColIdx][2] / 255.0, 0.05);
    shader.set("bgColor0", curCol[0], curCol[1], curCol[2]);
    // rgb = HSVtoRGB((t + 0.5) % 1.0, 1.0, 1.0);
    // shader.set("bgColor1", rgb.r, rgb.g, rgb.b);
    shader.set("bgColor1", colorSc[backColIdx][0] / 255.0,
    colorSc[backColIdx][1] / 255.0,
    colorSc[backColIdx][2] / 255.0);
    shader.set("pgTex", pg);
    shader.set("waveTex", wavePg);
    shader.set("backTex", backPg);
    shader.set("masterFader", p.oscFaders[0]);
    shader.set("feedbackFader", 1.0 - Math.pow(1.0 - p.oscFaders[4], 4.0));
    shader.set("phaseFader", p.oscFaders[5]);
    shader.set("xFader", p.oscFaders[6] * 10.0);
    shader.set("rAmountFader", p.oscFaders[7] * 1.0);
    frontPg.beginDraw();
    frontPg.filter(shader);
    frontPg.endDraw();

    p.resetShader();
    p.tint(255 * p.oscFaders[0]);
    p.image(frontPg, 0, 0);
    p.syphonServer.sendImage(frontPg);

    let intermediatePg = frontPg;
    frontPg = backPg;
    backPg = intermediatePg;
  }
};

var p080 = new p5(s);