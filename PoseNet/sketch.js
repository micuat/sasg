// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let video;
let envImage;
let poses = [];
let sh;

let videoFrameRate = 59.94;
let curTime = 0;
let isSetup = false;

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
  video = createVideo('assets/clip4.mp4', () => {
    console.log("ready")
    setupPromise();
  });
  sh = loadShader('vert.glsl', 'frag.glsl');
  envImage = loadImage('assets/env.jpg');
}

function setup() {
  noLoop();
}

function setupPromise() {
  if (isSetup) return;
  isSetup = true;
  let aspectRatio = video.width / video.height;
  if(aspectRatio > 1.0) {
    createCanvas(720, 720 / aspectRatio, WEBGL);
  }
  else {
    createCanvas(720 * aspectRatio, 720, WEBGL);
  }
  pixelDensity(2.0);

  video.loop();
  video.volume(0);
  video.play();
  video.size(width, height);
  // Hide the video element, and just show the canvas
  video.hide();

  loop();
}

function draw() {
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
  // We can call both functions to draw all keypoints and the skeletons
  drawAvatars();

  // push();
  // translate(width/2,height/3*2);
  // texture(envImage);
  // // specularMaterial(255);
  // rotateY(PI * -0.5);
  // sphere(155.0);
  // pop();
}

function drawAvatars()  {
  let index = parseInt(video.time() * videoFrameRate);

  for(let i = 0; i < frameNums.length; i++) {
    let frame;
    if(index - 60 > frameNums[i]) {
      continue;
    }
    if(index <= frameNums[i]) {
      continue;
    }
    frame = avatars[i];

    if(frame == undefined || frame.length == undefined) continue;
    for (let avatar of frame) {
      for (let point of avatar) {
        push();
        let sat = map(index, frameNums[i] + 60, frameNums[i] + 20, 0, 255);
        sat = constrain(sat, 0, 255);
        translate(point.x, point.y);
        texture(envImage);
        // specularMaterial(255);
        rotateY(PI * -0.5);
        let hsv = HSVtoRGB(map(point.c, 0.0, 255.0, 0.0, 1.0), 0.8, 0.8);
        sh.setUniform('uMaterialColorOverride', [hsv.r, hsv.g, hsv.b]);
        sphere(point.r * sat / 255.0);
        pop();
      }
    }
  }
}
