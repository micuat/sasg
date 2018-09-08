
precision mediump float;

    uniform float sides1;
    uniform float radius2;
    uniform float smoothing3;
    uniform float scrollX4;
    uniform float speed5;
    uniform float r6;
    uniform float g7;
    uniform float b8;
    uniform sampler2D tex9;
    uniform float amount10;
    uniform float xMult11;
    uniform float yMult12;
    uniform float r13;
    uniform float g14;
    uniform float b15;
    uniform float angle17;
    uniform float speed18;
uniform float time;
uniform vec2 resolution;
varying vec4 vertTexCoord;


          
  //	Simplex 3D Noise
  //	by Ian McEwan, Ashima Arts
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float _noise(vec3 v){
const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
vec3 i  = floor(v + dot(v, C.yyy) );
vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
vec3 g = step(x0.yzx, x0.xyz);
vec3 l = 1.0 - g;
vec3 i1 = min( g.xyz, l.zxy );
vec3 i2 = max( g.xyz, l.zxy );

//  x0 = x0 - 0. + 0.0 * C
vec3 x1 = x0 - i1 + 1.0 * C.xxx;
vec3 x2 = x0 - i2 + 2.0 * C.xxx;
vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
i = mod(i, 289.0 );
vec4 p = permute( permute( permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
float n_ = 1.0/7.0; // N=7
vec3  ns = n_ * D.wyz - D.xzx;

vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

vec4 x_ = floor(j * ns.z);
vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

vec4 x = x_ *ns.x + ns.yyyy;
vec4 y = y_ *ns.x + ns.yyyy;
vec4 h = 1.0 - abs(x) - abs(y);

vec4 b0 = vec4( x.xy, y.xy );
vec4 b1 = vec4( x.zw, y.zw );

vec4 s0 = floor(b0)*2.0 + 1.0;
vec4 s1 = floor(b1)*2.0 + 1.0;
vec4 sh = -step(h, vec4(0.0));

vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

vec3 p0 = vec3(a0.xy,h.x);
vec3 p1 = vec3(a0.zw,h.y);
vec3 p2 = vec3(a1.xy,h.z);
vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
p0 *= norm.x;
p1 *= norm.y;
p2 *= norm.z;
p3 *= norm.w;

// Mix final noise value
vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
m = m * m;
return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                              dot(p2,x2), dot(p3,x3) ) );
}
  
        
          vec4 noise(vec2 st, float scale, float offset){
    return vec4(vec3(_noise(vec3(st*scale, offset*time))), 1.0);
  }
        
          vec4 voronoi(vec2 st, float scale, float speed, float blending) {
    vec3 color = vec3(.0);

  // Scale
  st *= scale;

  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = 10.;  // minimun distance
  vec2 m_point;        // minimum point

  for (int j=-1; j<=1; j++ ) {
      for (int i=-1; i<=1; i++ ) {
          vec2 neighbor = vec2(float(i),float(j));
          vec2 p = i_st + neighbor;
          vec2 point = fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
          point = 0.5 + 0.5*sin(time*speed + 6.2831*point);
          vec2 diff = neighbor + point - f_st;
          float dist = length(diff);

          if( dist < m_dist ) {
              m_dist = dist;
              m_point = point;
          }
      }
  }

  // Assign a color using the closest point position
  color += dot(m_point,vec2(.3,.6));
color *= 1.0 - blending*m_dist;
  return vec4(color, 1.0);
  }
        
          vec4 osc(vec2 _st, float freq, float sync, float offset){
          vec2 st = _st;
          float r = sin((st.x-offset/freq+time*sync)*freq)*0.5  + 0.5;
          float g = sin((st.x+time*sync)*freq)*0.5 + 0.5;
          float b = sin((st.x+offset/freq+time*sync)*freq)*0.5  + 0.5;
          return vec4(r, g, b, 1.0);
        }
        
          vec4 shape(vec2 _st, float sides, float radius, float smoothing){
    vec2 st = _st * 2. - 1.;
    // Angle and radius from the current pixel
    float a = atan(st.x,st.y)+3.1416;
    float r = (2.*3.1416)/sides;
    float d = cos(floor(.5+a/r)*r-a)*length(st);
    return vec4(vec3(1.0-smoothstep(radius,radius + smoothing,d)), 1.0);
  }
        
          vec4 gradient(vec2 _st, float speed) {
    return vec4(_st, sin(time*speed), 1.0);
  }
  
        
          vec4 src(vec2 _st, sampler2D _tex){
  //  vec2 uv = gl_FragCoord.xy/vec2(1280., 720.);
    return texture2D(_tex, fract(_st));
  }
        
          vec4 solid(vec2 uv, float _r, float _g, float _b, float _a){
    return vec4(_r, _g, _b, _a);
  }
        
          vec2 rotate(vec2 st, float _angle, float speed){
            vec2 xy = st - vec2(0.5);
            float angle = _angle + speed *time;
            xy = mat2(cos(angle),-sin(angle), sin(angle),cos(angle))*xy;
            xy += 0.5;
            return xy;
        }
        
          vec2 scale(vec2 st, float amount, float xMult, float yMult){
    vec2 xy = st - vec2(0.5);
    xy*=(1.0/vec2(amount*xMult, amount*yMult));
    xy+=vec2(0.5);
    return xy;
  }
  
        
          vec2 pixelate(vec2 st, float pixelX, float pixelY){
    vec2 xy = vec2(pixelX, pixelY);
    return (floor(st * xy) + 0.5)/xy;
  }
        
          vec4 posterize(vec4 c, float bins, float gamma){
    vec4 c2 = pow(c, vec4(gamma));
    c2 *= vec4(bins);
    c2 = floor(c2);
    c2/= vec4(bins);
    c2 = pow(c2, vec4(1.0/gamma));
    return vec4(c2.xyz, c.a);
  }
        
          vec4 shift(vec4 c, float r, float g, float b, float a){
    vec4 c2 = vec4(c);
    c2.r = fract(c2.r + r);
    c2.g = fract(c2.g + g);
    c2.b = fract(c2.b + b);
    c2.a = fract(c2.a + a);
    return vec4(c2.rgba);
  }
  
        
          vec2 repeat(vec2 _st, float repeatX, float repeatY, float offsetX, float offsetY){
      vec2 st = _st * vec2(repeatX, repeatY);
      st.x += step(1., mod(st.y,2.0)) * offsetX;
      st.y += step(1., mod(st.x,2.0)) * offsetY;
      return fract(st);
  }
        
          vec2 modulateRepeat(vec2 _st, vec4 c1, float repeatX, float repeatY, float offsetX, float offsetY){
      vec2 st = _st * vec2(repeatX, repeatY);
      st.x += step(1., mod(st.y,2.0)) + c1.r * offsetX;
      st.y += step(1., mod(st.x,2.0)) + c1.g * offsetY;
      return fract(st);
  }
        
          vec2 repeatX(vec2 _st, float reps, float offset){
    vec2 st = _st * vec2(reps, 1.0);
  //  float f =  mod(_st.y,2.0);

    st.y += step(1., mod(st.x,2.0))* offset;
    return fract(st);
  }
        
          vec2 modulateRepeatX(vec2 _st, vec4 c1, float reps, float offset){
    vec2 st = _st * vec2(reps, 1.0);
  //  float f =  mod(_st.y,2.0);
    st.y += step(1., mod(st.x,2.0)) + c1.r * offset;

    return fract(st);
  }
        
          vec2 repeatY(vec2 _st, float reps, float offset){
    vec2 st = _st * vec2(1.0, reps);
  //  float f =  mod(_st.y,2.0);
    st.x += step(1., mod(st.y,2.0))* offset;
    return fract(st);
  }
        
          vec2 modulateRepeatY(vec2 _st, vec4 c1, float reps, float offset){
    vec2 st = _st * vec2(reps, 1.0);
  //  float f =  mod(_st.y,2.0);
    st.x += step(1., mod(st.y,2.0)) + c1.r * offset;
    return fract(st);
  }
        
          vec2 kaleid(vec2 st, float nSides){
    st -= 0.5;
    float r = length(st);
    float a = atan(st.y, st.x);
    float pi = 2.*3.1416;
    a = mod(a,pi/nSides);
    a = abs(a-pi/nSides/2.);
    return r*vec2(cos(a), sin(a));
  }
        
          vec2 modulateKaleid(vec2 st, vec4 c1, float nSides){
    st -= 0.5;
    float r = length(st);
    float a = atan(st.y, st.x);
    float pi = 2.*3.1416;
    a = mod(a,pi/nSides);
    a = abs(a-pi/nSides/2.);
    return (c1.r+r)*vec2(cos(a), sin(a));
  }
        
          vec2 scrollX(vec2 st, float amount, float speed){
    st.x += amount + time*speed;
    return fract(st);
  }
        
          vec2 modulateScrollX(vec2 st, vec4 c1, float amount, float speed){
    st.x += c1.r*amount + time*speed;
    return fract(st);
  }
        
          vec2 scrollY(vec2 st, float amount, float speed){
    st.y += amount + time*speed;
    return fract(st);
  }
        
          vec2 modulateScrollY(vec2 st, vec4 c1, float amount, float speed){
    st.y += c1.r*amount + time*speed;
    return fract(st);
  }
        
          vec4 add(vec4 c0, vec4 c1, float amount){
          return (c0+c1)*amount + c0*(1.0-amount);
        }
        
          vec4 layer(vec4 c0, vec4 c1){
      return vec4(mix(c0.rgb, c1.rgb, c1.a), c0.a+c1.a);
  }
  
        
          vec4 blend(vec4 c0, vec4 c1, float amount){
    return c0*(1.0-amount)+c1*amount;
  }
        
          vec4 mult(vec4 c0, vec4 c1, float amount){
    return c0*(1.0-amount)+(c0*c1)*amount;
  }
        
          vec4 diff(vec4 c0, vec4 c1){
    return vec4(abs(c0.rgb-c1.rgb), max(c0.a, c1.a));
  }
  
        
          vec2 modulate(vec2 st, vec4 c1, float amount){
        //  return fract(st+(c1.xy-0.5)*amount);
            return st + c1.xy*amount;
        }
        
          vec2 modulateScale(vec2 st, vec4 c1, float multiple, float offset){
    vec2 xy = st - vec2(0.5);
    xy*=(1.0/vec2(offset + multiple*c1.r, offset + multiple*c1.g));
    xy+=vec2(0.5);
    return xy;
  }
        
          vec2 modulatePixelate(vec2 st, vec4 c1, float multiple, float offset){
    vec2 xy = vec2(offset + c1.x*multiple, offset + c1.y*multiple);
    return (floor(st * xy) + 0.5)/xy;
  }
        
          vec2 modulateRotate(vec2 st, vec4 c1, float multiple, float offset){
      vec2 xy = st - vec2(0.5);
      float angle = offset + c1.x * multiple;
      xy = mat2(cos(angle),-sin(angle), sin(angle),cos(angle))*xy;
      xy += 0.5;
      return xy;
  }
        
          vec2 modulateHue(vec2 st, vec4 c1, float amount){

          return st + (vec2(c1.g - c1.r, c1.b - c1.g) * amount * 1.0/resolution);
        }
        
          vec4 invert(vec4 c0, float amount){
    return vec4((1.0-c0.rgb)*amount + c0.rgb*(1.0-amount), c0.a);
  }
        
          vec4 contrast(vec4 c0, float amount) {
    vec4 c = (c0-vec4(0.5))*vec4(amount) + vec4(0.5);
    return vec4(c.rgb, c0.a);
  }
  
        
          vec4 brightness(vec4 c0, float amount){
    return vec4(c0.rgb + vec3(amount), c0.a);
  }
  
        
          float luminance(vec3 rgb){
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    return dot(rgb, W);
  }
        
          vec4 mask(vec4 c0, vec4 c1){
    float a = luminance(c1.rgb);
    return vec4(c0.rgb*a, a);
  }
        
          vec4 luma(vec4 c0, float threshold, float tolerance){
    float a = smoothstep(threshold-tolerance, threshold+tolerance, luminance(c0.rgb));
    return vec4(c0.rgb*a, a);
  }
        
          vec4 thresh(vec4 c0, float threshold, float tolerance){
    return vec4(vec3(smoothstep(threshold-tolerance, threshold+tolerance, luminance(c0.rgb))), c0.a);
  }
        
          vec4 color(vec4 c0, float _r, float _g, float _b){
    vec3 c = vec3(_r, _g, _b);
    vec3 pos = step(0.0, c); // detect whether negative

    // if > 0, return r * c0
    // if < 0 return (1.0-r) * c0
    return vec4(mix((1.0-c0.rgb)*abs(c), c*c0.rgb, pos), c0.a);
  }
        
          vec3 _rgbToHsv(vec3 c){
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }
        
          vec3 _hsvToRgb(vec3 c){
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
        
          vec4 saturate(vec4 c0, float amount){
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(c0.rgb, W));
    return vec4(mix(intensity, c0.rgb, amount), c0.a);
  }
        
          vec4 hue(vec4 c0, float hue){
    vec3 c = _rgbToHsv(c0.rgb);
    c.r += hue;
  //  c.r = fract(c.r);
    return vec4(_hsvToRgb(c), c0.a);
  }
        
          vec4 colorama(vec4 c0, float amount){
    vec3 c = _rgbToHsv(c0.rgb);
    c += vec3(amount);
    c = _hsvToRgb(c);
    c = fract(c);
    return vec4(c, c0.a);
  }
        

void main () {
  vec4 c = vec4(1, 0, 0, 1);
  //vec2 st = uv;
  vec2 st = (vertTexCoord.st - vec2(0.5)) * vec2(1.0, -1.0) + vec2(0.5);
  gl_FragColor = diff(color(shape(scrollX(rotate(st, angle17, speed18), scrollX4, speed5), sides1, radius2, smoothing3), r6, g7, b8), color(src(scale(rotate(st, angle17, speed18), amount10, xMult11, yMult12), tex9), r13, g14, b15));
}
