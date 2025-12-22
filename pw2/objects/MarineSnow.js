import * as THREE from 'three'

class MarineSnow {
    constructor({
        count = 2000,
        areaX = 50,
        areaZ = 50,
        topY = 70,
        bottomY = 0,
        minSpeed = 0.05,
        maxSpeed = 0.25,
        lodDistance = 50,
        lowcount = 300,
    }) {
        this.count = count
        this.lowCount = lowcount
        this.lodDistance = lodDistance

        this.areaX = areaX
        this.areaZ = areaZ

        this.topY = topY
        this.bottomY = bottomY

        this.positions = new Float32Array(count * 3)
        this.speeds = new Float32Array(count)
        this.phaseX = new Float32Array(count)
        this.phaseZ = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            this.positions[i3] = THREE.MathUtils.randFloat(-areaX, areaX)
            this.positions[i3 + 1] = THREE.MathUtils.randFloat(bottomY, topY)
            this.positions[i3 + 2] = THREE.MathUtils.randFloat(-areaZ, areaZ)

            this.speeds[i] = THREE.MathUtils.randFloat(minSpeed, maxSpeed)
            this.phaseX[i] = Math.random() * Math.PI * 2
            this.phaseZ[i] = Math.random() * Math.PI * 2
        }

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(this.positions, 3)
        )

        this.geometry.setDrawRange(0, count)

        this.material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
        })

        this.points = new THREE.Points(this.geometry, this.material)

        this.activeCount = count
        this.lodOn = true
    }

    update(delta, camera) {
        const time = performance.now() * 0.001

        const dist = camera.position.distanceTo(this.points.position)

        if (dist > this.lodDistance && this.lodOn) {
            this.activeCount = this.lowCount
            this.geometry.setDrawRange(0, this.activeCount)
            this.lodOn = false
        }

        if (dist <= this.lodDistance && !this.lodOn) {
            this.activeCount = this.count
            this.geometry.setDrawRange(0, this.activeCount)
            this.lodOn = true
        }

        for (let i = 0; i < this.activeCount; i++) {
            const i3 = i * 3

            if (delta === undefined) {
                console.log(delta)
            }
            this.positions[i3 + 1] -= this.speeds[i] * delta
            this.positions[i3] += Math.sin(time + this.phaseX[i]) * 0.01
            this.positions[i3 + 2] += Math.cos(time + this.phaseZ[i]) * 0.01

            if (this.positions[i3 + 1] < this.bottomY) {
                this.positions[i3] = THREE.MathUtils.randFloat(-this.areaX, this.areaX)
                this.positions[i3 + 1] = this.topY
                this.positions[i3 + 2] = THREE.MathUtils.randFloat(-this.areaZ, this.areaZ)
            }
        }

        this.geometry.attributes.position.needsUpdate = true
    }
}

export { MarineSnow }