import * as THREE from "three";

class MyBasicCoral extends THREE.Object3D {

    constructor(
        material = new THREE.MeshBasicMaterial({color: 0xea76cb, side: THREE.DoubleSide})
    ) {
        super();
        this.material = material;
        this.stack = [];
        this.build();
    }

    build() {
        const geometry = new THREE.CylinderGeometry();
        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.position.y = 0.5;
        mesh.scale.set(0.1, 1, 0.1)
        this.add(mesh);
    }

    update() {}
}

class MyCoral extends THREE.Object3D {

    constructor(
        material = new THREE.MeshPhongMaterial({color: 0xea76cb, side: THREE.DoubleSide}),
        max_dna_size = 1_000,
    ) {
        super();
        this.material = material;
        this.stack = [];
        this.max_dna_size = max_dna_size;
        this.dna = 'ER';
        this.genePtr = 0;
        this.group = new THREE.Group();
        this.group.scale.setScalar(0.3);
        // this.branchMatrices = [];
        this.turtle = {
            position: new THREE.Vector3(0,0,0),
            quaternion: new THREE.Quaternion(),
        };
        this.branchLen = 0.3;
        this.build();
    }

    build() {
        this.makeDna();
        console.log("Dna: ", this.dna);
        
        for (let i = 0; i < 5; i++) {
            this.update();
        }
        
        this.add(this.group);
    }

    chooseNextRule(options) {
        const total = options.reduce((acc, opt) => acc + opt.prob, 0);

        let rand = Math.random() * total;

        for (const opt of options) {
            rand -= opt.prob;
            if (rand <= 0) return opt.rule;
        }
         
    }

    makeDna() {
        // Very simple initial DNA
        for (let i = 0; i < 4; ++i) this.growDna();
    }

    update() {
        if (this.dna.length < this.max_dna_size && this.genePtr < this.dna.length) this.growDna();
        const change_to_grow = 0.005;
        for (let i = 0; i < 20; i++) {
            const is_grow =  Math.random() < change_to_grow;
            if (is_grow) this.grow();   
        }
    }

    growDna() {
        // ops
        // Pitch ^ up  | & dwn (X)
        // Yaw   - lft | + rgt (Y)
        // Roll  ! lft | ? rgt (Z)
        // LS    [ sav | ] lod
        const rules = {
            'R': [
                {prob: 0.95, rule: 'EC'},
                {prob: 0.05, rule: 'ER'},
            ],
            'C': [
                {prob: 0.62, rule: 'EC'},
                {prob: 0.10, rule: '[+?C][-!C]'},
                {prob: 0.10, rule: '[+^C][-&C]'},
                {prob: 0.10, rule: '[?^C][!&C]'},
                {prob: 0.07, rule: '[++??&C][--!!&C][+?^^C]'},
                {prob: 0.01, rule: 'E'},
            ],
            'E': [
                {prob: 1, rule: 'E'},
            ]
        }


        // const any_log = (base, val) => Math.log10(val)/Math.log10(base); 
    
        // Calc string
        let mutation_chance = 0;
        let generated = this.dna.slice(0, this.genePtr);
        let rest = this.dna.slice(this.genePtr, this.dna.length);
        let nextStr = '';
        for (let char of rest) {
            mutation_chance = mutation_chance > 0 ? mutation_chance : 0;
            if (rules[char]) {
                if (mutation_chance > Math.random()) nextStr += 'C'.repeat((Math.random()*5));
                nextStr += this.chooseNextRule(rules[char]);
            } else {
                nextStr += char;
                switch (char) {
                    case '[': {
                        mutation_chance += 0.05;
                    }
                    case ']': {
                        mutation_chance -= 0.05;
                    }
                    case '+':
                    case '-': {
                        mutation_chance += 0.1;
                    }
                    case '^':
                    case '&': {
                        mutation_chance -= 0.1;
                    }
                    case '?': 
                    case '!': {
                        mutation_chance += 0.01;
                    }
                    
                }
            }
        }
        this.dna = generated + nextStr;
    }

    grow() {
        if (this.genePtr >= this.dna.length) {
            return;
        }
        const pitchAng = 15 * THREE.MathUtils.DEG2RAD;
        const rollAng = 15 * THREE.MathUtils.DEG2RAD;
        const yawAng = 10 * THREE.MathUtils.DEG2RAD;
        const varAng = 9 * THREE.MathUtils.DEG2RAD;
        
        let branchLen = 0.3;
        const lenFact = 1;

        const axisX = new THREE.Vector3(1,0,0);
        const axisY = new THREE.Vector3(0,1,0);
        const axisZ = new THREE.Vector3(0,0,1);

        const q = new THREE.Quaternion();

        const randAngle = x => x + (Math.random() * 2 - 1) * varAng;

        const pitch = randAngle(pitchAng);
        const yaw = randAngle(yawAng);
        const roll = randAngle(rollAng);

        const command = this.dna[this.genePtr];
        this.genePtr += 1;
        switch (command) {
            case 'C':
            case 'E':
            case 'R': {
                const startPos = this.turtle.position.clone();
                const forward = new THREE.Vector3(0,1,0)
                    .applyQuaternion(this.turtle.quaternion)
                    .multiplyScalar(this.branchLen);
                this.turtle.position.add(forward);
                const instMatrix = new THREE.Matrix4();
                const orientation = new THREE.Quaternion().setFromUnitVectors(axisY,forward.clone().normalize());
                const scale = new THREE.Vector3(1, branchLen, 1);
                instMatrix.compose(startPos, orientation, scale);
                // this.branchMatrices.push(instMatrix);
                const branchGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 6, 1);
                branchGeo.translate(0, 0.5,0);
                const branchMat = this.material;

                const branchMesh = new THREE.InstancedMesh(branchGeo, branchMat, 1);
                branchMesh.name = "🪸";
                branchMesh.setMatrixAt(0, instMatrix);

                this.group.add(branchMesh);
                break;   
            }
            case '+': {
                this.turtle.quaternion.multiply(q.setFromAxisAngle(axisY, yaw));
                break;
            }
            case '-': {
                this.turtle.quaternion.multiply(q.setFromAxisAngle(axisY, -yaw));
                break;
            }
            case '^': {
                this.turtle.quaternion.multiply(q.setFromAxisAngle(axisX, pitch));
                break;
            }
            case '&': {
                this.turtle.quaternion.multiply(q.setFromAxisAngle(axisX, -pitch));
                break;
            }
            case '?': {
                this.turtle.quaternion.multiply(q.setFromAxisAngle(axisZ, roll));
                break;
            }
            case '!': {
                this.turtle.quaternion.multiply(q.setFromAxisAngle(axisZ, -roll));
                break;
            }
            case '[': {
                this.stack.push({
                    position: this.turtle.position.clone(),
                    quaternion: this.turtle.quaternion.clone(),
                    lenght: this.branchLen,
                });
                this.branchLen *= lenFact;
                break;
            }
            case ']': {
                const state = this.stack.pop();
                if (!state) break;
                this.turtle.position = state.position;
                this.turtle.quaternion = state.quaternion;
                this.branchLen = state.lenght;
                break;
            }
            default:
                console.log("Weird... '", command, "' is not supported.");
        }
    }
 }

export { MyCoral, MyBasicCoral};
