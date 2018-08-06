// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let sh;
let avatars = [];

function preload() {
  video = createVideo('assets/clip3.mp4', () => {
    console.log("ready")
    setupPromise();
  });
  sh = loadShader('vert.glsl', 'frag.glsl');
}

function setup() {
  noLoop();
  for(let i = 0; i < 30; i++) avatars.push([]);
}

function setupPromise() {
  let aspectRatio = video.width / video.height;
  if(aspectRatio > 1.0) {
    createCanvas(720, 720 / aspectRatio, WEBGL);
  }
  else {
    createCanvas(720 * aspectRatio, 720, WEBGL);
  }
  pixelDensity(1.0);

  // createCanvas(480, 720, WEBGL);
  console.log(aspectRatio)
  video.loop();
  video.volume(0);
  video.speed(0.5);
  video.play();
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  // select('#status').html('Model Loaded');
  loop();
}

function draw() {
  background(0);
  translate(-width / 2, -height / 2);

  colorMode(RGB, 255);

  texture(video);
  beginShape();
  vertex(0, 0, 0, 0, 0);
  vertex(width, 0, 0, 1, 0);
  vertex(width, height, 0, 1, 1);
  vertex(0, height, 0, 0, 1);
  endShape(CLOSE);

  ambientLight(50, 50, 50);
  directionalLight(255, 255, 255, 0.25, 0.25, 0);

  colorMode(HSB, 255);
  // shader(sh);
  // sh.setUniform('uSampler', video);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawAvatars();

  if(avatars.length > 30) {
    avatars.shift();
  }

  // drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  let frame = []
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    let avatar = [];
    // get size
    let tall = 0;
    {
      let hmax = 0;
      let hmin = 1000;
      let skeleton = poses[i].skeleton;
      // For every skeleton, loop through all body connections
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        stroke(255, 0, 0);
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        hmin = Math.min(hmin, partA.position.y);
        hmin = Math.min(hmin, partB.position.y);
        hmax = Math.max(hmax, partA.position.y);
        hmax = Math.max(hmax, partB.position.y);
      }
      if(skeleton.length) {
        tall = hmax - hmin;
      }
      else {
        continue;
      }
    }

    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        // fill(255, j / pose.keypoints.length * 255.0, 0);
        // noStroke();
        // ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }

      if(j < 5) {
        push();
        let dw = 25;
        let dh = tall * 0.1;
        if(dh < 10) dh = 10;
        noStroke();
        specularMaterial(255 * i / 10.0, 255, 255);
        translate(keypoint.position.x, keypoint.position.y);
        // sphere(dh);
        avatar.push({
          x: keypoint.position.x,
          y: keypoint.position.y,
          r: dh,
          c: 255 * i / 10.0
        });
        pop();
      }
    }
    frame.push(avatar);
  }
  avatars.push(frame);
}

function drawAvatars()  {
  let count = 0;
  for (let frame of avatars) {
    for (let avatar of frame) {
      for (let point of avatar) {
        push();
        noStroke();
        let sat = map(count, 0, avatars.length / 2, 0, 255);
        sat = constrain(sat, 0, 255);
        specularMaterial(point.c, sat, 255);
        translate(point.x, point.y);
        sphere(point.r * sat / 255.0);
        pop();
      }
    }
    count++;
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let hmax = 0;
    let hmin = 1000;
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      hmin = Math.min(hmin, partA.position.y);
      hmin = Math.min(hmin, partB.position.y);
      hmax = Math.max(hmax, partA.position.y);
      hmax = Math.max(hmax, partB.position.y);
    }
    if(skeleton.length)
    line(skeleton[0][0].position.x, hmin, skeleton[0][0].position.x, hmax)
  }
}
