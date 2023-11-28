import { Color, Euler, Material, MathUtils, Matrix4, MeshStandardMaterial, RectAreaLight, ShaderMaterial, Vector3 } from 'three';
import { AnimationFunctionB } from '../types'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import '../scenes/font.css'
import gsap from 'gsap'

export default function initAnimationsB(): AnimationFunctionB {
	let canMove: boolean = true;
	const coor = new Vector3(0, 0, 0);
	const direction = new Vector3(0, 0, 0);

	const move = {
		end: new Euler(0, 0, 0, 'XYZ'),
		end2: new Euler(0, 0, 0, 'XYZ'),
		end3: new Euler(0, 0, 0, 'XYZ'),
		end4: new Euler(0, 0, 0, 'XYZ'),
		previousTime: 0,
		to: (current: Vector3 | Euler, end: Vector3 | Euler, alpha: number) => {
			current.x = MathUtils.lerp(current.x, end.x, alpha);
			current.y = MathUtils.lerp(current.y, end.y, alpha);
			current.z = MathUtils.lerp(current.z, end.z, alpha);
		},
		toWoDampling: (current: Vector3, end: Vector3, speed: number) => {
			direction.subVectors(end, current);
			const distanceToTravel = speed;
			const distanceToEnd = direction.length();

			if (distanceToTravel >= distanceToEnd) {
				current.copy(end);
			} else {
				direction.normalize().multiplyScalar(distanceToTravel);
				current.add(direction);
			}
		}
	}

	const color = {
		black: new Color(0x000000),
		dark_blue: new Color(0x7660A1),
		dark_grey: new Color(0x7A708E),
		white: new Color(0xffffff),
		red: new Color(0xc44949),
		grey: new Color("grey"),
		orange: new Color("#F78400"),
		green_blue: new Color("#80C4B7"),
		cyan: new Color("cyan"),
		purple: new Color("purple"),
		green: new Color('green'),
		gradientSet: {
			color: [
				new Color("#16A796"),
				new Color("#1670A7"),
				new Color("#882A71"),
				new Color("#DF373A"),
				new Color("#DF8837"),
				new Color("#DFDF37"),
			],
			index: [0, 0],
			indexNext: (index: number) => {
				return ((color.gradientSet.index[index] == color.gradientSet.color.length - 1) ? 0 : color.gradientSet.index[index] + 1);
			},
			next: (index: number) => {
				color.gradientSet.index[index] = ((color.gradientSet.index[index] == color.gradientSet.color.length - 1) ? 0 : color.gradientSet.index[index] + 1);
			},
			change: [false, false]
		},
		on: (rectArea: { light: RectAreaLight, helper: RectAreaLightHelper }, lightColor: Color, intensity: number) => {
			rectArea.light.intensity += intensity;
			rectArea.light.color.lerpColors(color.black, lightColor, rectArea.light.intensity);
			rectArea.helper.visible = true;
		},
		off: (rectArea: { light: RectAreaLight, helper: RectAreaLightHelper }, lightColor: Color, intensity: number) => {
			if (rectArea.light.intensity <= intensity) {
				rectArea.helper.visible = false;
				rectArea.light.intensity = 0;
				rectArea.light.color.copy(color.black);
				return false;
			}
			rectArea.light.intensity -= intensity;
			rectArea.light.color.lerpColors(color.black, lightColor, rectArea.light.intensity);
			return true;
		},
		setOn: (rectArea: { light: RectAreaLight, helper: RectAreaLightHelper }, lightColor: Color, intensity: number) => {
			rectArea.light.intensity = intensity;
			rectArea.light.color.lerpColors(color.black, lightColor, rectArea.light.intensity);
			rectArea.helper.visible = true;
		},
		setOff: (rectArea: { light: RectAreaLight, helper: RectAreaLightHelper }) => {
			rectArea.helper.visible = false;
			rectArea.light.intensity = 0;
			rectArea.light.color.copy(color.black);
		},
		all: (rectAreas: { light: RectAreaLight, helper: RectAreaLightHelper }[], color: Color) => {
			let totalR = 0, totalG = 0, totalB = 0;
			for (let i = 0; i < rectAreas.length; i++) {
				totalR += rectAreas[i].light.color.r;
				totalG += rectAreas[i].light.color.g;
				totalB += rectAreas[i].light.color.b;
			}

			color.r = totalR / rectAreas.length * 0.5;
			color.g = totalG / rectAreas.length * 0.5;
			color.b = totalB / rectAreas.length * 0.5;
		},
		gradient: (colorToChange: Color, time: number, transitionTime: number, index: number) => {
			let t = (time % transitionTime) / transitionTime;
			if (color.gradientSet.change[index] && t < 0.99)
				color.gradientSet.change[index] = false;
			if (color.gradientSet.change[index] && t >= 0.99)
				return;
			colorToChange.copy(color.gradientSet.color[color.gradientSet.index[index]]).lerp(color.gradientSet.color[color.gradientSet.indexNext(index)], t);
			if (t >= 0.99) {
				color.gradientSet.next(index);
				color.gradientSet.change[index] = true;
			}
		}
	}

	return {
		waterAnimation: (time, setAnime, ambientLight, models, transiParameters) => {
			models.water[1].material.uniforms['time'].value = time / 2;
			(models.backgroundShader.material as ShaderMaterial).uniforms.u_time.value = time;
			if (transiParameters.transition > 0.4 && !setAnime[6]) {
				if (!setAnime[5]) {
					transiParameters.timerParticules = time;
					setAnime[5] = true;
				}
				for (let i = 0; i < models.fontParticules.geometry.attributes.position.array.length * 3; i += 3) {
					coor.set(
						models.fontParticules.geometry.attributes.position.array[i],
						models.fontParticules.geometry.attributes.position.array[i + 1],
						models.fontParticules.geometry.attributes.position.array[i + 2]
					);
					coor.x = models.fontParticules.geometry.attributes.position.array[i] + time * 0.03 * (3 * (Math.random() - 0.1));
					coor.y = models.fontParticules.geometry.attributes.position.array[i + 1] - time * 0.02 * (1.5 * (Math.random() - 0.1));
					coor.z = models.fontParticules.geometry.attributes.position.array[i + 2] + time * 0.01 * (4.5 * Math.random() - 0.5);
					models.fontParticules.geometry.attributes.position.array[i] = coor.x;
					models.fontParticules.geometry.attributes.position.array[i + 1] = coor.y;
					models.fontParticules.geometry.attributes.position.array[i + 2] = coor.z;
				}
				if (time - transiParameters.timerParticules > 1.5) {
					setAnime[6] = true;
				}
				models.fontParticules.geometry.attributes.position.needsUpdate = true;
			}

			if (transiParameters.transition == 1) {
				if (!setAnime[7]) {
					setAnime[7] = true;
					transiParameters.timerWater = time;
				}
				if (transiParameters.timerWater > 0) {

					if (time - transiParameters.timerWater < 1.2) {
						ambientLight.intensity = 0.5 - (time - transiParameters.timerWater - 1) * 0.5;
					} else if (time - transiParameters.timerWater < 2.1) {
						ambientLight.intensity = 0.5 - (time - transiParameters.timerWater - 1.2) * 0.5;
					} else if (time - transiParameters.timerWater < 3.2) {
						if (!setAnime[0]) {
							move.end.set(0.414, 0.414, 0);
							move.end2.set(23, -21.2, 42.7);
							setAnime[0] = true;
						}
						move.to(models.camera[1].rotation, move.end, 0.03);
						move.to(models.camera[1].position, move.end2, 0.03);
					} else if (time - transiParameters.timerWater < 5.5) {
						if (!setAnime[1]) {
							move.end.set(-10.553, -7.455, -3.367);
							move.end2.set(1.354, 3.885, 1.71);
							setAnime[1] = true;
						}
						move.to(models.backgroundShader.position, move.end, 0.05);
						move.to(models.backgroundShader.rotation, move.end2, 0.05);
					} else if (time - transiParameters.timerWater < 8) {
						if (!setAnime[2]) {
							models.dragonUnBrokenNoSphere.visible = false;
							models.fontA2.visible = true;
							move.end.set(-5.28, 0.988, -4.912);
							move.end2.set(3.964, 2.224, -0.576);
							move.end3.set(3.3, 27.9, 27.9);
							move.end4.set((5.878 - Math.PI * 2), 0.259, 2.962);
							setAnime[2] = true;
						}
						move.to(models.backgroundShader.position, move.end, 0.02);
						move.to(models.backgroundShader.rotation, move.end2, 0.02);
						move.to(models.camera[1].position, move.end3, 0.04);
						move.to(models.camera[1].rotation, move.end4, 0.04);
					} else if (time - transiParameters.timerWater < 10) {
						if (!setAnime[3]) {
							move.end.set(4.381, 21.4, 20);
							setAnime[3] = true;
						}
						move.to(models.fontA2.position, move.end, 0.02);
					} else {
						if (!setAnime[4]) {
							move.end.set(models.fontA2.position.x, models.fontA2.position.y, models.fontA2.position.z);
							move.end2.set(models.fontA2.rotation.x, models.fontA2.rotation.y, models.fontA2.rotation.z);
							setAnime[4] = true;
						}

						models.fontA2.position.y = move.end.y + (Math.cos(time * 2) * 0.1);
						models.fontA2.rotation.x = move.end2.x + (Math.cos(time * 2) * 0.2);
						models.fontA2.rotation.y = move.end2.y + (Math.sin(time * 2) * 0.1);
						return false;
					}
				}
			}
			return true;
		},
		transitionAnimation: (time, models) => {
			models.water[1].material.uniforms['time'].value = time / 2;
			(models.backgroundShader.material as ShaderMaterial).uniforms.u_time.value = time;
			if (time < 1) {
				// models.camera[1].rotation.x += 0.05;
				models.camera[1].position.y += 0.02;
			}
			else return false;
			return true;
		},
		flashAnimation: (time, setAnime, rectAreaLights, models, scene) => {

			models.torus[0].rotation.z = time * 0.1;
			models.torus[1].rotation.z = -time * 0.1;
			if (time < 1) {

				models.textTitle.style.animation = 'fadeIn 0.5s forwards';
				models.textTitle.style.display = 'block';
				color.on(rectAreaLights[0], color.white, 0.1);
				color.on(rectAreaLights[2], color.white, 0.1);
				models.textTitle.style.animation = 'fadeOut 0.4s 2.9s forwards';
				models.textTitle.addEventListener('animationend', () => {
					models.textTitle.style.display = 'none';
				});
			} else if (time < 3.5) {
				color.off(rectAreaLights[0], color.white, 0.1);
				color.off(rectAreaLights[2], color.white, 0.1);
				color.on(rectAreaLights[4], color.white, 0.05);
				if (time > 3.1) {
					if (!setAnime[0]) {
						(models.dragonWireframe.material as MeshStandardMaterial).color.copy(color.black);
						setAnime[0] = true;
					}
					if (Math.random() < 0.8) {
						if (!setAnime[1]) {
							(scene.background as Color).copy(color.red);
							rectAreaLights[7].helper.visible = true;
							setAnime[1] = true;
						}
						color.on(rectAreaLights[0], color.white, time);
						color.on(rectAreaLights[3], color.white, time);
						color.on(rectAreaLights[4], color.white, time);
						color.on(rectAreaLights[6], color.white, time);
						color.on(rectAreaLights[7], color.white, time);
					} else {
						if (!setAnime[2]) {
							(scene.background as Color).copy(color.white);
							color.setOff(rectAreaLights[0]);
							rectAreaLights[0].helper.visible = true;
							color.setOff(rectAreaLights[3]);
							rectAreaLights[3].helper.visible = true;
							color.setOff(rectAreaLights[4]);
							rectAreaLights[4].helper.visible = true;
							color.setOff(rectAreaLights[6]);
							rectAreaLights[6].helper.visible = true;
							color.setOff(rectAreaLights[7]);
							rectAreaLights[7].helper.visible = true;
							setAnime[2] = true;
						}
					}
				}
			} else if (time < 4) {
				if (!setAnime[3]) {

					(scene.background as Color).copy(color.black);
					(models.torus[0].material as MeshStandardMaterial).color = color.cyan;
					(models.torus[1].material as MeshStandardMaterial).color = color.purple;
					(models.dragonWireframe.material as MeshStandardMaterial).color.copy(color.white);
					color.setOff(rectAreaLights[0]);
					color.setOff(rectAreaLights[3]);
					color.setOff(rectAreaLights[4]);
					color.setOff(rectAreaLights[6]);
					color.setOff(rectAreaLights[7]);
					setAnime[3] = true;
				}
				color.on(rectAreaLights[8], color.white, 0.08);
				if (Math.random() < 0.5) { color.setOn(rectAreaLights[5], color.white, time); }
				else { color.setOff(rectAreaLights[5]); }
				rectAreaLights[5].light.rotation.z += 0.025;
			} else if (color.off(rectAreaLights[8], color.white, 0.1) && time < 4.5) {
				if (!setAnime[4]) {
					color.setOff(rectAreaLights[5]);
					setAnime[4] = true;
				}
			} else if (time < 5) {
				if (!setAnime[5]) {
					color.setOn(rectAreaLights[1], color.white, 8);
					color.setOn(rectAreaLights[5], color.white, 8);
					color.setOn(rectAreaLights[7], color.white, 8);
					setAnime[5] = true;
				}
			} else if (time < 6.5) {
				if (time < 5.5) { color.setOff(rectAreaLights[1]); }
				else if (time < 6) { color.setOff(rectAreaLights[5]); }
				else {
					color.setOff(rectAreaLights[7]);
					color.gradient((models.torus[0].material as MeshStandardMaterial).color, time, 2, 0);
					color.gradient((models.torus[1].material as MeshStandardMaterial).color, time, 5, 1);
				}
			} else if (time < 8.5) {
				if (!setAnime[6]) {
					rectAreaLights[1].light.position.set(-150, 100, 0);
					rectAreaLights[1].light.lookAt(100, 0, 0);
					rectAreaLights[5].light.position.set(0, 150, -100);
					rectAreaLights[5].light.lookAt(0, 0, 0);
					rectAreaLights[7].light.position.set(0, -100, -100);
					rectAreaLights[7].light.lookAt(0, 0, 0);
					setAnime[6] = true;
				}
				if (time < 7.5) {
					if (!setAnime[7]) {
						models.fontB[0].visible = true;
						models.fontB[1].visible = true;
						models.fontB[2].visible = true;
						models.fontB[4].visible = true;
						setAnime[7] = true;
					}
					color.gradient((models.torus[0].material as MeshStandardMaterial).color, time, 2, 0);
					color.gradient((models.torus[1].material as MeshStandardMaterial).color, time, 5, 1);
					color.on(rectAreaLights[3], color.white, 0.05);
					color.on(rectAreaLights[4], color.white, 0.05);
					color.on(rectAreaLights[6], color.white, 0.05);
				} else {
					if (!setAnime[8]) {
						models.fontB[3].visible = true;
						models.fontB[5].visible = true;
						setAnime[8] = true;
					}
					color.gradient((models.torus[0].material as MeshStandardMaterial).color, time, 2, 0);
					color.gradient((models.torus[1].material as MeshStandardMaterial).color, time, 5, 1);
					color.on(rectAreaLights[1], color.white, 0.05);
					color.on(rectAreaLights[7], color.white, 0.05);
					color.on(rectAreaLights[5], color.white, 0.05);
				}
			} else {

				color.gradient((models.torus[0].material as MeshStandardMaterial).color, time, 2, 0);
				color.gradient((models.torus[1].material as MeshStandardMaterial).color, time, 5, 1);
				return false;
			}
			color.all(rectAreaLights, (models.dragonWireframe.material as MeshStandardMaterial).color);
			return true;
		},
		cameraAnimation: (event, camera) => {
			canMove = false;
			const cursor = {
				x: event.clientX / window.innerWidth - 0.5,
				y: event.clientY / window.innerHeight - 0.5
			};
			camera.rotation.x = -cursor.y;
			camera.rotation.y = -cursor.x;
			canMove = true;
		},
		cameraFlashAnimation: (time, setCam, models, funcListener) => {
			let damping = 0.01;
			if (time < 1.6) {
				if (!setCam[0]) {
					(models.torus[0].material as MeshStandardMaterial).color = color.dark_grey;
					(models.torus[1].material as MeshStandardMaterial).color = color.dark_blue;
					models.camera[1].position.set(-67, 65, -50);
					models.camera[1].rotation.set(-0.4, -1, -0.35);
					move.end.set(-67, 77, -50);
					setCam[0] = true;
				}
				move.to(models.camera[1].position, move.end, damping);
			} else if (time < 3.1) {
				if (!setCam[1]) {
					(models.torus[0].material as MeshStandardMaterial).color = color.green_blue;
					(models.torus[1].material as MeshStandardMaterial).color = color.orange;
					models.camera[1].position.set(-14, -56, -6);
					models.camera[1].rotation.set(-1.8, -1.35, -1.88);
					setCam[1] = true;
				}
			} else if (time < 3.2) {
				if (!setCam[2]) {
					models.camera[1].rotation.set(6, 0.8, 0.55);
					setCam[2] = true;
				}
			} else if (time < 3.3) {
				if (!setCam[3]) {
					models.camera[1].rotation.set(0, 0.2, 5.7);
					setCam[3] = true;
				}
			} else if (time < 3.4) {
				if (!setCam[4]) {
					models.camera[1].rotation.set(6.3, 6, 0.4);
					setCam[4] = true;
				}
			} else if (time < 3.5) {
				if (!setCam[5]) {
					models.camera[1].position.set(-45, -6, 16);
					models.camera[1].rotation.set(0.4, 5.0, 0.3);
					setCam[5] = true;
				}
			} else if (time < 6) {
				if (!setCam[6]) {
					models.camera[1].position.set(6, -10, -4);
					move.end.set(26, -44, -14);
					models.camera[1].rotation.set(1.8, 0.4, 2.8);
					damping = 0.7;
					setCam[6] = true;
				}
				models.camera[1].rotation.z += 0.005;
				move.to(models.camera[1].position, move.end, damping);
			} else if (time < 9) {
				if (!setCam[7]) {
					models.camera[1].position.set(0, 0, 75);
					models.camera[1].rotation.set(0, 0, 0);
					move.end.set(0, 0, 125);
					setCam[7] = true;
				}
				move.to(models.camera[1].position, move.end, damping);
			} else {
				if (!setCam[8]) {
					window.addEventListener('mousemove', funcListener);
					setCam[8] = true;
				}
				if (canMove) {
					models.camera[1].rotation.x += Math.sin(time) * 0.0005;
					models.camera[1].rotation.y += Math.cos(time) * 0.001;
				}
				return false;
			}
			return true;
		},
		galaxyAnimation: (time, setAnime, ambientLight, rectAreaLights, models, scene) => {
			let count = 0;
			for (let i = 0; i < models.dragonParticles.geometry.attributes.position.array.length * 3; i += 3) {
				coor.set(
					models.dragonParticles.geometry.attributes.position.array[i],
					models.dragonParticles.geometry.attributes.position.array[i + 1],
					models.dragonParticles.geometry.attributes.position.array[i + 2]
				);
				if (coor.length() < 1) {
					coor.x = 0;
					coor.y = 0;
					coor.z = 0;
					count++;
					if (count == models.dragonParticles.geometry.attributes.position.array.length) { return false; }
				} else if (time < 2.4) {
					color.off(rectAreaLights[1], color.white, 0.1);
					color.off(rectAreaLights[4], color.white, 0.1);
					color.off(rectAreaLights[3], color.white, 0.1);
					color.off(rectAreaLights[5], color.white, 0.1);
					color.off(rectAreaLights[6], color.white, 0.1);
					color.off(rectAreaLights[7], color.white, 0.1);
					return true
				} else if (time < 3) {
					if (!setAnime[0]) {
						rectAreaLights.forEach(({ light, helper }) => { scene.remove(light, helper) });
						models.fontB.forEach((font) => { font.visible = false });
						scene.remove(models.torus[0], models.torus[1]);
						(scene.background as Color).copy(color.white);
						(models.dragonWireframe.material as MeshStandardMaterial).color.copy(color.black);
						models.dragonWireframe.visible = true;
						setAnime[0] = true;
					}
				} else if (time < 4) {
					if (!setAnime[1]) {
						(scene.background as Color).copy(color.black);
						models.dragonParticles.visible = true;
						scene.remove(models.dragonWireframe);
						setAnime[1] = true;
					}
					coor.x += (Math.random() - 0.1) * 2;
					coor.y -= (Math.random() - 0.1) * 1.5;
					coor.z += (Math.random() - 0.5) * 1;
				} else if (time < 5.5) {
					coor.x += coor.x / (Math.random() * 100);
					coor.y += coor.y / (Math.random() * 100);
					coor.z += coor.z / (Math.random() * 100);
				} else if (time < 6) {
					coor.x += coor.x / ((7 - time) * 10);
					coor.y += coor.y / ((7 - time) * 10);
					coor.z += coor.z / ((7 - time) * 10);
				} else if (time < 6.5) {
					coor.x -= coor.x / ((5 - time) * 10);
					coor.y -= coor.y / ((5 - time) * 10);
					coor.z -= coor.z / ((5 - time) * 10);
				} else if (time < 14.85) {
					coor.x -= coor.x / (Math.random() * 100);
					coor.y -= coor.y / (Math.random() * 100);
					coor.z -= coor.z / (Math.random() * 100);
					if (time > 11.85) {
						if (!setAnime[2]) {
							models.cube.lookAt(models.camera[1].position);
							models.cube.position.set(models.camera[1].position.x * -1.44, models.camera[1].position.y * -1.44, models.camera[1].position.z * -1.44);
							models.cube.visible = true;
							move.previousTime = time;
							setAnime[2] = true;
						}
						move.toWoDampling(models.cube.position, models.camera[1].position, 0.00004);
					}
					if (time > 12.85) {
						models.camera[1].far = 280 - 100 * (time - 12.85);
						models.camera[1].updateProjectionMatrix();
					}
				} else {
					if (!setAnime[3]) {
						scene.remove(models.dragonParticles);
						models.camera[1].position.set(0, 0, 0);
						models.camera[1].rotation.set(0, 0, 0);
						models.cube.position.set(0, 0, 0);
						models.cube.rotation.set(0, 0, 0);
						models.fontB.forEach((font, index) => {
							font.visible = true;
							font.position.set(0, 0, -50 * (index % 2 + 1));
							font.scale.set(0.07, 0.07, 0.07);
							font.lookAt(0, 0, 0);
						});
						ambientLight.intensity = 0.1
						gsap.to(models.fontB[0].position, { x: -0.1,  y: 0, z: -0.5, duration: 2 });
						gsap.to(models.fontB[1].position, { x: -0.06, y: 0, z: -0.5, duration: 2 });
						gsap.to(models.fontB[2].position, { x: -0.02, y: 0, z: -0.5, duration: 2 });
						gsap.to(models.fontB[3].position, { x:  0.02, y: 0, z: -0.5, duration: 2 });
						gsap.to(models.fontB[4].position, { x:  0.06, y: 0, z: -0.5, duration: 2 });
						gsap.to(models.fontB[5].position, { x:  0.1,  y: 0, z: -0.5, duration: 2 });
						setAnime[3] = true;
					}
					models.cube.position.z = (time * 12) % 10;
					if (time < 15.15) { return true; }
					else {
						if (setAnime[9]) {
							gsap.to(models.fontB[0].position, { x: 0, y: 0, z: -25, duration: 1 });
							gsap.to(models.fontB[1].position, { x: 0, y: 0, z: -25, duration: 1 });
							gsap.to(models.fontB[2].position, { x: 0, y: 0, z: -25, duration: 1 });
							gsap.to(models.fontB[3].position, { x: 0, y: 0, z: -25, duration: 1 });
							gsap.to(models.fontB[4].position, { x: 0, y: 0, z: -25, duration: 1 });
							gsap.to(models.fontB[5].position, { x: 0, y: 0, z: -25, duration: 1 });
							setAnime[9] = false;
						}
						return false;
					}
				}
				models.dragonParticles.geometry.attributes.position.array[i] = coor.x;
				models.dragonParticles.geometry.attributes.position.array[i + 1] = coor.y;
				models.dragonParticles.geometry.attributes.position.array[i + 2] = coor.z;
			}
			models.dragonParticles.geometry.attributes.position.needsUpdate = true;
			return true;
		},
		cameraGalaxyAnimation: (time, setCam, camera) => {
			if (time < 2.4) {
				if (!setCam[0]) {
					move.end.set(0, 0, 0);
					setCam[0] = true;
				}
				camera.position.z = MathUtils.lerp(camera.position.z, -10, 0.08);
				move.to(camera.rotation, move.end, 0.005);
			} else if (time < 6.5) {
				camera.position.x = Math.sin(time) * 75;
				camera.position.z = -Math.cos(time) * 75;
				camera.lookAt(0, 0, 0);
			} else if (time < 10.2) {
				if (time > 6) {
					camera.position.y = MathUtils.lerp(camera.position.y, 75, 0.01);
				}
				camera.position.x = Math.sin(time) * 75;
				camera.position.z = Math.cos(time) * 75;
				camera.lookAt(0, 0, 0);
			}
		},
		resetSphereAnimation: (time, setAnime, ambientLight, hemisphereLight, models) => {
			if (!setAnime[0]) {
				ambientLight.intensity = 0;
				hemisphereLight.intensity = 0.1;
				gsap.to(ambientLight, { intensity: 0.07, duration: 2, ease: "none" });
				gsap.to(hemisphereLight, { intensity: 0.2, duration: 2, ease: "none" });
				gsap.fromTo(
					models.dragonSphere.position,
					{ x: -30, y: 0, z: 0 },
					{ x: 0, y: 0, z: 0, duration: 2, ease: "none" }
				);
				setAnime[0] = true;
			}
			if (time < 3) return true;
			return false;
		},
		resetDragonAnimation: (time, setAnime, ambientLight, hemisphereLight, models) => {
			if (!setAnime[0]) {
				gsap.to(ambientLight, { intensity: 0.14, duration: 2, ease: "none" });
				gsap.to(hemisphereLight, { intensity: 0.3, duration: 2, ease: "none" });
				gsap.fromTo(
					models.dragonUnBrokenNoSphere.position,
					{ x: -34.75, y: 0, z: 0 },
					{ x: -4.75, y: -0.58, z: -0.53, duration: 2, ease: "none" }
				);
				setAnime[0] = true;
			}
			if (time < 3) return true;
			return false;
		},
		resetGateAnimation: (time, setAnime, ambientLight, hemisphereLight, models) => {
			if (!setAnime[0]) {
				gsap.to(ambientLight, { intensity: 0.21, duration: 2, ease: "none" });
				gsap.to(hemisphereLight, { intensity: 0.4, duration: 2, ease: "none" });
				gsap.fromTo(
					models.gate.position,
					{ x: -50, y: 0, z: 0 },
					{ x: -0.39, y: 2.1, z: -1.42, duration: 2, ease: "none" }
				);
				setAnime[0] = true;
			}
			if (time < 3) return true;
			return false;
		},
		resetAureoleAnimation: [
			(time, setAnime, ambientLight, hemisphereLight, models) => {
				if (!setAnime[0]) {
					gsap.to(ambientLight, { intensity: 0.28, duration: 2, ease: "none" });
					gsap.to(hemisphereLight, { intensity: 0.5, duration: 2, ease: "none" });
					gsap.fromTo(
						models.aureole[0].position,
						{ x: -50, y: 0, z: 0 },
						{ x: 0, y: 0, z: -25, duration: 2, ease: "none" }
					);
					setAnime[0] = true;
				}
				if (time < 3) return true;
				return false;
			},
			(time, setAnime, ambientLight, hemisphereLight, models) => {
				if (!setAnime[0]) {
					gsap.to(ambientLight, { intensity: 0.35, duration: 2, ease: "none" });
					gsap.to(hemisphereLight, { intensity: 0.6, duration: 2, ease: "none" });
					gsap.fromTo(
						models.aureole[1].position,
						{ x: -50, y: 0, z: 0 },
						{ x: 0, y: 0, z: -25, duration: 2, ease: "none" }
					);
					setAnime[0] = true;
				}
				if (time < 3) return true;
				return false;
			},
			(time, setAnime, ambientLight, hemisphereLight, models) => {
				if (!setAnime[0]) {
					gsap.to(ambientLight, { intensity: 0.42, duration: 2, ease: "none" });
					gsap.to(hemisphereLight, { intensity: 0.7, duration: 2, ease: "none" });
					gsap.fromTo(
						models.aureole[2].position,
						{ x: -50, y: 0, z: 0 },
						{ x: 0, y: 0, z: -25, duration: 2, ease: "none" }
					);
					setAnime[0] = true;
				}
				if (time < 3) return true;
				return false;
			}
		],
		resetWaterAnimation: (time, setAnime, ambientLight, hemisphereLight, models) => {
			if (!setAnime[0]) {
				gsap.to(ambientLight, { intensity: 0.5, duration: 2, ease: "none" });
				gsap.to(hemisphereLight, { intensity: 0.8, duration: 2, ease: "none" });
				setAnime[0] = true;
			}
			models.water[0].position.y = MathUtils.lerp(models.water[0].position.y, -6, 0.02);
			models.water[0].material.uniforms['time'].value = time / 2;
			if (time < 3) return true;
			return false;
		}
	};
}