import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyWalls } from './objects/MyWalls.js';
import { MyTable } from './objects/MyTable.js';
import { MyOldCandle } from './objects/MyOldCandle.js';
import { MyLudoPiece } from './objects/MyLudoPiece.js';
import { MyDice } from './objects/MyDice.js';
import { MyPainting } from './objects/MyPainting.js';
import { MyWallLight } from './objects/MyWallLight.js';

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

        // Landscape related
        const lsTex = new THREE.TextureLoader().load('textures/landxp.jpg');
        const lsMat = new THREE.MeshPhongMaterial({map: lsTex});
        const fract = 7;
        const lsGeo = new THREE.PlaneGeometry(190 / fract, 100 / fract);
        this.lsMesh = new THREE.Mesh(lsGeo, lsMat);
        this.lsMesh.translateX(20);
        this.lsMesh.translateY(3);
        this.lsMesh.rotateY(-Math.PI / 2);

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

        // table related attributes
        const tableDisplacement = new THREE.Vector3(0, 0, 0)
        const tableTexture = new THREE.TextureLoader().load('textures/table_texture.jpg')
        const tableTopMaterial = new THREE.MeshPhongMaterial(
            {color: "#999999", specular: "#000000", emissive: "#000000", shininess: 90, map: tableTexture}
        )
        const tableLegMaterial = new THREE.MeshPhongMaterial(
            {color: "#999999", specular: "#eeeeee", emissive: "#000000", shininess: 90, map: tableTexture}
        )
        this.table = new MyTable(1.0, tableDisplacement, tableTopMaterial, tableLegMaterial)
        this.table.tableTopMaterial.map.wrapS = THREE.MirroredRepeatWrapping
        this.table.tableTopMaterial.map.wrapT = THREE.MirroredRepeatWrapping
        this.table.tableTopMaterial.map.repeat.set(1,1)

        this.table.tableLegMaterial.map.wrapS = THREE.MirroredRepeatWrapping
        this.table.tableLegMaterial.map.wrapT = THREE.MirroredRepeatWrapping
        this.table.tableLegMaterial.map.repeat.set(1,1)

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

        // spotlight helper
        this.spotlightHelper = new THREE.SpotLightHelper(this.spotlight);

        // ludo piece related attributes
        this.ludo_piece = new MyLudoPiece();
        this.ludo_piece.translateY(2.25);
        this.ludo_piece.translateX(-1);
        this.ludo_piece.translateZ(1);

        // dice related attributes
        this.dice = new MyDice();
        this.dice.translateY(2.15);
        this.dice.translateX(-0.7);
        this.dice.translateZ(0.7);
        this.dice.rotation.set(Math.PI / 180 * 25, 0, 0);
        
        // painting related attributes
        const left_picture = new THREE.TextureLoader().load('textures/left_painting.jpeg');
        const left_material = new THREE.MeshPhongMaterial({map: left_picture});
        this.left_painting = new MyPainting(left_material);
        this.left_painting.translateX(-3);
        this.left_painting.translateY(4);
        this.left_painting.translateZ(-7.49);
        
        const right_picture = new THREE.TextureLoader().load('textures/right_painting.jpeg');
        const right_material = new THREE.MeshPhongMaterial({map: right_picture});
        this.right_painting = new MyPainting(right_material);
        this.right_painting.translateX(3);
        this.right_painting.translateY(4);
        this.right_painting.translateZ(-7.49);
        
        // wall light related attributes
        this.wall_light = new MyWallLight();
        this.wall_light.translateZ(7.3);
        this.wall_light.translateY(4);
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

        // add lslight
        const lsLight = new THREE.DirectionalLight(0xff_ff_ff, 5);
        lsLight.target = this.lsMesh;
        lsLight.castShadow = true;
        lsLight.translateX(25);
        this.app.scene.add(lsLight);
                
        // add ls
        this.app.scene.add(this.lsMesh);

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

        // add ludo piece
        this.app.scene.add(this.ludo_piece);

        // add dice
        this.app.scene.add(this.dice);
        
        // add paintings
        this.app.scene.add(this.left_painting);
        this.app.scene.add(this.right_painting);
        
        // add wall light
        this.app.scene.add(this.wall_light);
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
