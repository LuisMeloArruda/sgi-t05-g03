import * as THREE from "three";

// TODO: This is only a placeholder
class MyTerrainSegment extends THREE.Object3D {

    constructor(
        // TODO
        material = new THREE.MeshBasicMaterial({color: 0xccd0da, side: THREE.DoubleSide})
    ) {
        super();
        // TODO
        this.material = material;
        this.build();
    }

    build() {
        // TODO
        const geometry = new THREE.PlaneGeometry();
        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.rotateX(Math.PI / 2);
        this.add(mesh);
    }
}

export { MyTerrainSegment };
