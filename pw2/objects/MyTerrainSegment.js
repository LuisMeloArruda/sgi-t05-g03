import * as THREE from "three";

class MyBasicTerrainSegment extends THREE.Object3D {

    constructor(
        // TODO
        material = new THREE.MeshPhongMaterial({color: 0x8e8b61, side: THREE.DoubleSide})
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

class MyTerrainSegment extends THREE.Object3D {

    constructor(
        material = new THREE.MeshPhongMaterial({color: 0x8e8b61, side: THREE.DoubleSide})
    ) {
        super();
        this.material = material;
        this.build();
    }

    build() {
        const geometry = new THREE.PlaneGeometry();
        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.rotateX(Math.PI / 2);
        this.add(mesh);
    }
}

export { MyBasicTerrainSegment, MyTerrainSegment};
