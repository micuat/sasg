#include "ofApp.h"

bool testMode = false;

//--------------------------------------------------------------
void ofApp::setup() {
	//ofSetLogLevel(OF_LOG_NOTICE);
    ofSetFrameRate(30);

	setupGui();

    ofEnableArbTex();
    
    mainTexture.allocate(ofGetWidth(), ofGetHeight(), GL_RGBA);

    // ofxSubscribeOsc(8001, "/mm/swapper/eyetween", eyeTween);
    ofxPublishOsc("localhost", 13000, "/face/points", facePoints);
    facePoints.resize(68);

    // Setup tracker
	tracker0.setup();
	tracker1.setup();

	if (testMode) {
		input0.load(ofToDataPath("clip.mp4"));
		input0.setSpeed(0.5f);
		input0.play();
	}
	else {
		// Setup grabber
        auto cameras = grabber.listDevices();
        if(cameras.size() > 1) {
            // USB capture
            int index = 0;
            for(int i = 0; i < cameras.size(); i++) {
                if(cameras.at(i).deviceName.find("USB Capture HDMI") == 0) {
                    index = i;
                    break;
                }
            }
            grabber.setDeviceID(index);
            grabber.setup(1280, 720);
        }
        else {
            grabber.setDeviceID(0);
            grabber.setup(1280, 720);
        }
	}
	input1.load(ofToDataPath("input1.jpg"));

	shader.load("Shaders/tone");
	ofEnableAlphaBlending();
    
    mainOutputSyphonServer.setName("Face Output");
}

//--------------------------------------------------------------
void ofApp::setupLut(string filename) {
}

void ofApp::setupLuts() {
}

//--------------------------------------------------------------
void ofApp::setupGui() {
	gui.setup();
	gui.add(eyeSlider.setup("eye deform", 0.5f, 0.0f, 1.0f));
	gui.add(mouthSlider.setup("mouth deform", 0.5f, 0.0f, 1.0f));
	gui.add(qualitySlider.setup("tracking quality", 0.5f, 0.0f, 1.0f));
	gui.add(guiLutLabel.setup("LUT", ""));

	qualitySlider.unregisterMouseEvents();
	guiLutLabel.unregisterMouseEvents();
	gui.setPosition(300, 500);
	gui.setWidthElements(500);
}

//--------------------------------------------------------------
void ofApp::update() {
	if (testMode) {
		input0.update();
		if (true || input0.isFrameNew()) {
			tracker0.update(input0);
		}
	}
	else {
		grabber.update();
		if (grabber.isFrameNew()) {
			tracker0.update(grabber);
            if(tracker0.getInstances().size() > 0) {
                auto points = tracker0.getInstances().at(0).getLandmarks().getImagePoints();
                int i = 0;
                for(auto& p: points) {
                    facePoints.at(i).x = p.x;
                    facePoints.at(i).y = p.y;
                    i++;
                }
            }
		}
	}

//    if (ofGetFrameNum() % 10 == 0 || vcb.isEmpty()) {
//        if (tracker0.getInstances().size() > 0) {
//            auto points = tracker0.getInstances().at(0).getLandmarks().getImagePoints();
//            if (testMode) {
//                vcb.addFrame(input0.getTexture(), points, eyeSlider, mouthSlider);
//            }
//            else {
//                vcb.addFrame(grabber.getTexture(), points, eyeSlider, mouthSlider);
//            }
//        }
//    }
//    vcb.updateLerpFrame((ofGetFrameNum() % 30) / 30.0f);
//    tracker1.update(input1);
}

//--------------------------------------------------------------
void ofApp::draw() {
	ofBackground(0);
    grabber.draw(0,0);
    tracker0.drawDebug();

//    // check if there is a face
//    if (tracker0.getInstances().size() == 0 || tracker1.getInstances().size() == 0) {
//        qualitySlider = qualitySlider - 0.01f;
//        if (qualitySlider < 0.0f) qualitySlider = 0.0f;
//    }
//    else {
//        qualitySlider = qualitySlider + 0.01f;
//        if (qualitySlider > 1.0f) qualitySlider = 1.0f;
//    }
//
//    drawMainTexture();
//
//    mainTexture.draw(0, 0);
//    gui.draw();
//
//    mainOutputSyphonServer.publishScreen();
}

//--------------------------------------------------------------
void ofApp::drawMainTexture() {
	mainTexture.begin();
	ofBackground(0);
	//ofScale(0.5f, 0.5f);

	// Draw camera image
	if (testMode) {
		input0.draw(0, 0);
		//vcb.getFrame().draw(0, input0.getHeight());
	}
	else {
		grabber.draw(0, 0);
		//vcb.getFrame().draw(0, input0.getHeight());
	}
	//tracker0.drawDebug();
	//ofPopMatrix();

	if (qualitySlider > 0.0f && vcb.isEmpty() == false && tracker0.getInstances().size() > 0) {
		for (int j = 0; j < tracker0.getInstances().size(); j++) {
			auto vs0 = vcb.getImagePoints();
			auto vs1 = tracker1.getInstances().at(0).getLandmarks().getImagePoints();

			ofMesh m;
			int count = 0;
			for (auto& v : tracker0.getInstances().at(j).getLandmarks().getImagePoints()) {
				m.addVertex(glm::vec3(v.x, v.y, 0));
				if (false && count < 27) { // contour
					m.addColor(ofFloatColor(1.0f, 1.0f, 1.0f, 0.0f));
				}
				else {
					m.addColor(ofFloatColor(1.0f, 1.0f, 1.0f, qualitySlider));
				}
				count++;
			}

			count = 0;
			for (auto& vt : points) {
				m.addTexCoord(glm::vec2(vt[0], vt[1]));
				count++;
			}
			for (int i = 0; i < sizeof(faces) / sizeof(*faces); i += 3) {
				m.addIndex(faces[i]);
				m.addIndex(faces[i + 1]);
				m.addIndex(faces[i + 2]);
			}

			vcb.getFrame().bind();
			m.draw();
			vcb.getFrame().unbind();
		}
	}

	mainTexture.end();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key) {
}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){
    mainTexture.allocate(ofGetWidth(), ofGetHeight(), GL_RGBA);
}
