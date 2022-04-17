let facemesh;
let video;
let predictions = [];
let ratio = 0;
let img_eyes_open;
let img_eyes_closed;
let eyes_open = true;
let initial_eyes_open = true;
let seed_animation;
let start_button;
let reset_button;
let game_play = false;
let game_end = false;
let end_time;
let seed_animation_play = false;
let model_ready = false;
let game_start_time;
let counter;

function preload() {
  seed_animation = loadImage('assets/seed.gif');
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  
  // Start Button
  start_button = createButton('Start');
  start_button.position(width/2, 400);
  start_button.mousePressed(gamePlay);
  start_button.hide()
  
  // Reset Button
  reset_button = createButton('Reset');
  reset_button.position(width/2, 400);
  reset_button.mousePressed(gameReset);
  reset_button.hide()
  
  img_eyes_open = loadImage('assets/open_cropped.jpg');
  img_eyes_closed = loadImage('assets/closed_cropped.jpg');
  seed_animation.resize(400, 400);
  seed_animation.delay(10000);

  facemesh = ml5.facemesh(video, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new predictions are made
  facemesh.on("predict", results => {
    predictions = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  console.log("Model ready!");
  model_ready = true;
  start_button.show();
}

function draw() {  

  background(0);
  
  eyesOpen();
  eyeAntimation();
  
  if (game_play) {
    image(seed_animation,width/2 - 200, height/2 - 200);
    if (initial_eyes_open) {
      if (eyes_open) {
        seed_animation.pause()
      } else {
        seed_animation.play()
        if (counter < 300) {
          counter += 1;  
        } else {
          initial_eyes_open = false;
        }        
      }
    } else {
      if (eyes_open) {
        seed_animation.pause()
        game_play = false;
        game_end = true;
        if (!end_time) {
          end_time = millis();  
        }
        reset_button.show()
      } else {
        seed_animation.play()
      }      
    }
  }
  
  if (game_end) {
    gameEnd();
  }
  
  fill(255);
  text("Close your eyes for 5 minutes for nice things to grow", width/2 - 384/2, height/2 - 70);
}

// A function to draw ellipses over the detected keypoints
function eyesOpen() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;
    
    const [LtopX, LtopY] = keypoints[159];
    const [LbottomX, LbottomY] = keypoints[145];
    const [LrightX, LrightY] = keypoints[33];
    const [LleftX, LleftY] = keypoints[133];
    
    const [RtopX, RtopY] = keypoints[386];
    const [RbottomX, RbottomY] = keypoints[374];
    const [RrightX, RrightY] = keypoints[362];
    const [RleftX, RleftY] = keypoints[263];
    
    ratio = ((LleftX - LrightX) + (RleftX - RrightX)) / ((LbottomY - LtopY) + (RbottomY - RtopY));
  }
  
  background(0);
  fill(0, 255, 0);
  textSize(12);
  //text(ratio, 10, 30);
  //console.log(ratio);
  
  if (model_ready) {
    if (ratio < 2.9) {
      eyes_open = true;
      text("close your eyes", 10, 60);
      text(ratio, 10, 30);
    } else {
      eyes_open = false;
      text("manifesting", 10, 60);
      text(ratio, 10, 30);
    }
  } else {
    text("loading...", 10, 60);
  }
  
  text("initial_eyes: " + initial_eyes_open, 10, 80);
  text("game_play: " + game_play, 10, 90);
  text("game_end: " + game_end, 10, 100);
  text("counter: " + counter, 10, 110);
  
}

function eyeAntimation() {
  if (eyes_open) {
    image(img_eyes_open, width/2 - 384/2, height/2 - 111/2, 384, 111);
  } else {
    image(img_eyes_closed, width/2 - 384/2, height/2 - 111/2, 384, 111);
  }
}

function seedAnimation() {
  if (seed_animation_play) {
    seed_animation_play = false;
  } else {
    seed_animation_play = true;
    start_button.hide();
  }
}

function gamePlay() {
  if (game_play) {
    game_play = false;
  } else {
    game_play = true;
    start_button.hide();
    game_start_time = millis();
    counter = 0;
  }
}

function gameEnd() {
  background(0);
  let game_time = int((end_time - game_start_time)/1000);
  text("you closed your eyes for " + game_time + " seconds", 100, height/2);
}

function gameReset() {
  initial_eyes_open = true;
  game_play = false;
  game_end = false;
  seed_animation_play = false;
  counter = 0;
  reset_button.hide()
  start_button.show()
}
