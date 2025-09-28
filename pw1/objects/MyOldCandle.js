import * as THREE from 'three';

/**
 * @param {number} size - Overall scale of the candle.
 * @param {THREE.Vector3} displacement - Vector displacement from the initial position.
 * @param {THREE.Material|null} material - Material of the candle body.
 * @param {THREE.Material|null} baseMaterial - Material of the candle base.
 */
class MyOldCandle extends THREE.Object3D {
    constructor(size = 1.0, displacement = new THREE.Vector3(0, 0, 0), material, baseMaterial) {
        super()
        this.size = size
        this.displacement = displacement
        this.material = material
        this.baseMaterial = baseMaterial
        this.mesh = null
        this.build()
    }

    build() {
        this.blackMaterial = new THREE.MeshPhongMaterial(
            {color: "#000000", specular: "#000000", emissive: "#000000", shininess: 90}
        )

        const baseWidth = this.size / 4.5
        const baseHeight = this.size
        const candleWidth = this.size / 5
        const candleHeight = this.size * 1.5
        const stringWidth = this.size / 48
        const stringHeight = this.size / 4

        const base = new THREE.CylinderGeometry(baseWidth, baseWidth, baseHeight)
        const candle = new THREE.CylinderGeometry(candleWidth * (3/4), candleWidth, candleHeight)
        const string = new THREE.CylinderGeometry(stringWidth, stringWidth, stringHeight)

        const baseMesh = new THREE.Mesh(base, this.baseMaterial)
        const candleMesh = new THREE.Mesh(candle, this.material)
        const stringMesh = new THREE.Mesh(string, this.blackMaterial)
        
        // Transformations
        candleMesh.position.y += baseHeight / 2

        stringMesh.position.y += baseHeight / 2 + candleHeight / 2

        this.add(baseMesh, candleMesh, stringMesh)
        this.position.copy(this.displacement)
        this.position.y += this.size / 2
    }    
}

export {MyOldCandle};