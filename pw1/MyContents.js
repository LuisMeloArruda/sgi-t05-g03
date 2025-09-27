import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
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
        this.diffusePlaneColor = "#7f7f7f"
        this.specularPlaneColor = "#7f7f7f"
        this.planeShininess = 100
        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess })

        // spotlight light related attributes
        this.spotlightColor = 0xffffff
        this.spotlightIntensity = 15
        this.spotlightDistance = 14
        this.spotlightAngle = Math.PI / 9
        this.spotlightPenumbra = 1
        this.spotlightDecay = 0
        this.spotlightPosition = new THREE.Vector3(5, 10, 2)
        this.spotlightTargetPosition = new THREE.Vector3(1, 0, 1)

        this.spotlight = new THREE.SpotLight(this.spotlightColor, this.spotlightIntensity, this.spotlightDistance,
            this.spotlightAngle, this.spotlightPenumbra, this.spotlightDecay
        );
        this.spotlight.position.copy(this.spotlightPosition)
        this.spotlight.target.position.copy(this.spotlightTargetPosition)
        this.spotlight.visible

        // spotlight helper
        this.spotlightHelper = new THREE.SpotLightHelper(this.spotlight);
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
        const ambientLight = new THREE.AmbientLight( 0x444444, 5 );
        this.app.scene.add( ambientLight );

        // // add a directional light
        // const directionalLight = new THREE.DirectionalLight();
        // directionalLight.intensity = 0
        // directionalLight.position.set(5, 10, 2)
        // directionalLight.target.position.set(1, 0, 1)
        // this.app.scene.add(directionalLight)

        // // directional light helper
        // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5)
        // this.app.scene.add(directionalLightHelper)

        // add spotlight
        this.app.scene.add(this.spotlight)

        // add spotlight helper
        this.app.scene.add(this.spotlightHelper)

        // add walls
        this.app.scene.add(this.walls)

        // add table
        this.app.scene.add(this.table)

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
     * updates spotlight's attributes
     * @param {THREE.Color | number} value
     * @param {String} attribute
     */
    updateSpotLight(value, attribute) {
        switch (attribute) {
            case "Visible":
                value ? this.app.scene.add(this.spotlight) : this.app.scene.remove(this.spotlight)
                break;
            case "Helper":
                value ? this.app.scene.add(this.spotlightHelper) : this.app.scene.remove(this.spotlightHelper)
            case "Color":
                this.spotlight.color.set(this.spotlightColor);
                break;
            case "Intensity":
                this.spotlight.intensity = value
                break;
            case "Distance":
                this.spotlight.distance = value
                break;
            case "Angle":
                this.spotlight.angle = value
                break;
            case "Penumbra":
                this.spotlight.penumbra = value
                break;
            case "Decay":
                this.spotlight.decay = value
                break;
            case "PositionX":
                this.spotlight.position.x = value
                break;
            case "PositionY":
                this.spotlight.position.y = value
                break;
            case "PositionZ":
                this.spotlight.position.z = value
                break;
            case "TargetX":
                this.spotlight.target.position.x = value
                this.app.scene.add(this.spotlight.target)
                break;
            case "TargetY":
                this.spotlight.target.position.y = value
                this.app.scene.add(this.spotlight.target)
                break;
            case "TargetZ":
                this.spotlight.target.position.z = value
                this.app.scene.add(this.spotlight.target)
                break;
            default:
        }
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
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
    }

}

export { MyContents };