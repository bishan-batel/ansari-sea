#ifdef GL_ES 
precision mediump float;
#endif

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;

varying vec2 fragTexCoord;
varying vec4 worldCoord;

uniform mat4 mWorld, mProj, mView;
uniform float uTime;
uniform float uSpeed;
uniform float uRoughness;


float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f * f * (3.0 - 2.0 * f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

void main() {
    fragTexCoord = vertTexCoord;
    worldCoord = mWorld * vec4(vertPosition, 1.0);

    vec3 pos = vertPosition;
    vec2 offset = uTime * uSpeed * vec2(1., 0.) + pos.xy * uRoughness;

    pos.z = sin(offset.x) + cos(offset.y);
    pos.z = pos.z * 8.;

    pos.z += noise(offset) * 10.;

    // gl_Position = mProj * mView * mWorld * vec4(pos, 1.0);


    gl_Position = mProj * mView * mWorld * vec4(pos, 1.0);
}