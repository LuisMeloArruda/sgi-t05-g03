import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyBox } from './objects/MyBox.js'
import { MyWalls } from './objects/MyWalls.js';
import { MyTable } from './objects/MyTable.js';
import { MyOldCandle } from './objects/MyOldCandle.js';

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

        // box related attributes
        this.boxEnabled = true
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0, 2, 0)
        this.box = new MyBox(1.0, this.boxDisplacement)

        // walls related attributes
        this.wallsDisplacement = new THREE.Vector3(0, 0, 0)
        this.walls = new MyWalls(15, 8, this.wallsDisplacement)

        // table related attributes
        this.tableDisplacement = new THREE.Vector3(0, 0, 0)
        this.table = new MyTable(1.0, this.tableDisplacement)

        // old candle related attributes
        this.oldCandleDisplacement = new THREE.Vector3(1, 2, 1)
        this.oldCandle = new MyOldCandle(0.5, this.oldCandleDisplacement)

        // plane related attributes
        this.diffusePlaneColor = "#ffffff"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess })
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

        // add a point light on top of the model
        const pointLight = new THREE.PointLight( 0xffffff, 500, 0 );
        pointLight.position.set( 0, 20, 0 );
        this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555 );
        this.app.scene.add( ambientLight );

        // add walls
        this.app.scene.add( this.walls)

        // add table
        this.app.scene.add( this.table)

        // add candle
        this.app.scene.add(this.oldCandle)
        
        // Create a Plane Mesh with basic material
        let plane = new THREE.PlaneGeometry( 15, 15 );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }
    
    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    
    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // this.updateBoxIfRequired()
        // this.box.updatePosition(this.boxDisplacement)
    }

}

export { MyContents };