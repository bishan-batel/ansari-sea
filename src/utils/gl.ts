export const f32bitSize = (num: number) => num * Float32Array.BYTES_PER_ELEMENT;

export function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
    const ctx = canvas.getContext('webgl2');
    if (ctx === null) {
        alert("Your browser does not support webGL2");
        throw Error("Unable to retrieve context");
    }
    return ctx;
}

export const clearColorDepth = (gl: WebGL2RenderingContext) =>
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

export interface GlColor {
    r: number,
    g: number,
    b: number,
    a: number
}

export const colorb = (r: number, g: number, b: number, a: number): GlColor => ({
    r: r / 255,
    g: g / 255,
    b: b / 255,
    a: a / 255
});

export type GlShaderType = 'fragment' | 'vertex';

export function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
    const program = gl.createProgram();
    if (program == null) throw new Error("Failed to Create Program");
    return program;
}

export function compileShader(gl: WebGL2RenderingContext, shaderSrc: string, type: GlShaderType) {
    const shader = gl.createShader(type === 'fragment' ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
    if (shader === null) throw new Error(`Failed to create ${type} shader`);

    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`Error compiling ${type} shader, ${gl.getShaderInfoLog(shader)}`);
    }

    return shader;
}

export function linkProgram(gl: WebGL2RenderingContext, program: WebGLProgram, validate?: boolean) {
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new ProgramLinkerErr(gl, program);

    if (!(validate ?? false)) return;
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
        throw new ProgramValidateErr(gl, program);
}

export const createArrayBuffer = (
    gl: WebGL2RenderingContext,
    arr: any,
    usage: number
): WebGLBuffer => createBuffer(gl, gl.ARRAY_BUFFER, arr, usage);

export function createBuffer(
    gl: WebGL2RenderingContext,
    target: number,
    arr: any,
    usage: number
): WebGLBuffer {
    const buffer = gl.createBuffer();
    if (buffer == null) throw new Error("Failed to create buffer");

    gl.bindBuffer(target, buffer); 
    gl.bufferData(target, arr, usage);

    return buffer;
}

// Errors
export class ProgramValidateErr extends Error {
    constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
        super("Validation Error: " + gl.getProgramInfoLog(program) ?? "Validation Error")
    }
}

export class ProgramLinkerErr extends Error {
    constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
        super("Linking Error: " + gl.getProgramInfoLog(program) ?? "Linker Error")
    }
}
