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

        const index = this.geometry.getIndex().array;
        
        let prev = new THREE.Vector3(0,0,0);
        let curr  = new THREE.Vector3(0,0,0);
        let next  = new THREE.Vector3(0,0,0);

        let target = new THREE.Vector3(0,0,0);
        let ray =  new THREE.Ray(new THREE.Vector3(x,1_000,z), new THREE.Vector3(0,-1,0));
            
        for (let i = 0; i < index.length; i += 3) {
            let prev_idx = index[i];
            let curr_idx = index[i + 1];
            let next_idx = index[i + 2];
            
            prev.setX(arr[prev_idx * 3]);
            prev.setY(arr[prev_idx * 3 + 1]);
            prev.setZ(arr[prev_idx * 3 + 2]);
            curr.setX(arr[curr_idx * 3]);
            curr.setY(arr[curr_idx * 3 + 1]);
            curr.setZ(arr[curr_idx * 3 + 2]);
            next.setX(arr[next_idx * 3]);
            next.setY(arr[next_idx * 3 + 1]);
            next.setZ(arr[next_idx * 3 + 2]);


            if (ray.intersectTriangle(prev, curr, next, false, target) != null) {
                break;
            }            
        }

        return target.y;
    }
}

export { MyTerrainSegment };
