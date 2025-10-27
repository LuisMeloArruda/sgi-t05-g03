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
  constructor(size = 1.0, material = new THREE.MeshPhongMaterial({ color: 0xcccc00 , side: THREE.DoubleSide})) {
    super();
    // body
    const bodyCapsule = new THREE.CapsuleGeometry(size*0.9, size*2, 16, 16, 16)
    const bodyCylinder = new THREE.CylinderGeometry(size * 0.6, size, size * 1.4)
    const bodyBox = new THREE.BoxGeometry(size, size*0.05, size)

    const bodySphereMesh = new THREE.Mesh(bodyCapsule, material)
    bodySphereMesh.rotateX(Math.PI / 2)

    const bodyCapsuleMesh = new THREE.Mesh(bodyCylinder, material)
    bodyCapsuleMesh.scale.set(0.5, 0.5, 0.5)
    bodyCapsuleMesh.position.y = 1
    bodyCapsuleMesh.position.z = -0.2

    const bodyBoxMesh = new THREE.Mesh(bodyBox, material)
    bodyBoxMesh.position.y = 1
    bodyBoxMesh.position.z = -0.1
    bodyBoxMesh.rotateY(Math.PI)

    // periscope
    const periscope = new THREE.TorusGeometry(size * 10, size * 0.5, size * 10, size * 10, size * 1.5)
    const periscopeMaterial = new THREE.MeshPhongMaterial({color: 0x686a69, side: THREE.DoubleSide})
    const periscopeMesh =  new THREE.Mesh(periscope, periscopeMaterial)
    periscopeMesh.position.y = 0.7
    periscopeMesh.position.z = -0.7
    periscopeMesh.rotateY(-Math.PI / 2)
    periscopeMesh.scale.set(0.05, 0.1, 0.1)

    // windows
    const windowGeometry = new THREE.TorusGeometry(size * 15, size * 2, size * 10, size * 32);
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x686a69, side: THREE.DoubleSide });

    const glassGeometry = new THREE.SphereGeometry();
    const glassMaterial = new THREE.MeshPhongMaterial({ color: 0x89CFF0 });

    const windowGroup = new THREE.Group();

    for (let i = 0; i < 3; i++) {
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);

      glassMesh.scale.set(0.3, 0.3, 0.33);
      glassMesh.position.set(-0.75, 0.1, -1 + i * 1);

      windowMesh.scale.set(0.02, 0.02, 0.04);
      windowMesh.position.set(-0.85, 0.1, -1 + i * 1);
      windowMesh.rotation.y = -Math.PI / 2;

      windowGroup.add(windowMesh);
      windowGroup.add(glassMesh);
    }
    
    for (let i = 0; i < 3; i++) {
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial)
      const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial)

      glassMesh.scale.set(0.3, 0.3, 0.33);
      glassMesh.position.set(0.75, 0.1, -1 + i * 1);

      windowMesh.scale.set(0.02, 0.02, 0.04);
      windowMesh.position.set(0.85, 0.1, -1 + i * 1);
      windowMesh.rotation.y = -Math.PI / 2;
      windowGroup.add(windowMesh, glassMesh)
    }

    this.add(bodyCapsuleMesh, bodySphereMesh, bodyBoxMesh, periscopeMesh, windowGroup)
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
