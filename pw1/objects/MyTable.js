import * as THREE from 'three';

// A table ;)
class MyTable extends THREE.Object3D {
    constructor(size = 1.0, displacement = new THREE.Vector3(0, 2, 0), material = null) {
        super()
        this.size = size
        this.displacement = displacement
        this.material = material
        this.mesh = null
        this.build()
    }

    build() {
        if (!this.material) {
            this.material = new THREE.MeshPhongMaterial(
                {color: "#ffff77", specular: "#000000", emissive: "#000000", shininess: 90}
            )
        }

        const legWidth = this.size / 4
        const legHeigh = this.size * 2
        const tableWidth = this.size * 4
        const tableHeight = this.size / 4

        const leg = new THREE.CylinderGeometry(legWidth, legWidth, legHeigh)
        const tableTop = new THREE.BoxGeometry(tableWidth, tableHeight, tableWidth)

        const leg1 = new THREE.Mesh(leg, this.material)
        const leg2 = new THREE.Mesh(leg, this.material)
        const leg3 = new THREE.Mesh(leg, this.material)
        const leg4 = new THREE.Mesh(leg, this.material)

        const tableTopMesh = new THREE.Mesh(tableTop, this.material)

        // Transformations
        const offset = tableWidth / 2 - legWidth

        leg1.position.z += offset
        leg1.position.x += offset

        leg2.position.z -= offset
        leg2.position.x += offset

        leg3.position.z += offset
        leg3.position.x -= offset

        leg4.position.z -= offset
        leg4.position.x -= offset

        tableTopMesh.position.y += legHeigh / 2

        this.add(leg1, leg2, leg3, leg4, tableTopMesh)
        this.position.copy(this.displacement)
    }
}

export {MyTable};