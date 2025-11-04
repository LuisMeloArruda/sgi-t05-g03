import * as THREE from 'three';

/**
 * @param {THREE.Vector3} displacement - Vector displacement from the initial position.
 * @param {THREE.Material|null} material - Material of the submarine.
 * @param {number} rotationSpeed - Defines how fast submarine rotates
 * @param {number} yLimit - Defines the minimum Y-coordinate the submarine is allowed to reach
 * @param {number} speedMax - Defines the maximum horizontal speed submarine is allowed to reach
 * @param {number} accelerationHorizontal - Horizontal acceleration
 * @param {number} accelerationVertical - Vertical acceleration
 * @param {friction} friction - Friction applied when not accelerating
 */
class MySubmarineControler extends THREE.Object3D {
  constructor(
    displacement = new THREE.Vector3(0, 0, 0),
    rotationSpeed = 0.1, 
    yLimit = 0.5, 
    speedMax = 0.2,
    accelerationHorizontal = 0.005, 
    accelerationVertical = 0.005, 
    friction = 0.002
  ) {
    super();

    this.position.copy(displacement);

    this.mesh = null;
    this.speedHorizontal = 0;
    this.speedVertical = 0;
    this.rotationSpeed = rotationSpeed;
    this.accelerationVertical = accelerationVertical;
    this.accelerationHorizontal = accelerationHorizontal
    this.friction = friction
    this.speedMax = speedMax
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
    // Horizontal speed
    if (this.pressedKeys.has('KeyW')) {
      if (this.speedHorizontal < this.speedMax) {
        this.speedHorizontal += this.accelerationHorizontal;
      }
    }
    else if (this.pressedKeys.has('KeyS')) {
      if (this.speedHorizontal > -this.speedMax / 2) {
        this.speedHorizontal -= this.accelerationHorizontal;
      }
    }
    else {
      if (Math.abs(this.speedHorizontal) > 0.001) {
        this.speedHorizontal -= this.friction * Math.sign(this.speedHorizontal);
      } else {
        this.speedHorizontal = 0;
      }
    }

    if (Math.abs(this.speedHorizontal) > 0) {
      this.translateZ(-this.speedHorizontal);
    }

    // Vertical speed
    if (this.pressedKeys.has('KeyP')) {
      if (this.speedVertical < this.speedMax)
        this.speedVertical += this.accelerationVertical;
    } 
    else if (this.pressedKeys.has('KeyL') && this.position.y > this.yLimit) {
      if (this.speedVertical > -this.speedMax)
        this.speedVertical -= this.accelerationVertical;
    } 
    else {
      if (Math.abs(this.speedVertical) > 0.001)
        this.speedVertical -= this.friction * Math.sign(this.speedVertical);
      else this.speedVertical = 0;
    }

    if (Math.abs(this.speedVertical) > 0) {
      this.translateY(this.speedVertical);
      if (this.position.y < this.yLimit) {
        this.position.y = this.yLimit;
        this.speedVertical = 0;
      }
    }
  
    // Horizontal direction left or right
    if (this.pressedKeys.has('KeyA')) this.rotateY(this.rotationSpeed);
    if (this.pressedKeys.has('KeyD')) this.rotateY(-this.rotationSpeed);
  }
}

/**
 * Very basic visual-only LOD version of the submarine (low poly)
 */
class MyBasicSubmarine extends THREE.Object3D {
  constructor(material = new THREE.MeshPhongMaterial({ color: 0xcccc00 , side: THREE.DoubleSide})) {
    super();
    // body
    const bodyCapsule = new THREE.CapsuleGeometry(1*0.9, 1*2, 16, 16, 16)
    const bodyCylinder = new THREE.CylinderGeometry(1 * 0.6, 1, 1 * 1.4)
    const bodyBox = new THREE.BoxGeometry(1, 1*0.05, 1)

    const bodySphereMesh = new THREE.Mesh(bodyCapsule, material)
    bodySphereMesh.rotateX(Math.PI / 2)

    const bodyCapsuleMesh = new THREE.Mesh(bodyCylinder, material)
    bodyCapsuleMesh.scale.set(0.5, 0.5, 0.5)
    bodyCapsuleMesh.position.y = 1
    bodyCapsuleMesh.position.z = -0.4

    const bodyBoxMesh = new THREE.Mesh(bodyBox, material)
    bodyBoxMesh.position.y = 1
    bodyBoxMesh.position.z = -0.3
    bodyBoxMesh.rotateY(Math.PI)

    // periscope
    const periscope = new THREE.TorusGeometry(1 * 10, 1 * 0.5, 1 * 10, 1 * 10, 1 * 1.5)
    const periscopeMaterial = new THREE.MeshPhongMaterial({color: 0x686a69, side: THREE.DoubleSide})
    const periscopeMesh =  new THREE.Mesh(periscope, periscopeMaterial)
    periscopeMesh.position.y = 0.7
    periscopeMesh.position.z = -0.9
    periscopeMesh.rotateY(-Math.PI / 2)
    periscopeMesh.scale.set(0.05, 0.1, 0.1)

    // windows
    const windowGeometry = new THREE.TorusGeometry(1 * 15, 1 * 2, 1 * 10, 1 * 32);
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

    // Hatch
    const hatchGroup = new THREE.Group()
    const hatchGeometry = new THREE.CylinderGeometry(1 * 3, 1 * 3, 1, 1 * 32)
    const hatchMaterial = new THREE.MeshPhongMaterial({ color: 0x686a69, side: THREE.DoubleSide })

    const hatchMesh = new THREE.Mesh(hatchGeometry, hatchMaterial);
    hatchMesh.position.z = 0.8
    hatchMesh.position.y = 0.85
    hatchMesh.scale.set(0.1, 0.1, 0.1)

    const hatchHandle = new THREE.TorusGeometry(1 * 10, 1 * 2, 1 * 10, 1 * 10, 1 * 3)
    const hatchHandleMesh = new THREE.Mesh(hatchHandle, hatchMaterial)
    hatchHandleMesh.position.y = 0.9
    hatchHandleMesh.position.z = 0.8
    hatchHandleMesh.scale.set(0.01, 0.005, 0.005)
    hatchGroup.add(hatchMesh, hatchHandleMesh)

    this.add(bodyCapsuleMesh, bodySphereMesh, bodyBoxMesh, periscopeMesh, windowGroup, hatchGroup)
  }
}

/**
 * Mid-level version of the submarine (moderate detail)
 */
class MyMidSubmarine extends THREE.Object3D {
    constructor(material = new THREE.MeshBasicMaterial({ color: 0x888888 })) {
        super();
        const submarine = new THREE.BoxGeometry(1, 1, 1);
        const submarineMesh = new THREE.Mesh(submarine, material);
        this.add(submarineMesh);
        }
}

export { MySubmarineControler, MyMidSubmarine, MyBasicSubmarine };
