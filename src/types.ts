import { AmbientLight, Group, HemisphereLight, Mesh, PerspectiveCamera, Points, RectAreaLight, Scene, Texture, WebGLRenderer } from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { Tween } from 'three/examples/jsm/libs/tween.module'

export type AnimationFunctionA = (elapsedTime: number, models: ThreeModels, camera: PerspectiveCamera, scene: Scene, transition: Transition) => void;
export type AnimationFunctionB = {
	waterAnimation: (time: number, setAnime: boolean[], ambientLight: AmbientLight, models: ThreeModels, transition: Transition) => boolean,
	transitionAnimation: (time: number, models: ThreeModels) => boolean,
	flashAnimation: (time: number, setAnime: boolean[], reactAreaLights: { light: RectAreaLight, helper: RectAreaLightHelper }[], models: ThreeModels, scene: Scene) => boolean,
	cameraAnimation: (event: MouseEvent, camera: PerspectiveCamera) => void,
	cameraFlashAnimation: (time: number, setCam: boolean[], models: ThreeModels, funcListener: (event: MouseEvent) => void) => boolean,
	galaxyAnimation: (time: number, setAnime: boolean[], ambientLight: AmbientLight, reactAreaLights: { light: RectAreaLight, helper: RectAreaLightHelper }[], models: ThreeModels, scene: Scene) => boolean,
	cameraGalaxyAnimation: (time: number, setCam: boolean[], camera: PerspectiveCamera) => void,
	resetSphereAnimation: (time: number, setAnime: boolean[], ambientLight: AmbientLight, hemisphereLight: HemisphereLight, models: ThreeModels) => boolean,
	resetDragonAnimation: (time: number, setAnime: boolean[], ambientLight: AmbientLight, hemisphereLight: HemisphereLight, models: ThreeModels) => boolean,
	resetGateAnimation: (time: number, setAnime: boolean[], ambientLight: AmbientLight, hemisphereLight: HemisphereLight, models: ThreeModels) => boolean,
	resetAureoleAnimation: ((time: number, setAnime: boolean[], ambientLight: AmbientLight, hemisphereLight: HemisphereLight, models: ThreeModels) => boolean)[],
	resetWaterAnimation: (time: number, setAnime: boolean[], ambientLight: AmbientLight, hemisphereLight: HemisphereLight, models: ThreeModels) => boolean
}

export type ThreeModels = {
	backgroundTexture: Texture,
	backgroundShader: Mesh,
	fontA1: Mesh,
	fontA2: Mesh,
	fontB: Mesh[],
	cube: Group,
	torus: Mesh[],
	fontParticules: Points,
	dragonUnBroken: Mesh,
	dragonWireframe: Mesh,
	dragonParticles: Points,
	dragonSphere: Mesh,
	rockA: Mesh,
	rockB: Mesh,
	rockC: Mesh,
	RockD: Mesh,
	dragonBroken: Mesh,
	dragonUnBrokenNoSphere: Group,
	planeShader: Mesh,
	gate: Mesh,
	aureole: Group[]
	camera: PerspectiveCamera[],
	water: Water[],
	textContainer: HTMLElement,
	textTitle: HTMLElement,
	textSubtitle: HTMLElement,
	creditText: HTMLElement
}


export type Transition = {
	transition: number,
	transitionBis: number,
	animation: number,
	timerParticules: number,
	timerWater: number,
	scrollPercentage: number,
	sceneWeAt: number,
	animate: boolean,
	scrollForTransition: boolean,
	needScroll: boolean,
	waitScroll: boolean,
	animations_transiA: [boolean, boolean, boolean, boolean],
	myTween?: Tween<Transition>,
	myTweenBack?: Tween<Transition>,
	sceneToScene: () => void,
	resetAnimation: () => void,
};