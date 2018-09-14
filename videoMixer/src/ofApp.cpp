#include "ofApp.h"

// https://github.com/hvfrancesco/lpmt/blob/master/src/homography.cpp
void gaussian_elimination(float *input, int n)
{
    // ported to c from pseudocode in
    // http://en.wikipedia.org/wiki/Gaussian_elimination
    
    float * A = input;
    int i = 0;
    int j = 0;
    int m = n-1;
    while (i < m && j < n)
    {
        // Find pivot in column j, starting in row i:
        int maxi = i;
        for(int k = i+1; k<m; k++)
        {
            if(fabs(A[k*n+j]) > fabs(A[maxi*n+j]))
            {
                maxi = k;
            }
        }
        if (A[maxi*n+j] != 0)
        {
            //swap rows i and maxi, but do not change the value of i
            if(i!=maxi)
                for(int k=0; k<n; k++)
                {
                    float aux = A[i*n+k];
                    A[i*n+k]=A[maxi*n+k];
                    A[maxi*n+k]=aux;
                }
            //Now A[i,j] will contain the old value of A[maxi,j].
            //divide each entry in row i by A[i,j]
            float A_ij=A[i*n+j];
            for(int k=0; k<n; k++)
            {
                A[i*n+k]/=A_ij;
            }
            //Now A[i,j] will have the value 1.
            for(int u = i+1; u< m; u++)
            {
                //subtract A[u,j] * row i from row u
                float A_uj = A[u*n+j];
                for(int k=0; k<n; k++)
                {
                    A[u*n+k]-=A_uj*A[i*n+k];
                }
                //Now A[u,j] will be 0, since A[u,j] - A[i,j] * A[u,j] = A[u,j] - 1 * A[u,j] = 0.
            }
            
            i++;
        }
        j++;
    }
    
    //back substitution
    for(int i=m-2; i>=0; i--)
    {
        for(int j=i+1; j<n-1; j++)
        {
            A[i*n+m]-=A[i*n+j]*A[j*n+m];
            //A[i*n+j]=0;
        }
    }
}

void findHomography(ofPoint src[4], ofPoint dst[4], float homography[16])
{
    
    // create the equation system to be solved
    //
    // from: Multiple View Geometry in Computer Vision 2ed
    //       Hartley R. and Zisserman A.
    //
    // x' = xH
    // where H is the homography: a 3 by 3 matrix
    // that transformed to inhomogeneous coordinates for each point
    // gives the following equations for each point:
    //
    // x' * (h31*x + h32*y + h33) = h11*x + h12*y + h13
    // y' * (h31*x + h32*y + h33) = h21*x + h22*y + h23
    //
    // as the homography is scale independent we can let h33 be 1 (indeed any of the terms)
    // so for 4 points we have 8 equations for 8 terms to solve: h11 - h32
    // after ordering the terms it gives the following matrix
    // that can be solved with gaussian elimination:
    
    float P[8][9]=
    {
        {-src[0].x, -src[0].y, -1,   0,   0,  0, src[0].x*dst[0].x, src[0].y*dst[0].x, -dst[0].x }, // h11
        {  0,   0,  0, -src[0].x, -src[0].y, -1, src[0].x*dst[0].y, src[0].y*dst[0].y, -dst[0].y }, // h12
        
        {-src[1].x, -src[1].y, -1,   0,   0,  0, src[1].x*dst[1].x, src[1].y*dst[1].x, -dst[1].x }, // h13
        {  0,   0,  0, -src[1].x, -src[1].y, -1, src[1].x*dst[1].y, src[1].y*dst[1].y, -dst[1].y }, // h21
        
        {-src[2].x, -src[2].y, -1,   0,   0,  0, src[2].x*dst[2].x, src[2].y*dst[2].x, -dst[2].x }, // h22
        {  0,   0,  0, -src[2].x, -src[2].y, -1, src[2].x*dst[2].y, src[2].y*dst[2].y, -dst[2].y }, // h23
        
        {-src[3].x, -src[3].y, -1,   0,   0,  0, src[3].x*dst[3].x, src[3].y*dst[3].x, -dst[3].x }, // h31
        {  0,   0,  0, -src[3].x, -src[3].y, -1, src[3].x*dst[3].y, src[3].y*dst[3].y, -dst[3].y }, // h32
    };
    
    gaussian_elimination(&P[0][0],9);
    
    // gaussian elimination gives the results of the equation system
    // in the last column of the original matrix.
    // opengl needs the transposed 4x4 matrix:
    float aux_H[]= { P[0][8],P[3][8],0,P[6][8], // h11  h21 0 h31
        P[1][8],P[4][8],0,P[7][8], // h12  h22 0 h32
        0      ,      0,0,0,       // 0    0   0 0
        P[2][8],P[5][8],0,1
    };      // h13  h23 0 h33
    
    for(int i=0; i<16; i++) homography[i] = aux_H[i];
}

//--------------------------------------------------------------
void ofApp::setup(){
    ofSetEscapeQuitsApp(false);
    
    ofSetWindowTitle("videoMixer");
    ofSetWindowShape(1920, 1080);
    ofSetFrameRate(60);
    
    //setup our directory
    dir.setup();
    //setup our client
    client.setup();
    
    //register for our directory's callbacks
    ofAddListener(dir.events.serverAnnounced, this, &ofApp::serverAnnounced);
    // not yet implemented
    //ofAddListener(dir.events.serverUpdated, this, &ofApp::serverUpdated);
    ofAddListener(dir.events.serverRetired, this, &ofApp::serverRetired);
    
    dirIdx = -1;
}

