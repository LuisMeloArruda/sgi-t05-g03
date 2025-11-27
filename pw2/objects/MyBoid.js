import * as THREE from "three";
import { MyFish } from "./MyFish.js";
import { DynamicBVH } from "../System/DynamicBVH.js";

class MyBoid extends THREE.Object3D {
    constructor(
        dangerous_entities,
        staticBVH,
        fish_constructor = () => new MyFish(),
        cohesion = 0.5,
        separation = 0.5,
        alignment = 0.5,
        moveSpeed = 5,
        awareness = 12.5,
        totalFishes = 50,
        lowerLimit = new THREE.Vector3(-50, 5, -50),
        upperLimit = new THREE.Vector3(50, 50, 50),
        dangerSize = 5,
        useBVH = true,
    ) {
        super();
        this.dangerous_entities = dangerous_entities;
        this.fish_constructor = fish_constructor;
        this.cohesion = cohesion;
        this.separation = separation;
        this.alignment = alignment;
        this.moveSpeed = moveSpeed;
        this.awareness = awareness;
        this.totalFishes = totalFishes;
        this.lowerLimit = lowerLimit.clone();
        this.upperLimit = upperLimit.clone();
        this.dangerSize = dangerSize;

        this.fishes = [];
        this.timer = new THREE.Timer();
        this.timer.connect(document);

        // BVH attributes
        this.useBVH = useBVH;
        this.staticBVH = staticBVH;
        this.bvhRebuildInterval = 1;
        this._lastBVHRebuild = 0;

        this.build();
    }

    build() {
        for (let i = 0; i < this.totalFishes; i++) {
            const fish = this.fish_constructor();
            fish.alignment = new THREE.Vector3(0, 0, 0);
            fish.cohesion = new THREE.Vector3(0, 0, 0);
            fish.separation = new THREE.Vector3(0, 0, 0);
            fish.boundavoid = new THREE.Vector3(0, 0, 0);
            fish.acceleration = new THREE.Vector3(0, 0, 0);
            fish.velocity = new THREE.Vector3(
                THREE.MathUtils.randFloat(-1, 1),
                THREE.MathUtils.randFloat(-1, 1),
                THREE.MathUtils.randFloat(-1, 1),
            );
            fish.velocity.setLength(THREE.MathUtils.randFloat(0, 4));
            fish.position.set(
                THREE.MathUtils.randFloat(this.lowerLimit.x, this.upperLimit.x),
                THREE.MathUtils.randFloat(this.lowerLimit.y, this.upperLimit.y),
                THREE.MathUtils.randFloat(this.lowerLimit.z, this.upperLimit.z),
            );
            this.fishes.push(fish);
            this.add(fish);
        }

        this.neighborStructure = new DynamicBVH({ leafSize: 8 });
        this.neighborStructure.build(this.fishes);
    }

    _applyBoundaryAvoidance(fish) {
        const margin = Math.max(0.0001, this.dangerSize);
        const steer = new THREE.Vector3();

        if (fish.position.x < this.lowerLimit.x + margin) {
            steer.x += (this.lowerLimit.x + margin - fish.position.x) * 0.2;
        } else if (fish.position.x > this.upperLimit.x - margin) {
            steer.x -= (fish.position.x - (this.upperLimit.x - margin)) * 0.2;
        }

        if (fish.position.y < this.lowerLimit.y + margin) {
            steer.y += (this.lowerLimit.y + margin - fish.position.y) * 0.2;
        } else if (fish.position.y > this.upperLimit.y - margin) {
            steer.y -= (fish.position.y - (this.upperLimit.y - margin)) * 0.2;
        }

        if (fish.position.z < this.lowerLimit.z + margin) {
            steer.z += (this.lowerLimit.z + margin - fish.position.z) * 0.2;
        } else if (fish.position.z > this.upperLimit.z - margin) {
            steer.z -= (fish.position.z - (this.upperLimit.z - margin)) * 0.2;
        }

        if (steer.lengthSq() > 0) {
            steer.normalize().multiplyScalar(Math.max(0.1, this.separation) * 2.0);
            fish.acceleration.add(steer);
        }
    }

    _distanceToCapsule(fishPosition, entity) {
        const capsule = entity.userData.capsuleInfo;
        if (!capsule) return Infinity;

        const start = capsule.segment.start.clone().applyMatrix4(entity.matrixWorld);
        const end = capsule.segment.end.clone().applyMatrix4(entity.matrixWorld);

        const closest = new THREE.Vector3();
        new THREE.Line3(start, end).closestPointToPoint(fishPosition, true, closest);

        return closest.distanceTo(fishPosition) - capsule.radius;
    }

