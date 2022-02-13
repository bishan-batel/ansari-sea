import { glMatrix, mat4, vec3 } from "gl-matrix";
import {
    createProgram,
    clearColorDepth,
    colorb,
    compileShader,
    getContext,
    createArrayBuffer,
    f32bitSize,
    linkProgram, createBuffer
} from "./utils/gl";
import { FloatUniform, Mat4Uniform, TimeUniform } from "./utils/shaderUniform";
// import Abhinav from "./prettyboy.png"; 
import { getShaderSrc, loadImage } from "./utils/assets";
import { plane } from "./utils/geometry";
import { Camera } from "./utils/camera";
import Abhinav from "./baked.jpg";


export const BACKGROUND = colorb(2, 13, 13, 255);

export async function init(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;



    // Setting Up OpenGL
    const gl = getContext(canvas);

    (window.onresize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height)
    })();

    // window.onresize = () => gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(BACKGROUND.r, BACKGROUND.b, BACKGROUND.g, BACKGROUND.a);

    const program = createProgram(gl);
    gl.attachShader(program, compileShader(gl, await getShaderSrc("vertex.vert"), 'vertex'))
    gl.attachShader(program, compileShader(gl, await getShaderSrc("fragment.frag"), 'fragment'))
    linkProgram(gl, program);
    gl.useProgram(program);




    let [verticies, indices] = plane(200);

    const vertBuffer = createArrayBuffer(gl, new Float32Array(verticies), gl.STATIC_DRAW);
    const indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const vertAttrib = {
        position: gl.getAttribLocation(program, 'vertPosition'),
        texCoord: gl.getAttribLocation(program, 'vertTexCoord'),
    };

    gl.vertexAttribPointer(
        vertAttrib.position,
        3,
        gl.FLOAT,
        false,
        f32bitSize(5),
        0
    );

    gl.vertexAttribPointer(
        vertAttrib.texCoord,
        2,
        gl.FLOAT,
        false,
        f32bitSize(5),
        f32bitSize(3)
    );

    gl.enableVertexAttribArray(vertAttrib.position);
    gl.enableVertexAttribArray(vertAttrib.texCoord);

    // Load texture
    const boxTex = gl.createTexture();
    if (boxTex == null) throw Error("Failed to create texture");
    gl.bindTexture(gl.TEXTURE_2D, boxTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, await loadImage(Abhinav));

    const uniforms = {
        time: new TimeUniform(gl, program),
        speed: new FloatUniform(gl, program, 'uSpeed'),
        roughness: new FloatUniform(gl, program, "uRoughness"),
        world: new Mat4Uniform(gl, program, "mWorld"),
        view: new Mat4Uniform(gl, program, "mView"),
        proj: new Mat4Uniform(gl, program, "mProj"),
        scale: new FloatUniform(gl, program, "uTexScale"),
    };

    const mWorld = mat4.create();
    mat4.identity(mWorld);

    // uniforms.speed.update(1.);
    uniforms.speed.update(0.002);
    // uniforms.speed.update(0.0);
    uniforms.scale.update(1.);
    uniforms.roughness.update(20);

    // Scales camera
    const camera = new Camera(canvas);
    camera.fov = 180;
    camera.sensitivity = 0.008;

    let view_test = mat4.create();
    mat4.lookAt(view_test, [0, 0, -8], [0, 0, 0], [0, 1., 0]);


    console.log("view " + view_test);

    const scale = 2000;
    loop();
    function loop() {
        gl.useProgram(program);

        clearColorDepth(gl);

        mat4.identity(mWorld);
        mat4.scale(mWorld, mWorld, [scale, 1, scale]);
        mat4.translate(mWorld, mWorld, [0, -5, 0]);
        mat4.translate(mWorld, mWorld, [0, 0, 0]);
        mat4.rotateX(mWorld, mWorld, glMatrix.toRadian(-90))

        camera.update();
        uniforms.proj.update(camera.projMatrix);
        uniforms.view.update(camera.viewMatrix);

        uniforms.world.update(mWorld);
        uniforms.time.update();

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, boxTex);
        gl.uniform1i(gl.getUniformLocation(program, "sample") as WebGLUniformLocation, 0);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    }
}
