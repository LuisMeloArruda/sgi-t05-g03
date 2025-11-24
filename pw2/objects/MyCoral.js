import * as THREE from "three";

class MyBasicCoral extends THREE.Object3D {

    constructor(
        material = new THREE.MeshPhongMaterial({color: 0xea76cb, side: THREE.DoubleSide, })
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

const coralMat = {
    material: null,
};

class MyCoral extends THREE.Object3D {
    constructor(
        material = coralMat.material,
        max_dna_size = 5000 * (0.25 + Math.random() * 0.75),
    ) {
        super();
        this.clock = new THREE.Timer();
        this.clock.connect(document);
        if (material === null) {
            this.initSingletonMat();
            material = coralMat.material;
        };
        this.material = material;
        if (this.material !== coralMat) {
            this.material.onBeforeCompile = (shader) => {
              shader.uniforms.time = this.material.userData.time;  
              // Manual vertex projection, might not work on different/future versions
              shader.vertexShader =
                  `
                  uniform float time;
                  `
                  + shader.vertexShader.replace(
                  '#include <project_vertex>',
                  `
                  vec4 mvPosition = vec4( transformed, 1.0 );
                  mvPosition = instanceMatrix * mvPosition;
  
                  float coralAlpha = time;
                  float sway1 = 0.2 * cos(sin(mod(0.5 * coralAlpha, 2.0 * PI)));
                  float sway2 = 0.2 * sin(cos(mod(0.5 * coralAlpha, 2.0 * PI)));
              
                  mvPosition.x += mvPosition.y * sway1;
                  mvPosition.z += mvPosition.y * sway2;
  
                  mvPosition = modelViewMatrix * mvPosition;
                  gl_Position = projectionMatrix * mvPosition;
                  `
              );
           }
        }
        
        this.doneGrowing = false;
        this.growthFactor = 1;
        this.stack = [];
        this.max_dna_size = max_dna_size;
        this.dna = 'ER';
        this.genePtr = 0;
        this.placedCount = 0;
        this.group = new THREE.Group();
        this.group.scale.setScalar(0.3);
        this.branchMatrices = [];
        this.turtle = {
            position: new THREE.Vector3(0,0,0),
            quaternion: new THREE.Quaternion(),
        };
        this.branchMesh = this.makeNewMesh(this.max_dna_size);
        this.branchLen = 0.3;
        this.build();
    }

    initSingletonMat() {
        if (coralMat.material === null) {
            coralMat.material = new THREE.MeshPhongMaterial({color: 0xea76cb, side: THREE.DoubleSide, });
            const loader = new THREE.TextureLoader();
            const texture = loader.load("objects/assets/coral_ground_02_rough_480p.jpg");
            const bump = loader.load("objects/assets/coral_fort_wall_01_ao_480p.jpg");
            texture.colorSpace = THREE.SRGBColorSpace;
            coralMat.material.map = texture;
            coralMat.material.bumpMap = bump;
            coralMat.material.bumpScale = 10;
            coralMat.material.userData.time = { value: 0 };
            coralMat.material.onBeforeCompile = (shader) => {
              shader.uniforms.time = this.material.userData.time;  
              // Manual vertex projection, might not work on different/future versions
              shader.vertexShader =
                  `
                  uniform float time;
                  `
                  + shader.vertexShader.replace(
                  '#include <project_vertex>',
                  `
                  vec4 mvPosition = vec4( transformed, 1.0 );
                  mvPosition = instanceMatrix * mvPosition;
  
                  float coralAlpha = time;
                  float sway1 = 0.2 * cos(sin(mod(0.5 * coralAlpha, 2.0 * PI)));
                  float sway2 = 0.2 * sin(cos(mod(0.5 * coralAlpha, 2.0 * PI)));
              
                  mvPosition.x += mvPosition.y * sway1;
                  mvPosition.z += mvPosition.y * sway2;
  
                  mvPosition = modelViewMatrix * mvPosition;
                  gl_Position = projectionMatrix * mvPosition;
                  `
              );  
           }
        }
    }

    makeNewMesh(size) {
        const branchGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 5, 1);
        branchGeo.translate(0, 0.5,0);
        const branchMat = this.material;
        const branchMesh = new THREE.InstancedMesh(branchGeo, branchMat, size);
        branchMesh.name = "🪸";
        return branchMesh;
    }
    
    clearGenetics() {
        this.dna = null;
        this.stack = null;
    }

    build() {
        this.makeDna();
        
        this.group.add(this.branchMesh);
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
        this.clock.update();
        this.material.userData.time.value = this.clock.getElapsed();
        if (this.dna === null) return;
        if (this.genePtr >= this.dna.length) {
            // console.log("Finished Growning: gf(", this.growthFactor, "), dna(",this.dna.length,")");
            this.clearGenetics();
            return;
        }
        if (this.dna.length < this.max_dna_size && this.genePtr < this.dna.length && this.growthFactor !== 0) this.growDna();
        const chance_to_grow = 0.1;
        if (Math.random() < chance_to_grow) {
            const prev_size = this.dna.length;
            this.grow();
            this.group.clear();
            this.group.add(this.branchMesh);
            this.growthFactor = this.dna.length - prev_size;
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
                {prob: 0.47, rule: 'EC'},
                {prob: 0.15, rule: '[+?CCC]C[-!C]'},
                {prob: 0.15, rule: '[+^C]CC[-&CCC]'},
                {prob: 0.15, rule: '[?^CC]CCC[!&CC]'},
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
                if (mutation_chance > Math.random()) nextStr += 'E'.repeat((Math.random()*5)) + 'C';
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
        const pitchAng = 20 * THREE.MathUtils.DEG2RAD * (0.7 > Math.random() ? 1 : -1);
        const rollAng = 20 * THREE.MathUtils.DEG2RAD * (0.6 > Math.random() ? 1 : -1);
        const yawAng = 13 * THREE.MathUtils.DEG2RAD * (0.7 > Math.random() ? 1 : -1);
        const varAng = 7 * THREE.MathUtils.DEG2RAD * (0.5 > Math.random() ? 1 : -1);
        
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
                this.branchMatrices.push(instMatrix);
                if (this.branchMatrices.length >= this.branchMesh.count) {
                    console.info("Making new mesh");
                    this.branchMesh = this.makeNewMesh(this.branchMesh.count * 2);
                    for (let i = 0; i < this.branchMatrices.length; i++) {
                        this.branchMesh.setMatrixAt(i, this.branchMatrices[i]);
                    }
                }

                // console.log("Adding matrix to place ", this.placedCount);
                this.branchMesh.setMatrixAt(this.placedCount, instMatrix);
                this.branchMesh.instanceMatrix.needsUpdate = true;
                this.placedCount += 1;

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
