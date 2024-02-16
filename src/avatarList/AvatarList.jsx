import { NavLink,useNavigate } from "react-router-dom";
import AvatarListData from "./allAvatarList.json";
import "./avatarList.css";
import React, { useState } from 'react';
//import {} from '../modelsAndRelated/';

import eva from '../modelsAndRelated/model.glb';
//import emma from '../modelsAndRelated/GLB_1.glb';
//import emma from '../modelsAndRelated/sirona.glb';

function AvatarList() {
	const navigate = useNavigate();
	localStorage.setItem("flag",true)
// console.log(process.env.REACT_APP_AIHUMAN_URL);

	const handleAvatarClick = (view,bottype) => {
      let url="";
	  let modelGlb="";
	  if(bottype =="aihuman"){
			url=process.env.REACT_APP_AIHUMAN_URL;
			modelGlb=eva
	  }else {
		    url=process.env.REACT_APP_SIRONA_URL;
			modelGlb=eva
	  }
	  navigate('./avatars/eva',{
		state: {
			view: view,
			//bottype: bottype,
			url: url,
			glbModel: modelGlb
		  }
	  });
	};
	
	return (
		// <div style={{ padding: "5px" }}>
		// 	<h2>List of Available Avatars</h2>
		// 	<NavLink relative="path" to="eva?className=main">Avatar - Eva</NavLink><br />
		// 	<NavLink relative="path" to="eva?className=">Avatar - chatEva</NavLink><br />
		// 	<NavLink relative="path" to="samantha">Avatar - Samantha</NavLink><br />
		// 	<NavLink relative="path" to="demoHead">Avatar - Demo Head only</NavLink><br />
		// </div>
		<div className="container">
			<div className="header">
				<h1>All Avatars</h1>
			</div>
			<div className="avatarContainer">
			{AvatarListData.map((item) => (
				<div key={item.id} className="avatarCard">
				{/* <p>To: {item.to}</p> */}
				<div className="imageConatiner">
				<img src={process.env.PUBLIC_URL + item.thumbnail} alt={item.name} />
				
				</div>
				<div className="detailsOfAvatar">
				<div>
					<h2>{item.name} </h2>
					<p>({item.bottype})</p>
				</div>
				<div className="buttonsContainer">
					<button className="navLinksView" onClick={() => handleAvatarClick("main",item.bottype)}>chat</button>
					<button className="navLinksView" onClick={() => handleAvatarClick("Fullview",item.bottype)}>Full View</button>
					{/* <NavLink relative="path" to="./avatars/eva?className=main" className="navLinksView">Chat</NavLink>
					<NavLink relative="path" to="./avatars/eva?className=abc" className="navLinksView">Full View</NavLink> */}
				</div>
				</div>
				</div>
			))}
			</div>
		</div>
		
	)
}

export default AvatarList