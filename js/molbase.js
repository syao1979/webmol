import THREE from 'three';

class Atom extends THREE.Vector3 {
	element = "C";		// Atom type, H, C, O etc
	name = "C";		// name, C2 etc
	OK = false	

	constructor(data){
		super();

		this.molecule = data.molecule;
		this.name = data.name;	// atom nme
		this.group = data.resName;	// residue name
		this.chain = data.chainID;			// chain name
		this.element = data.element;
		super.set(data.x, data.y, data.z)
		
		this.OK = (data.molecule && data.name && data.resName && data.chainID && data.element);
	}

	ball(quality="NORMAL", scale=1.0){
		// Set up the mesh lets
		// console.log(`ball ${quality}`)
		let size = Atom.VDWR[Atom.ATOM_NUMBER[this.element]];
		let color = Atom.COLOR[Atom.ATOM_NUMBER[this.element]];

		const material = new THREE.MeshLambertMaterial( 
				{ 
					color: color, 
					opacity : 1.0,
					transparent : true
				}
			);
		material.transparent = true;

		size = scale > 0 ? size * scale : 0.0602;
		// console.dir(Atom.MODEL)
	  	const mesh = new THREE.Mesh(Atom.MODEL[quality], material);
	  	mesh.scale.x = size;
	  	mesh.scale.y = size;
	  	mesh.scale.z = size;
	  	mesh.position.set(...this.toArray());

	  	return this.wrapupGLMesh(mesh);
	}

	wrapupGLMesh (obj) {
		[obj.name, obj.molecule, obj.chain, obj.group] = [this.name, this.molecule, this.chain, this.group];
		obj.molname = this.molecule;
		obj.name = this.name;
		obj.type = "ATOM";
		return obj;
	}

	toString(){
		return `type=${this.element}; name=${this.name}; pos=${this.toArray()}`;
	}

	atomicNum(){
		return Atom.ATOM_NUMBER[this.element];
	}
}

Atom.MODEL = {
	SUPER_HIGH : new THREE.SphereGeometry(1, 64, 64),
	HIGH : new THREE.SphereGeometry(1, 32, 32),
	NORMAL : new THREE.SphereGeometry(1, 24, 24),
	LOW : new THREE.SphereGeometry(1, 16, 16),
	SUPER_LOW : new THREE.SphereGeometry(1, 8, 8),
}

Atom.ATOM_CPK = {
	H : { color: 0xffff, size : 1 },
	C : { color: 0x999999, size : 1.5 },
	O : { color: 0xff0000, size : 1.35},
	N : { color: 0x0000, size : 1.25 },
	P : { color: 0xffff00, size : 1.7 },
	S : { color: 0xffff00, size : 1.7}
}

Atom.ATOM_NUMBER = {
	H : 1,
	C : 6,
	N : 7,
	O : 8,
	F : 9,
	NA : 11,
	P : 15,
	S : 16,
	CL : 17,
}

Atom.VDWR = [
	0.8, //dummy
    // H  He     Li    Be     B     C     N     O     F     Ne			10
    1.1,  2.2,   1.22, 0.63,  1.75, 1.55, 1.4,  1.35, 1.3,  2.02,
    //Na  Mg     Al    Si     P     S     Cl    Ar    K     Ca			20
    2.2,  1.5,   1.5,  2.0,   1.88, 1.81, 1.75, 2.77, 2.39, 1.95,
    //Sc  Ti     V     Cr     Mg    Fe    Co    Ni    Cu    Zn			30
    1.32, 1.95,  1.06, 1.13,  1.19, 1.26, 1.13, 1.24, 1.15, 1.15,
    //Ga  Ge     As    Se     Br    Ke    Rb    Sr    Y     Zr			40
    1.55, 1.48,  0.83, 0.9,   1.95, 1.9,  2.65, 2.02, 1.61, 1.42,
    //Nb  Mo     Tc    Ru     Rh    Pb    Ag    Cd    In    Sn			50
    1.33, 1.75,  1.8,  1.2,   1.22, 1.44, 1.55, 1.75, 1.46, 1.67,
    //Sb  Te     I     Xe     Cs    Ba    La    Ce    Pr    Nd			60
    1.12, 1.26,  2.15, 2.1,   3.01, 2.41, 1.83, 1.86, 1.62, 1.79,
    //Pm  Sm     Eu    Gd     Tb    Dy    Ho    Er    Tm    Yb			70
    1.76, 1.74,  1.96, 1.69,  1.66, 1.63, 1.61, 1.59, 1.57, 1.54,
    //Lu  Hf     Ta    W      Re    Os    Ir    Pt    Au    Hg			80
    1.53, 1.4,   1.22, 1.26,  1.3,  1.58, 1.22, 1.55, 1.45, 1.98,
    //Tl  Pb     Bi    Po     At    Rn    Fr    Ra    Ac    Th    
    1.71, 2.16,  1.73, 1.21,  1.12, 2.3,  3.24, 2.75, 2.12, 1.84,
    //Pa  U      Np    Pu     Am    Cm    Bk    Cf    Es    Fm
    1.6,  1.75,  1.71, 1.67,  1.66, 1.65, 1.64, 1.63, 1.62, 1.61,
    //Md  No     Lr
    1.6,  1.59,  1.58
]

