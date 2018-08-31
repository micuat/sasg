// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let video;
let poseNet;
let poses = [];
let frameNums = [];
let avatars = [];

let videoFrameRate = 59.94;
let curTime = 0;
let looped = false;
let lastFrameNum = 0;
let isSetup = false;

function preload() {
  video = createVideo('assets/clip180811.mp4', () => {
    console.log("ready")
    setupPromise();
  });
}

function setup() {
  noLoop();
}

function onPose(results) {
  if (looped) return;
  poses = results;
  processKeypoints();
}

function setupPromise() {
  if (isSetup) return;
  isSetup = true;
  let aspectRatio = video.width / video.height;
  if(aspectRatio > 1.0) {
    createCanvas(720, 720 / aspectRatio);
  }
  else {
    createCanvas(720 * aspectRatio, 720);
  }
  pixelDensity(2.0);

  video.loop();
  video.elt.muted = true;
  video.play();
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', onPose);
  video.speed(0.5);

  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  loop();
}

function draw() {
  background(0);

  image(video, 0, 0, width, height);
  // We can call both functions to draw all keypoints and the skeletons
  drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function processKeypoints() {
  let frame = [];
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
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }

      if(j < 5) {
        let dw = 25;
        let dh = tall * 0.1;
        if(dh < 10) dh = 10;
        avatar.push({
          x: keypoint.position.x,
          y: keypoint.position.y,
          r: dh,
          c: 255 * i / 10.0
        });
      }
    }
    frame.push(avatar);
  }
  let curFrameNum = parseInt(video.time() * videoFrameRate);
  if(curFrameNum < lastFrameNum) {
    console.log("looped")
    looped = true;
    video.speed(1.0);
    console.log(JSON.stringify(frameNums))
    console.log(JSON.stringify(avatars))
    // poseNet.off('pose', onPose);
  }
  else {
    avatars.push(frame);
    frameNums.push(curFrameNum);
    lastFrameNum = curFrameNum;
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
