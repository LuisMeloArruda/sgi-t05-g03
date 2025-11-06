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
        complexity = 20,
    ) {
        super();
        this.material = material;
        this.stack = [];
        this.dna = null;
        this.genePtr = 0;
        this.group = new THREE.Group();
        this.group.scale.setScalar(0.3);
        // this.branchMatrices = [];
        this.turtle = {
            position: new THREE.Vector3(0,0,0),
            quaternion: new THREE.Quaternion(),
        };
        this.branchLen = 0.3;
        this.build(complexity);
    }

    build(complexity) {
        this.makeDna(complexity);
        
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

    makeDna(complexity) {
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

        const axiom = 'R';

        const any_log = (base, val) => Math.log10(val)/Math.log10(base); 
        
        // Calc string
        this.dna = axiom;
        for (let i = 0; i < complexity; i++) {
            let nextStr = '';
            for (const char of this.dna) {
                if (rules[char]) {
                    nextStr += this.chooseNextRule(rules[char]);
                } else {
                    nextStr += char;
                }
            }
            this.dna = nextStr;
            if (this.dna.length >= Math.pow(complexity,any_log(3,complexity))) {
                console.log("hit limit");
                return;
            }
        }        
    }

    update() {
        for (let i = 0; i < 20; i++) {
            this.grow();   
        }
    }

    grow() {
        if (this.genePtr >= this.dna.length) {
            return;
        }
        const pitchAng = 10 * THREE.MathUtils.DEG2RAD;
        const rollAng = 10 * THREE.MathUtils.DEG2RAD;
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
                const branchGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 6, 1);
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
