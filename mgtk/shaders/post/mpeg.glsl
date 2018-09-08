#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
varying vec4 vertTexCoord;
uniform vec2 resolution;
uniform float time;
varying vec4 vertColor;

// https://www.shadertoy.com/view/Md2GDw

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

void main(void) {
  float timef = time * 0.005;
  vec2 iResolution = vec2(1280, 560);
	vec2 uv = vertTexCoord.xy;
	vec2 block = floor(vertTexCoord.xy * iResolution / vec2(16));
	vec2 uv_noise = block / vec2(64);
	uv_noise += floor(vec2(time * 0.1) * vec2(1234.0, 3543.0)) / vec2(64);
	
	float block_thresh = -pow(fract(time * 0.1 * 1236.0453), 2.0) * 1000.2;
	float line_thresh = -pow(fract(time * 0.1 * 2236.0453), 3.0) * 1000.7;
	
	vec2 uv_r = uv, uv_g = uv, uv_b = uv;

	// glitch some blocks and lines
	if (_noise(vec3(uv_noise, timef)) < block_thresh ||
		_noise(vec3(uv_noise.y, timef, 0.0)) < line_thresh) {
	// if (texture2D(texture/*1*/, uv_noise).r < block_thresh ||
	// 	texture2D(texture/*1*/, vec2(uv_noise.y, 0.0)).g < line_thresh) {

		vec2 dist = (fract(uv_noise) - 0.5) * 0.3;
		uv_r += dist * 0.1;
		uv_g += dist * 0.2;
		uv_b += dist * 0.125;
	}

	// gl_FragColor.r = texture2D(texture, uv_r).r;
	gl_FragColor.g = texture2D(texture, uv_g).g;
	// gl_FragColor.b = texture2D(texture, uv_b).b;
	gl_FragColor.rb = texture2D(texture, uv).rb;
	gl_FragColor.a = texture2D(texture, uv_r).a;
	// gl_FragColor.a = 1.0;

	// loose luma for some blocks
	if (_noise(vec3(uv_noise, timef+0.3))< block_thresh)
	// if (texture2D(texture/*1*/, uv_noise).g < block_thresh)
		gl_FragColor.rgb = gl_FragColor.ggg;

	// discolor block lines
	if (_noise(vec3(uv_noise.y, timef, 0.7)) * 3.5 < line_thresh)
	// if (texture2D(texture/*1*/, vec2(uv_noise.y, 0.0)).b * 3.5 < line_thresh)
		gl_FragColor.rgb = vec3(0.0, dot(gl_FragColor.rgb, vec3(1.0)), 0.0);

	// interleave lines in some blocks
	if (_noise(vec3(uv_noise, timef+0.3)) * 1.5 < block_thresh ||
		_noise(vec3(uv_noise.y, timef, 0.3)) * 2.5 < line_thresh) {
	// if (texture2D(texture/*1*/, uv_noise).g * 1.5 < block_thresh ||
	// 	texture2D(texture/*1*/, vec2(uv_noise.y, 0.0)).g * 2.5 < line_thresh) {
		float line = fract(vertTexCoord.y / 3.0);
		vec3 mask = vec3(3.0, 0.0, 0.0);
		if (line > 0.333)
			mask = vec3(0.0, 3.0, 0.0);
		if (line > 0.666)
			mask = vec3(0.0, 0.0, 3.0);
		
		gl_FragColor.xyz *= mask;
	}
}
