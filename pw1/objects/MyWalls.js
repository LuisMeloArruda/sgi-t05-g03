import * as THREE from 'three';

/**
 * @param {number} width - Width of the walls.
 * @param {number} height - Height of the walls.
 * @param {THREE.Vector3} displacement - Vector displacement from the initial position.
 * @param {THREE.Material|null} material - Material of the walls.
 */
class MyWalls extends THREE.Object3D {
    constructor(width = 1.0, height = 1.0, displacement = new THREE.Vector3(0, 0, 0), material, backWallMaterial) {
        super()
        this.width = width
        this.height = height
        this.displacement = displacement
        this.mesh = null
        this.material = material
        this.backWallMaterial = backWallMaterial
        this.build()
    }

    build() {

        const wall = new THREE.PlaneGeometry(this.width, this.height)
        const donut = new THREE.RingGeometry(0.4, 1, 4, 32, Math.PI / 4);

        const leftWall = new THREE.Mesh(wall, this.material)
        const rightWall = new THREE.Mesh(wall, this.material)
        const frontWall = new THREE.Mesh(donut, this.material)
        const backWall = new THREE.Mesh(wall, this.backWallMaterial)

        // Transformations
        const offset = this.width / 2

        leftWall.position.z += offset
        leftWall.rotateY(Math.PI)

        rightWall.position.z -= offset

        frontWall.position.x += offset
        frontWall.rotateY(-Math.PI / 2)
        frontWall.scale.set(this.width*Math.cos(Math.PI/4), this.height*Math.cos(Math.PI/4), 1);

        backWall.position.x -= offset
        backWall.rotateY(Math.PI / 2)
        
        this.add(leftWall, rightWall, frontWall, backWall)
        this.position.copy(this.displacement)
        this.position.y += this.height / 2
    }
}

export { MyWalls };
