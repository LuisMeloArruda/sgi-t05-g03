import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TintEffect } from './TintEffect.js';
import { CameraOverlay } from './CameraOverlay.js';
import { CircleClip } from './CircleClip.js'

/**
 * MyPostProcessing
 * Manages the render and post-processing effects.
 * Controls which effects are applied based on the active camera.
 */
class MyPostProcessing {
    constructor (
        renderer,
        scene,
        activeCamera,
    ) {
    this.renderer = renderer
    this.scene = scene
    this.activeCamera = activeCamera

    this.composer = new EffectComposer(renderer);

    this.resScale = 1;
    this.composer.setSize(window.innerWidth * this.resScale, window.innerHeight * this.resScale);


    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // DoF effect
    this.params = {
        focus: 5,
        aperture: 0.00025,
        maxblur: 0.01
    };

    this.bokehPass = new BokehPass(scene, camera, {
        focus: this.params.focus,
        aperture: this.params.aperture,
        maxblur: this.params.maxblur,
    });

    this.bokehPass.enabled = false
    this.composer.addPass(this.bokehPass);

    // Output Pass for color
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    // Tint effect
    this.tintEffect = new TintEffect({
        tintColor: new THREE.Vector3(1.1, 1.2, 0.9),
        strength: 0.8
    })
    this.composer.addPass(this.tintEffect.pass)

    // Scratches effect
    const loader = new THREE.TextureLoader()
    const scratchesTex = loader.load('objects/assets/periscope/scratches.jpeg')
    this.scratchesEffect = new CameraOverlay(scratchesTex, 0.3, false)
    this.composer.addPass(this.scratchesEffect.pass)

    // HUD effect
    const hudTex = loader.load('objects/assets/periscope/HUD.png')
    this.hudEffect = new CameraOverlay(hudTex, 0.7, true)
    this.composer.addPass(this.hudEffect.pass)

    // Clip effect
    this.circleClipEffect = new CircleClip(0.55)
    this.composer.addPass(this.circleClipEffect.pass)
    }

    update() {
        if (this.bokehPass.enabled) {
            const u = this.bokehPass.uniforms;
            u.focus.value = this.params.focus;
            u.aperture.value = this.params.aperture;
            u.maxblur.value = this.params.maxblur;
        }
    }

    setCamera(camera) {
        this.camera = camera;
        this.renderPass.camera = camera;
        this.bokehPass.camera = camera;

        this.bokehPass.enabled = !!camera.userData.useDOF;
        this.tintEffect.pass.enabled = !!camera.userData.useTint;
        this.scratchesEffect.pass.enabled = !!camera.userData.useScratches;
        this.hudEffect.pass.enabled = !!camera.userData.useHUD;
        this.circleClipEffect.pass.enabled = !!camera.userData.useCircleClip
    }

    resize(width, height) {
        this.composer.setSize(width * this.resScale, height * this.resScale);

        if (this.hudEffect.pass.enabled) {
            this.hudEffect.resize(width, height)
        }
        if (this.scratchesEffect.pass.enabled) {
            this.scratchesEffect.resize(width, height)
        }
        if (this.circleClipEffect.pass.enabled) {
            this.circleClipEffect.resize(width, height)
        }
    }

    render() {
        this.composer.render();
    }
}

export { MyPostProcessing };