Atom.COLOR = [
	0x00ffff,	//0 dummy
	0xffffff,	//1 H
	0x88ffff,	//2 He
	0x8844ff, 	//3 Li
	0x99ff00,	//4 Be
	0xff9999, 	//5 B
	0x888888, 	//6 C
	0x7777ff,	//7 N
	0xee0000,	//8 O
	0x88ffff,	//9 F
	0x668899, 	//10 Ne
	0x663695, 	//11 Na
	0x530000,	//12 Mg
	0x826565, 	//13 Al
	0x506060,	//14 Si
	0xff8000,	//15 P
	0xff8020,	//16 S
	0x158070, 	//17 Cl
	0x80b0c0,	//18 Ar
	0x80b0c0,   //19 K
	0x80b0c0,   //20 Ca
	0x80b0c0,   //21 Sc
	0x80b0c0,   //22 Ti
	0x80b0c0,   //23 V
	0x80b0c0,   //24 Cr
	0x80b0c0,   //25 Mn
	0x80b0c0,   //26 Fe
	0x80b0c0,   //27 Co
	0x80b0c0,   //28 Ni
	0x80b0c0,   //29 Cu
	0x80b0c0,   //30 Zn
	0x80b0c0,   //31 Ga
	0x80b0c0,   //32 Ge
	0x80b0c0,   //33 As
	0x80b0c0,   //34 Se
	0x80b0c0,   //35 Br
	0x80b0c0,   //36 Kr
	0x80b0c0,   //37 Rb
	0x80b0c0,   //38 Sr
	0x80b0c0,   //39 Y
	0x80b0c0,   //40 Zr
	0x80b0c0,   //41 X
	0x80b0c0,   //42 X
	0x80b0c0,   //43 X
	0x80b0c0,   //44 X
	0x80b0c0,   //45 X
	0x80b0c0,   //46 X
	0x80b0c0,   //47 X
	0x80b0c0,   //48 X
	0x80b0c0,   //49 X
	0x80b0c0,   //50 X
	0x80b0c0,   //51 X
	0x80b0c0,   //52 X
	0x80b0c0,   //53 X
	0x80b0c0,   //54 X
	0x80b0c0,   //55 X
	0x80b0c0,   //56 X
	0x80b0c0,   //57 X
	0x80b0c0,   //58 X
	0x80b0c0,   //59 X
	0x80b0c0,   //60 X
	0x80b0c0,   //61 X
	0x80b0c0,   //62 X
	0x80b0c0,   //63 X
	0x80b0c0,   //64 X
	0x80b0c0,   //65 X
	0x80b0c0,   //66 X
	0x80b0c0,   //67 X
	0x80b0c0,   //68 X
	0x80b0c0,   //69 X
	0x80b0c0,   //70 X
	0x80b0c0,   //71 X
	0x80b0c0,   //72 X
	0x80b0c0,   //73 X
	0x80b0c0,   //74 X
	0x80b0c0,   //75 X
	0x80b0c0,   //76 X
	0x80b0c0,   //77 X
	0x80b0c0,   //78 X
	0x80b0c0,   //79 X
	0x80b0c0,   //80 X
]

//====================================

class Bond{
	pair = [];
	constructor( cfg ){
		if (cfg){
			if (cfg.from){
				this.pair.push(cfg.from);
			}

			if(cfg.to){
				this.pair.push(cfg.to);
			}
		}
	}

