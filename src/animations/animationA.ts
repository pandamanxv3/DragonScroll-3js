import { Color } from 'three'
import { AnimationFunctionA } from '../types'
import gsap from 'gsap'

// const enum animations_name {
//     rotation_aureole,
//     water,
//     water2,
//     cube
// };

// let timer: number = 0;
// let acceleration: number = 1;

export default function initAnimationA(): AnimationFunctionA[] {
    const enum animations_name {
        rotation_aureole,
        water,
        water2,
        cube
    };
    let timer: number = 0;
    let acceleration: number = 1;
    const animations: AnimationFunctionA[] = [];

    animations[0] = (elapsedTime, models, camera, scene, transition) => {
        models.aureole[0].rotation.z = elapsedTime * 1.2
        models.aureole[1].rotation.z = elapsedTime * 0.8
        models.aureole[2].rotation.z = elapsedTime * 0.3
    
        models.dragonSphere.rotation.y = elapsedTime * 0.5
        models.dragonSphere.rotation.z = elapsedTime * 0.5
        models.dragonSphere.rotation.x = elapsedTime * 0.5
        models.dragonSphere.position.y = Math.sin(elapsedTime) * 0.4
        models.dragonSphere.position.x = Math.sin(elapsedTime) * 0.1
    }
    
    animations[1] = (elapsedTime, models, camera, scene, transition) => {
    
        if (transition.animations_transiA[animations_name.rotation_aureole] === false) {
            timer = elapsedTime;
            //camera
            gsap.to(models.camera[0].position, {
                x: 5.136253315285573,
                z: 12,
                duration: 5,
                ease: 'power3.in'
            })
            gsap.to(models.camera[0].rotation, {
                x: -0.5328347560354862,
                y: 0.34957452680039297,
                z: 0.20129148780149939,
                duration: 5,
                ease: 'expo.in'
            })
    
            //Sphere
            gsap.to(models.dragonSphere.scale, {
                x: 0.01,
                y: 0.01,
                z: 0.01,
                duration: 3,
                delay: 3,
                ease: 'rough({ strength: 1, points: 20, template: none.out, taper: none, randomize: true, clamp: false })'
            })
            //auréole[0]
            gsap.to(models.aureole[0].scale, {
                x: 0.8,
                y: 0.7,
                z: 0.8,
                duration: 1.8,
                delay: 4,
                ease: 'power2.out'
            })
    
            gsap.to(models.aureole[0].position, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                delay: 4,
                ease: 'power2.out'
            })
    
            //auréole[1]
            gsap.to(models.aureole[1].scale, {
                x: 0.8,
                y: 0.7,
                z: 0.8,
                duration: 1.5,
                delay: 5,
                ease: 'power2.out'
            })
            gsap.to(models.aureole[1].position, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                delay: 5,
                ease: 'power2.out'
            })
    
            //auréole[2]
    
            gsap.to(models.aureole[2].scale, {
                x: 0.8,
                y: 0.7,
                z: 0.8,
                duration: 1.5,
                delay: 6,
                ease: 'power2.out'
            })
    
            gsap.to(models.aureole[2].position, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.6,
                delay: 6,
                ease: 'power2.out'
            })
            transition.animations_transiA[animations_name.rotation_aureole] = true
        }
        else {
            if (timer + 9.5 > elapsedTime) {
                models.dragonSphere.rotation.y = (elapsedTime / 5) * acceleration
                models.dragonSphere.rotation.x = elapsedTime * acceleration
                acceleration += 0.03
                models.dragonSphere.position.y = Math.sin(elapsedTime * 12) * 0.09
                models.dragonSphere.position.x = Math.cos(elapsedTime * 45) * 0.02
                camera.rotation.x += Math.sin(elapsedTime * 84) * acceleration * 0.0001
                camera.rotation.y += Math.cos(elapsedTime * 12) * acceleration * 0.0002
                if (timer + 3 > elapsedTime) {
                    models.aureole[0].rotation.z = elapsedTime * 1.2
                }
                if (timer + 5 > elapsedTime) {
                    models.aureole[1].rotation.z = elapsedTime * 0.8
                }
                if (timer + 6 > elapsedTime) {
                    models.aureole[2].rotation.z = elapsedTime * 0.3
                }
                if (timer + 4.5 < elapsedTime) {
                    models.aureole[0].rotation.x = elapsedTime * 4
                    models.aureole[0].rotation.z = elapsedTime * 2
                    models.aureole[0].rotation.y = elapsedTime
                }
                if (timer + 6.5 < elapsedTime) {
                    models.aureole[1].rotation.x = elapsedTime * 4
                    models.aureole[1].rotation.z = elapsedTime * 2
                }
                if (timer + 7.5 < elapsedTime) {
                    models.aureole[2].rotation.x = elapsedTime * 5
                    models.aureole[2].rotation.y = elapsedTime * 4
                }
                if (timer + 8.8 < elapsedTime) {
                    transition.animation++;
                }
                return
            }
        }
    }
    
    animations[2] = (elapsedTime, models, camera, scene, transition) => {
    
        if (transition.animations_transiA[animations_name.water] == false) {
            acceleration = 1
            timer = elapsedTime
            models.fontA1.visible = true
            transition.animations_transiA[animations_name.water] = true
            gsap.to(models.camera[0].position, {
                x: -6.535940828585609,
                y: 2.0745032593765087,
                z: 8.883506946424909,
                duration: 3,
                ease: 'expo.out'
            })
            gsap.to(models.camera[0].rotation, {
                x: -0.9542850549036911,
                y: -0.06736478636557684,
                z: 3.141592653589793,
                duration: 3,
                ease: 'expo.out'
            })
        }
        if (timer + 0.41 < elapsedTime && transition.animations_transiA[animations_name.water2] == false) {
            models.gate.visible = false
            models.aureole[0].visible = false
            models.aureole[1].visible = false
            models.aureole[2].visible = false
            models.dragonSphere.visible = false
            models.fontA1.visible = true //particules liee a ca, les delier
            transition.animations_transiA[animations_name.water2] = true
        }
        if (timer + 3 < elapsedTime) // a retirer
            transition.needScroll = true
    
    }
    animations[3] = (elapsedTime, models, camera, scene, transition) => {
        if (transition.animation == 3) {
            transition.animation = 4;
            transition.sceneToScene();
        }
    }
    
    animations[4] = () => {
        return;
    }
    
    animations[6] = (elapsedTime, models, camera, scene, transition) => {
    
        if (transition.animations_transiA[animations_name.cube] == false) {
            camera.position.set(-11.668095624446837, 7.0791641969833075, 27.986620027884758)
            camera.rotation.set(0, 0, 0)
            scene.background = new Color('black');
            models.cube.position.set(-11.668095624446837, 7.0791641969833075, 27.986620027884758)
            models.cube.rotation.set(0, 0, 0)
            models.cube.visible = true
            transition.animations_transiA[animations_name.cube] = true
            transition.needScroll = true // a changer
        }
        models.cube.position.z = (elapsedTime * 12) % 10
    }

    return animations;
};