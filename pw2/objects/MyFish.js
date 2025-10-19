import * as THREE from "three";

// TODO: This is only a placeholder
class MyBasicFish extends THREE.Object3D {

    constructor(
        // TODO
        material = new THREE.MeshBasicMaterial({color: 0x1e66f5, side: THREE.DoubleSide})
    ) {
        super();
        // TODO
        this.material = material;
        this.build();
    }

    build() {
        // TODO
        const geometry = new THREE.SphereGeometry(0.5);
        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.scale.set(2, 1, 1);
        this.add(mesh);
    }
}

class MyFish extends THREE.Object3D {
    constructor(
        body_width = 1,
        head_width = 0.2,
        tail_width = 0.1,
        height = 0.3,
        depth = 0.4,
        material = new THREE.MeshBasicMaterial({color: 0x1e66f5, side: THREE.DoubleSide}) // TODO
    ) {
        super()
        this.body_width = body_width;
        this.head_width = head_width;
        this.tail_width = tail_width;
        this.height = height;
        this.depth = depth;
        this.material = material;
        this.base_vertices = 5;
        this.tail_filling = 0.5;
        this.upper_fin_start = 0.2;
        this.upper_fin_end = 0.7;
        this.build();
    }
    
    build() {
        const body = this.build_body();
        const tail = this.build_tail();
        const upper_fin = this.build_upper_fin();
        const bottom_left_fin = this.build_bottom_left_fin();
        const bottom_right_fin = this.build_bottom_right_fin();
        
        // TODO: Transformations
        
        this.add(body, tail, upper_fin);
    }
    
    build_body() {        
        let vertices = [
            -this.body_width / 2, 0, 0,
            this.body_width / 2, 0, 0
        ];
        
        const angle_step = Math.PI * 2 / this.base_vertices;
        const base_x = (-this.body_width / 2) + this.head_width;
        for (let angle = 0; angle < Math.PI * 2; angle += angle_step) {
            const base_z = Math.cos(angle + (Math.PI / 2)) * this.depth / 2;
            const base_y = Math.sin(angle + (Math.PI / 2)) * this.height / 2;
            vertices.push(base_x, base_y, base_z);
        }
        
        let indices = [];
        for (let face = 2; face < this.base_vertices + 2; face++) {
            const left_end = 0;
            const right_end = 1;
            const next_face_vertice = ((face - 2 + 1) % this.base_vertices) + 2;
            indices.push(face, next_face_vertice, left_end);
            indices.push(right_end, next_face_vertice, face);
        }
        
        let geometry = new THREE.BufferGeometry();
        geometry.setIndex( indices );
        geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ))
        const mesh = new THREE.Mesh(geometry, this.material);
        return mesh;
    }
    
    build_tail() {
        const vertices = [
            this.body_width / 2, 0, 0,
            this.body_width / 2 + this.tail_width * this.tail_filling, 0, 0,
            this.body_width / 2 + this.tail_width, this.height / 2, 0,
            this.body_width / 2 + this.tail_width, -this.height / 2, 0
        ];
        
        const indices = [
            2, 0, 1,
            1, 0, 3,
        ];
        
        let geometry = new THREE.BufferGeometry();
        geometry.setIndex( indices );
        geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ))
        const mesh = new THREE.Mesh(geometry, this.material);
        return mesh;
    }
    
    build_upper_fin() {
        const start_x = -this.body_width / 2 + this.head_width;
        const end_x = this.body_width / 2;
        const start_y = this.height / 2;
        const end_y = 0;
        
        const vertices = [
            start_x + (end_x - start_x) * this.upper_fin_start, start_y + (end_y - start_y) * this.upper_fin_start, 0,
            0, this.height / 2, 0,
            start_x + (end_x - start_x) * this.upper_fin_end, start_y + (end_y - start_y) * this.upper_fin_end, 0
        ];
        
        const indices = [
            2, 1, 0
        ];
        
        let geometry = new THREE.BufferGeometry();
        geometry.setIndex( indices );
        geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ))
        const mesh = new THREE.Mesh(geometry, this.material);
        return mesh;
    }
    
    build_bottom_left_fin() {
        // TODO
    }
    
    build_bottom_right_fin() {
        // TODO
    }
}
export { MyBasicFish, MyFish };
