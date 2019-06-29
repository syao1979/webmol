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
import { mousePositionElement } from './mouse';
import { appendInfo, treeview } from './utils';

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

    meshlist = [];
    pick_cnt = 0; // # times the same object is clicked
    pick_level = {
        2 : "group",
        3 : "chain",
        4 : "molecule"
    }
    shiftdown  = false;

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
        this.renderer.setClearColor(MyGL2.CLEAR_COLOR);

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

            // window.addEventListener('resize', (e)=>this.resize(e), false);
        }
        document.addEventListener("keydown", (e)=>this.onDocumentKeyDown(e), false);
        document.addEventListener("keyup", (e)=>this.onDocumentKeyUp(e), false);
        window.addEventListener('resize', (e)=>this.resize(e), false);
        

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
            // this.stats.domElement.style.position = 'absolute';
            // this.stats.domElement.style.position = 'relative';
            this.stats.domElement.style.top = '40px';
            this.stats.domElement.style.left = '120px';
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

    loadMol(dstr, dtype, mname, mtype, callback){
        if (!this.model){
            this.model = new MModel();
        }
        // console.log(`loadMol : ${mname}`)

        mname = this.model.loadMol(dstr, dtype, mname);
        if (mname){
            callback(mname);
            this.reloadModel(mname, mtype);
        }
       
    }

    reloadModel(mname, model="CPK"){
        if (!this.model){
            this.model = new MModel();
        }

        if (this.meshlist.length == 0){
            // clear the old mol
            if (this.objects){
                this.clearDisplayObjects(this.objects);
                this.objects = null;
            }

            this.objects = this.model.get_gl_objects(mname, model);
            if (this.objects){
                this.objects.forEach( (o) => this.scene.add(o) );
            }
        } else {
            this.clearDisplayObjects(this.meshlist);
            let mlist = []
            this.meshlist.forEach( (m) => {
                const mesh = m.data.model(model, this.meshlist);
                if (mesh){
                    mlist.push(mesh);
                }
            })
            
            mlist.forEach( (o) => { this.scene.add(o) })
        }
        this.show_tree();
        return this;
    }

    clearDisplayObjects(objects){
        if (objects){
            objects.forEach( (o) => {
                // let obj = this.scene.getObjectByProperty("uuid", o.uuid);
                // obj.geometry.dispose();  // do not rm geometry - shared
                o.material.dispose();
                this.scene.remove(o);
            })
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

        // this.toggle_highlight();

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
            let atom = null;
            let bond = null;
            intersects.forEach( (o) => {
                const mesh = o.object;
                
                if (!atom && o.object.type == "ATOM"){
                    atom = o.object;
                }
                if (!bond && o.object.type == "BOND"){
                    bond = o.object;
                }
            })

            const hitObj = atom ? atom : bond;

            if ( hitObj ){ // since bond to atom is "under", [0] will always be the atom
                appendInfo(`selected ${hitObj.type}-${hitObj.molecule}:${hitObj.chain}:${hitObj.group}:${hitObj.name}`);
                //  the controls
                this.controls.enabled = false;

                // Calculate the offset
                let tmp = this.raycaster.intersectObject(this.plane);
                this.offset.copy(tmp[0].point).sub(this.plane.position);

                this.toggle_highlight(hitObj);
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

        } else {
            // Update position of the plane if need
            let intersects = this.raycaster.intersectObjects(this.objects);
            if (intersects.length > 0) {
              this.plane.position.copy(intersects[0].object.position);
              this.plane.lookAt(this.camera.position);
            }
        }
    }

    onDocumentMouseUp (event) {
        if ( !this.objects ){ return; }

        // Enable the controls
        this.controls.enabled = true;
    }

    onDocumentKeyDown (event){
        let keyCode = event.which;
        this.shiftdown = event.shiftKey;
        console.log(`shiftkeydown=${this.shiftdown}`)
    }

    onDocumentKeyUp (event){
        this.shiftdown = false;
        console.log(`shiftkeydown=${this.shiftdown}`)
    }

    show_tree(){
        // var data = [
        //     {
        //         name: 'node1', id: 1,
        //         children: [
        //             { name: 'child1', id: 2 },
        //             { name: 'child2', id: 3 }
        //         ]
        //     },
        //     {
        //         name: 'node2', id: 4,
        //         children: [
        //             { name: 'child3', id: 5 }
        //         ]
        //     }
        // ];
        // treeview(data);
    }
    toggle_highlight(hitObj){
        if (hitObj == undefined){
            return;
        }

        // const hasSelectedBefore = (hitObj && hitObj == this.selection) ? true : false;
        const hasSelectedBefore = (this.meshlist.indexOf(hitObj) > -1);
        if (!hasSelectedBefore){
            this.pick_cnt = 1;
            if (this.selection){
                console.log("reset selected")
                this.update_selected(true);
                this.selection = null;
                this.meshlist = [];
            }  
            this.selection = hitObj;
            this.meshlist.push(hitObj);
            this.update_selected();
            
        } else {

            this.pick_cnt++;
            // console.log(`call collect_mesh for level ${this.pick_level[this.pick_cnt]}`)
            const alist = this.collect_mesh(hitObj);
            console.log(`old len=${this.meshlist.length}; new len=${alist.length}`)
            if (alist.length > this.meshlist.length){
                this.meshlist = alist;
                this.update_selected();
            } else if (alist.length == this.meshlist.length){   // has to be !
                this.update_selected(true);  // reset
            } else {
                // error !
            }     
        }
    }

    collect_mesh(mesh){
        const level = this.pick_level[this.pick_cnt];
        let alist = []

        // DEBUG: 
        this.mesh = mesh;
        console.log(`${level}; mesh.level=${mesh.data[level]}`)

        if (level){
            const lname = mesh[level];
            this.scene.children.forEach( (o) => {               
                if (o.type == "ATOM" || o.type == "BOND"){
                    if ( o.data.in(level, lname) ){
                        alist.push(o)
                    }
                }
            })
        }
        return alist;
    }

    update_selected(restore=false){
        if (restore){
            this.meshlist.forEach( (m) => {
                m.material.transparent = false;
                m.material.opacity = 1.0;
                m.material.color = m.ori_color.clone();
            })
            this.selection = null;
            this.meshlist = [];
        } else {
            this.meshlist.forEach( (m) => {
                m.material.transparent = true;
                m.material.opacity = 0.85;
                if ( m.ori_color == undefined){
                    m.ori_color = m.material.color.clone();
                }
                m.material.color.setHex(0xffff00);
            })
        }
    }

    moveMol(pos){
        if (this.objects){
            this.objects.forEach( (o) => {
                // o.position.copy(pos);
            })
        } 
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

    setSize(width, height){
        if (this.view){
            [this.view.style.clientWidth, this.view.style.clientHeight] = [width, height];
        }
        this.resize();
    }
    random_color() {
        return '#' + (function co(lor){   return (lor +=
          [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
          && (lor.length == 6) ?  lor : co(lor); })('');
    }
}

MyGL2.CLEAR_COLOR = 0x333333;   // glview backgroud color

export default MyGL2;