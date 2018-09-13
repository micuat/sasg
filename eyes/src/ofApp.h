// ofxFaceTrack2 example: SIMPLE EXAMPLE
//
// This example shows minimal usage of the ofxFaceTracker2 addon,
// doing simple landmark detection and pose estimation
//

#pragma once

#include "ofMain.h"
#include "ofxGui.h"
#include "ofxFaceTracker2.h"
#include "ofxAutoReloadedShader.h"
#include "ofxPubSubOsc.h"
#include "ofxSyphon.h"

static const int faces[] = { 0,17,18,20,23,24,19,20,24,25,26,16,26,45,16,46,14,15,45,46,15,16,45,15,35,13,14,46,35,14,54,12,13,35,54,13,35,53,54,47,35,46,25,45,26,54,11,12,44,45,25,24,44,25,29,35,47,55,10,11,54,55,11,44,46,45,20,21,23,42,29,47,43,44,24,23,43,24,44,47,46,43,47,44,29,30,35,21,22,23,56,9,10,55,56,10,35,52,53,28,29,42,64,55,54,23,22,43,43,42,47,53,64,54,22,42,43,34,52,35,56,8,9,22,27,42,65,55,64,53,63,64,27,28,42,57,8,56,30,34,35,65,56,55,52,63,53,33,52,34,65,66,56,66,57,56,51,63,52,33,51,52,30,33,34,21,27,22,58,7,57,57,7,8,50,51,33,51,62,63,30,32,33,58,57,66,67,58,66,61,62,51,31,30,29,32,50,33,39,29,28,39,28,27,21,39,27,31,32,30,40,31,29,39,40,29,50,61,51,6,7,58,59,6,58,59,58,67,49,61,50,31,49,50,31,50,32,38,39,21,60,59,67,40,41,31,41,2,31,20,38,21,2,3,31,48,49,31,3,48,31,48,60,49,3,4,48,48,5,59,5,6,59,60,48,59,19,38,20,38,40,39,19,37,38,4,5,48,1,2,41,37,41,40,37,40,38,36,1,41,18,37,19,36,41,37,18,36,37,17,0,36,0,1,36,18,17,36,49,60,61 };

// just outline
//int faces[] = {0,17,18,20,23,24,19,20,24,25,26,16,26,24,15,24,23,15,22,14,15,23,22,15,16,26,15,22,13,14,22,3,13,4,12,13,3,4,13,4,11,12,25,24,26,21,3,22,4,5,11,6,10,11,5,6,11,2,3,21,20,21,23,6,8,10,6,7,8,21,22,23,8,9,10,1,2,21,19,1,20,20,1,21,17,1,19,18,17,19,0,1,17};

// with nose
//int faces[] = {0,17,18,20,23,24,19,20,24,25,26,16,24,23,15,23,28,15,26,24,15,29,14,15,28,29,15,16,26,15,30,13,14,29,30,14,30,12,13,25,24,26,30,11,12,22,28,23,27,28,22,30,10,11,20,21,23,30,6,10,6,8,10,6,7,8,21,22,23,8,9,10,5,6,30,4,5,30,21,27,22,3,4,30,2,30,29,20,19,28,19,1,28,21,20,28,1,29,28,21,28,27,2,3,30,1,2,29,17,1,19,18,17,19,0,1,17};

// with small nose
//int faces[] = { 0,17,18,20,23,24,19,20,24,25,26,16,24,23,15,23,28,15,26,24,15,28,14,15,16,26,15,30,13,14,28,30,14,30,12,13,25,24,26,30,11,12,22,28,23,30,10,11,20,21,23,30,6,10,6,8,10,6,7,8,21,22,23,8,9,10,5,6,30,4,5,30,21,28,22,3,4,30,20,19,28,19,1,28,21,20,28,2,30,28,1,2,28,2,3,30,17,1,19,18,17,19,0,1,17 };

