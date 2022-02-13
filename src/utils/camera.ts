import { glMatrix, mat4, ReadonlyMat4, ReadonlyVec3, ReadonlyVec4, vec3 } from "gl-matrix";

export class Camera {
    static UP = vec3.fromValues(0, 1, 0);

    public sensitivity: number = .008;
    public fov: number = 90;

    public pos: vec3 = vec3.create();
    public rot: vec3 = vec3.create();
    public viewMatrix: mat4 = mat4.create();
    public projMatrix: mat4 = mat4.create();
    public canvas: HTMLCanvasElement;
    public locked: boolean = false;
    public keysDown: any = {};

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        window.addEventListener("click", () => {
            // this.canvas.requestFullscreen();
            setTimeout(() => this.canvas.requestPointerLock(), 0);
        })

        document.onpointerlockchange = () => this.locked = document.pointerLockElement === canvas;
        this.canvas.onmousemove = (ev) => {
            console.log(ev.movementX);

            vec3.add(this.rot, this.rot, vec3.fromValues(
                ev.movementY * this.sensitivity,
                ev.movementX * -this.sensitivity,
                0
            ))

            if (this.rot[0] > Math.PI / 2) this.rot[0] = Math.PI / 2 - .001;
            else if (this.rot[0] < -Math.PI / 2) this.rot[0] = -Math.PI / 2 - 0.01;
        }

        window.onkeydown = (ev) => this.keysDown[ev.key] = true;
        window.onkeyup = (ev) => this.keysDown[ev.key] = false;

    }

    update() {
        const forward = this.forward();
        vec3.add(forward, this.pos, forward);

        mat4.lookAt(this.viewMatrix, this.pos, forward, Camera.UP);

        mat4.perspective(
            this.projMatrix,
            glMatrix.toRadian(this.fov / 2),
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            Infinity
        );

        if (!this.locked) return;

        let speed = 1.;

        vec3.set(forward, 0, 0, 0);
        if (this.keysDown['w']) vec3.scale(forward, this.forward(), 1.);
        if (this.keysDown['s']) vec3.scale(forward, this.forward(), -1.);
        vec3.scale(forward, forward, speed); vec3.add(this.pos, this.pos, forward);
    }

    forward = (): vec3 => {
        let forward = vec3.fromValues(0, 0, 1);
        vec3.rotateX(forward, forward, [0, 0, 0], this.rot[0]);
        vec3.rotateY(forward, forward, [0, 0, 0], this.rot[1]);
        return forward;
    }


    lock = () => this.canvas.requestPointerLock();
}