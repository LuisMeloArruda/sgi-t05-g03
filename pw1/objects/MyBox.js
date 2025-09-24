import * as THREE from 'three';

// I just added this here because MyContent.js has code of MyBox interacting with MyGuiInterface.js
// you can remove it if you want
class MyBox {
    constructor(size = 1.0, displacement = new THREE.Vector3(0, 2, 0), material = null) {
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

        const geometry = new THREE.BoxGeometry(this.size, this.size, this.size)

        this.mesh = new THREE.Mesh(geometry, this.material)
        this.mesh.position.copy(this.displacement)

        // Transformations
        this.mesh.rotateX(-Math.PI / 3)
        this.mesh.rotateX(-Math.PI / 3)
        this.mesh.scale.set(3, 2, 1)
    }

    updatePosition(displacement) {
        this.displacement.copy(displacement)
        this.mesh.position.copy(this.displacement)
    }
    
}

export {MyBox};