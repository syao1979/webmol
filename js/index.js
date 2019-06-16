// /**
//  *
//  * WebGL With Three.js - Lesson 10 - Drag and Drop Objects
//  * http://www.script-tutorials.com/webgl-with-three-js-lesson-10/
//  *
//  * Licensed under the MIT license.
//  * http://www.opensource.org/licenses/mit-license.php
//  * 
//  * Copyright 2015, Script Tutorials
//  * http://www.script-tutorials.com/
//  */

import './OrbitControls';
import MyGL2 from '../mygl2';

var GL = null;
// when DOM is ready ...
	$( function() {
	$( "#tabs" ).tabs().show();
	GL = new MyGL2("glview");
	// GL.loadMol($("#pdb").html());
	} );


function do_model(){
	let model = $("#model_select").val();
	if (GL.model){
		GL.reloadModel("MOL1", model);
	}
}

function handleFileSelect(evt) {
		  		//Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 


    if (f) {
      	var r = new FileReader();
      	r.onload = function(e) { 
	      	var contents = e.target.result;
	      	GL.loadMol(contents, "pdb", "MOL1", $("#model_select").val())
	      	// console.log(contents) 
      	}
      	r.readAsText(f);
    } else { 
      	alert("Failed to load file");
    } 
}

if (process.env.NODE_ENV === 'development')
	window.GL = GL;

document.getElementById('files').addEventListener('change', handleFileSelect, false);