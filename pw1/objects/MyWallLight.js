import * as THREE from "three";

class MyWallLight extends THREE.Object3D {

    constructor(
        radius = 0.5,
        height = 2,
        angle = 20,
        material = new THREE.MeshPhongMaterial({color: 0xccd0da, side: THREE.DoubleSide})
    ) {
        super();
        this.radius = radius;
        this.height = height;
        this.angle = angle;
        this.material = material;
        this.build();
    }

    build() {
        const cone_geometry = new THREE.ConeGeometry(this.radius, this.height, 32 * this.radius, 1, true);
        let cone = new THREE.Mesh(cone_geometry, this.material);
        cone.rotateX(Math.PI);
        cone.rotateY(- Math.PI / 2);
        cone.rotateZ(Math.PI / 180 * this.angle);
        const spotlight = new THREE.SpotLight( 0xffffff );
        spotlight.rotateZ(Math.PI);
        this.add(cone, spotlight);
    }
}

export { MyWallLight };
