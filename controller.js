
mousex = null;
mousey = null;
mousedown = false;
shiftkey = false;

view.addEventListener('mousedown', function(e){
	// console.dir(e);
	mousedown = true;
	mousex  = e.clientX;
	mousey  = e.clientY;

	// event.preventDefault();
 //    var mouseX = (event.clientX / height)*2-1;
 //    var mouseY = -(event.clientY /width)*2+1;
 //    var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
 //    projector.unprojectVector( vector, camera );
 //    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
 //    var intersects = raycaster.intersectObjects( objects, true );
 //    if (intersects.length > 0) {
 //        alert("intersect!");
 //        var particle = new THREE.Sprite( particleMaterial );
 //        particle.position.copy( intersects[0].point );
 //        particle.scale.x = particle.scale.y = 300;
 //        scene.add(particle);    
 //    }

})

view.addEventListener('mousemove', function(e){
	if (mousedown){
		let dx = e.clientX - mousex;
		let dy = e.clientY - mousey;
		// console.log(`dx=${dx}; dy=${dy}`)
		model.transform(dx, dy, 0, shiftkey);
		mousex = e.clientX;
		mousey = e.clientY;
	}

})

window.addEventListener('keydown', function(e){
	shiftkey = e.code.toLowerCase();
})

window.addEventListener('keyup', function(e){
	shiftkey = null;
})

view.addEventListener('mouseup', function(){
	reset_mouse();
})

view.addEventListener('mouseleave', function(){
	reset_mouse();
})



function reset_mouse(){
	mousedown = false;
	mousex  = null;
	mousey  = null;
}