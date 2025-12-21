import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

class ScratchesEffect {
    constructor(texture, strength = 0.3) {

        this.pass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null},
                scratchesTex: {value: texture},
                strength: {value: strength},
            },

            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,

            fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform sampler2D scratchesTex;
            uniform float strength;
            varying vec2 vUv;

            void main() {
                vec4 baseColor = texture2D(tDiffuse, vUv);
                vec3 scratches = 1.0 - texture2D(scratchesTex, vUv).rgb;
                gl_FragColor = vec4(baseColor.rgb + scratches * strength, baseColor.a);
            }
            `,
        })
        
        this.pass.enabled = false
    }


    setStrength(v) {
        this.pass.uniforms.strength.value = v
    }
}


export { ScratchesEffect };
