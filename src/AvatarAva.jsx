import { faMicrophone, faMicrophoneSlash, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Environment, Loader, OrbitControls, OrthographicCamera, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import avaStyle from './AvatarAva.module.css';
import Avatar, { SetAvatarPosition } from './avatarUtlity/Avatar';
import Comp from './avatarUtlity/Comp';
//import modelGlb from './modelsAndRelated/GLB_1.glb';
import photo_studio_loft_hall_1k from './images/photo_studio_loft_hall_1k.hdr';
import { useLocation } from 'react-router-dom';

import { SpeechConfig, SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";
import blendShapeNames from './avatarUtlity/blendShapeNames.json';


export default  function AvatarAva() {
	// console.log('..ava')
	const AZURE_REGION = process.env.REACT_APP_AZURE_REGION || "AZURE_REGION_None";
	const AZURE_KEY = process.env.REACT_APP_AZURE_KEY || "AZURE_KEY_None";
	 const [blendDataState, setBlendDataState] = useState([]);
	 // const [blenddatajson, Setblenddatajson] = useState([]);
	//const [message, setMessage] = useState();
	// const refTextArea = useRef();
	const [textAreaValue, setTextAreaValue] = useState('');

	const [hitAzure, setHitAzure] = useState(false);
	const [text, setText] = useState('');
	const [responseText, setResponseText] = useState('');
	const [chatMessages, setChatMessages] = useState([]);
	const [isLoaderVisible, setLoaderIsVisible] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const recognition = useRef(new (window.SpeechRecognition || window.webkitSpeechRecognition)());
	const chatMsgContainerRef = useRef(null);
	
	const { search,state } = useLocation();
	//const params = new URLSearchParams(search);
	const className =state.view; //params.get('className') || null;
	const apiUrl=state.url;
	const modelGlb=state.glbModel;
	const [AvatarModel, setAvatarModel] = useState(<Avatar avatar_url={modelGlb}/>);//text={responseText}
	// console.log(state)
	// console.log(state.view)
	function handlerPosition() {
		if(className !=='main'){
			SetAvatarPosition();
			console.log("testing scene");
		}
	}
	// useEffect(()=>{
	// 	setAvatarModel(<Avatar avatar_url={modelGlb} text={responseText} />)
	// }, [responseText]);

	useEffect(()=>{
		setAvatarModel(<Avatar avatar_url={modelGlb} blendDataState={blendDataState} text={responseText}/>)
	}, [blendDataState]);

  // Function to update the state when the textarea value changes
  const handleTextAreaChange = (event) => {
    setTextAreaValue(event.target.value);
  };


  function textToSpeech(textToVesime) {
	return new Promise((resolve, reject) => {
		// let promptForAzure = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
		// 	<voice name="en-US-JennyNeural">
		// 		<mstts:viseme type="FacialExpression"/>
		// 		${textToVesime}
		// 	</voice>
		// </speak>`;
		let promptForAzure = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
		<voice name="en-US-JennyNeural">
			<mstts:viseme type="FacialExpression"/>
			<prosody volume="silent">${textToVesime}</prosody>
		</voice>
	</speak>`;
		const speechConfig = SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
		speechConfig.speechSynthesisOutputFormat = 5; // mp3-48kb/bitrate

		let blendData = [];
		let timeStep = 1 / 60;
		let timeStamp = 0;

		//	SpeechConfig, AudioConfig
		const synthesizer = new SpeechSynthesizer(speechConfig);

		synthesizer.visemeReceived = (s, e) => {
			// `Animation` is an xml string for SVG or a json string for blend shapes
			let animation = JSON.parse(e.animation);
			animation?.BlendShapes?.forEach(blendArray => {
				let blend = {};
				blendShapeNames.forEach((shapeName, shapeNameIndex) => {
					blend[shapeName] = blendArray[shapeNameIndex];
				});
				blendData.push({
					time: timeStamp,
					blendshapes: blend
				});
				timeStamp += timeStep;
			});
		};
		//synthesizer.speakSsmlAsync(promptForAzure)
		synthesizer.speakSsmlAsync(
			promptForAzure,
			result => {
				synthesizer.close();
				 //console.log(":::::::::::::");
				 setBlendDataState(blendData)
				//setResponseText(textToVesime)
				resolve({ blendData: blendData, message: "success" });
			},
			error => {
				synthesizer.close();
				reject(error.message);
			}
		);
	});
};


  // Function to handle the click event of the button
  const handleButtonClicktxtarea = async () => {
	debugger
    // Here you can use textAreaValue however you need
    console.log('Textarea value:', textAreaValue);
	await textToSpeech(textAreaValue)

	setResponseText(textAreaValue);
			let htmlContent=null
			setChatMessages(prevMessages => [...prevMessages, { type: 'receive', text: textAreaValue, htmlContent }]);
  };
	
	const sendToAigs = async () => {
		setLoaderIsVisible(true);
		
		try {
			const response = await fetch(
				`${apiUrl}` +
				`&query=${text}`,
				{
					method: "GET",
				}
			);

			if (response.ok) {
				debugger;
				// Check if the response content type is JSON
				const contentType = response.headers.get("content-type");
				if (contentType && contentType.includes("application/json")) {
					const data = await response.json();
					setText(data);
					const htmlContent = extractHtml(data);
					setChatMessages(prevMessages => [...prevMessages, { type: 'receive', text: data, htmlContent }]);
					if (!htmlContent) {
						setHitAzure(true);
					}
				} else {
					// If not JSON, you might handle other content types here
					const data = await response.text();
					//setResponseText(data);
				
					const htmlContent = extractHtml(data);
					setChatMessages(prevMessages => [...prevMessages, { type: 'receive', text: data, htmlContent }]);
					if (!htmlContent) {
						setHitAzure(true);
					}
				}

				// Assuming setHitAzure is a state-setting function
				setLoaderIsVisible(false);
			} else {
				console.error("Error in execution: ", response.status);
				setLoaderIsVisible(false);
			}
		} catch (error) {
			console.error("Error in execution: ", error.message);
			setLoaderIsVisible(false);
		}
	};
	

	const playchunk = async () => {
		
			// var txt=`In assessing your digital avatar's linguistic capabilities, it is imperative to employ a comprehensive selection of English words that encapsulate a diverse range of phonetic sounds. The inclusion of various phonemes is crucial for evaluating the avatar's proficiency in accurately reproducing an extensive spectrum of linguistic nuances. Incorporating plosives, such as the crisp sounds in "pop" and the resonant impact of "bump," allows for an examination of the avatar's ability to articulate abrupt and forceful elements within speech. Fricatives, exemplified by words like "zest" and "whiff," contribute to the evaluation of the avatar's handling of continuous, hissing sounds, showcasing its aptitude for nuanced pronunciation.Nasals, represented by words like "munch" and "sniff," introduce challenges related to resonant nasal airflow, testing the avatar's capacity to faithfully reproduce these distinctive auditory patterns. Affricates, combining elements of plosives and fricatives as seen in "chirp" and "jolt," provide insight into the avatar's ability to seamlessly transition between different articulatory configurations. Vowel sounds, exhibited in words like "gleam" and "hoot," present an opportunity to evaluate the avatar's proficiency in reproducing the nuanced variations inherent in vowel articulation.By strategically selecting words that encompass a wide array of phonetic complexities, this testing approach aims to validate the digital avatar's linguistic prowess across the spectrum of English language sounds. It ensures a thorough examination of the avatar's capacity to faithfully replicate the subtleties and intricacies of human speech, contributing to its overall effectiveness in communication scenarios.`;
			var txt=`In assessing your digital avatar's linguistic capabilities, it is imperative to employ a comprehensive selection of English words that encapsulate a diverse range of phonetic sounds.`;
			setResponseText(txt);
			let htmlContent=null
			setChatMessages(prevMessages => [...prevMessages, { type: 'receive', text: txt, htmlContent }]);
			 //await textToSpeech(txt)


			// var data=txt.split(" ");
			// var chunkSize = 100;

			// for (var i = 0; i < data.length; i += chunkSize) {
			// 	let marray=data.slice(i, i + chunkSize).join(" ")
			// 	let htmlContent=null
			// 		setChatMessages(prevMessages => [...prevMessages, { type: 'receive', text: marray, htmlContent }]);
			// 		await textToSpeech(marray)
			// 		console.log(marray)
			// }

				
		};

		
		
	// const sendToAigss=async() =>{
	// 	setLoaderIsVisible(true);
	// 	const OPENAI_API_KEY = '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';
	// 	fetch('https://api.openai.com/v1/chat/completions', {
	// 	  method: 'POST',
	// 	  headers: {
	// 		'Content-Type': 'application/json',
	// 		'Authorization': 'Bearer ' + OPENAI_API_KEY
	// 	  },
	// 	  body: JSON.stringify({
	// 		model: 'gpt-3.5-turbo',
	// 		messages: [{ role: 'user', content: text }],
	// 		temperature: 0.7,
	// 		stream: true
	// 	  })
	// 	})
	// 	.then(response => {
	// 		console.log(response)
	// 	  const reader = response.body.getReader();
	// 	  const decoder = new TextDecoder();
	// 	  return new ReadableStream({
	// 		start(controller) {
	// 		  function read() {
	// 			reader.read().then(({ done, value }) => {
	// 			  if (done) {
	// 				console.log("Stream has ended");
	// 				setLoaderIsVisible(false);
	// 				controller.close();
	// 				return;
	// 			  }
	// 				debugger
	// 			  let text = decoder.decode(value, { stream: true }).split('data: ')[1];
	// 			  let res=JSON.parse(text).choices[0].delta.content;
	// 			  let htmlContent=null
	// 			// setText(res);
	// 			// setResponseText(res);
	// 			// setChatMessages(prevMessages => [...prevMessages, { type: 'receive', text: res, htmlContent }]);
	// 			// setHitAzure(true);
	// 			  console.log(res);
	// 			  read();
	// 			}).catch(error => {
	// 			  console.error('Error reading stream:', error);
	// 			  controller.error(error);
	// 			});
	// 		  }
	// 		  read();
	// 		}
	// 	  });
	// 	})
	// 	.then(stream => {
	// 	  // You can consume the stream here if needed
	// 	})
	// 	.catch(error => {
	// 	  console.error('Error:', error);
	// 	});
		
		
		
	// }

	// const handleButtonClickChunkdelay=()=>{
	// 	playchunkdelay();
	// 	setChatMessages(prevMessages => [...prevMessages, { type: 'send', text }]);
	// }
	// const handleButtonClickplay=()=>{
	// 	playtext();
	// 	setChatMessages(prevMessages => [...prevMessages, { type: 'send', text }]);
	// }

	const handleButtonClickChunk=()=>{
		playchunk();
		setChatMessages(prevMessages => [...prevMessages, { type: 'send', text }]);
	}



	const handleButtonClick = () => {
		if (text !== '') {
			sendToAigs();
			setChatMessages(prevMessages => [...prevMessages, { type: 'send', text }]);
			setText('');
		}
	}

	

	// const startListening = () => {
	// 	recognition.current.start();
	// 	setIsListening(true);
	// };

	// const stopListening = () => {
	// 	recognition.current.stop();
	// 	setIsListening(false);
	// };

	// if (recognition.current) {
	// 	recognition.current.onresult = (event) => {
	// 		const spokenText = event.results[0][0].transcript;
	// 		setText(spokenText.substring(0, 200));
	// 	};

	// 	recognition.current.onend = () => {
	// 		setIsListening(false);
	// 	};
	// }

	const test = () => {
		SetAvatarPosition();
	};


	useEffect(() => {
		// Scroll to the bottom when chat messages change or loader is visible
		// chatMsgContainerRef.current.scrollTop = chatMsgContainerRef.current.scrollHeight;
	}, [chatMessages, isLoaderVisible]);

	function extractHtml(response) {
		const htmlRegex = /<\/?[a-z][\s\S]*>/i;
		const match = response.match(htmlRegex);
		return match ? match[0] : null;
	}

	return (
		<div className={`full ${avaStyle[className]}`}>
			<Canvas dpr={2} onCreated={(ctx) => { ctx.gl.physicallyCorrectLights = true; }}>
				<OrbitControls enableZoom={true}
					minZoom={1000}  // Minimum zoom level
					maxZoom={2200}  // Maximum zoom level
					minAzimuthAngle={-Math.PI / 9}	// right
					maxAzimuthAngle={Math.PI / 9}	// left
					maxPolarAngle={Math.PI / 1.55}	// down
					minPolarAngle={Math.PI / 3}	// up *
					target={[0, 1.65, 1]} />
				<Stars />
				<OrthographicCamera makeDefault zoom={2000} position={[0, 1.65, 1]} />
				<Suspense fallback={null}>
					<Environment background={false} files={photo_studio_loft_hall_1k} />
				</Suspense>
				<Suspense fallback={null}>
					<Comp />
				</Suspense>
				<Suspense fallback={null}>
					{AvatarModel}
					{/* <Avatar avatar_url={modelGlb} hitAzure={hitAzure} setHitAzure={setHitAzure} refTextArea={refTextArea} text={responseText} blendDataState={blenddatajson} /> */}
				</Suspense>
			</Canvas>
			<Loader dataInterpolation={(p) => `Loading... please wait`} />

			<div className={avaStyle.chatContainer}>
				<div className={avaStyle.chatMsgContainer} ref={chatMsgContainerRef}>
					<ul className={avaStyle.chatElement}>
						{chatMessages.map((message, index) => (
							<li key={index} className={message.type === 'send' ? avaStyle.send : avaStyle.receive}>
								{!message.htmlContent && message.text}
								{message.htmlContent && (<div className={avaStyle.htmlData} dangerouslySetInnerHTML={{ __html: message.htmlContent }} />)}
							</li>
						))}
					</ul>
					{isLoaderVisible && (
						<div className={avaStyle.loader1} id={avaStyle.waitingForResp}>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
						</div>
					)}
				</div>
			<div className={avaStyle.speakText}>
					{/* <textarea rows={4} type="text" ref={refTextArea} className={avaStyle.text} value={text} placeholder='Search...' onClick={handlerPosition} onKeyDown={(event) => { if (event.key === 'Enter') handleButtonClick() }} onChange={(e) => setText(e.target.value)} /> */}
					<div className={avaStyle.actionIcons}>
						{/* <button onClick={() => test()} >test</button>
						<button onClick={() => handleButtonClickChunk()} >play in chunk</button> */}
					<textarea
        value={textAreaValue}
        onChange={handleTextAreaChange}
        placeholder="Enter text here..."
      />
      <br />
      <button onClick={handleButtonClicktxtarea}>speak</button>
    
				</div>
			</div>
		</div>

		{/* <button onClick={onClickButtonFull} style={{width:"10%", height:"40px", padding:"2%", position:"fixed", bottom:"2%", right:"2%", }}>Full View</button> */}

		</div>
	)
}