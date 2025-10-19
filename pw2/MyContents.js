import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MySubmarine } from './objects/MySubmarine.js';
import { MyRock } from './objects/MyRock.js';
import { MyTerrainSegment } from './objects/MyTerrainSegment.js';
import { MyCoral } from './objects/MyCoral.js';
import { MyBubble } from './objects/MyBubble.js';
import { MyFish } from './objects/MyFish.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null
        
        this.terrain = new THREE.Group();
        
        const segments = new THREE.Group();
        const segment1 = new MyTerrainSegment();
        segment1.scale.set(5, 5, 5);
        const segment2 = new MyTerrainSegment();
        segment2.scale.set(2, 2, 2);
        segment2.translateY(1);
        segment2.translateX(2.5);
        segments.add(segment1, segment2);
        
        const rocks = new THREE.Group();
        const rock1 = new MyRock();
        rock1.scale.set(1, 1, 0.5);
        const rock2 = new MyRock();
        rock2.scale.set(0.5, 1, 1);
        rock2.translateX(2);
        rocks.add(rock1, rock2);
        rocks.translateX(-1);
        rocks.translateY(0.5);
        rocks.translateZ(-1);
        
        this.terrain.translateY(0.1);
        this.terrain.add(segments, rocks);
        
        this.corals = new THREE.Group();
        const coral1 = new MyCoral();
        // coral1.scale.set(0.1, 1, 0.1);
        const coral2 = new MyCoral();
        // coral2.scale.set(0.1, 1, 0.1);
        coral2.translateX(0.2);
        coral2.rotateZ(-Math.PI / 180 * 20);
        this.corals.add(coral1, coral2);
        this.corals.translateX(-2);
        this.corals.translateY(0.5);
        this.corals.translateZ(2);

        this.bubbles = new THREE.Group();
        const bubble1 = new MyBubble();
        bubble1.scale.set(0.1, 0.1, 0.1);
        const bubble2 = new MyBubble();
        bubble2.scale.set(0.1, 0.1, 0.1);
        bubble2.translateX(0.3);
        bubble2.translateY(0.3);
        this.bubbles.add(bubble1, bubble2);
        this.bubbles.translateX(-2);
        this.bubbles.translateY(1.5);
        this.bubbles.translateZ(2);
        
        this.fishes = new THREE.Group();
        const fish1 = new MyFish();
        fish1.scale.set(0.3, 0.3, 0.3);
        const fish2 = new MyFish();
        fish2.scale.set(0.3, 0.3, 0.3);
        fish2.translateX(0.5);
        fish2.translateY(0.5);
        fish2.translateZ(0.5);
        this.fishes.add(fish1, fish2);
        this.fishes.translateY(1.5);

        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: "#0000ff", specular: "#000000", emissive: "#000000", shininess: 90
        })

        // Submarine related attributes
        this.submarineMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff00", specular: "#000000", emissive: "#000000", shininess: 90
        })

        this.submarine = new MySubmarine(1, new THREE.Vector3(0, 0, 0), this.submarineMaterial);
    }

    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555 );
        ambientLight.intensity = 50;
        this.app.scene.add( ambientLight );
        
        // Create a Plane Mesh with basic material
        let plane = new THREE.PlaneGeometry( 10, 10 );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );

        // add submarine
        this.app.scene.add(this.submarine);
        
        this.app.scene.add(this.terrain);
        this.app.scene.add(this.corals);
        this.app.scene.add(this.bubbles);
        this.app.scene.add(this.fishes);
    }

    /**
     * Updates the camera's position and target to follow the submarine while maintaining a constant offset
     */
    updateSubmarineCamera() {
        if (this.app.activeCameraName !== 'Submarine') return;

        const camera = this.app.activeCamera;
        const controls = this.app.controls;
        
        const offset = camera.position.clone().sub(controls.target);
        controls.target.copy(this.submarine.position);
        camera.position.copy(this.submarine.position.clone().add(offset));
        
        controls.update();
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        this.submarine.update();
        this.updateSubmarineCamera();
    }

}

export { MyContents };
