import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const parameters = {

}
parameters.count = 100000
parameters.size = .01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = .2
parameters.randomnessPower = 2
parameters.insideColor = 0xff6030
parameters.outsideColor = 0x1b3984

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {

    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry()

    const pointsArray = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchesAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1)

        pointsArray[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX
        pointsArray[i3 + 1] = randomY
        pointsArray[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ

        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)
}

gui.add(parameters, 'count').min(100).max(1000000).step(100).name('Stars count').onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(.001).max(.1).step(.001).name('Stars size').onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(.01).max(20).step(.01).name('Galaxy radius').onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).name('Galaxy branches').onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(.001).name('Galaxy spin').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(.001).name('Galaxy randomness').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(.001).name('Galaxy randomness power').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').name('Galaxy inside color').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').name('Galaxy outside color').onFinishChange(generateGalaxy)

generateGalaxy()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // generateGalaxy()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()