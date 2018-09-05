var video;


function setup() {
  video = createVideo('assets/clip4.webm');
  video.elt.muted = true;
  video.size(720 * 2, 1280)
  video.loop();
  video.hide();
  createCanvas(720, 1280);
}

function draw() {
  background(0);
  tint(255, map(mouseX, 0, width, 255, 0));
  image(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
  tint(255, map(mouseX, 0, width, 0, 255));
  image(video, 0, 0, video.width, video.height, video.width/2, 0, video.width, video.height);
}