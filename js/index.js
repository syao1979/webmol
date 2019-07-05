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
import MyGL2 from './mygl2';
import BorderLayout from './border/border';
import "./tree/jquery.ztree.core.js"

var GL = null;
// when DOM is ready ...
$( function() {
	new BorderLayout(document.querySelectorAll('.border-layout')[0], glviewsize);
	GL = new MyGL2("glview");
	if (process.env.NODE_ENV === 'development'){
		window.GL = GL;
	}
} );


function change_display_model(){
	let model = $("#model_select").val();
	if (GL.model){
		GL.reloadModel($("#molecule").val(), model);
	}
}

function load_demo_molecule(){
	console.log('demo')
	GL.loadMol($("#demo1_data").html().trim(), "pdb", "guanosine", $("#model_select").val(), loadedMoleculeName);
}

//Retrieve the first (and only!) File from the FileList object
function handleFileSelect(evt) {
    var f = evt.target.files[0]; 

    if (f) {
      	let r = new FileReader();
      	r.onload = (e) => { 
	      	let contents = e.target.result;
	      	let toks = f.name.split('.')
	      	let ftype = toks[toks.length-1].toLowerCase();
	      	if (["xyz", "pdb"].indexOf(ftype) > -1 ) {
	      		let mname = f.name.substr(0, f.name.length - 4);
	      		GL.loadMol(contents, ftype, mname, $("#model_select").val(), loadedMoleculeName)
	      	} else {
	      		alert(`Unsupported module file type : ${f.name}`)
	      	}
      	}
      	/*
      		f.name -> file name string
      		f.size 
      	*/
      	console.log(f)
      	r.readAsText(f);
    } else { 
      	alert("Failed to load file");
    } 
}

function loadedMoleculeName(mname){
	if (mname){
		// remove empty options
		$("#molecule option").filter(function() {
			    return !this.value || $.trim(this.value).length == 0 || $.trim(this.text).length == 0;
			}).remove();

		let opt = document.createElement("option");
		opt.innerHTML = mname;
		document.getElementById("molecule").insertBefore(opt, document.getElementById("molecule").firstChild);
		$("#molecule").show();
		$("#molecule")[0].selectedIndex = 0; 	// make the 1st option is current
	}
}

function glviewsize(e){
	console.log(e)
	GL.setSize(e.centerW, e.centerH);
	GL.setStatsPosition(e.north, e.west);
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);
document.getElementById('model_select').addEventListener('change', change_display_model);
document.getElementById("demo1").addEventListener('click', load_demo_molecule);
document.getElementById('molecule').addEventListener('change', change_display_model);

