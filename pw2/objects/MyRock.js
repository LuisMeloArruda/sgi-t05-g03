import * as THREE from "three";

class MyBasicRock extends THREE.Object3D {

    constructor(
        material = new THREE.MeshPhongMaterial({ color: 0x4c4f69, side: THREE.DoubleSide })
    ) {
        super();
        this.material = material;
        this.build();
    }

    build() {
        const geometry = new THREE.BoxGeometry();
        let mesh = new THREE.Mesh(geometry, this.material);
        this.add(mesh);
    }
}

const rockDefaultMaterialSingleton = {
    material: null
};

class MyRock extends THREE.Object3D {

    constructor(
        material = rockDefaultMaterialSingleton,
        segments = 12,
        noise = 0.25,
    ) {
        super();
        this.initializeSingletonMaterial();

        if (material === rockDefaultMaterialSingleton) {
            this.material = material.material
        } else {
            this.material = material
        }


        this.segments = segments
        this.noise = noise
        this.build()
    }

    initializeSingletonMaterial() {
        if (rockDefaultMaterialSingleton.material === null) {
            rockDefaultMaterialSingleton.material = new THREE.MeshPhongMaterial({
                // color: 0x4c4f69,
                // flatShading: true,
                // shininess: 10,
                side: THREE.DoubleSide
            });
            const loader = new THREE.TextureLoader();
            const texture = loader.load("objects/assets/aerial_rocks_02_diff_480p.jpg");
            const bump = loader.load("objects/assets/aerial_rocks_02_nor_dx_480p.jpg");
            const disp = loader.load("objects/assets/aerial_rocks_02_disp_480p.jpg");
            texture.colorSpace = THREE.SRGBColorSpace;
            rockDefaultMaterialSingleton.material.map = texture;
            rockDefaultMaterialSingleton.material.bumpMap = bump;
            rockDefaultMaterialSingleton.material.bumpScale = 10;
            rockDefaultMaterialSingleton.material.displacementMap = disp;
            rockDefaultMaterialSingleton.material.displacementScale = 0.35;
        }
    }

    build() {
        const geometry = new THREE.BufferGeometry()
        const positions = []
        const indices = []
        const uv = []

        for (let y = 0; y <= this.segments; y++) {
            const v = y / this.segments
            const phi = v * Math.PI

            for (let x = 0; x <= this.segments; x++) {
                const u = x / this.segments
                const theta = u * Math.PI * 2

                const px = Math.sin(phi) * Math.cos(theta)
                const py = Math.cos(phi)
                const pz = Math.sin(phi) * Math.sin(theta)

                const displacement = 1 + THREE.MathUtils.randFloatSpread(this.noise)

                positions.push(
                    px * displacement,
                    py * displacement,
                    pz * displacement
                );

                uv.push(u,v);
            }
        }

        for (let y = 0; y < this.segments; y++) {
            for (let x = 0; x < this.segments; x++) {
                const a = y * (this.segments + 1) + x
                const b = a + this.segments + 1
                const c = b + 1
                const d = a + 1

                if (x < this.segments - 1) {
                    indices.push(a, b, d)
                    indices.push(b, c, d)
                } else {
                    const a2 = y * (this.segments + 1) + x
                    const b2 = a2 + this.segments + 1
                    const c2 = y * (this.segments + 1)
                    const d2 = (y + 1) * (this.segments + 1)
                    indices.push(a2, b2, c2)
                    indices.push(b2, d2, c2)
                }
            }
        }


        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
        geometry.setIndex(indices)
        geometry.computeVertexNormals()

        const mesh = new THREE.Mesh(geometry, this.material)
        this.add(mesh)
    }
}

export { MyBasicRock, MyRock };