	color_gradient_line () {		

		// geometry
		let geometry = new THREE.BufferGeometry();

	  	// material
	  	let lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

		// attributes : 2-ended line
		let positions = new Float32Array( 2 * 3 ); // 3 vertices per point
		let colors = new Float32Array( 2 * 3 );
		let color = new THREE.Color();

		// the 2 ends
		for (let i=0; i<2; i++) {
			color.set ( Atom.COLOR[Atom.ATOM_NUMBER[this.pair[i].element]] );
			[ positions[ i * 3 ], positions[ i * 3 + 1 ], positions[ i * 3 + 2] ] = this.pair[i].toArray();
			[ colors[ i * 3 ], colors[ i * 3 + 1 ], colors[ i * 3 + 2 ] ] = color.toArray();
		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

		// line
		let line = new THREE.Line( geometry, lineMaterial );
		line.group = this.pair[0].group;
		return this.wrapupGLMesh(line);
	}

	center_position(){
		let pt1 = this.pair[0].toArray();
		let pt2 = this.pair[1].toArray();
		return [ (pt1[0] + pt2[0]) * 0.5, (pt1[1] + pt2[1]) * 0.5, (pt1[2] + pt2[2]) * 0.5 ]
	}

	color_divide_line () {		

		// geometry
		let geometry = new THREE.BufferGeometry();

	  	// material
	  	let lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

		// attributes : 4 ended-line
		let positions = new Float32Array( 4 * 3 ); // 3 vertices per point
		let colors = new Float32Array( 4 * 3 );
		let color = new THREE.Color();

		let pt1 = this.pair[0].toArray();
		let pt2 = this.pair[1].toArray();
		let ptm = this.center_position(); 

		// the 4 ends
		let n = 0;

		color.set ( Atom.COLOR[Atom.ATOM_NUMBER[this.pair[0].element]] );
		[ positions[ n * 3 ], positions[ n * 3 + 1 ], positions[ n * 3 + 2] ] = pt1;
		[ colors[ n * 3 ], colors[ n * 3 + 1 ], colors[ n * 3 + 2 ] ] = color.toArray();
		n++;
		[ positions[ n * 3 ], positions[ n * 3 + 1 ], positions[ n * 3 + 2] ] = ptm;
		[ colors[ n * 3 ], colors[ n * 3 + 1 ], colors[ n * 3 + 2 ] ] = color.toArray();

		color.set ( Atom.COLOR[Atom.ATOM_NUMBER[this.pair[1].element]] );
		n++;
		[ positions[ n * 3 ], positions[ n * 3 + 1 ], positions[ n * 3 + 2] ] = ptm;
		[ colors[ n * 3 ], colors[ n * 3 + 1 ], colors[ n * 3 + 2 ] ] = color.toArray();
		n++;
		[ positions[ n * 3 ], positions[ n * 3 + 1 ], positions[ n * 3 + 2] ] = pt2;
		[ colors[ n * 3 ], colors[ n * 3 + 1 ], colors[ n * 3 + 2 ] ] = color.toArray();

		
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

		// line
		let line = new THREE.Line( geometry, lineMaterial );
		line.group = this.pair[0].group;
		return this.wrapupGLMesh(line);
	}

	_cylinder2(v1, v2, color, size, atom, matename, cone, length, orientation){
	    
	    let edgeGeometry = cone ? new THREE.CylinderGeometry(size*1.5, 0, length, 32, 1) :
	    								new THREE.CylinderGeometry(size, size, length, 32, 1);
	    let material = new THREE.MeshPhongMaterial({color: color});
	    let edge = new THREE.Mesh(edgeGeometry, material);
	    edge.applyMatrix(orientation);
	    // position based on midpoints - there may be a better solution than this
	    edge.position.x = 0.5 * (v1.x + v2.x );
	   	edge.position.y = 0.5 * (v1.y + v2.y );
	   	edge.position.z = 0.5 * (v1.z + v2.z );
	   	
	   	edge.type = "BOND";
	   	edge.group = atom.group;
	   	edge.name = `${atom.name}-${matename}`;

	    return edge;
	}

	cylinder2(cone=false){
		let direction = new THREE.Vector3().subVectors(this.pair[0], this.pair[1]);
	    let rotm = new THREE.Matrix4();
	    rotm.set(
	                1, 0, 0, 0,
	                0, 0, 1, 0,
	                0, -1, 0, 0,
	                0, 0, 0, 1
	              )

	    // first half from A to B
	    let orientation = new THREE.Matrix4();
	    orientation.lookAt(this.pair[0], this.pair[1], new THREE.Object3D().up);
	    orientation.multiply(rotm);

		let v1 = this.pair[0];
		let v2 = new THREE.Vector3(...this.center_position());
		let vec = new THREE.Vector3().subVectors(v1, v2)
		let color = Atom.COLOR[Atom.ATOM_NUMBER[this.pair[0].element]];
		let c1 = this._cylinder( v1, v2, color, 0.06, v1, this.pair[1].name, cone, vec.length(), orientation );

		// second half from B to A
		orientation = new THREE.Matrix4();
	    orientation.lookAt(this.pair[1], this.pair[0], new THREE.Object3D().up);
	    orientation.multiply(rotm);

		v1 = this.pair[1];
		color = Atom.COLOR[Atom.ATOM_NUMBER[this.pair[1].element]];
		vec = new THREE.Vector3().subVectors(v1, v2)
		let c2 = this._cylinder( v1, v2, color, 0.06, v1, this.pair[0].name, cone, vec.length(), orientation );

		c1.mate = c2;
		c2.mate = c1;
		c1 = this.wrapupGLMesh(c1);
		c2 = this.wrapupGLMesh(c2);
		return [c1, c2];
	}

	_cylinder(v1, v2, color, atom, matename, length, orientation, edgeGeometry){
	    
	    let material = new THREE.MeshPhongMaterial({color: color});
	    let edge = new THREE.Mesh(edgeGeometry, material);
	    edge.applyMatrix(orientation);
	    // position based on midpoints - there may be a better solution than this
	    edge.scale.y = length;
	    edge.position.x = 0.5 * (v1.x + v2.x );
	   	edge.position.y = 0.5 * (v1.y + v2.y );
	   	edge.position.z = 0.5 * (v1.z + v2.z );
	   	
	   	edge.type = "BOND";
	   	edge.group = atom.group;
	   	edge.name = `${atom.name}-${matename}`;

	    return edge;
	}

	cylinder(cone=false, quality="HIGH"){
		let direction = new THREE.Vector3().subVectors(this.pair[0], this.pair[1]);
	    let rotm = new THREE.Matrix4();
	    rotm.set(
	                1, 0, 0, 0,
	                0, 0, 1, 0,
	                0, -1, 0, 0,
	                0, 0, 0, 1
	              )

	    // reuse the cylinderGeo
	    const geotype = cone ? "CONE" : "STICK";
	    const geo = Bond.MODEL[geotype][quality]


	    // first half from A to B
	    let orientation = new THREE.Matrix4();
	    orientation.lookAt(this.pair[0], this.pair[1], new THREE.Object3D().up);
	    orientation.multiply(rotm);

		let v1 = this.pair[0];
		let v2 = new THREE.Vector3(...this.center_position());
		let vec = new THREE.Vector3().subVectors(v1, v2)
		let color = Atom.COLOR[Atom.ATOM_NUMBER[this.pair[0].element]];
		let c1 = this._cylinder( v1, v2, color, v1, this.pair[1].name, vec.length(), orientation, geo );

		// second half from B to A
		orientation = new THREE.Matrix4();
	    orientation.lookAt(this.pair[1], this.pair[0], new THREE.Object3D().up);
	    orientation.multiply(rotm);

		v1 = this.pair[1];
		color = Atom.COLOR[Atom.ATOM_NUMBER[this.pair[1].element]];
		vec = new THREE.Vector3().subVectors(v1, v2)
		let c2 = this._cylinder( v1, v2, color, v1, this.pair[0].name, vec.length(), orientation, geo );

		c1.mate = c2;
		c2.mate = c1;
		c1 = this.wrapupGLMesh(c1);
		c2 = this.wrapupGLMesh(c2);
		return [c1, c2];
	}


	getColoredBufferLine ( steps, phase, geometry ) {
		let vertices = geometry.vertices;
		let segments = geometry.vertices.length;

		// geometry
		geometry = new THREE.BufferGeometry();

	  	// material
	  	let lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

		// attributes
		let positions = new Float32Array( segments * 3 ); // 3 vertices per point
		let colors = new Float32Array( segments * 3 );
		let frequency = 1 /  ( steps * segments );
		let color = new THREE.Color();

		let x, y, z;

		for ( let i = 0, l = segments; i < l; i ++ ) {
			x = vertices[ i ].x;
			y = vertices[ i ].y;
			z = vertices[ i ].z;

		    positions[ i * 3 ] = x;
		    positions[ i * 3 + 1 ] = y;
		    positions[ i * 3 + 2 ] = z;

		    color.set ( this.makeColorGradient( i, frequency, phase ) );

		    colors[ i * 3 ] = color.r;
		    colors[ i * 3 + 1 ] = color.g;
		    colors[ i * 3 + 2 ] = color.b;
		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

		// line
		let line = new THREE.Line( geometry, lineMaterial );

		return this.wrapupGLMesh(line);

	}

	makeColorGradient ( i, frequency, phase ) {  

		  let center = 128;
		  let width = 127;
			
		  let redFrequency, grnFrequency, bluFrequency;
		 	grnFrequency = bluFrequency = redFrequency = frequency;
		  
		  let phase2 = phase + 2;
		  let phase3 = phase + 4;

		  let red   = Math.sin( redFrequency * i + phase ) * width + center;
		  let green = Math.sin( grnFrequency * i + phase2 ) * width + center;
		  let blue  = Math.sin( bluFrequency * i + phase3 ) * width + center;

		  return parseInt( '0x' + this._byte2Hex( red ) + this._byte2Hex( green ) + this._byte2Hex( blue ) );
	}

	_byte2Hex (n) {
		  let nybHexString = "0123456789ABCDEF";
		  return String( nybHexString.substr( ( n >> 4 ) & 0x0, 1 ) ) + nybHexString.substr( n & 0x0, 1 );
	}

	length(){
		return this.pair[0].distanceTo(this.pair[1]);
	}

	type(afrom, ato){
		let anums = this.pair.map( (a) => a.atomicNum() ).sort();
		let dist = this.length();
	}

	wrapupGLMesh(obj){
		[obj.molecule, obj.chain] = [this.pair[0].molecule, this.pair[1].chain];
		obj.name = `${this.pair[0].name}-${this.pair[1].name}`;
		obj.type = "BOND";
		obj.atoms = this.pair
		return obj;
	}
}

Bond.BOND_TYPE = {
	"1_6" : 1.1,
	"1_7" : 1.04,
	"1_8" : 1.0,
	"6_6" : 1.6,
	"6_7" : 1.5,
	"6_8" : 1.5,
	"7_7" : 1.5,
	"8_15" : 1.7,
}

Bond.STICK_SIZE = 0.06;

Bond.MODEL = {
	CONE : {
		SUPER_HIGH : new THREE.CylinderGeometry(Bond.STICK_SIZE * 1.5, 0, 1, 40, 1, false),
		HIGH       : new THREE.CylinderGeometry(Bond.STICK_SIZE * 1.5, 0, 1, 32, 1, false),
		NORMAL     : new THREE.CylinderGeometry(Bond.STICK_SIZE * 1.5, 0, 1, 26, 1, false),
		LOW        : new THREE.CylinderGeometry(Bond.STICK_SIZE * 1.5, 0, 1, 10, 1, false),
		SUPER_LOW  : new THREE.CylinderGeometry(Bond.STICK_SIZE * 1.5, 0, 1, 8, 1, false),
	},
	STICK : {
		SUPER_HIGH : new THREE.CylinderGeometry(Bond.STICK_SIZE, Bond.STICK_SIZE, 1, 40, 1, false),
		HIGH       : new THREE.CylinderGeometry(Bond.STICK_SIZE, Bond.STICK_SIZE, 1, 32, 1, false),
		NORMAL     : new THREE.CylinderGeometry(Bond.STICK_SIZE, Bond.STICK_SIZE, 1, 26, 1, false),
		LOW        : new THREE.CylinderGeometry(Bond.STICK_SIZE, Bond.STICK_SIZE, 1, 10, 1, false),
		SUPER_LOW  : new THREE.CylinderGeometry(Bond.STICK_SIZE, Bond.STICK_SIZE, 1, 8, 1, false),
	},
	LINE : new THREE.BufferGeometry()

}

Bond.bondto = (afrom, ato) => {
	let length = afrom.distanceTo(ato);

	let anums = [afrom, ato].map( (a) => a.atomicNum() ).sort( (a,b) => a-b);	// sort low to high
	let key = `${anums[0]}_${anums[1]}`;
	// console.log(`${key} ${length} ${Bond.BOND_TYPE[key]}`)

	return length <= Bond.BOND_TYPE[key] ? true: false
}

export {
	Bond, Atom
};
