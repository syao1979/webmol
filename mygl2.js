/**
 *
 * WebGL With Three.js - Lesson 10 - Drag and Drop Objects
 * http://www.script-tutorials.com/webgl-with-three-js-lesson-10/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Script Tutorials
 * http://www.script-tutorials.com/
 */

import THREE from 'three';
import Stats from 'stats-js';
import MModel from './model';
import { mousePositionElement } from './js/mouse';

class MyGL2{
    scene = null;
    camera = null; 
    renderer = null;
    container = null; 
    controls = null;
    clock = null;
    stats = null;
    plane = null; 
    selection = null;
    offset = new THREE.Vector3();
    objects = null;
    raycaster = new THREE.Raycaster();

    model = null;
    objects = null; 
    atomHighlight = null;

    constructor(viewid) {

        // Create main scene
        this.view = document.getElementById(viewid);
        this.initSize();
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);

        
        // Prepare perspective camera
        var VIEW_ANGLE = 75, ASPECT = this.width / this.height, NEAR = 0.1, FAR = 10000;
        this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);

        this.camera.position.set(10, 0, 0); // update on object range?

        this.camera.lookAt(new THREE.Vector3(0,0,0));

        // Prepare webgl renderer
        // console.log(`w=${this.width}; h=${this.height}`)
        this.renderer = new THREE.WebGLRenderer({ antialias:true });
        this.renderer.setSize(this.width, this.height);
        // this.renderer.setClearColor(this.scene.fog.color);
        this.renderer.setClearColor(0x333333);

        // Prepare container
        if (this.view){
            this.view.appendChild(this.renderer.domElement);
        } else {
            this.container = document.createElement('div');
            document.body.appendChild(this.container);
            this.container.appendChild(this.renderer.domElement);
        }
        

        // Events
        // THREEx.WindowResize(this.renderer, this.camera);
        if (this.view){
            this.view.addEventListener('mousedown', (e)=>this.onDocumentMouseDown(e), false);
            this.view.addEventListener('mousemove', (e)=>this.onDocumentMouseMove(e), false);
            this.view.addEventListener('mouseup', (e)=>this.onDocumentMouseUp(e), false);
            this.view.addEventListener('resize', (e)=>this.resize(e), false);
        } else {
            document.addEventListener('mousedown', (e)=>this.onDocumentMouseDown(e), false);
            document.addEventListener('mousemove', (e)=>this.onDocumentMouseMove(e), false);
            document.addEventListener('mouseup', (e)=>this.onDocumentMouseUp(e), false);
            window.addEventListener('resize', (e)=>this.resize(e), false);
        }

        // Prepare Orbit controls
        if (this.view){
            this.controls = new THREE.OrbitControls(this.camera, this.view); // control listen on dom
        } else {
            this.controls = new THREE.OrbitControls(this.camera); // control listen on document
        }
        
        

        this.controls.target = new THREE.Vector3(0, 0, 0);
        this.controls.maxDistance = 150;

        

        // Prepare stats
        this.showstats = true;
        if (this.showstats){

            // Prepare clock
            this.clock = new THREE.Clock();

            this.stats = new Stats();
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.zIndex = 1;
            if (this.view){
                this.view.appendChild( this.stats.domElement );
            } else {
                this.container.appendChild( this.stats.domElement );
            }
        }
        // Display skybox
        // this.addSkybox();
  
        
        // Add lights
        this.scene.add( new THREE.AmbientLight(0x444444));

        var dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(200, 200, 1000).normalize();
        this.camera.add(dirLight);
        this.camera.add(dirLight.target);



        // Plane, that helps to determinate an intersection position
        this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff}));
        this.plane.visible = false;
        this.scene.add(this.plane);

        this.model = new MModel();  // init an empty model obj

        // this way object will not be distorted
        let render = () => {
            // redraw when screen is refreshed (55hz), to maintain object propotion
            requestAnimationFrame(render);
            this.renderer.render(this.scene, this.camera);
            this.update();
        }
        render();
    }

    loadMol(dstr, dtype, mname, mtype){
        if (!this.model){
            this.model = new MModel();
        }
        // console.log(`loadMol : ${mname}`)

        const ok = this.model.loadMol(dstr, dtype, mname);
        if (ok){
            this.reloadModel(mname, mtype);
        }
       
    }

    reloadModel(mname, model="CPK"){
        if (!this.model){
            this.model = new MModel();
        }

        // clear the old mol
        if (this.objects){
            this.clearMol();
        }

        this.objects = this.model.get_gl_objects(mname, model);
        if (this.objects){
            this.objects.forEach( (o) => this.scene.add(o) );
        }
        return this;
    }

    clearMol(){
        if (this.objects){
            this.objects.forEach( (o) => {
                let obj = this.scene.getObjectByProperty("uuid", o.uuid);
                obj.geometry.dispose();
                obj.material.dispose();
                this.scene.remove(obj);
            })
            this.objects = null;
        }
        return this;
    }
    

    initSize(){
        if (this.view){
            this.width =  this.view.clientWidth;
            this.height =  this.view.clientHeight;
        } else {
            this.width =  window.innerWidth;
            this.height =  window.innerHeight;
        }
        // console.log(`init size : w=${this.width}; h=${this.height}`)
    }

    addSkybox() {
        let iSBrsize = 500;
        let uniforms = {
          topColor: {type: "c", value: new THREE.Color(0x0077ff)}, bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
          offset: {type: "f", value: iSBrsize}, exponent: {type: "f", value: 1.5}
        }

        let skyGeo = new THREE.SphereGeometry(iSBrsize, 32, 32);
        let skyMat = new THREE.ShaderMaterial({vertexShader: sbVertexShader, fragmentShader: sbFragmentShader, uniforms: uniforms, side: THREE.DoubleSide, fog: false});
        let skyMesh = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(skyMesh);
    }

    mouse_relative_position(event) {      
        let {x, y} = mousePositionElement(event);
        return [x, y]

    }
  
    onDocumentMouseDown (event) {
        // Get mouse position
        // console.log('onDocumentMouseDown')
        event.preventDefault();

        this.toggle_highlight(false);

        let [ex, ey] = this.mouse_relative_position(event);
        let mouseX = (ex / this.width) * 2 - 1;
        let mouseY = -(ey / this.height) * 2 + 1;
        // console.log(`clientX=${event.clientX}->pageX=${event.pageX}->${ex}; clientY=${event.clientY}->pageY=${event.pageY}->${ey}`)
        // console.log(`offsetL=${this.view.offsetLeft}; offsetTop=${this.view.offsetTop}`)
        // console.log('')
        

        if ( !this.objects ){ return; }

        // Get 3D vector from 3D mouse position using 'unproject' function
        let vector = new THREE.Vector3(mouseX, mouseY, 1);
        vector.unproject(this.camera);

        // Set the raycaster position
        this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );

        // Find all intersected objects
        let intersects = this.raycaster.intersectObjects(this.objects);

        if (intersects.length > 0 ) {
            // console.log(`    selection count = ${intersects.length}`)
            // console.dir(intersects)

            // debug - change to random color for all hits
            let color = this.random_color();
            intersects.forEach( (o) => {
                const mesh = o.object;
                console.log(`selected ${mesh.type}-${mesh.molecule}:${mesh.chain}:${mesh.group}:${mesh.name}`);
                // o.object.material.color.set(color);
                // if (o.object.type == "BOND"){
                //     o.object.mate.material.color.set(color);
                // }
            })

            if ( intersects[0].object.type == "ATOM" ){ // since bond to atom is "under", [0] will always be the atom

                //  the controls
                this.controls.enabled = false;


                // Set the selection - first intersected object
                // if (this.atomHighlight){
                //     this.scene.remote(this.atomHighlight);
                //     this.atomHighlight.geometry.dispose();
                //     this.atomHighlight.material.dispose();
                //     this.atomHighlight = null;
                // }
                this.selection = intersects[0].object;
                this.toggle_highlight();

                // this.atomHighlight = this.selection.clone();
                // this.atomHighlight.wireframe = true;
                // this.atomHighlight.opacity = 0.5;
                // let sf = 1.25;  // scale factor
                // this.atomHighlight.scale.x *= sf;
                // this.atomHighlight.scale.y *= sf;
                // this.atomHighlight.scale.z *= sf;
                // this.atomHighlight.material.color.set(0x800080)  // purple
                // this.scene.add(this.atomHighlight)


                // this.selection.material.color.set(this.random_color());
                // console.dir(this.selection)

                // Calculate the offset
                let tmp = this.raycaster.intersectObject(this.plane);
                this.offset.copy(tmp[0].point).sub(this.plane.position);
            }
        }
    }

    toggle_highlight(flag=true){
        if (this.selection){
            if(flag){
                this.selection.material.transparent = true;
                this.selection.material.opacity = 0.85;
                // this.selection.material.wireframe = true;
            } else {
                this.selection.material.transparent = false;
                this.selection.material.opacity = 1.0;
                // this.selection.material.wireframe = false;
                this.selection = null;
            }
              
        }
    }


    onDocumentMouseMove (event) {
        if ( !this.objects ){ return; }

        event.preventDefault();

        // Get mouse position
        let [ex, ey] = this.mouse_relative_position(event);
        let mouseX = (ex / this.width) * 2 - 1;
        let mouseY = -(ey / this.height) * 2 + 1;

        // Get 3D vector from 3D mouse position using 'unproject' function
        let vector = new THREE.Vector3(mouseX, mouseY, 1);
        vector.unproject(this.camera);

        // Set the raycaster position
        this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );

        if (this.selection) {
            // Check the position where the plane is intersected
            let intersects = this.raycaster.intersectObject(this.plane);

            // Reposition the object based on the intersection point with the plane
            // this.selection.position.copy(intersects[0].point.sub(this.offset));
            
            // let newpos = intersects[0].point.sub(this.offset);
            // this.moveMol(newpos)

        } else {
            // Update position of the plane if need
            let intersects = this.raycaster.intersectObjects(this.objects);
            if (intersects.length > 0) {
              this.plane.position.copy(intersects[0].object.position);
              this.plane.lookAt(this.camera.position);
            }
        }
    }

    moveMol(pos){
        if (this.objects){
            this.objects.forEach( (o) => {
                // o.position.copy(pos);
            })
        } 
    }

    onDocumentMouseUp (event) {
        if ( !this.objects ){ return; }

        // Enable the controls
        this.controls.enabled = true;
        // if (this.selection){
        //   this.selection.material.transparent = false;
        //   this.selection = null;
        // }
    }

    // Update controls and stats
    update() {
        if ( !this.objects ){ return; }

        if (this.showstats){
            let delta = this.clock.getDelta();

            this.controls.update(delta);
            this.stats.update();
        }
    }

    resize(e) {
        console.log('resize()')
        this.initSize();
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    random_color() {
        return '#' + (function co(lor){   return (lor +=
          [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
          && (lor.length == 6) ?  lor : co(lor); })('');
    }
}

export default MyGL2;