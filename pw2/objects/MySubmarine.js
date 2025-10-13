import * as THREE from 'three';

/**
 * @param {number} size - Overall scale of the submarine.
 * @param {THREE.Vector3} displacement - Vector displacement from the initial position.
 * @param {THREE.Material|null} material - Material of the submarine.
 * @param {number} speed - Defines how fast submarine moves
 * @param {number} rotationSpeed - Defines how fast submarine rotates
 * @param {number} yLimit - Defines the maximum Y-coordinate the submarine is allowed to reach
 */
class MySubmarine extends THREE.Object3D {
    constructor(size = 1.0, displacement = new THREE.Vector3(0, 0, 0), material, speed = 0.1, rotationSpeed = 0.1, yLimit = 0) {
        super()
        this.size = size
        this.displacement = displacement
        this.material = material
        this.mesh = null
        this.speed = speed
        this.rotationSpeed = rotationSpeed
        this.yLimit = yLimit

        this.pressedKeys = new Set();

        this.build()
    }

    build() {
        const submarine = new THREE.BoxGeometry(this.size, this.size, this.size)

        const submarineMESH = new THREE.Mesh(submarine, this.material)

        this.add(submarineMESH)
        this.position.copy(this.displacement)
    }

    setupListeners() {
        this._onKeyDown = (e) => this.pressedKeys.add(e.code);
        this._onKeyUp = (e) => this.pressedKeys.delete(e.code);

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    dispose() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }

    update() {
        if (this.pressedKeys.has('KeyW')) this.translateZ(-this.speed);
        if (this.pressedKeys.has('KeyS')) this.translateZ(this.speed);
        if (this.pressedKeys.has('KeyA')) this.rotateY(this.rotationSpeed);
        if (this.pressedKeys.has('KeyD')) this.rotateY(-this.rotationSpeed);
        if (this.pressedKeys.has('KeyR') && this.position.y < this.yLimit) this.translateY(this.speed);
        if (this.pressedKeys.has('KeyF')) this.translateY(-this.speed);
    }
}

export {MySubmarine};
