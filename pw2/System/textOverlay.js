import * as THREE from 'three'

/**
 * Screen text overlay
 * Renders dynamic text using a font spritesheet.
 */
class textOverlay extends THREE.Group {
    constructor(
        fontTexture,
        cols,
        rows,
        charSize = 0.04,
        charMap= {}
    ) {
        super()

        this.fontTexture = fontTexture
        this.cols = cols
        this.rows = rows
        this.charSize = charSize
        this.charMap = charMap

        this.cellW = 1 / cols
        this.cellH = 1 / rows

        this.sprites = []
        this.text = ''

        this.fontTexture.wrapS = THREE.ClampToEdgeWrapping
        this.fontTexture.wrapT = THREE.ClampToEdgeWrapping
    }

    setText(str) {
        if (str === this.text) return
        this.text = str

        while ( this.sprites.length < str.length ) {
            const tex = this.fontTexture.clone()
            const material = new THREE.SpriteMaterial({
                map: tex,
                transparent: true
            })
            const sprite = new THREE.Sprite(material)
            sprite.scale.set(this.charSize, this.charSize, 1)
            this.sprites.push(sprite)
            this.add(sprite)
        }

        for (let i = 0; i < this.sprites.length; i++) {
            const sprite = this.sprites[i]

            if (i >= str.length) {
                sprite.visible = false
                continue
            }

            sprite.visible = true
            sprite.position.x = i * this.charSize
            
            const ch = str[i]
            const cell = this.charMap[ch] ?? this.charMap[' ']
            const [cx, cy] = cell

            sprite.material.map.repeat.set(this.cellW, this.cellH)
            sprite.material.map.offset.set(
                cx *  this.cellW,
                1 - (cy + 1) * this.cellH
            )
        }
    }
}

export { textOverlay };