// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let video;
let envImage;
let poses = [];
let sh;

let poseNet;

let videoFrameRate = 59.94;
let curTime = 0;
let isSetup = false;

let clipName = "clip4.mp4";
let frameNums = [];
let avatars = [];

let mode;

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
  poses = results;
  // processKeypoints();
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
  // Hide the video element, and just show the canvas
  video.hide();

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', onPose);
  video.speed(0.5);
}

function modelReady() {
  loop();
}

function draw() {
  background(0);

  // We can call both functions to draw all keypoints and the skeletons
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
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (j < 5 && keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function draw3D() {
  if (_renderer.name != "p5.RendererGL") {
    return;
  }
  background(0);
  translate(-width / 2, -height / 2);

  colorMode(RGB, 255);

  sh.setUniform('uBrighter', 0.0);

  texture(video);
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
  for (let i = 0; i < poses.length; i++) {
    push();
    let sat = 255.0;
    // let sat = map(index, frameNums[i] + 60, frameNums[i] + 20, 0, 255);
    // sat = constrain(sat, 0, 255);
    let point = poses[i].pose.keypoints[0].position;
    point.r = 10;
    translate(point.x, point.y);
    texture(envImage);
    rotateY(PI * -0.5);
    let hsv = HSVtoRGB(map(point.x, 0.0, width, 0.0, 1.0), 0.8, 0.8);
    sh.setUniform('uMaterialColorOverride', [hsv.r, hsv.g, hsv.b]);
    // sh.setUniform('uMaterialColorOverride', [0.5, 0.5, 0.5]);
    sphere(point.r * sat / 255.0 * 2.0);
    pop();
  }
}