    flockBVH() {
        for (let i = 0; i < this.fishes.length; i++) {
            const fish = this.fishes[i];
    
            fish.boundavoid.set(0, 0, 0);
            fish.acceleration.set(0, 0, 0);
    
            const neighbors = this.neighborStructure
                .querySphere(fish.position, this.awareness, [])
                .filter(other => other !== fish);
    
            this._computeBoidForces(fish, neighbors);
            this._applyStaticCollision(fish);
            this._applyDangerAvoidance(fish);
        }
    }
    
    flockBruteForce() {
        for (const fish of this.fishes) {
            fish.boundavoid.set(0,0,0);
            fish.acceleration.set(0,0,0);
    
            const neighbors = [];
    
            for (const other of this.fishes) {
                if (fish === other) continue;
                const dist = fish.position.distanceTo(other.position);
                if (dist > 0 && dist < this.awareness) neighbors.push(other);
            }
    
            this._computeBoidForces(fish, neighbors);
            this._applyStaticCollision(fish);
            this._applyDangerAvoidance(fish);
        }
    }
    

    _computeBoidForces(fish, neighbors) {
        let total = 0;
    
        fish.alignment.set(0,0,0);
        fish.cohesion.set(0,0,0);
        fish.separation.set(0,0,0);
    
        const tmp = new THREE.Vector3();
    
        for (const other of neighbors) {
            if (other === fish) continue;
            if (!this._viewingAngle(other.position)) continue;
    
            fish.alignment.add(other.velocity);
            fish.cohesion.add(other.position);
    
            tmp.copy(fish.position).sub(other.position);
            const d = tmp.length();
            if (d > 0) fish.separation.addScaledVector(tmp, 1/d);
    
            total++;
        }
    
        if (total === 0) return;
    
        // alignment
        fish.alignment.divideScalar(total);
        if (fish.alignment.lengthSq() > 0.000001) {
            fish.alignment.normalize().multiplyScalar(this.alignment);
            fish.acceleration.add(fish.alignment);
        }
    
        // cohesion
        fish.cohesion.divideScalar(total);
        fish.cohesion.sub(fish.position);
        if (fish.cohesion.lengthSq() > 0.000001) {
            fish.cohesion.normalize().multiplyScalar(this.cohesion);
            fish.acceleration.add(fish.cohesion);
        }
    
        // separation
        if (fish.separation.lengthSq() > 0.000001) {
            fish.separation.normalize().multiplyScalar(this.separation);
            fish.acceleration.add(fish.separation);
        }
    }

    _applyDangerAvoidance(fish) {
        let danger_found = false;
    
        for (const entity of this.dangerous_entities || []) {
            if (!entity) continue;
    
            const d = entity.userData?.capsuleInfo
                ? this._distanceToCapsule(fish.position, entity)
                : fish.position.distanceTo(entity.position);
    
            if (d <= this.dangerSize) {
                danger_found = true;
                fish.boundavoid.add(
                    fish.position.clone().sub(entity.position).normalize()
                );
            }
        }
    
        if (danger_found) {
            if (fish.boundavoid.lengthSq() > 0.000001) {
                fish.boundavoid.normalize().multiplyScalar(this.moveSpeed);
                fish.acceleration.add(fish.boundavoid);
            }
            return;
        }
    
        this._applyBoundaryAvoidance(fish);
    }
    
    _applyStaticCollision(fish) {
        const staticBVH = this.staticBVH?.mesh?.geometry?.boundsTree;
        if (!staticBVH) return;
    
        const sphere = new THREE.Sphere(fish.position, this.dangerSize);
        let hit = false;
    
        staticBVH.shapecast({
            intersectsBounds: box => sphere.intersectsBox(box),
            intersectsTriangle: tri => { hit = true; return true; }
        });
    
        if (hit) {
            const avoid = fish.velocity.clone().multiplyScalar(-1);
            avoid.y += 1.5;
            avoid.setLength(this.moveSpeed);
            fish.acceleration.add(avoid);
        }
    }

    update() {
        this.timer.update();
        const t = this.timer.getDelta();

        if (this.useBVH) {
            this.flockBVH();
        } else {
            this.flockBruteForce();
        }

        for (const fish of this.fishes) {
            fish.position.addScaledVector(fish.velocity, t);
            fish.velocity.add(fish.acceleration);

            fish.velocity.clampLength(0, Math.max(0.0001, this.moveSpeed));

            fish.acceleration.set(0, 0, 0);

            fish.lookAt(fish.position.clone().add(fish.velocity));
            fish.rotateY(Math.PI / 2);

            fish.position.clamp(this.lowerLimit, this.upperLimit);
        }
    }

    // return true if other boid position is within our viewing angle
    _viewingAngle(other) {
        let rads = this.position.angleTo(other);
        return rads < 3.927 || rads > 5.4978;
    }
}

export { MyBoid };
