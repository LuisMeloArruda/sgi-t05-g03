import * as THREE from "three";
import { MyApp } from "../MyApp.js";

// TODO: This is only a placeholder
class MyBasicFish extends THREE.Object3D {
    constructor(
        material = new THREE.MeshBasicMaterial({
            color: 0x1e66f5,
            side: THREE.DoubleSide,
        }),
    ) {
        super();
        this.material = material;
        this.build();
    }

    build() {
        // TODO: Replace with BoxSquare
        const geometry = new THREE.SphereGeometry(0.5);
        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.scale.set(1.0, 0.3, 0.3);
        this.add(mesh);
    }
    
    update() {
        // Do nothing.
    }
}

class MyFish extends THREE.Object3D {
    constructor(
        app,
        body_width = 1,
        head_width = 0.2,
        tail_width = 0.1,
        height = 0.3,
        depth = 0.4,
        subdivisions = 7,
        material = new THREE.MeshStandardMaterial({
            skinning: true,
            metalness: 0.2,
            roughness: 0.8,
            color: 0x1e66f5,
        }), // TODO
    ) {
        super();
        this.app = app;
        this.body_width = body_width;
        this.head_width = head_width;
        this.tail_width = tail_width;
        this.height = height;
        this.depth = depth;
        this.subdivisions = subdivisions;
        this.material = material;
        this.base_vertices = 5;
        this.tail_filling = 0.5;
        this.upper_fin_start = 0.2;
        this.upper_fin_end = 0.7;
        this.anim_duration = 1.5;
        this.anim_angle = Math.PI / 180 * 45;
        this.build();
    }

    merge_components(...components) {
        for (const c of components) {
            this.indices = this.indices.concat(
                c.indices.map((i) => i + this.vertices.length / 3),
            );
            this.vertices = this.vertices.concat(c.vertices);
        }
    }

    build() {
        // Build geometry
        this.vertices = [];
        this.indices = [];
        this.merge_components(
            this.build_body(),
            this.build_tail(),
            this.build_upper_fin(),
        );
        let geometry = new THREE.BufferGeometry()
            .setIndex(this.indices)
            .setAttribute(
                "position",
                new THREE.Float32BufferAttribute(this.vertices, 3),
            );

        // TODO: Remove magic numbers 0.05 and 0.2
        // let left_pectoral_fin = this.build_pectoral_fin();
        // left_pectoral_fin.translateZ(this.depth / 2 - 0.05);
        // left_pectoral_fin.translateX(-this.body_width * 0.2);
        // left_pectoral_fin.rotateY(- Math.PI / 180 * 20);

        // let right_pectoral_fin = this.build_pectoral_fin();
        // right_pectoral_fin.translateZ(- this.depth / 2 + 0.05);
        // right_pectoral_fin.translateX(-this.body_width * 0.2);
        // right_pectoral_fin.rotateY(Math.PI / 180 * 20);

        // Build skeleton
        this.bones = [];
        const head = new THREE.Bone();
        head.position.x = -(this.body_width / 2) + this.head_width / 2;
        const body = new THREE.Bone();
        const tail = new THREE.Bone();
        tail.position.x = this.body_width + this.tail_width / 2;
        body.add(head, tail);
        this.bones.push(body, head, tail);

        const skeleton = new THREE.Skeleton(this.bones);
        const position = geometry.attributes.position;

        // Define Skinning Attributes
        const skinIndices = [];
        const skinWeights = [];

        for (let i = 0; i < position.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
            const x = vertex.x;
            const w1 = 1 - THREE.MathUtils.smoothstep(
                x,
                -this.body_width / 2,
                0
            );
            const w2 = THREE.MathUtils.smoothstep(
                x,
                0,
                this.body_width / 2 + this.tail_width,
            );
            const w0 = x > 0 ? 1 - w2 : 1 - w1;
            skinIndices.push(0, 1, 2, 0);
            skinWeights.push(w0, w1, w2, 0);
        }

        geometry.setAttribute(
            "skinIndex",
            new THREE.Uint16BufferAttribute(skinIndices, 4),
        );
        geometry.setAttribute(
            "skinWeight",
            new THREE.Float32BufferAttribute(skinWeights, 4),
        );

        let skinnedMesh = new THREE.SkinnedMesh(geometry, this.material);
        skinnedMesh.add(this.bones[0]);
        skinnedMesh.bind(skeleton);

        this.add(skinnedMesh);
    }