//--------------------------------------------------------------
void ofApp::update(){
    if(ofGetFrameNum() % 60 == 0) {
        ofFile file("geometry.json");
        if(file.exists()){
            try {
                file >> jsonGeometry;
            }
            catch (exception e) {
                ofLogError() << e.what();
            }
        }
    }
}

//--------------------------------------------------------------
void ofApp::draw(){
    if(ofGetFrameNum() == 60) {
        updateClients();
        ofSetWindowPosition(4000, 100);
        ofSetFullscreen(true);
    }

    ofBackground(0, 0, 0);
    ofColor(255, 255, 255, 255);
//    ofEnableAlphaBlending();
    ofEnableBlendMode(OF_BLENDMODE_ADD);
    
    for(int i = 0; i < clients.size(); i++) {
        if(dir.isValidIndex(i)) {
            auto& c = clients.at(i);
            ofPushMatrix();
            float alpha = 0.0f;
            try {
                if(jsonGeometry.find("layers") != jsonGeometry.end()) {
                    auto& jsonLayers = jsonGeometry["layers"];
                    string name = c.getServerName() + ":" + c.getApplicationName();

                    if(jsonLayers.find(name) != jsonLayers.end()) {
                        auto& layer = jsonLayers[name];

                        if(layer.find("corners") != layer.end()) {
                            ofPoint src[4];
                            ofPoint dst[4];
                            float homography[16];
                            src[0] = ofPoint(0, 0);
                            src[1] = ofPoint(c.getWidth(), 0);
                            src[2] = ofPoint(c.getWidth(), c.getHeight());
                            src[3] = ofPoint(0, c.getHeight());
                            for(int idx = 0; idx < 4; idx++) {
                                dst[idx] = ofPoint(layer["corners"][idx]["x"], layer["corners"][idx]["y"]);
                            }
                            findHomography(src, dst, homography);
                            glMultMatrixf(homography);
                        }
                        if(layer.find("alpha") != layer.end()) {
                            alpha = ofClamp(layer["alpha"], 0.0f, 1.0f);
                        }
                    }
                }
            }
            catch (exception e) {
            }
            
            ofSetColor(ofFloatColor(1.0f, alpha));
            if(c.getServerName() == "alcFreeliner") {
                float t = (ofGetElapsedTimef() * 0.1f);
                ofFloatColor col = ofFloatColor::fromHsb(t - floorf(t), 1.0f, 1.0f);
                ofSetColor(col);
            }
            c.draw(0, 0);
            ofSetColor(ofFloatColor(1.0f, 1.0f));

            try {
                if(jsonGeometry.find("debug") != jsonGeometry.end()) {
                    auto& jsonDebug = jsonGeometry["debug"];
                    if(jsonDebug.find("showCorners") != jsonDebug.end()) {
                        if(jsonDebug["showCorners"]) {
                            float r = 20;
                            ofPushStyle();
                            ofFill();
                            ofSetColor(255);
                            ofDrawEllipse(0, 0, r, r);
                            ofDrawEllipse(c.getWidth(), 0, r, r);
                            ofDrawEllipse(c.getWidth(), c.getHeight(), r, r);
                            ofDrawEllipse(0, c.getHeight(), r, r);
                            ofPopStyle();
                        }
                    }
                }
            }
            catch (exception e) {
            }
            ofPopMatrix();
        }
    }

//    ofDrawBitmapString("Press any key to cycle through all available Syphon servers.", ofPoint(20, 580));
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){
    if(key == 'f') {
        ofToggleFullscreen();
    }
    updateClients();
    //press any key to move through all available Syphon servers
    if (dir.size() > 0)
    {
        dirIdx++;
        if(dirIdx > dir.size() - 1)
            dirIdx = 0;
        
        client.set(dir.getDescription(dirIdx));
        string serverName = client.getServerName();
        string appName = client.getApplicationName();
        
        if(serverName == ""){
            serverName = "null";
        }
        if(appName == ""){
            appName = "null";
        }
        ofSetWindowTitle(serverName + ":" + appName);
    }
    else
    {
        ofSetWindowTitle("No Server");
    }
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::updateClients(){
    dirIdx = 0;
    clients.clear();
    clients.resize(dir.size());
    for(int i = 0; i < dir.size(); i++) {
        clients.at(i).setup();
        clients.at(i).set(dir.getDescription(i));
    }
}

//these are our directory's callbacks
void ofApp::serverAnnounced(ofxSyphonServerDirectoryEventArgs &arg)
{
    for( auto& dir : arg.servers ){
        ofLogNotice("ofxSyphonServerDirectory Server Announced")<<" Server Name: "<<dir.serverName <<" | App Name: "<<dir.appName;
    }
    updateClients();
}

void ofApp::serverUpdated(ofxSyphonServerDirectoryEventArgs &arg)
{
    for( auto& dir : arg.servers ){
        ofLogNotice("ofxSyphonServerDirectory Server Updated")<<" Server Name: "<<dir.serverName <<" | App Name: "<<dir.appName;
    }
    updateClients();
}

void ofApp::serverRetired(ofxSyphonServerDirectoryEventArgs &arg)
{
    for( auto& dir : arg.servers ){
        ofLogNotice("ofxSyphonServerDirectory Server Retired")<<" Server Name: "<<dir.serverName <<" | App Name: "<<dir.appName;
    }
    updateClients();
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
