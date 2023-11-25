import { Clock, OrthographicCamera, ShaderMaterial, WebGLRenderer } from 'three'
import Loader from './loader'
import SceneA from './scenes/SceneA'
import SceneB from './scenes/SceneB'
import { ThreeModels, Transition as TransitionType } from './types'
import TransitionClass from './utils/Transition'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min'
import { cloneThreeModels } from './utils/cloneThreeModels'

/********************************************************************************/
/* ----------------------------------- MODELS --------------------------------- */
/********************************************************************************/
const models: ThreeModels = await Loader();
console.log("Tous les modèles sont chargés !");

/********************************************************************************/
/* ----------------------------------- INIT --------------------------------- */
/********************************************************************************/
const transitionParams: TransitionType = {
	transition: 0,
	transitionBis: 0,
	animation: 0,
	timerParticules: 0,
	timerWater: 0,
	scrollPercentage: 0.02,
	sceneWeAt: 0,
	distance: 0, // a checker !
	animate: false,
	scrollForTransition: false,
	needScroll: true,
	animations_transiA: [
		false,
		false,
		false,
		false,
	],
	sceneToScene: function () {
		if (this.sceneWeAt == 0) {
			this.scrollForTransition = true;
			// this.myTween.start();
		} else {
			this.sceneWeAt = 0;
			this.myTweenBack.start();
		}
		// a retirer
		this.animate = true;
	},
	resetAnimation: function () {
		this.transition = 0,
		this.transitionBis = 0,
		this.animation = 0,
		this.timerParticules = 0,
		this.timerWater = 0,
		this.scrollPercentage = 0.02,
		this.sceneWeAt = 0,
		this.distance = 0, // a checker !
		this.animate = false,
		this.scrollForTransition = false,
		this.needScroll = true,
		this.animations_transiA = [
			false,
			false,
			false,
			false,
		],
		scenes.sceneA = new SceneA(cloneThreeModels(models), renderer, gui);
		scenes.sceneB = new SceneB(cloneThreeModels(models), renderer, transitionParams);
		transition = new TransitionClass(scenes.sceneA, scenes.sceneB, models, transitionParams);
	},
};

/********************************************************************************/
/* ----------------------------------- RENDER --------------------------------- */
/********************************************************************************/
const canvas: HTMLCanvasElement | null = document.querySelector('canvas.webgl');
(!canvas) && process.exit(1);

const renderer = new WebGLRenderer({ canvas: canvas!, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const stats = new Stats;
document.body.appendChild(stats.dom);

/********************************************************************************/
/* ----------------------------------- SCENES --------------------------------- */
/********************************************************************************/
const camera = new OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -10, 10);
const gui = new GUI(); // TMP - Debug
const scenes: { [key: string]: SceneA | SceneB } = {
	sceneA: new SceneA(cloneThreeModels(models), renderer, gui),
	sceneB: new SceneB(cloneThreeModels(models), renderer, transitionParams)
};

/********************************************************************************/
/* ----------------------------------- EVENTS --------------------------------- */
/********************************************************************************/
window.addEventListener('wheel', function () {
	if (transitionParams.needScroll) {
		transitionParams.animation++;

		transitionParams.needScroll = false;
		if (transitionParams.animation > 8) {
			transitionParams.resetAnimation();
		}
	}
	if (transitionParams.scrollForTransition) {
		transitionParams.transitionBis += transitionParams.scrollPercentage;
		transitionParams.transitionBis = Math.min(Math.max(transitionParams.transitionBis, 0), 1);
		if (transitionParams.transition > 0.8) {
			transitionParams.transition = 1;
			transitionParams.scrollForTransition = false;
			transitionParams.animate = false;
			transitionParams.sceneWeAt = 1;
		}
	}
});

window.addEventListener('resize', () => {
	console.log('resize');

	models.camera[0].aspect = window.innerWidth / window.innerHeight;
	models.camera[0].updateProjectionMatrix();
	models.camera[1].aspect = window.innerWidth / window.innerHeight;
	models.camera[1].updateProjectionMatrix();

	camera.left = window.innerWidth / - 2;
	camera.right = window.innerWidth / 2;
	camera.top = window.innerHeight / 2;
	camera.bottom = window.innerHeight / - 2;
	camera.updateProjectionMatrix();

	(models.backgroundShader.material as ShaderMaterial).uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
	// (models.planeShader.geometry as PlaneGeometry).verticesNeedUpdate = true;

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

/********************************************************************************/
let transition = new TransitionClass(scenes.sceneA, scenes.sceneB, models, transitionParams);
const clock = new Clock();
function animate() {
	transition.render(clock.getElapsedTime(), camera, scenes.sceneA, scenes.sceneB, renderer, models, transitionParams)
	stats.update();
	requestAnimationFrame(animate);
}
animate();