    build_body() {
        let vertices = [-this.body_width / 2, 0, 0, this.body_width / 2, 0, 0];
        const angle_step = (Math.PI * 2) / this.base_vertices;
        const start_x = -this.body_width / 2 + this.head_width;
        for (let scale = 1; scale > 0; scale -= 1 / this.subdivisions) {
            const base_x =
                start_x + (this.body_width - this.head_width) * (1 - scale);
            for (let angle = 0; angle < Math.PI * 2; angle += angle_step) {
                const base_z =
                    ((Math.cos(angle + Math.PI / 2) * this.depth) / 2) * scale;
                const base_y =
                    ((Math.sin(angle + Math.PI / 2) * this.height) / 2) * scale;
                vertices.push(base_x, base_y, base_z);
            }
        }

        let indices = [];
        for (let face = 2; face < this.base_vertices + 2; face++) {
            const left_end = 0;
            const next_face_vertice = ((face - 2 + 1) % this.base_vertices) + 2;
            indices.push(next_face_vertice, face, left_end);
        }

        let start_idx = 2;
        for (
            let subdivision = 0;
            subdivision < this.subdivisions;
            subdivision++
        ) {
            for (let face = 0; face < this.base_vertices; face++) {
                const vertices_already_counted =
                    start_idx + subdivision * this.base_vertices;
                const this_idx = face + vertices_already_counted;
                const next_vertice =
                    ((face + 1) % this.base_vertices) +
                    vertices_already_counted;
                const next_face = this_idx + this.base_vertices;
                const next_face_and_vertice =
                    ((face + 1) % this.base_vertices) +
                    vertices_already_counted +
                    this.base_vertices;
                indices.push(this_idx, next_vertice, next_face_and_vertice);
                indices.push(next_face_and_vertice, next_face, this_idx);
            }
        }

        start_idx = 2 + this.subdivisions * this.base_vertices;
        for (
            let face = start_idx;
            face < start_idx + this.base_vertices;
            face++
        ) {
            const right_end = 1;
            const next_face_vertice =
                ((face - start_idx + 1) % this.base_vertices) + start_idx;
            indices.push(right_end, next_face_vertice, face);
        }

        return { vertices, indices };
    }

    build_tail() {
        const vertices = [
            this.body_width / 2, 0, 0,
            this.body_width / 2 + this.tail_width * this.tail_filling, 0, 0,
            this.body_width / 2 + this.tail_width, this.height / 2, 0,
            this.body_width / 2 + this.tail_width, -this.height / 2, 0,
        ];

        const indices = [
            2, 0, 1,
            1, 0, 3,
            // Double side
            0, 2, 1,
            0, 1, 3
        ];

        return { vertices, indices };
    }

    build_upper_fin() {
        const start_x = -this.body_width / 2 + this.head_width;
        const end_x = this.body_width / 2;
        const start_y = this.height / 2;
        const end_y = 0;

        const vertices = [
            0, this.height / 2, 0,
        ];
        
        for (let percentage = this.upper_fin_start; percentage < this.upper_fin_end; percentage += 1 / this.subdivisions) {
            vertices.push(start_x + (end_x - start_x) * percentage, start_y + (end_y - start_y) * percentage, 0);
        }
        vertices.push(start_x + (end_x - start_x) * this.upper_fin_end, start_y + (end_y - start_y) * this.upper_fin_end, 0);

        const indices = [];
        
        for (let vertice = 2; vertice < vertices.length / 3; vertice++) {
            indices.push(vertice, 0, vertice - 1);
            indices.push(0, vertice, vertice - 1);
        }

        return { vertices, indices };
    }

    // TODO: Parameterize the pectoral fin
    build_pectoral_fin() {
        const vertices = [0, 0, 0, 0.2, 0, 0, 0.1, -0.1, 0, 0, -0.05, 0];

        const indices = [0, 3, 2, 1, 0, 2];

        let geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3),
        );
        const mesh = new THREE.Mesh(geometry, this.material);
        return mesh;
    }
    
    update() {
        this.app.timer.update();
        const timeElapsed = this.app.timer.getElapsed();
        const t = - (Math.cos(Math.PI * timeElapsed / this.anim_duration) - 1) / 2;
        const rotation = t * this.anim_angle - (this.anim_angle / 2);
        this.bones[1].rotation.y = rotation;
        this.bones[2].rotation.y = -rotation;
    }
}

export { MyBasicFish, MyFish };
