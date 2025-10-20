import * as THREE from 'three';

/**
 * @param {number} size - Overall scale of the submarine.
 * @param {THREE.Vector3} displacement - Vector displacement from the initial position.
 * @param {THREE.Material|null} material - Material of the submarine.
 * @param {number} speed - Defines how fast submarine moves
 * @param {number} rotationSpeed - Defines how fast submarine rotates
 * @param {number} yLimit - Defines the maximum Y-coordinate the submarine is allowed to reach
 */
class MySubmarineControler extends THREE.Object3D {
  constructor(displacement = new THREE.Vector3(0, 0, 0), speed = 0.1, rotationSpeed = 0.1, yLimit = 0) {
    super();
    this.displacement = displacement;
    this.mesh = null;
    this.speed = speed;
    this.rotationSpeed = rotationSpeed;
    this.yLimit = yLimit;

    this.pressedKeys = new Set();
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

/**
 * Very basic visual-only LOD version of the submarine (low poly)
 */
class MyBasicSubmarine extends THREE.Object3D {
  constructor(size = 1.0, material = new THREE.MeshPhongMaterial({ color: 0xcccc00 })) {
    super();
    const body = new THREE.CylinderGeometry(size * 0.4, size * 0.4, size * 2, 12);
    const bodyMesh = new THREE.Mesh(body, material);
    this.add(bodyMesh);
  }
}

/**
 * Mid-level version of the submarine (moderate detail)
 */
class MyMidSubmarine extends THREE.Object3D {
    constructor(size = 1.0, material = new THREE.MeshBasicMaterial({ color: 0x888888 })) {
        super();
        const submarine = new THREE.BoxGeometry(size, size, size);
        const submarineMesh = new THREE.Mesh(submarine, material);
        this.add(submarineMesh);
        }
}

export { MySubmarineControler, MyMidSubmarine, MyBasicSubmarine };
