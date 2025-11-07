import * as THREE from "three";
import { MyFish } from "./MyFish.js";

class MyBoid extends THREE.Object3D {
    constructor(
        dangerous_entities,
        cohesion = 2,
        separation = 2,
        alignment = 2,
        moveSpeed = 5,
        awareness = 25,
        totalFishes = 50,
        lowerLimit = new THREE.Vector3(-50, 5, -50),
        upperLimit = new THREE.Vector3(50, 50, 50),
        dangerSize = 5,
    ) {
        super();
        this.dangerous_entities = dangerous_entities;
        this.cohesion = cohesion;
        this.separation = separation;
        this.alignment = alignment;
        this.moveSpeed = moveSpeed;
        this.awareness = awareness;
        this.totalFishes = totalFishes;
        this.lowerLimit = lowerLimit;
        this.upperLimit = upperLimit;
        this.dangerSize = dangerSize;

        this.fishes = [];
        this.timer = new THREE.Timer();
        this.timer.connect(document);

        this.build();
    }

    build() {
        for (let i = 0; i < this.totalFishes; i++) {
            const fish = new MyFish(this.app);
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
    }

    // Loop through every fish to update forces/accelerations
    flock() {
        if (this.fishes.length <= 1) return;

        // TODO: Improve performance; no need to test all fishes, just the ones close enough.
        for (const fish of this.fishes) {
            let total = 0;
            for (const other_fish of this.fishes) {
                if (fish === other_fish) continue;
                const distance = fish.position.distanceTo(other_fish.position);
                if (distance <= 0) continue;
                if (distance >= this.awareness) continue;
                if (!this._viewingAngle(other_fish.position)) continue;
                fish.alignment.add(other_fish.velocity);
                fish.cohesion.add(other_fish.position);
                fish.separation.addScaledVector(
                    fish.position.clone().sub(other_fish.position),
                    1 / distance,
                );
                total++;
            }

            if (total <= 0) continue;

            // the average direction of the neighbors' velocities
            fish.alignment.setLength(Math.min(this.moveSpeed, this.alignment));

            // the average position of neighbors
            fish.cohesion.divideScalar(total);
            // the direction from current position to average
            fish.cohesion.sub(fish.position);
            // an acceleration with that direction
            fish.cohesion.setLength(Math.min(this.moveSpeed, this.cohesion));

            // and average direction of the repulsion from neighbors
            fish.separation.setLength(
                Math.min(this.moveSpeed, this.separation),
            );

            fish.acceleration.add(fish.alignment);
            fish.acceleration.add(fish.cohesion);
            fish.acceleration.add(fish.separation);

            // boundary and danger avoidance
            let danger_found = false;
            for (const entity of this.dangerous_entities) {
                if (fish.position.distanceTo(entity.position) <= this.dangerSize) {
                    danger_found = true;
                    fish.boundavoid.add(fish.position.clone().sub(entity.position).normalize())
                }
            }
            
            if (danger_found) {
                fish.boundavoid.setLength(this.moveSpeed);
            } else {
                const lowerDangerZone = this.lowerLimit.clone().addScalar(this.dangerSize);
                const upperDangerZone = this.upperLimit.clone().subScalar(this.dangerSize);
                if (fish.position.x <= lowerDangerZone.x / 2) fish.boundavoid.setX(1);
                else if (fish.position.x >= upperDangerZone.x / 2) fish.boundavoid.setX(-1);
                if (fish.position.y <= lowerDangerZone.y / 2) fish.boundavoid.setY(1);
                else if (fish.position.y >= upperDangerZone.y / 2) fish.boundavoid.setY(-1);
                if (fish.position.z <= lowerDangerZone.z / 2) fish.boundavoid.setZ(1);
                else if (fish.position.z >= upperDangerZone.z / 2) fish.boundavoid.setZ(-1);
    
                fish.boundavoid.setLength(Math.min(1, this.moveSpeed));
            }
            
            fish.acceleration.add(fish.boundavoid);  
            
            if (
                !fish.position ||
                !fish.alignment ||
                !fish.cohesion ||
                !fish.separation ||
                !fish.boundavoid ||
                !fish.acceleration
            )
                console.error(fish);
        }
    }

    update() {
        this.flock();
        this.timer.update();
        const t = this.timer.getDelta();
        for (const fish of this.fishes) {
            fish.position.addScaledVector(fish.velocity, t);
            fish.velocity.add(fish.acceleration);
            fish.velocity.clampLength(-this.moveSpeed, this.moveSpeed);
            fish.acceleration.set(0, 0, 0);
            fish.lookAt(fish.position.clone().add(fish.velocity));
            fish.rotateY(Math.PI / 2); // The fish head should be pointing in the direction
        }
    }

    // return true if other boid position is within our viewing angle
    _viewingAngle(other) {
        let rads = this.position.angleTo(other);
        return rads < 3.927 || rads > 5.4978;
    }
}

export { MyBoid };
