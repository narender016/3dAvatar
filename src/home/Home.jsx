import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

function DefaultApp() {
	useEffect(() => {
		document.title = "3D Avatar";
	}, [])

	return (
		<div id='homeContainer'>
			<nav id='navbar'>Home | About | Contact</nav>
			<div className="mainCOntainer">
			<NavLink to="./avatars">Avatars - List</NavLink><br />
			<NavLink to="./avatars/eva">Avatar - Eva</NavLink><br />
			</div>
			{/* <Outlet /> */}
		</div>
	)
}

export default DefaultApp