static const int points[136][2] = { { 487,298 },{ 489,345 },{ 497,392 },{ 507,437 },{ 521,481 },{ 543,521 },{ 573,555 },{ 609,584 },{ 650,591 },{ 689,585 },{ 722,555 },{ 751,520 },{ 775,479 },{ 788,432 },{ 794,385 },{ 800,337 },{ 800,290 },{ 510,279 },{ 533,259 },{ 565,254 },{ 597,258 },{ 626,271 },{ 672,273 },{ 700,259 },{ 732,254 },{ 762,256 },{ 782,277 },{ 652,302 },{ 652,332 },{ 651,361 },{ 651,392 },{ 617,414 },{ 634,419 },{ 652,425 },{ 668,421 },{ 684,417 },{ 545,307 },{ 563,300 },{ 583,301 },{ 600,313 },{ 581,317 },{ 561,316 },{ 694,313 },{ 710,300 },{ 731,300 },{ 748,306 },{ 734,316 },{ 713,317 },{ 592,484 },{ 612,468 },{ 634,458 },{ 650,465 },{ 666,461 },{ 687,473 },{ 705,489 },{ 686,513 },{ 666,522 },{ 647,523 },{ 630,520 },{ 609,508 },{ 602,485 },{ 634,480 },{ 650,482 },{ 666,482 },{ 695,490 },{ 664,492 },{ 648,492 },{ 631,489 },{ 487,298 },{ 489,345 },{ 497,392 },{ 507,437 },{ 521,481 },{ 543,521 },{ 573,555 },{ 609,584 },{ 650,591 },{ 689,585 },{ 722,555 },{ 751,520 },{ 775,479 },{ 788,432 },{ 794,385 },{ 800,337 },{ 800,290 },{ 510,279 },{ 533,259 },{ 565,254 },{ 597,258 },{ 626,271 },{ 672,273 },{ 700,259 },{ 732,254 },{ 762,256 },{ 782,277 },{ 652,302 },{ 652,332 },{ 651,361 },{ 651,392 },{ 617,414 },{ 634,419 },{ 652,425 },{ 668,421 },{ 684,417 },{ 545,307 },{ 563,300 },{ 583,301 },{ 600,313 },{ 581,317 },{ 561,316 },{ 694,313 },{ 710,300 },{ 731,300 },{ 748,306 },{ 734,316 },{ 713,317 },{ 592,484 },{ 612,468 },{ 634,458 },{ 650,465 },{ 666,461 },{ 687,473 },{ 705,489 },{ 686,513 },{ 666,522 },{ 647,523 },{ 630,520 },{ 609,508 },{ 602,485 },{ 634,480 },{ 650,482 },{ 666,482 },{ 695,490 },{ 664,492 },{ 648,492 },{ 631,489 } };

class VideoCircleBuffer {
public:
	int maxFrame;
	ofFbo lerpFrame;
	vector<ofFbo> frames;
	vector<vector<glm::vec2> > imagePointses;
	bool empty;

	int framePosition;

	ofxAutoReloadedShader mixShader;

	VideoCircleBuffer() {
		setMaxFrame(10);
		mixShader.load("Shaders/mix");
	}

	void setMaxFrame(int mf) {
		maxFrame = mf;
		lerpFrame.allocate(1280, 720, GL_RGBA);
		frames.resize(maxFrame, ofFbo());
		for (int i = 0; i < maxFrame; i++) {
			frames.at(i).allocate(1280, 720, GL_RGBA);
		}
		imagePointses.resize(maxFrame, vector<glm::vec2>());
		empty = true;
	}

	// https://gamedev.stackexchange.com/questions/23743/whats-the-most-efficient-way-to-find-barycentric-coordinates
	// Compute barycentric coordinates (u, v, w) for
	// point p with respect to triangle (a, b, c)
	void Barycentric(glm::vec2 p, glm::vec2 a, glm::vec2 b, glm::vec2 c, float &u, float &v, float &w)
	{
		glm::vec2 v0 = b - a, v1 = c - a, v2 = p - a;
		float d00 = glm::dot(v0, v0);
		float d01 = glm::dot(v0, v1);
		float d11 = glm::dot(v1, v1);
		float d20 = glm::dot(v2, v0);
		float d21 = glm::dot(v2, v1);
		float denom = d00 * d11 - d01 * d01;
		v = (d11 * d20 - d01 * d21) / denom;
		w = (d00 * d21 - d01 * d20) / denom;
		u = 1.0f - v - w;
	}

	glm::vec2 toGlm(const int* a) {
		return glm::vec2(a[0], a[1]);
	}

