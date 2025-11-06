import * as THREE from "three";


class MyTerrainSegment extends THREE.Object3D {

    constructor(
        width = 100,
        height = 100,
        segX = 100,
        segY = 100,
        material = new THREE.MeshPhongMaterial({ color: 0x8e8b61, side: THREE.DoubleSide })
    ) {
        super();
        this.width = width
        this.height = height
        this.segX = segX
        this.segY = segY
        this.material = material

        this.build()
    }

    build() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height, this.segX, this.segY)
        geometry.rotateX(-Math.PI / 2)

        const pos = geometry.attributes.position;
        const arr = pos.array

        for (let i = 0; i < arr.length; i += 3) {
            const x = arr[i]
            const z = arr[i + 2]

            const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2.5 + (Math.random() - 0.5) * 1.5

            arr[i + 1] = y
        }

        const mesh = new THREE.Mesh(geometry, this.material)
        mesh.receiveShadow = true
        mesh.castShadow = false
        this.add(mesh)

        this.geometry = geometry
        this.mesh = mesh
    }

    getHeightAt(x, z) {
        const pos = this.geometry.attributes.position;
        const arr = pos.array;
        let nearestY = 0;
        let minDist = Infinity;
    
        for (let i = 0; i < arr.length; i += 3) {
            const vx = arr[i];
            const vy = arr[i + 1];
            const vz = arr[i + 2];
    
            const dx = vx - x;
            const dz = vz - z;
            const distSq = dx * dx + dz * dz;
    
            if (distSq < minDist) {
                minDist = distSq;
                nearestY = vy;
            }
        }
    
        return nearestY;
    }
}

export { MyTerrainSegment};
