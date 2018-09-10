// this example is used for rendering video
// http://localhost:8080/index.html

// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let video;
let envImage;
let sh;
let realWidth = 0;

let poseNet;

let preset = {
  "comp.mov": [{x: 0, y: -300}, {x: -50, y: 80}, {x: 50, y: 80}, {x: 0, y: -300}],
  "clip4.mp4": [{x: 0, y: -300}, {x: -50, y: 80}, {x: 50, y: 80}, {x: 0, y: -300}],
  "clip180811.mp4": [{x: 0, y: -300}, {x: -50, y: 80}, {x: 50, y: 80}, {x: 0, y: -300}],
  "clip180902.mov": [{x: 0, y: -400}, {x: -50, y: -10}, {x: 50, y: -10}, {x: 0, y: -250}],
  "clip180902_2.mov": [{x: 0, y: -300}, {x: -100, y: 100}, {x: 0, y: 100}, {x: 0, y: -300}],
}
let keys = ["clip4.mp4", "clip180902.mov", "clip180902_2.mov"];
let curPreset = preset[keys[0]];
let lerpPreset = preset[keys[0]];
let clipName = "comp.mov";
let posesQueue = [];

let geomFaderOverride = 0;

let mode;

let pg2d;
let pg3d;
let pgBack;

let tshirtTexts = ["Doing\nNothing",
"I WANNA\nGET\nBETTER",
"BUSINESS\nREPLY\nMAIL",
"VETEMENTS",
"STAY\nHERE WID\nME!",
"KNOWLEDGE\nIS\nPOWER",
"SHOOT\nPICTURES",
"THAT DAY DEVELOP\nSO OBVIOUS\nNOT",
"NOTHING\nCHANGES\nIF NOTHING\nCHANGES",
"It's\nLovely!",
"I KNOW YOU'RE\nIN A VERY FEEL\nHOUSE NOW\nBUCKET.\nBUT YOU MUST\nHOME MOTION\nTHE LIGHT.",
"NEW YORK\nTHEY WANTS\nALMOST EVERYTHING",
"SCULPTOR"];
let tshirtText = [tshirtTexts[0], tshirtTexts[1], tshirtTexts[2], tshirtTexts[3]];

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

function preload() {
  video = createVideo('assets/' + clipName, () => {
    console.log("ready")
    setupPromise();
  });
  sh = loadShader('vert.glsl', 'frag.glsl');
  envImage = loadImage('assets/env.jpg');
  font = loadFont('assets/Avenir.otf');
}

function setup() {
  // mode = P2D;
  mode = WEBGL;
  noLoop();
}

function onPose(results) {
  for (let i = 0; i < results.length; i++) {
    {
      let hmax = 0;
      let hmin = 1000;
      let skeleton = results[i].skeleton;
      // For every skeleton, loop through all body connections
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        hmin = Math.min(hmin, partA.position.y);
        hmin = Math.min(hmin, partB.position.y);
        hmax = Math.max(hmax, partA.position.y);
        hmax = Math.max(hmax, partB.position.y);
      }
      if (skeleton.length) {
        results[i].tall = hmax - hmin;
      }
      else {
        results[i].tall = 0;
        continue;
      }
    }
  }
  posesQueue.push(results);
  if (posesQueue.length > 30) {
    posesQueue.shift();
  }
}

function setScene(scene) {
  console.log("scene " + scene);
  curPreset = preset[keys[scene]];
  geomFaderOverride = 1.0;
}

function setupPromise() {
  pixelDensity(2.0);
  let aspectRatio = video.width / video.height;
  let longSide = 540;
  if (aspectRatio > 1.0) {
    createCanvas(longSide * aspectRatio , longSide, mode);
  }
  else {
    createCanvas(longSide, longSide / aspectRatio, mode);
  }
  realWidth = width;

  video.loop();
  video.elt.muted = true;
  video.volume(0);
  video.play();
  video.size(realWidth, height);
  video.speed(0.5);
  video.hide();

  // for debugging
  // video.elt.currentTime = 28;

  video.addCue(0.1, setScene, 0);
  video.addCue(34.0, setScene, 1);
  video.addCue(92.0, setScene, 2);

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', onPose);

  pg2d = createGraphics(realWidth, height, P2D);
  pg3d = createGraphics(realWidth, height, WEBGL);
  pgBack = createGraphics(realWidth, height, P2D);
}

function modelReady() {
  loop();
}

function draw() {
  background(0);

  if (mode == P2D) {
    draw2D();
  }
  else if (mode == WEBGL) {
    draw3D();
  }
}

function draw2D() {
  image(video, 0, 0, width, height);
  drawKeypoints();
  drawSkeleton();
}

function drawKeypoints() {
  for (let k = 30; k < posesQueue.length; k++) {
    let poses = posesQueue[k];
    for (let i = 0; i < poses.length; i++) {
      for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
        let keypoint = poses[i].pose.keypoints[j];
        if (j < 5 && keypoint.score > 0.2) {
          fill(255, 0, 0, 100);
          noStroke();
          ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
        }
      }
    }
  }
}

