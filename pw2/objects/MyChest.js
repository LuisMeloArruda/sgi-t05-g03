import * as THREE from "three";

/**
 * Similar to MyChest, but uses simpler geometry types for improved rendering performance.
 */
class MyBasicChest extends THREE.Object3D {

    constructor(
        material = new THREE.MeshPhongMaterial({ color: 0x964B00, side: THREE.DoubleSide }),
        pearlMaterial = new THREE.MeshPhongMaterial(
            { color: 0xbabbf1, specular: 0xffffff, emissive: 0xffffff, shininess: 1000, side: THREE.DoubleSide})
    ) {
        super();
        this.material = material
        this.pearlMaterial = pearlMaterial
        this.build();
    }

    build() {
        const bottom = new THREE.BoxGeometry(1, 1 / 2, 2)
        const top = new THREE.CylinderGeometry(1 / 2, 1 / 2, 2, 16, 16, false, 0, 3.14)
        const pearl = new THREE.BoxGeometry(0.1, 0.1, 0.1)

        let bottomMesh = new THREE.Mesh(bottom, this.material)
        let topMesh = new THREE.Mesh(top, this.material)

        // pearls
        const seed = 42;
        const pearlsGroup = new THREE.Group()
        const pearlCount = 50
        for (let i = 0; i < pearlCount; i++) {
            const pearlMesh = new THREE.Mesh(pearl, this.pearlMaterial)

            pearlMesh.position.x = (seededRandom(seed + i * 13.37) * 2 - 1) * 2;
            pearlMesh.position.z = (seededRandom(seed + i * 91.17) * 2 - 1) * 2;

            pearlsGroup.add(pearlMesh)
        }

        for (let i = 0; i < pearlCount*5; i++) {
            const pearlMesh = new THREE.Mesh(pearl, this.pearlMaterial)
            const random = Math.max(seededRandom(seed + i * 13.37) + 0.4, 0.7)
            pearlMesh.scale.set(random, random, random)

            pearlMesh.position.x = (seededRandom(seed + i * 13.37) * 2 - 1) * 0.4;
            pearlMesh.position.z = (seededRandom(seed + i * 91.17) * 2 - 1) * 0.9;

            pearlMesh.position.y = 1/2

            pearlsGroup.add(pearlMesh)
        }

        // Transformations
        topMesh.rotateZ(Math.PI / 4)
        topMesh.rotateX(Math.PI / 2)
        topMesh.position.x = 0.1

        pearlsGroup.position.y = -1/1.5

        bottomMesh.position.y = -1 / 2
        this.add(topMesh, bottomMesh, pearlsGroup);

    }
}

/**
 * Represents a 3D treasure chest containing pseudo randomly placed pearls.
 */
class MyChest extends THREE.Object3D {

    constructor(
        material = new THREE.MeshPhongMaterial({ color: 0x964B00, side: THREE.DoubleSide }),
        pearlMaterial = new THREE.MeshPhongMaterial(
            { color: 0xbabbf1, specular: 0xffffff, emissive: 0xffffff, shininess: 1000, side: THREE.DoubleSide})
    ) {
        super();
        this.material = material
        this.pearlMaterial = pearlMaterial
        this.build();
    }

    build() {
        const bottom = new THREE.BoxGeometry(1, 1 / 2, 2)
        const top = new THREE.CylinderGeometry(1 / 2, 1 / 2, 2, 16, 16, false, 0, 3.14)
        const pearl = new THREE.SphereGeometry(0.1, 16, 16)

        let bottomMesh = new THREE.Mesh(bottom, this.material)
        let topMesh = new THREE.Mesh(top, this.material)

        // pearls
        const seed = 42;
        const pearlsGroup = new THREE.Group()
        const pearlCount = 50
        for (let i = 0; i < pearlCount; i++) {
            const pearlMesh = new THREE.Mesh(pearl, this.pearlMaterial)

            pearlMesh.position.x = (seededRandom(seed + i * 13.37) * 2 - 1) * 2;
            pearlMesh.position.z = (seededRandom(seed + i * 91.17) * 2 - 1) * 2;

            pearlsGroup.add(pearlMesh)
        }

        for (let i = 0; i < pearlCount*2; i++) {
            const pearlMesh = new THREE.Mesh(pearl, this.pearlMaterial)
            const random = Math.max(seededRandom(seed + i * 13.37) + 0.4, 0.7)
            pearlMesh.scale.set(random, random, random)

            pearlMesh.position.x = (seededRandom(seed + i * 13.37) * 2 - 1) * 0.4;
            pearlMesh.position.z = (seededRandom(seed + i * 91.17) * 2 - 1) * 0.9;

            pearlMesh.position.y = 1/2

            pearlsGroup.add(pearlMesh)
        }

        // Transformations
        topMesh.rotateZ(Math.PI / 4)
        topMesh.rotateX(Math.PI / 2)
        topMesh.position.x = 0.1

        pearlsGroup.position.y = -1/1.5

        bottomMesh.position.y = -1 / 2
        this.add(topMesh, bottomMesh, pearlsGroup);

    }
}

/**
 * Generates random numbers
 * @param {number} seed 
 * @returns pseudo random number
 */
function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  

export { MyChest, MyBasicChest };
