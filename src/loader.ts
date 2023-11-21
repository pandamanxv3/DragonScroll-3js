import { BackSide, BoxGeometry, BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, RepeatWrapping, ShaderMaterial, Texture, TextureLoader, TorusGeometry, Vector2, Vector3 } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { Water } from 'three/examples/jsm/objects/Water'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { ThreeModels } from './types'

/********************************************************************************/
/* --------------------------------- LOADER ----------------------------------- */
/********************************************************************************/

// Texture loader
const textureLoader = new TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Font loader
const fontLoader = new FontLoader();

async function importFileAsString(path) {
	const response: Response = await fetch(path);
	const text: string = await response.text();
	return text;
}

/********************************************************************************/
/* ----------------------------- TEXTURE/MATERIAL ----------------------------- */
/********************************************************************************/

// Textures
const textures: { [key: string]: { normalMap: Texture } } = {}

textures.dragonUnbroken = { normalMap: textureLoader.load("textures/dragon/unbroken/Normal.png") };
textures.dragonUnbroken.normalMap.flipY = false;

textures.dragonBroken = { normalMap: textureLoader.load("/textures/dragon/broken/Normal.png") };
textures.dragonBroken.normalMap.flipY = false;

textures.aureole = { normalMap: textureLoader.load("textures/aureole/Normal.png") };
textures.aureole.normalMap.flipY = false;

// Materials
const materials: { [key: string]: MeshStandardMaterial } = {}
const map = textureLoader.load("textures/marble/Color.jpg");
const aoMap = textureLoader.load("textures/marble/AmbientOcclusion.jpg");
const roughnessMap = textureLoader.load("textures/marble/Roughness.jpg");
const displacementMap = textureLoader.load("textures/marble/Height.png");


materials.marble = new MeshStandardMaterial({
	map: map,
	aoMap: aoMap,
	roughnessMap: roughnessMap,
	displacementMap: displacementMap,
	displacementScale: 0.2
});

materials.dragonUnbroken = new MeshStandardMaterial({
	map: map,
	aoMap: aoMap,
	roughnessMap: roughnessMap,
	normalMap: textures.dragonUnbroken.normalMap
});

materials.dragonBroken = new MeshStandardMaterial({
	map: map,
	aoMap: aoMap,
	roughnessMap: roughnessMap,
	normalMap: textures.dragonBroken.normalMap,
	displacementMap: displacementMap,
	displacementScale: 10
});

materials.aureole = new MeshStandardMaterial({
	map: map,
	aoMap: aoMap,
	normalMap: textures.aureole.normalMap,
	displacementMap: displacementMap,
	displacementScale: 10,
});

materials.gate = new MeshStandardMaterial({
	map: map,

	color: "#F09684", // Remplacez 0xRRGGBB par la valeur hexadécimale de la couleur souhaitée
    roughness: 0,
});

const fontStandardMaterial = new MeshStandardMaterial({ color: 0xffffff });
const fontBasicMaterial = new MeshBasicMaterial({ color: 0xff0000 });

/********************************************************************************/
/* ----------------------------------- FONT ----------------------------------- */
/********************************************************************************/

function loadFont(fontPath) {
	const fontLoader = new FontLoader();
	return new Promise((resolve, reject) => {
		fontLoader.load(fontPath, resolve, undefined, reject);
	});
};

/********************************************************************************/
/* ----------------------------------- OBJECT --------------------------------- */
/********************************************************************************/
const objectsPath = [
	'mesh/dragon/Center.glb',
	'mesh/dragon/Down.glb',
	'mesh/dragon/Sphere.glb',
	'mesh/dragon/Up.glb',
	'mesh/aureole/aureole.glb',
	'mesh/aureole/RockA.glb',
	'mesh/aureole/RockB.glb',
	'mesh/aureole/RockC.glb',
	'mesh/aureole/RockD.glb',
	'mesh/dragon/Broken.glb',
	'mesh/dragon/Unbroken.glb',
	'mesh/gate/tori_low.glb',
	'mesh/dragon/Dragon_OneMesh_Body.glb',
];

const objectsName = [
	'dragonCenter',
	'dragonDown',
	'dragonSphere',
	'dragonUp',
	'aureole',
	'rockA',
	'rockB',
	'rockC',
	'rockD',
	'dragonBroken',
	'dragonUnbroken',
	'gate',
	'dragonUnBrokenNoSphere'
];

