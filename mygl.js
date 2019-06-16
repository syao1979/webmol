class MyGL{
	hotobj = null;
	mousex = null;
	mousey = null;
	mousedown = false;
	shiftkey = false;
	offset = new THREE.Vector3();

	constructor(viewid){

		/* mouse event variables */

		// We need 3 things everytime we use Three.js
		// Scene + Camera + Renderer
		this.view = document.getElementById(viewid);
		// this.view = window;
		this.view.addEventListener("contextmenu", event => event.preventDefault());

		this.width = this.view.clientWidth;
		this.height = this.view.clientHeight;
		// this.width = this.view.innerWidth;
		// this.height = this.view.innerHeight;

		this.fov = 75;
		this.aspect = this.width / this.height;  // the canvas default
		this.near = 0.1;
		this.far = 10000;

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
		this.camera.position.z = 5;
		this.renderer = new THREE.WebGLRenderer( {antialias: true});
		
		// Start the renderer.	
		this.renderer.setClearColor("#e5e5e5");
		this.renderer.setSize(this.width, this.height);

		// document.body.appendChild(this.renderer.domElement);
		this.view.appendChild( this.renderer.domElement )

		// handle resize event 
		// document.getElementById(viewid).addEventListener('resize', () => {
		// 	this.resize();
		// })

		let geometry = new THREE.BoxGeometry(1, 1, 1);
		let meterial = new THREE.MeshLambertMaterial({color: 0xFFCC00});
		let mesh = new THREE.Mesh(geometry, meterial);
		mesh.position.set(-2, 1, 3)
		this.scene.add(mesh);

		geometry = new THREE.SphereGeometry(1, 10, 10);
		meterial = new THREE.MeshLambertMaterial({color: 0xFFCC00});
		mesh = new THREE.Mesh(geometry, meterial);
		mesh.position.set(2, -1, -4)
		this.scene.add(mesh);

		this.model = new MModel()
		// this.model.objects().forEach( (o) => this.scene.add(o) );

		let plight = new THREE.PointLight(0xFFFFFF, 1, 500);
		plight.position.set(10, 0, 25);
		this.scene.add(plight);

		// this way object will not be distorted
		let render = () => {
			// redraw when screen is refreshed (55hz), to maintain object propotion

			//= handle resize event
			let view = document.getElementById(viewid);
			let width = view.clientWidth;
			let height = view.clientHeight;
			if (width != this.width || height != this.height){
				this.resize();
			}

			requestAnimationFrame(render);
			// mesh.rotation.x += 0.05;
			this.renderer.render(this.scene, this.camera);
		}
		render();

		// for object picking
		
		// Plane, that helps to determinate an intersection position
	    // this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff}));
	    // this.plane.visible = false;
	    // this.scene.add(this.plane);

		this.raycaster = new THREE.Raycaster();
		// this.mouse = new THREE.Vector3();

		this.view.addEventListener('mousedown', (e) => this.mouse_down(e) )
		this.view.addEventListener('mousemove', (e) => this.mouse_move(e) )
		this.view.addEventListener('mouseup', () => this.reset_mouse() )
		this.view.addEventListener('mouseleave', () => this.reset_mouse() )

		// window.addEventListener('keydown', (e) => this.shiftkey = e.code.toLowerCase() )
		// window.addEventListener('keyup', (e) => this.shiftkey = null )


	}

	resize(e) {
		this.width = this.view.clientWidth;
		this.height = this.view.clientHeight;
		this.renderer.setSize(this.width, this.height);
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
	}

	//-- mouse event handlers
	mouse_down(e) {
		event.preventDefault();
		this.mousedown = true;
		this.mousex  = e.clientX;
		this.mousey  = e.clientY;

		// detect mouse down object
		let mouse = new THREE.Vector3();
		mouse.x = ( e.clientX / this.width ) * 2 - 1;
		mouse.y = -( ( e.clientY / this.height ) * 2 - 1 );
		this.raycaster.setFromCamera( mouse, this.camera );
		var intersects = this.raycaster.intersectObjects( this.scene.children, true );
		if (intersects.length > 0) {
			this.hotobj = intersects[0];
			
			this.hotobj.object.material.color.set(this.random_color());
			console.log( ` id=${this.hotobj['object']['id']}; name=${this.hotobj['object']['name']}` );

		} else {
			this.hotobj = null;
		}

		    // Get mouse position
	    // var mouseX = (event.clientX / this.width) * 2 - 1;
	    // var mouseY = -(event.clientY / this.width) * 2 + 1;

	    // // Get 3D vector from 3D mouse position using 'unproject' function
	    // var vector = new THREE.Vector3(mouseX, mouseY, 1);
	    // vector.unproject(this.camera);

	    // // Set the raycaster position
	    // this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );

	    // // Find all intersected objects
	    // var intersects = this.raycaster.intersectObjects(this.scene.children);

	    // if (intersects.length > 0) {
	    //   	this.hotobj = intersects[0];

		   //   // Calculate the offset
		   //  var intersects = this.raycaster.intersectObject(this.plane);
		   //  this.offset.copy(this.hotobj.point).sub(this.plane.position);
	    // }

	}

	mouse_move(e) {
		event.preventDefault();
		
		if ( this.mousedown && this.hotobj) {
			// Make the sphere follow the mouse
			let m = {x: 0, y: 0}
			m.x = ( e.clientX / this.width ) * 2 - 1;
			m.y = -( ( e.clientY / this.height ) * 2 - 1 );

		  	let vector = new THREE.Vector3(m.x, m.y, this.hotobj.object.position.z);
			vector.unproject( this.camera );
			let dir = vector.sub( this.camera.position ).normalize();
			let distance = - this.camera.position.z / dir.z;
			let pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );
			console.log(`z=${this.hotobj.object.position.z}; posz=${pos.z}`)
			pos.z = this.hotobj.object.position.z;
			this.hotobj.object.position.copy(pos);


			// Get mouse position
		    // var mouseX = (event.clientX / this.width) * 2 - 1;
		    // var mouseY = -(event.clientY / this.width) * 2 + 1;

		    // // Get 3D vector from 3D mouse position using 'unproject' function
		    // var vector = new THREE.Vector3(mouseX, mouseY, 1);
		    // vector.unproject(this.camera);

		    // // Set the raycaster position
		    // this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );

		    // var intersects = this.raycaster.intersectObject(this.plane);
		    //   // Reposition the object based on the intersection point with the plane
		    // this.hotobj.position.copy(this.hotobj.point.sub(this.offset));

		    // this.plane.position.copy(this.hotobj.object.object.position);
		    // this.plane.lookAt(this.camera.position);
		} 
	}

	reset_mouse(){
		// console.log("reset_mouse");
		this.mousedown = false;
		this.mousex  = null;
		this.mousey  = null;
	}

	render() {
		// update the picking ray with the camera and mouse position
		// this.raycaster.setFromCamera( this.mouseVector, this.camera ); 
		// // calculate objects intersecting the picking ray var intersects =     
		// this.raycaster.intersectObjects( this.scene.children ); 

		// if (intersects) {
		// 	for ( var i = 0; i < intersects.length; i++ ) { 
		// 	    intersects[ i ].object.material.color.set( 0xff0000 ); 
		// 	}
		// }
		
		// this.renderer.render( this.scene, this.camera );
	}

	random_color() {
		return '#' + (function co(lor){   return (lor +=
			  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
			  && (lor.length == 6) ?  lor : co(lor); })('');
	}
}