	void prepareMesh(ofMesh& m, vector<glm::vec2> vs, float eyeSlider, float mouthSlider) {
		int count = 0;
		for (auto& v : points) {
			m.addVertex(glm::vec3(v[0], v[1], 0));
			count++;
		}

		// indices start from 1
		// l eye 37-42 : in 2, 20, 29 triangle
		// r eye 43-48 : in 16, 24, 29 triangle

		// indices start from 0
		// l eye 36-41 : in 1, 19, 28 triangle
		// r eye 42-47 : in 15, 23, 28 triangle

		count = 0;
		for (auto& vt : vs) {
			if (ofInRange(count, 36, 41)) {
				// left eye
				float u, v, w;
				Barycentric(toGlm(points[count]), toGlm(points[1]), toGlm(points[19]), toGlm(points[28]), u, v, w);
				auto t = glm::lerp(glm::vec2(u * vs.at(1) + v * vs.at(19) + w * vs.at(28)), glm::vec2(vt[0], vt[1]), (float)eyeSlider);
				m.addTexCoord(glm::vec2(t.x, t.y));
			}
			else if (ofInRange(count, 42, 47)) {
				// right eye
				float u, v, w;
				Barycentric(toGlm(points[count]), toGlm(points[15]), toGlm(points[23]), toGlm(points[28]), u, v, w);
				auto t = glm::lerp(glm::vec2(u * vs.at(15) + v * vs.at(23) + w * vs.at(28)), glm::vec2(vt[0], vt[1]), (float)eyeSlider);
				m.addTexCoord(glm::vec2(t.x, t.y));
			}
			else if (ofInRange(count, 48, 67)) {
				// mouth
				float u, v, w;
				Barycentric(toGlm(points[count]), toGlm(points[6]), toGlm(points[10]), toGlm(points[30]), u, v, w);
				auto t = glm::lerp(glm::vec2(u * vs.at(6) + v * vs.at(10) + w * vs.at(30)), glm::vec2(vt[0], vt[1]), (float)mouthSlider);
				m.addTexCoord(glm::vec2(t.x, t.y));
			}
			else {
				m.addTexCoord(glm::vec2(vt.x, vt.y));
			}
			count++;
		}
		for (int i = 0; i < sizeof(faces) / sizeof(*faces); i += 3) {
			m.addIndex(faces[i]);
			m.addIndex(faces[i + 1]);
			m.addIndex(faces[i + 2]);
		}
	}

	void addFrame(ofTexture tex, vector<glm::vec2> imagePoints, float eyeSlider, float mouthSlider) {
		framePosition = (framePosition + 1) % maxFrame;
		frames.at(framePosition).begin();
		ofClear(0);
		//tex.draw(0, 0);

		ofMesh m;
		prepareMesh(m, imagePoints, eyeSlider, mouthSlider);

		tex.bind();
		m.draw();
		tex.unbind();
		frames.at(framePosition).end();
		imagePointses.at(framePosition) = imagePoints;
		empty = false;
	}

	ofTexture getFrame() {
		//return frames.at(framePosition).getTexture();
		return lerpFrame.getTexture();
	}

	void updateLerpFrame(float _p) {
		float p = ofClamp(_p, 0.0f, 1.0f);
		auto& f0 = frames.at((framePosition - 1 + maxFrame) % maxFrame);
		auto& f1 = frames.at(framePosition);

		lerpFrame.begin();
		ofEnableAlphaBlending();

		mixShader.begin();
		mixShader.setUniform1f("p", p);
		mixShader.setUniformTexture("f0", f0.getTexture(), 0);
		mixShader.setUniformTexture("f1", f1.getTexture(), 1);
		ofDrawPlane(lerpFrame.getWidth() * 0.5f, lerpFrame.getHeight() * 0.5f, lerpFrame.getWidth(), lerpFrame.getHeight());
		mixShader.end();

		lerpFrame.end();
	}
	vector<glm::vec2> getImagePoints() {
		return imagePointses.at(framePosition);
	}

	bool isEmpty() {
		return empty;
	}
};

class ofApp : public ofBaseApp{
public:
    void setup();
    void setupLut(string);
	void setupLuts();
	void setupGui();
	void update();
	void draw();
	void drawMainTexture();
	void keyPressed(int);
    void windowResized(int w, int h);
    ofxFaceTracker2 tracker0;
    ofxFaceTracker2 tracker1;
    ofVideoGrabber grabber;
    ofVideoPlayer input0;
    ofImage input1;
    ofxAutoReloadedShader shader;
    
    vector<glm::vec2> facePoints;

	VideoCircleBuffer vcb;

    float eyeTween = 0.5;
    
    ofFbo mainTexture;

    // LUT
    GLuint texture3D;
    int LUTsize = 32;
    string LUTpath;
    struct RGB { float r, g, b; };
	vector<string> lutList;
	int curLut;

	// GUI
	ofxFloatSlider eyeSlider;
	ofxFloatSlider mouthSlider;
	ofxFloatSlider qualitySlider;
	ofxLabel guiLutLabel;
	ofxPanel gui;
    
    ofxSyphonServer mainOutputSyphonServer;

    string doTracking;
};