function drawTerrain(alpha) {
  for(let i in lerpPreset) {
    lerpPreset[i].x = lerp(lerpPreset[i].x, curPreset[i].x, 0.1);
    lerpPreset[i].y = lerp(lerpPreset[i].y, curPreset[i].y, 0.1);
  }
  let bleft = lerpPreset[0];
  let tleft = lerpPreset[1];
  let tright = lerpPreset[2];
  let bright = lerpPreset[3];

  pg2d.strokeWeight(1);
  pg2d.stroke(255, 255, 255, alpha * 155);
  pg2d.noFill();
  pg2d.beginShape(LINE_STRIP);
  pg2d.vertex(bleft.x, height + bleft.y);
  pg2d.vertex(width / 2 + tleft.x, height / 2 + tleft.y);
  pg2d.vertex(width / 2 + tright.x, height / 2 + tright.y);
  pg2d.vertex(width + bright.x, height + bright.y);
  pg2d.endShape();
}

function drawSkeleton(alpha) {
  pg2d.textFont(font);
  pg2d.textAlign(CENTER, TOP);

  if(frameCount % 150 == 0) {
    for(let i in tshirtText) {
      tshirtText[i] = random(tshirtTexts);
    }
  }

  for (let k = 20; k < posesQueue.length; k++) {
    pg2d.stroke(255, 255, 255, alpha * map(k, 0, posesQueue.length, 10, 155));
    let poses = posesQueue[k];
    for (let i = 0; i < poses.length; i++) {
      let skeleton = poses[i].skeleton;
      for (let j = 0; j < skeleton.length; j++) {
        if(k == posesQueue.length - 1 && j == 4) {
          pg2d.push();
          pg2d.textSize(poses[i].tall * 0.05);
          pg2d.fill(255, alpha * 255)
          let index = Math.floor(constrain(map(skeleton[4][0].position.x, 0, width, 0, 4), 0, 3));
          pg2d.text(tshirtText[index], lerp(skeleton[4][0].position.x, skeleton[1][1].position.x, 0.5), skeleton[1][1].position.y + 20);
          pg2d.pop();
        }
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        pg2d.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
    }
  }
}

let geomFader = 0.0;

function draw3D() {
  if (_renderer.name != "p5.RendererGL") {
    return;
  }
  background(0);
  translate(-width / 2, -height / 2);

  // let geomFader = map(mouseX, 0, width, 0, 1)
  // override!
  if (geomFaderOverride > 0.5) {
    geomFader = geomFader + 0.1;
    if(geomFader >= 5.0) {
      geomFaderOverride = 0.0;
    }
  }
  else {
    geomFader = lerp(geomFader, constrain(map(sin(millis() * 0.001 * 0.25 * Math.PI), -1, 1, -0.5, 1.5), 0, 1), 0.1);
  }
  let realGeomFader = constrain(geomFader, 0, 1);
  stroke(255, 255, 255)
  colorMode(RGB, 255);
  pg2d.clear();
  drawTerrain(realGeomFader);
  drawSkeleton(realGeomFader);

  sh.setUniform('uBrighter', 0.0);

  pgBack.clear();
  pgBack.tint((1 - realGeomFader) * 255);
  pgBack.image(video, 0, 0, realWidth, height);
  texture(pgBack);
  beginShape();
  vertex(0, 0, 0, 0, 0);
  vertex(realWidth, 0, 0, 1, 0);
  vertex(realWidth, height, 0, 1, 1);
  vertex(0, height, 0, 0, 1);
  endShape(CLOSE);

  texture(pg2d);
  beginShape();
  vertex(0, 0, 0, 0, 0);
  vertex(realWidth, 0, 0, 1, 0);
  vertex(realWidth, height, 0, 1, 1);
  vertex(0, height, 0, 0, 1);
  endShape(CLOSE);

  ambientLight(200, 200, 200);
  let lc = 150;
  directionalLight(lc, lc, lc, 0.25, 0.25, -0.5);
  directionalLight(lc, lc, lc, -0.25, 0.25, -0.5);

  colorMode(HSB, 255);
  shader(sh);
  sh.setUniform('uSampler', video);
  sh.setUniform('uBrighter', 1.0);
  drawAvatars(realGeomFader);
}

function drawAvatars(fader) {
  for (let j = 0; j < posesQueue.length; j++) {
    let poses = posesQueue[j];
    for (let i = 0; i < poses.length; i++) {
      push();
      let sat;
      if (j < 20) {
        sat = map(j, 0, 20, 0, 255);
      }
      else {
        sat = map(j, 50, 60, 255, 0);
      }
      sat = constrain(sat, 0, 255);
      let point = poses[i].pose.keypoints[0].position;
      point.r = poses[i].tall * 0.1;
      translate(point.x, point.y);
      texture(envImage);
      rotateY(PI * -0.5);
      let hsv = HSVtoRGB(map(point.x, 0.0, width, 0.0, 1.0), 0.4 * fader, 0.8);
      sh.setUniform('uMaterialColorOverride', [hsv.r, hsv.g, hsv.b]);
      sphere(point.r * sat / 255.0 * 1.5);
      pop();
    }
  }
}
