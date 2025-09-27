import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder( 'Plane' );
        planeFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffusePlaneColor(value) } );
        planeFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updateSpecularPlaneColor(value) } );
        planeFolder.add(this.contents, 'planeShininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updatePlaneShininess(value) } );
        planeFolder.close();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'AnotherPerspective', 'Left', 'Top', 'Front' , 'Back', 'Right'] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.close()

        const spotLightData = {
            'Visible': this.contents.spotlight.visible,
            'Helper': this.contents.spotlightHelper.visible,
            'color': this.contents.spotlight.color,
            'intensity': this.contents.spotlight.intensity,
            'distance': this.contents.spotlight.distance,
            'angle': this.contents.spotlight.angle,
            'penumbra': this.contents.spotlight.penumbra,
            'decay': this.contents.spotlight.decay,
            'Position': this.contents.spotlight.position,
            'TargetPosition': this.contents.spotlight.target.position,
        };

        // adds a folder to the gui interface for the spotlight
        const spotLightFolder = this.datgui.addFolder('SpotLight')
        spotLightFolder.add(spotLightData, 'Visible').onChange(v => this.contents.updateSpotLight(v, "Visible"));
        spotLightFolder.add(spotLightData, 'Helper').onChange(v => this.contents.updateSpotLight(v, "Helper"));
        spotLightFolder.addColor(spotLightData, 'color').onChange(v => this.contents.updateSpotLight(v, "Color"));
        spotLightFolder.add(spotLightData, 'intensity', 0, 50).onChange(v => this.contents.updateSpotLight(v, "Intensity"));
        spotLightFolder.add(spotLightData, 'distance', 0, 200).onChange(v => this.contents.updateSpotLight(v, "Distance"));
        spotLightFolder.add(spotLightData, 'angle', 0, Math.PI / 2).onChange(v => this.contents.updateSpotLight(v, "Angle"));
        spotLightFolder.add(spotLightData, 'penumbra', 0, 1).onChange(v => this.contents.updateSpotLight(v, "Penumbra"));
        spotLightFolder.add(spotLightData, 'decay', 1, 5).onChange(v => this.contents.updateSpotLight(v, "Decay"));
        spotLightFolder.open()
        
        // spotlight and target positions
        const posFolder = spotLightFolder.addFolder('Position');

        posFolder.add(spotLightData.Position, 'x', -20, 20).onChange(v => this.contents.updateSpotLight(v, "PositionX"))
        posFolder.add(spotLightData.Position, 'y', -20, 20).onChange(v => this.contents.updateSpotLight(v, "PositionY"))
        posFolder.add(spotLightData.Position, 'z', -20, 20).onChange(v => this.contents.updateSpotLight(v, "PositionZ"))
        posFolder.close()

        const tarPosFolder = spotLightFolder.addFolder('Target Position');
        tarPosFolder.add(spotLightData.TargetPosition, 'x', -20, 20).onChange(v => this.contents.updateSpotLight(v, "TargetX"))
        tarPosFolder.add(spotLightData.TargetPosition, 'y', -20, 20).onChange(v => this.contents.updateSpotLight(v, "TargetY"))
        tarPosFolder.add(spotLightData.TargetPosition, 'z', -20, 20).onChange(v => this.contents.updateSpotLight(v, "TargetZ"))
        tarPosFolder.close()

    }
}

export { MyGuiInterface };