import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyWalls } from './objects/MyWalls.js';
import { MyTable } from './objects/MyTable.js';
import { MyOldCandle } from './objects/MyOldCandle.js';
import { MyLudoPiece } from './objects/MyLudoPiece.js';

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
        const wallMaterial = new THREE.MeshPhongMaterial(
            {color: "#999999", specular: "#000000", emissive: "#000000", shininess: 90}
        )
        const backWallTexture = new THREE.TextureLoader().load('textures/window.jpg')
        const backWallMaterial = new THREE.MeshPhongMaterial(
            {color: "#999999", specular: "#000000", emissive: "#000000", shininess: 90, map: backWallTexture}
        )
        const wallsDisplacement = new THREE.Vector3(0, 0, 0)
        this.walls = new MyWalls(15, 8, wallsDisplacement, wallMaterial, backWallMaterial)
        this.walls.backWallMaterial.map.wrapS = THREE.ClampToEdgeWrapping
        this.walls.backWallMaterial.map.wrapT = THREE.ClampToEdgeWrapping
        this.walls.backWallMaterial.map.repeat.set(2, 2)
        this.walls.backWallMaterial.map.offset.set(-0.5, -0.5)

        // upside down
        // this.walls.backWallMaterial.map.center.set(0.5, 0.5)
        // this.walls.backWallMaterial.map.rotation = Math.PI

        this.walls.backWallMaterial.map

        // table related attributes
        const tableDisplacement = new THREE.Vector3(0, 0, 0)
        const tableTexture = new THREE.TextureLoader().load('textures/table_texture.jpg')
        const tableMaterial = new THREE.MeshPhongMaterial(
            {color: "#999999", specular: "#000000", emissive: "#000000", shininess: 90, map: tableTexture}
        )
        this.table = new MyTable(1.0, tableDisplacement, tableMaterial)
        this.table.material.map.wrapS = THREE.MirroredRepeatWrapping
        this.table.material.map.wrapT = THREE.MirroredRepeatWrapping
        this.table.material.map.repeat.set(1,1)

        // old candle related attributes
        const candleMaterial = new THREE.MeshPhongMaterial(
            {color: "#ffffff", specular: "#000000", emissive: "#000000", shininess: 90}
        )
        const candleBaseMaterial = new THREE.MeshPhongMaterial(
            {color: "#5d1d21", specular: "#000000", emissive: "#000000", shininess: 90}
        )
        const oldCandleDisplacement = new THREE.Vector3(1, 2, 1)
        this.oldCandle = new MyOldCandle(0.5, oldCandleDisplacement, candleMaterial, candleBaseMaterial)

        // plane related attributes
        this.diffusePlaneColor = "#ffffff"
        this.specularPlaneColor = "#ffffff"
        this.planeShininess = 100
        this.planeTexture = new THREE.TextureLoader().load('textures/floor.png')
        this.planeTexture.wrapS = THREE.MirroredRepeatWrapping
        this.planeTexture.wrapT = THREE.MirroredRepeatWrapping

        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess, map:this.planeTexture})

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

        this.ludo_piece = new MyLudoPiece();
        this.ludo_piece.translateY(2.25);
        this.ludo_piece.translateX(-1);
        this.ludo_piece.translateZ(1);
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
        let planeSize = 15
        let plane = new THREE.PlaneGeometry( planeSize, planeSize );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;

        this.planeTexture.repeat.set(planeSize, planeSize)

        this.app.scene.add( this.planeMesh );

        this.app.scene.add(this.ludo_piece);
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
                this.spotlight.color.set(value);
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
        this.spotlightHelper.update();
    }

    /**
     * updates back window texture from clap wrap to repeat wrap
     * @param {THREE.TextureLoader} value
     */
    updateBackWindow(value) {
        if (value == THREE.ClampToEdgeWrapping) {
            this.walls.backWallMaterial.map.wrapS = THREE.ClampToEdgeWrapping 
            this.walls.backWallMaterial.map.wrapT = THREE.ClampToEdgeWrapping 
        } else {
            this.walls.backWallMaterial.map.wrapS = THREE.RepeatWrapping 
            this.walls.backWallMaterial.map.wrapT = THREE.RepeatWrapping 
        }
        this.walls.backWallMaterial.map.needsUpdate = true
    }

    /**
     * updates the MyAxis visibility
     * @param {Boolean} value
     */
    updateMyAxis(value) {
        value ? this.axis.visible = true : this.axis.visible = false
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
