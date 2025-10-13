import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MySubmarine } from './objects/MySubmarine.js';

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