import * as THREE from 'three';

/**
 * @param {number} width - Width of the walls.
 * @param {number} height - Height of the walls.
 * @param {THREE.Vector3} displacement - Vector displacement from the initial position.
 * @param {THREE.Material|null} material - Material of the walls.
 */
class MyWalls extends THREE.Object3D {
    constructor(width = 1.0, height = 1.0, displacement = new THREE.Vector3(0, 0, 0), material = null) {
        super()
        this.width = width
        this.height = height
        this.displacement = displacement
        this.mesh = null
        this.material = material
        this.build()
    }

    build() {
        if (!this.material) {
            this.material = new THREE.MeshPhongMaterial(
                {color: "#ff5900", specular: "#000000", emissive: "#000000", shininess: 90}
            )
        }

        const wall = new THREE.PlaneGeometry(this.width, this.height)

        const leftWall = new THREE.Mesh(wall, this.material)
        const rightWall = new THREE.Mesh(wall, this.material)
        const frontWall = new THREE.Mesh(wall, this.material)
        const backWall = new THREE.Mesh(wall, this.material)

        // Transformations
        const offset = this.width / 2

        leftWall.position.z += offset
        leftWall.rotateY(Math.PI)

        rightWall.position.z -= offset

        frontWall.position.x += offset
        frontWall.rotateY(-Math.PI / 2)

        backWall.position.x -= offset
        backWall.rotateY(Math.PI / 2)
        
        this.add(leftWall, rightWall, frontWall, backWall)
        this.position.copy(this.displacement)
        this.position.y += this.height / 2
    }
}

export { MyWalls };