const aureoleScale = [
	{ x: 0.8, y: 0.7, z: 0.8 },
	{ x: 1.1, y: 1.2, z: 1 },
	{ x: 1.7, y: 1.6, z: 1.3 }
];
const aureolePosition = [
	{ x: 0.25, y: 0, z: 0 },
	{ x: -0.25, y: 0, z: 0 },
	{ x: 0.5, y: 0, z: 0 },
	{ x: -0.5, y: 0, z: 0 },
	{ x: 0.8, y: 0, z: 0 },
	{ x: -0.8, y: 0, z: 0 }
];

/* -------------------------------------------------------------------------- */

export default async function Loader(): Promise<ThreeModels> {
	let positions = []; // TMP - type
	const objects: Partial<ThreeModels> = {
		camera: [],
		water: [],
		fontB: [],
		torus: [],
		aureole: []
	};

	objects.dragonUnBrokenNoSphere = new Group;
	if (objects.aureole) {
		objects.aureole[0] = new Group()
		objects.aureole[1] = new Group()
		objects.aureole[2] = new Group()
	}

	try {
		/* -------------------- Camera -------------------- */
		objects.camera && (objects.camera = [
			new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80),
			new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 350)
		]);

		/* -------------------- Font -------------------- */
		const font: Font = await loadFont('/fonts/Grahvez_Reverse.json') as Font;
		const textGeometry = new TextGeometry(
			'scroll', {
			font,
			size: 0.5,
			height: 0.2,
			curveSegments: 15,
			bevelEnabled: true,
			bevelThickness: 0.003,
			bevelSize: 0.01,
			bevelOffset: 0.01,
			bevelSegments: 5
		});
		textGeometry.center();

		objects.fontA1 = new Mesh(textGeometry.clone(), fontStandardMaterial.clone());
		objects.fontA2 = new Mesh(textGeometry.clone(), fontBasicMaterial.clone());
		objects.fontParticules = new Points(objects.fontA1.geometry.clone(), new PointsMaterial({
			color: 0x888888,
			size: 0.02,
			sizeAttenuation: true
		}));

		const word = "scroll";
		for (let i = 0; i < 6; i++) {
			const textGeometry = new TextGeometry(
				word[i], {
				font: font,
				size: 0.5,
				height: 0.2,
				curveSegments: 15,
				bevelEnabled: true,
				bevelThickness: 0.003,
				bevelSize: 0.01,
				bevelOffset: 0.01,
				bevelSegments: 5
			});
			textGeometry.center()
			if (objects.fontB) {
				objects.fontB[i] = new Mesh(textGeometry, fontStandardMaterial.clone());
				objects.fontB[i].scale.set(50, 50, 50);
			}
		}

		/* -------------------- Background -------------------- */
		objects.backgroundTexture = textureLoader.load('textures/background4.jpg')

		/* -------------------- Water -------------------- */
		if (objects.water) {
			objects.water[0] = new Water(
				new PlaneGeometry(10000, 10000), {
				textureWidth: 512,
				textureHeight: 512,
				waterNormals: new TextureLoader().load('textures/waternormals.jpg', function (texture) {
					texture.wrapS = texture.wrapT = RepeatWrapping;
				}),
				sunDirection: new Vector3,
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale: 2
			});

			objects.water[1] = new Water(
				new PlaneGeometry(10000, 10000, 100, 100), {
				textureWidth: 512,
				textureHeight: 512,
				waterNormals: new TextureLoader().load('textures/waternormals.jpg', function (texture) {
					texture.wrapS = texture.wrapT = RepeatWrapping;
				}),
				sunDirection: new Vector3,
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale: 2
			});
		}

		/* -------------------- Shader -------------------- */
		const [vertexShader, fragmentShader] = await Promise.all([
			importFileAsString('/shaders/vertex.glsl'),
			importFileAsString('/shaders/S014_watercolor.frag')
		]);

		objects.backgroundShader = new Mesh(
			new PlaneGeometry(4, 2),
			new ShaderMaterial({
				uniforms: {
					u_resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
					u_time: { value: 0 }
				},
				vertexShader,
				fragmentShader,
				transparent: true
			})
		);

		objects.planeShader = new Mesh(
			new PlaneGeometry(window.innerWidth, window.innerHeight),
			new ShaderMaterial({
				uniforms: {
					tDiffuse1: {
						value: null
					},
					tDiffuse2: {
						value: null
					},
					mixRatio: {
						value: 0.0
					},
					threshold: {
						value: 0.3
					},
					useTexture: {
						value: 1
					},
					tMixTexture: {
						value: textureLoader.load('textures/transition/transition4.png')
					}
				},
				vertexShader: [

					'varying vec2 vUv;',

					'void main() {',

					'vUv = vec2( uv.x, uv.y );',
					'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

					'}'

				].join('\n'),
				fragmentShader: [

					'uniform float mixRatio;',

					'uniform sampler2D tDiffuse1;',
					'uniform sampler2D tDiffuse2;',
					'uniform sampler2D tMixTexture;',

					'uniform int useTexture;',
					'uniform float threshold;',

					'varying vec2 vUv;',

					'void main() {',

					'	vec4 texel1 = texture2D( tDiffuse1, vUv );',
					'	vec4 texel2 = texture2D( tDiffuse2, vUv );',

					'	if (useTexture==1) {',

					'		vec4 transitionTexel = texture2D( tMixTexture, vUv );',
					'		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;',
					'		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);',

					'		gl_FragColor = mix( texel1, texel2, mixf );',

					'	} else {',

					'		gl_FragColor = mix( texel2, texel1, mixRatio );',

					'	}',

					'	#include <tonemapping_fragment>',
					'	#include <encodings_fragment>',

					'}'

				].join('\n')
			})
		);

		/* -------------------- Cube -------------------- */
		// objects.cube = new Mesh(
		// 	new BoxGeometry(4, 2.55, 200, 2, 1, 100),
		// 	new MeshBasicMaterial({
		// 		color: 0xff0000,
		// 		wireframe: true,
		// 		side: BackSide
		// 	})
		// );
		const sideGeometry = new PlaneGeometry(1, 1, 1, 100);
		const sideMaterial = new MeshBasicMaterial({
			color: 0xff0000,
			wireframe: true,
			side: BackSide
		});
		const sides: Mesh[] = [
			new Mesh(sideGeometry, sideMaterial),
			new Mesh(sideGeometry, sideMaterial),
			new Mesh(sideGeometry, sideMaterial),
			new Mesh(sideGeometry, sideMaterial)
		];
		sides[0].position.set(0, 2.55, 0);
		sides[0].rotation.set(Math.PI / 2, 0, 0);
		sides[0].scale.set(8, 200, 1);
		sides[1].position.set(4, 0, 0);
		sides[1].rotation.set(Math.PI / 2, -Math.PI / 2, 0);
		sides[1].scale.set(5.10, 200, 1);
		sides[2].position.set(0, -2.55, 0);
		sides[2].rotation.set(-Math.PI / 2, 0, 0);
		sides[2].scale.set(8, 200, 1);
		sides[3].position.set(-4, 0, 0);
		sides[3].rotation.set(Math.PI / 2, Math.PI / 2, 0);
		sides[3].scale.set(5.10, 200, 1);
		objects.cube = new Group;
		objects.cube.add(
			sides[0],
			sides[1],
			sides[2],
			sides[3]
		);
		/* -------------------- Torus -------------------- */
		if (objects.torus) {
			objects.torus[0] = new Mesh(new TorusGeometry(100, 80, 16, 32), new MeshStandardMaterial({ color: 0x7660A1 }));
			(objects.torus[0].material as MeshStandardMaterial).wireframe = true;
			objects.torus[1] = new Mesh(new TorusGeometry(105, 80, 32, 16), new MeshStandardMaterial({ color: 0x7A708E }));
			(objects.torus[1].material as MeshStandardMaterial).wireframe = true;
		}

		/* -------------------- Models -------------------- */

		const objectsData = {
			'dragonCenter': 'mesh/dragon/Center.glb',
			'dragonDown': 'mesh/dragon/Down.glb',
			'dragonSphere': 'mesh/dragon/Sphere.glb',
			'dragonUp': 'mesh/dragon/Up.glb',
			'aureole': 'mesh/aureole/aureole.glb',
			'rockA': 'mesh/aureole/RockA.glb',
			'rockB': 'mesh/aureole/RockB.glb',
			'rockC': 'mesh/aureole/RockC.glb',
			'rockD': 'mesh/aureole/RockD.glb',
			'dragonBroken': 'mesh/dragon/Broken.glb',
			'dragonUnbroken': 'mesh/dragon/Unbroken.glb',
			'gate': 'mesh/gate/tori_low.glb',
			'dragonUnBrokenNoSphere': 'mesh/dragon/Dragon_OneMesh_Body.glb',
		};

		const modelDragon: BufferGeometry[] = []
		let positionDragon = []

		for (let objectsName in objectsData) {
			const gltf = await gltfLoader.loadAsync(objectsData[objectsName]);
			gltf.scene.traverse(n => {
				if (!(n instanceof Mesh)) return;
				if (objectsName == 'dragonUnbroken') {
					positionDragon = positionDragon.concat(Array.from(n.geometry.attributes.position.array));
					const geometry: BufferGeometry = n.geometry.clone();
					geometry.applyMatrix4(n.matrixWorld);
					modelDragon.push(geometry);
				} if (objectsName == 'dragonUnBrokenNoSphere') {
					positions = positions.concat(Array.from(n.geometry.attributes.position.array));
					n.material = materials.dragonUnbroken;
					objects.dragonUnBrokenNoSphere?.add(gltf.scene);
				} else if (objectsName == 'dragonBroken' || objectsName == 'dragonDown' || objectsName == 'dragonUp' || objectsName == 'dragonCenter') {
					n.material = materials.dragonBroken;
				} else if (objectsName == 'aureole') {
					n.material = materials.aureole;
					for (let j = 0; j < 6; j++) {
						let copy = gltf.scene.clone();
						copy.position.set(aureolePosition[j].x, aureolePosition[j].y, aureolePosition[j].z);
						copy.scale.set(aureoleScale[Math.floor(j / 2)].x, aureoleScale[Math.floor(j / 2)].y, aureoleScale[Math.floor(j / 2)].z);
						if (j % 2 == 0) {
							copy.rotation.y = Math.PI;
						}
						objects.aureole && objects.aureole[Math.floor(j / 2)].add(copy);
					}

				} else if (objectsName == 'gate') {
					n.material = materials.gate;
				} else if (objectsName == 'dragonSphere') {
					n.material = materials.dragonBroken;
				} else {
					n.material = materials.aureole;
				}

				if (objectsName == 'dragonCenter') { objects.dragonCenter = n }
				else if (objectsName == 'dragonDown') { objects.dragonDown = n }
				else if (objectsName == 'dragonSphere') { objects.dragonSphere = n }
				else if (objectsName == 'dragonUp') { objects.dragonUp = n }
				else if (objectsName == 'rockA') { objects.rockA = n }
				else if (objectsName == 'rockB') { objects.rockB = n }
				else if (objectsName == 'rockC') { objects.rockC = n }
				else if (objectsName == 'rockD') { objects.RockD = n }
				else if (objectsName == 'dragonBroken') { objects.dragonBroken = n }
				else if (objectsName == 'gate') { objects.gate = n }
			})
		}

		let particlesGeometry = new BufferGeometry;
		const particlesMaterial = new PointsMaterial({
			color: 0xffffff,
			size: 0.1,
			sizeAttenuation: true
		});

		objects.dragonUnBroken = new Mesh(mergeGeometries(modelDragon, false), materials.dragonUnbroken.clone());
		objects.dragonUnBroken.scale.set(0.1, 0.1, 0.1);
		(objects.dragonUnBroken.material as MeshStandardMaterial).wireframe = true

		objects.dragonWireframe = new Mesh(objects.dragonUnBroken.geometry, new MeshBasicMaterial({
			color: 0x00000,
			wireframe: true
		}));
		objects.dragonWireframe.scale.set(0.1, 0.1, 0.1);

		particlesGeometry.setAttribute('position', new Float32BufferAttribute(positionDragon, 3));
		const particles = new Points(particlesGeometry, particlesMaterial);
		particles.scale.set(0.1, 0.1, 0.1);
		objects.dragonParticles = particles;

		return objects as ThreeModels;
	} catch (error) {
		console.error("Erreur lors du chargement des modèles :", error);
		process.exit(1);
	}
}
