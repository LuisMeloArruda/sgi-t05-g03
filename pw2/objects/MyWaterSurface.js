import * as THREE from "three";

class MyWaterSurface extends THREE.Object3D {
    constructor(
        width = 500,
        height = 500,
        segX = 100,
        segY = 100,
        material = new THREE.MeshPhongMaterial({ color: 0x10212a })
    ) {
        super();
        this.width = width;
        this.height = height;
        this.segX = segX;
        this.segY = segY;
        this.material = material;
        this.build();
    }
    
    build() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height, this.segX, this.segY);
        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.rotateX(THREE.MathUtils.degToRad(90))
        this.add(mesh);
    }
    
    update() {
        
    }
}

export { MyWaterSurface }