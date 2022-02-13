#ifdef GL_ES
precision mediump float;
#endif

varying vec2 fragTexCoord;
varying vec4 worldCoord;

uniform float uTime;
uniform float uSpeed;
uniform float uTexScale;
uniform float uRoughness;
#define NOISE_STRENGTH 4.

uniform sampler2D sampler;
uniform sampler2D depth;


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
    vec2 offset = vec2(uTime * uSpeed) * .1;
//    offset = offset * noise(offset);

    vec2 nArgs = (worldCoord.xz) * .05 + offset;

    vec2 n = vec2(1.);

    for (float i =0.; i < NOISE_STRENGTH; i++) {
        nArgs += n;
        n.x += noise(nArgs.xy);
        n.y += noise(nArgs.yx);
    }

    // float distToCenter = pow(distance(fragTexCoord, vec2(.5,.5)), 1.);
    vec2 coord = (n + fragTexCoord) * uTexScale;
    gl_FragColor = texture2D(sampler, coord);

    // // gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * n, 1.);

    // vec4 tint = texture2D(sampler, coord);
    // gl_FragColor = mix(texture2D(sampler, coord), tint, 0.5);
}

