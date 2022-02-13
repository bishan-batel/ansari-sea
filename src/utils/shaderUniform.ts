import { mat4 } from "gl-matrix";

export type UniSetCallback = (loc: WebGLUniformLocation) => void;

export class ShaderUniform {
    location: WebGLUniformLocation | null;
    gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext, program: WebGLProgram, name: string) {
        this.gl = gl;

        this.location = gl.getUniformLocation(program, name);
        if (this.location == null) {
            console.error(`Failed to find uniform location for '${name}'`);
            return;
        }
    }

    public set = (callback: UniSetCallback) => {
        if (this.location == null) return;
        callback(this.location);
    }
}

export class TimeUniform extends ShaderUniform {
    constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
        super(gl, program, 'uTime');
    }

    public update = () => this.set(loc => this.gl.uniform1f(this.location, performance.now()));
}

export class Mat4Uniform extends ShaderUniform {
    public update = (val: mat4, transpose?: boolean) =>
        this.gl.uniformMatrix4fv(this.location, transpose ?? false, val);
}

export class FloatUniform extends ShaderUniform {
    public update = (val: number) =>
        this.gl.uniform1f(this.location, val);
}