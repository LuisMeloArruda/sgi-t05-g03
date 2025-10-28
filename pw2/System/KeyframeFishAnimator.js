import * as THREE from 'three'

/**
 * Animates a 3D object along a looping path using random keyframe positions within bounds.
 *
 * @param {THREE.Object3D} object - The object to animate.
 * @param {number} keyframes - Number of control points (>=2).
 * @param {number} duration - Total animation duration (s).
 * @param {number} minX, maxX - X-axis bounds.
 * @param {number} minY, maxY - Y-axis bounds.
 * @param {number} minZ, maxZ - Z-axis bounds.
 */
class KeyframeFishAnimator {
  constructor(object, keyframes = 3, duration = 3,
    minX = -1, maxX = 1,
    minY = 0,  maxY = 1,
    minZ = -1, maxZ = 1)
    {
    this.minX = minX; this.maxX = maxX;
    this.minY = minY; this.maxY = maxY;
    this.minZ = minZ; this.maxZ = maxZ;
    this.object = object
    this.keyframes = Math.max(2, keyframes)
    this.duration = duration
    this.mixer = new THREE.AnimationMixer(this.object)
    this.clock = new THREE.Clock()
    this.previousPosition = new THREE.Vector3()
    this.currentPosition = new THREE.Vector3()

    this.object.getWorldPosition(this.previousPosition)

    const { times, positions } = this._generateRandomKeyframePath()
    const track = new THREE.VectorKeyframeTrack('.position', times, positions)
    const clip = new THREE.AnimationClip('swim', -1, [track])

    this.action = this.mixer.clipAction(clip)
    this.action.setLoop(THREE.LoopRepeat)
    this.action.play()
  }

  _generateRandomKeyframePath() {
    const points = []
    const start = this.previousPosition.toArray()
    points.push(start)

    for (let i = 1; i < this.keyframes; i++) {
      const p = [
        Math.random() * (this.maxX - this.minX) + this.minX,
        Math.random() * (this.maxY - this.minY) + this.minY,
        Math.random() * (this.maxZ - this.minZ) + this.minZ
      ]
      points.push(p)
    }

    points.push(start)

    const distances = []
    let total = 0
    for (let i = 0; i < points.length - 1; i++) {
      const d = this._distance(points[i], points[i + 1])
      distances.push(d)
      total += d
    }

    const times = [0]
    let cumulative = 0
    for (let i = 0; i < distances.length; i++) {
      cumulative += distances[i]
      times.push((cumulative / total) * this.duration)
    }

    const positions = points.flat()
    return { times, positions }
  }

  _distance(a, b) {
    return Math.sqrt(
      (a[0] - b[0]) ** 2 +
      (a[1] - b[1]) ** 2 +
      (a[2] - b[2]) ** 2
    )
  }

  update() {
    const delta = this.clock.getDelta()
    this.mixer.update(delta)

    this.object.getWorldPosition(this.currentPosition)
    const direction = new THREE.Vector3().subVectors(this.currentPosition, this.previousPosition)

    this.object.lookAt(this.currentPosition.clone().add(direction))

    this.previousPosition.copy(this.currentPosition)
  }
}

export { KeyframeFishAnimator };