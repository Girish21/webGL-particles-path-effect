import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import bg from './assets/bg.jpg'
import fragmentShader from './shaders/fragment.frag?raw'
import vertexShader from './shaders/vertex.vert?raw'

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const mouse = {
  x: 0,
  y: 0,
}

const canvas = document.getElementById('webGL')

const svgPaths = Array.from(document.querySelectorAll('.cls-1'))
const lines = []

svgPaths.forEach(path => {
  const length = path.getTotalLength()
  const noOfPoints = Math.floor(length / 5)
  const points = []
  for (let i = 0; i < noOfPoints; i++) {
    const pointAt = length * (i / noOfPoints)
    const point = path.getPointAtLength(pointAt)
    points.push(new THREE.Vector3(point.x - 1024, point.y - 512, 0))
  }
  lines.push({
    id: THREE.MathUtils.generateUUID(),
    path,
    length,
    number: noOfPoints,
    points,
    speed: 1,
    curPos: 0,
  })
})

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera()
const controls = new OrbitControls(camera, canvas)
const renderer = new THREE.WebGLRenderer({ canvas })
const clock = new THREE.Clock()

controls.enableDamping = true

camera.fov = 75
camera.aspect = size.width / size.height
camera.far = 10000
camera.near = 100
camera.position.set(0, 0, 500)

scene.add(camera)

const pointGeometry = new THREE.BufferGeometry()
const pointMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
  },
  transparent: true,
  depthTest: true,
  depthWrite: true,
  blending: THREE.AdditiveBlending,
})
const pointsMesh = new THREE.Points(pointGeometry, pointMaterial)
const max = lines.length * 100
const positions = new Float32Array(max * 3)
const opacity = new Float32Array(max)

for (let i = 0; i < max; i++) {
  positions.set(
    [Math.random() * 1000 - 500, Math.random() * 1000 - 500, 0],
    i * 3
  )
  opacity.set([Math.random() / 2], i)
}

pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
pointGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacity, 1))

scene.add(pointsMesh)

const bgTexture = new THREE.TextureLoader().load(bg)
bgTexture.flipY = false
const bgGeometry = new THREE.PlaneBufferGeometry(2048, 1024)
const bgMaterial = new THREE.MeshBasicMaterial({
  map: bgTexture,
  color: 0x000050,
})
const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)

scene.add(bgMesh)

function resizeHandler() {
  size.height = window.innerHeight
  size.width = window.innerWidth

  camera.aspect = size.width / size.height
  camera.updateProjectionMatrix()

  renderer.setSize(size.width, size.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
resizeHandler()

window.addEventListener('resize', resizeHandler)

function tick() {
  const elapsedTime = clock.getElapsedTime()

  pointMaterial.uniforms.uTime.value = elapsedTime

  function updatePosition() {
    let j = 0
    lines.forEach(line => {
      line.curPos += line.speed
      line.curPos = line.curPos % line.number

      for (let i = 0; i < 100; i++) {
        const index = (line.curPos + i) % line.number
        const point = line.points[index]
        positions.set([point.x, point.y, point.z], j * 3)
        opacity.set([i / 500], j)
        j++
      }
    })
  }

  updatePosition()
  pointGeometry.attributes.opacity.needsUpdate = true
  pointGeometry.attributes.position.needsUpdate = true

  controls.update()

  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}
tick()

const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches
const event = isTouch ? 'touchmove' : 'mousemove'
let timeoutId
window.addEventListener(event, e => {
  if (isTouch && e.touches?.[0]) {
    const touchEvent = e.touches[0]
    mouse.x = (touchEvent.clientX / size.width) * 2 - 1
    mouse.y = (-touchEvent.clientY / size.height) * 2 + 1
  } else {
    mouse.x = (e.clientX / size.width) * 2 - 1
    mouse.y = (-e.clientY / size.height) * 2 + 1
  }

  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    mouse.x = 0
    mouse.y = 0
  }, 1000)
})
