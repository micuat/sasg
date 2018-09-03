// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let video;
let envImage;
let sh;

let poseNet;

let videoFrameRate = 59.94;
let curTime = 0;
let isSetup = false;

let clipName = "clip4.mp4";
let posesQueue = [];

let mode;

let pg2d;
let pgBack;

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

function setupPromise() {
  if (isSetup) return;
  isSetup = true;
  let aspectRatio = video.width / video.height;
  let longSide = 720;
  if (aspectRatio > 1.0) {
    createCanvas(longSide, longSide / aspectRatio, mode);
  }
  else {
    createCanvas(longSide * aspectRatio, longSide, mode);
  }
  pixelDensity(2.0);

  video.loop();
  video.elt.muted = true;
  video.volume(0);
  video.play();
  video.size(width, height);
  video.speed(0.5);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', onPose);

  pg2d = createGraphics(width, height, P2D);
  pgBack = createGraphics(width, height, P2D);
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

function drawSkeleton(alpha) {
  pg2d.strokeWeight(1);
  for (let k = 20; k < posesQueue.length; k++) {
    pg2d.stroke(255, 255, 255, alpha * map(k, 0, posesQueue.length, 10, 155));
    let poses = posesQueue[k];
    for (let i = 0; i < poses.length; i++) {
      let skeleton = poses[i].skeleton;
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        pg2d.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
    }
  }
}

function draw3D() {
  if (_renderer.name != "p5.RendererGL") {
    return;
  }
  background(0);
  translate(-width / 2, -height / 2);

  let geomFader = map(sin(millis() * 0.001), -1, 1, 0, 1)
  stroke(255,255,255)
  colorMode(RGB, 255);
  pg2d.clear();
  drawSkeleton(geomFader);

  sh.setUniform('uBrighter', 0.0);

  pgBack.clear();
  pgBack.tint((1 - geomFader) * 255);
  pgBack.image(video, 0, 0, width, height);
  texture(pgBack);
  beginShape();
  vertex(0, 0, 0, 0, 0);
  vertex(width, 0, 0, 1, 0);
  vertex(width, height, 0, 1, 1);
  vertex(0, height, 0, 0, 1);
  endShape(CLOSE);

  texture(pg2d);
  beginShape();
  vertex(0, 0, 0, 0, 0);
  vertex(width, 0, 0, 1, 0);
  vertex(width, height, 0, 1, 1);
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
  drawAvatars();

  // push();
  // translate(width/2,height/3*2);
  // texture(envImage);
  // sh.setUniform('uMaterialColorOverride', [0.5, 0.5, 0.5]);
  // rotateY(PI * -0.5);
  // sphere(155.0);
  // pop();
}

function drawAvatars() {
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
      let hsv = HSVtoRGB(map(point.x, 0.0, width, 0.0, 1.0), 0.8, 0.8);
      sh.setUniform('uMaterialColorOverride', [hsv.r, hsv.g, hsv.b]);
      sphere(point.r * sat / 255.0 * 1.5);
      pop();
    }
  }
}
