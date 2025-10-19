import * as THREE from "three";

// TODO: This is only a placeholder
class MyCoral extends THREE.Object3D {

    constructor(
        material = new THREE.MeshBasicMaterial({color: 0xea76cb, side: THREE.DoubleSide}),
        complexity = 30,
    ) {
        super();
        this.material = material;
        this.build(complexity);
    }

    build(complexity) {
        // TODO

        const mesh = this.createObject( complexity);
        
        this.add(mesh);
    }

    chooseNextRule(options) {
        const total = options.reduce((acc, opt) => sum + opt.prob, 0);

        let rand = Math.random() * total;

        for (const opt of options) {
            rand -= opt.prob;
            if (rand <= 0) return opt.rule;
        }
         
    }

    createObject(complexity) {
        // ops
        // Pitch ^ up  | & dwn (X)
        // Yaw   - lft | + rgt (Y)
        // Roll  ! lft | ? rgt (Z)
        // LS    [ sav | ] lod

        const pitchAng = 10 * THREE.MathUtils.DEG2RAD;
        const rollAng = 10 * THREE.MathUtils.DEG2RAD;
        const yawAng = 10 * THREE.MathUtils.DEG2RAD;
        const varAng = 9 * THREE.MathUtils.DEG2RAD;
        
        const rules = {
            'R': [
                {prob: 0.90, rule: 'RCC'},
                {prob: 0.10, rule: 'RR'},
            ],
            'C': [
                {prob: 0.30, rule: 'CC'},
                {prob: 0.20, rule: '[+?C][-!C]'},
                {prob: 0.20, rule: '[+^C][-&C]'},
                {prob: 0.15, rule: '[?^C][!&C]'},
                {prob: 0.10, rule: '[++??&C][--!!&C][+?^^C]'},
                {prob: 0.05, rule: 'E'},
            ],
            'E': [
                {prob: 1, rule: 'E'},
            ]
        }

        const axiom = 'R';

        // Calc string
        let coralString = axiom;
        for (let i = 0; i < complexity; i++) {
            let nextStr = '';
            for (const char of coralString) {
                if (rules[char]) {
                    nextStr += this.chooseNextRule(rules[char]);
                }
            }
            coralString = nextStr;
        }

        const stack = [];
        let turtle = {
            position: new THREE.Vector3(0,0,0),
            quaternion: new THREE.Quaternion(),
        }

        let branchLen = 0.3;
        const lenFact = 0.95;
        const branchMatrices = [];

        const axisX = new THREE.Vector3(1,0,0);
        const axisY = new THREE.Vector3(0,1,0);
        const axisZ = new THREE.Vector3(0,0,1);

        const q = new THREE.Quaternion();

        const randAngle = x => x + (Math.random() * 2 - 1) * varAng;

        for (const char of coralString) {
            const pitch = randAngle(pitchAng);
            const yaw = randAngle(yawAng);
            const roll = randAngle(rollAng);
            switch (char) {
                case 'R', 'C', 'E': {
                    const startPos = turtle.position.clone();
                    const forward = new THREE.Vector3(0,1,0)
                        .applyQuaternion(turtle.quaternion)
                        .multiplyScalar(branchLen);
                    turtle.position.add(forward);
                    const instMatrix = new THREE.Matrix4();
                    const orientation = new THREE.Quaternion().setFromUnitVectors(axisY,forward.clone().normalize());
                    const scale = new THREE.Vector3(1, branchLen, 1);
                    instMatrix.compose(startPos, orientation, scale);
                    branchMatrices.push(instMatrix);
                    break;   
                }
                case '+': {
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisY, yaw));
                    break;
                }
                case '-': {
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisY, -yaw));
                    break;
                }
                case '^': {
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisX, pitch));
                    break;
                }
                case '&': {
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisX, -pitch));
                    break;
                }
                case '?': {
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisZ, roll));
                    break;
                }
                case '!': {
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisZ, -roll));
                    break;
                }
                case '[': {
                    stack.push({
                        position: turtle.position.clone(),
                        quaternion: turtle.quaternion.clone(),
                        lenght: branchLen,
                    });
                    branchLen *= lenFact;
                    break;
                }
                case ']': {
                    const state = stack.pop();
                    if (!state) break;
                    turtle.position = state.position;
                    turtle.quaternion = state.quaternion;
                    branchLen = state.lenght;
                    break;
                }
                default:
                    continue;
            }
        }

        const group = new THREE.Group();

        const branchGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
        branchGeo.translate(0, 0.5,0);
        const branchMat = this.material;
        const branchMesh = new THREE.InstancedMesh(branchGeo, branchMat, branchMatrices.length);

        branchMesh.name = "🪸";

        for (let i = 0; i < branchMatrices.length; i++) {
            branchMesh.setMatrixAt(i, branchMatrices[i]);
        }
        group.add(branchMesh);

        group.scale.setScalar(0.3);
        return group;
    }
 }

export { MyCoral };
