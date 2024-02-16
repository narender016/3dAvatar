/* eslint-disable react-hooks/exhaustive-deps */
import { useAnimations, useFBX, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { AnimationMixer, LineBasicMaterial, LinearSRGBColorSpace, LoopOnce, MeshPhysicalMaterial, MeshStandardMaterial, SRGBColorSpace, Vector2 } from "three";
import blinkData from "../modelsAndRelated/blendDataBlink.json";
import createAnimation from "../modelsAndRelated/converter";
import idleFbFile from "../modelsAndRelated/idle.fbx";
 import useVesimeGetJson from '../vesime/useVesimeGetJson';

import image_body from "../images/body.webp";
import image_eyes from "../images/eyes.webp";
import image_body_specular from "../images/body_specular.webp";
import image_body_roughness from "../images/body_roughness.webp";
import image_body_normal from "../images/body_normal.webp";
import image_teeth_diffuse from "../images/teeth_diffuse.webp";
import image_teeth_normal from "../images/teeth_normal.webp";
// import image_teeth_specular from "../images/teeth_specular.webp"; //
import image_h_color from "../images/h_color.webp";
import image_tshirt_diffuse from "../images/tshirt_diffuse.webp";
import image_tshirt_normal from "../images/tshirt_normal.webp";
import image_tshirt_roughness from "../images/tshirt_roughness.webp";
import image_h_alpha from "../images/h_alpha.webp";
import image_h_normal from "../images/h_normal.webp";
import image_h_roughness from "../images/h_roughness.webp";
import { TweenLite  } from 'gsap';

import { SpeechConfig, SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";
import blendShapeNames from './blendShapeNames.json';

var gltf;
// var flag=true;
export function SetAvatarPosition() {
	TweenLite.to(gltf.scene.position, 1, { x: 0.17, y: 0, z: 0 });
}
  
export default  function Avatar({avatar_url,
 blendDataState,
 text
}) {
  
document.title = "Eva | 3d Avatar";
debugger


console.log("blendDataState",blendDataState);
	gltf = useGLTF(avatar_url);
  let morphTargetDictionaryBody = {}; 
  let morphTargetDictionaryLowerTeeth = {}; ;

  const [
    bodyTexture,
    eyesTexture,
    teethTexture,
    bodySpecularTexture,
    bodyRoughnessTexture,
    bodyNormalTexture,
    teethNormalTexture,
    // teethSpecularTexture,
    hairTexture,
    tshirtDiffuseTexture,
    tshirtNormalTexture,
    tshirtRoughnessTexture,
    hairAlphaTexture,
    hairNormalTexture,
    hairRoughnessTexture,
  ] = useTexture([
    image_body,
    image_eyes,
    image_teeth_diffuse,
    image_body_specular,
    image_body_roughness,
    image_body_normal,
    image_teeth_normal,
    // image_teeth_specular,
    image_h_color,
    image_tshirt_diffuse,
    image_tshirt_normal,
    image_tshirt_roughness,
    image_h_alpha,
    image_h_normal,
    image_h_roughness,
  ]);

  [
    bodyTexture,
    eyesTexture,
    teethTexture,
    teethNormalTexture,
    bodySpecularTexture,
    bodyRoughnessTexture,
    bodyNormalTexture,
    tshirtDiffuseTexture,
    tshirtNormalTexture,
    tshirtRoughnessTexture,
    hairAlphaTexture,
    hairNormalTexture,
    hairRoughnessTexture,
  ].forEach((t) => {
    t.colorSpace = SRGBColorSpace;
    t.flipY = false;
  });

  bodyNormalTexture.colorSpace = LinearSRGBColorSpace;
  tshirtNormalTexture.colorSpace = LinearSRGBColorSpace;
  teethNormalTexture.colorSpace = LinearSRGBColorSpace;
  hairNormalTexture.colorSpace = LinearSRGBColorSpace;

  gltf.scene.traverse((node) => {
    
    //console.log("nodetype: "+node.type)
    if (
      node.type === "Mesh" ||
      node.type === "LineSegments" ||
      node.type === "SkinnedMesh"
    ) {
      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = false;
      if (node.name.includes("Body")) {
        node.castShadow = true;
        node.receiveShadow = true;

        node.material = new MeshPhysicalMaterial();
        node.material.map = bodyTexture;
        // node.material.shininess = 60;
        node.material.roughness = 1.7;

        // node.material.specularMap = bodySpecularTexture;
        node.material.roughnessMap = bodyRoughnessTexture;
        node.material.normalMap = bodyNormalTexture;
        node.material.normalScale = new Vector2(0.6, 0.6);
        morphTargetDictionaryBody = node.morphTargetDictionary;
        node.material.envMapIntensity = 0.8;
        // node.material.visible = false;
      }

      if (node.name.includes("Eyes")) {
        node.material = new MeshStandardMaterial();
        node.material.map = eyesTexture;
        // node.material.shininess = 100;
        node.material.roughness = 0.1;
        node.material.envMapIntensity = 0.5;
      }

      if (node.name.includes("Brows")) {
        node.material = new LineBasicMaterial({ color: 0x000000 });
        node.material.linewidth = 1;
        node.material.opacity = 0.5;
        node.material.transparent = true;
        node.visible = false;
      }

      if (node.name.includes("Teeth")) {
        node.receiveShadow = true;
        node.castShadow = true;
        node.material = new MeshStandardMaterial();
        node.material.roughness = 0.1;
        node.material.map = teethTexture;
        node.material.normalMap = teethNormalTexture;

        node.material.envMapIntensity = 0.7;
      }

      if (node.name.includes("Hair")) {
        node.material = new MeshStandardMaterial();
        node.material.map = hairTexture;
        node.material.alphaMap = hairAlphaTexture;
        node.material.normalMap = hairNormalTexture;
        node.material.roughnessMap = hairRoughnessTexture;

        node.material.transparent = true;
        node.material.depthWrite = false;
        node.material.side = 2;
        node.material.color.setHex(0x000000);
        node.material.envMapIntensity = 0.3;
        node.material.opacity = 4;
      }

      if (node.name.includes("TSHIRT")) {
        node.material = new MeshStandardMaterial();
        node.material.map = tshirtDiffuseTexture;
        node.material.roughnessMap = tshirtRoughnessTexture;
        node.material.normalMap = tshirtNormalTexture;
        node.material.color.setHex(0xffffff);
        node.material.envMapIntensity = 0.5;
      }

      if (node.name.includes("TeethLower")) {
        morphTargetDictionaryLowerTeeth = node.morphTargetDictionary;
      }
    }
  });

  // Load idle body animations
  const [clips, setClips] = useState([]);
  const mixer = useMemo(() => new AnimationMixer(gltf.scene), [gltf.scene]);
  let idleFbx = useFBX(idleFbFile);
  let { clips: idleClips } = useAnimations(idleFbx.animations); // Variable is idleClips from clips state of useAnimations // from .fbx
  idleClips[0].tracks = idleClips[0].tracks.filter(track => track.name.includes("Head") || track.name.includes("Neck") || track.name.includes("Spine2"));
  idleClips[0].tracks = idleClips[0].tracks.map(track => {
    if (track.name.includes("Head")) track.name = "head.quaternion";
    if (track.name.includes("Neck")) track.name = "neck.quaternion";
    if (track.name.includes("Spine")) track.name = "spine2.quaternion";
    return track;
  });
  //	Adding Idle body movement and Eye blink
  useEffect(() => {
    let idleBody = mixer.clipAction(idleClips[0]);
    idleBody.play();
    let idleBlink = createAnimation(blinkData, morphTargetDictionaryBody, "HG_Body");// from json
    let blinkAction = mixer.clipAction(idleBlink);
    if(blinkAction!=null){
      blinkAction.play();
    }

  }, []);

  const [animationReady, setAnimationReady] = useState(null);
  

// const [blendDataState, setBlendDataState] = useState([]);
const AZURE_REGION = process.env.REACT_APP_AZURE_REGION || "AZURE_REGION_None";
const AZURE_KEY = process.env.REACT_APP_AZURE_KEY || "AZURE_KEY_None";

// blendDataState = textToSpeech(text)
let promptForAzure = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
<voice name="en-US-JennyNeural">
  <mstts:viseme type="FacialExpression"/>
  ${text}
</voice>
</speak>`;
const speechConfig = SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
speechConfig.speechSynthesisOutputFormat = 5; // mp3-48kb/bitrate
const synthesizer = new SpeechSynthesizer(speechConfig);


  useEffect(() => {

    if (blendDataState?.length > 0) {
    
      // console.log(">> blendDataState: ", blendDataState);
      let newClips = [
        createAnimation(blendDataState, morphTargetDictionaryBody, "HG_Body"),
        createAnimation(
          blendDataState,
          morphTargetDictionaryLowerTeeth,
          "HG_TeethLower"
        ),
      ];
      
      let stopTime = Math.round(newClips[0].duration * 1000 * 1);
      // console.log("New animation clips:", newClips, "Time:", stopTime);
      setClips(newClips);
      setAnimationReady(true);
        /** ---------audio play----------- */
        synthesizer.speakSsmlAsync(promptForAzure)
        /** -------------------- */
      setTimeout(() => {
        setAnimationReady(false);
      }, stopTime);
    }
  }, [blendDataState]);

  //
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    // Will have to false animation Ready
    if (animationReady === true) {
      setPlaying(true);
    } else {
      setPlaying(false);
      // setHitAzure(false);// comment 15 feb
    }
  }, [animationReady]);

  // Play animation clips when available
  useEffect(() => {
    if (playing === true)
      clips.forEach((clip) => {
        // console.log(clip, clip.tracks.at(-1).times.at(-1));
        let clipAction = mixer.clipAction(clip);
        clipAction.setLoop(LoopOnce);
        clipAction.play();
      });
  }, [playing]);

  useFrame((state, delta) => {
    mixer.update(delta);
  });

  return <primitive object={gltf.scene} dispose={null} />;
}


//  function textToSpeech(textToVesime) {
//  // const [blendDataState, setBlendDataState] = useState([]);
//   const AZURE_REGION = process.env.REACT_APP_AZURE_REGION || "AZURE_REGION_None";
// 	const AZURE_KEY = process.env.REACT_APP_AZURE_KEY || "AZURE_KEY_None";
//   // if(flag == true){
//   //   flag=false
// 	return new Promise((resolve, reject) => {
//     let promptForAzure = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
//       <voice name="en-US-JennyNeural">
//         <mstts:viseme type="FacialExpression"/>
//         ${textToVesime}
//       </voice>
//     </speak>`;
//     const speechConfig = SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
//     speechConfig.speechSynthesisOutputFormat = 5; // mp3-48kb/bitrate

//     let blendData = [];
//     let timeStep = 1 / 60;
//     let timeStamp = 0;

//     //	SpeechConfig, AudioConfig
//     const synthesizer = new SpeechSynthesizer(speechConfig);

//     synthesizer.visemeReceived = (s, e) => {
//       // `Animation` is an xml string for SVG or a json string for blend shapes
//       let animation = JSON.parse(e.animation);
//       animation?.BlendShapes?.forEach(blendArray => {
//         let blend = {};
//         blendShapeNames.forEach((shapeName, shapeNameIndex) => {
//           blend[shapeName] = blendArray[shapeNameIndex];
//         });
//         blendData.push({
//           time: timeStamp,
//           blendshapes: blend
//         });
       
//         timeStamp += timeStep;
//       });
//     };
    
//     synthesizer.speakSsmlAsync(
//       promptForAzure,
//       result => {
//         synthesizer.close();
//         resolve(blendData);
//       },
//       error => {
//         synthesizer.close();
//         reject(error.message);
//       }
//     );
//   });
//     //}
// };