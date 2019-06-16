

function create_atom(cfg){

	// Set up the mesh vars
  	const QUALITY = 24;
	const SEGMENTS = QUALITY;
	const RINGS = QUALITY;


	// this.config = cfg;
	// const meshMaterial = new THREE.MeshLambertMaterial( { color: cfg.color, wireframe: false });
	const material = new THREE.MeshPhongMaterial( { color: cfg.color, wireframe: false });
	material.transparent = true;

	var objGeometry = new THREE.SphereGeometry(cfg.r, SEGMENTS, RINGS);	// can be singular and use clone

  	const mesh = new THREE.Mesh(objGeometry.clone(), // new THREE.SphereGeometry(cfg.r,SEGMENTS,RINGS),
						  			material);
  	mesh.position.set(...cfg.position);
  	// console.log(` create : ${mesh.position.x}; ${mesh.position.y}; ${mesh.position.z}`)

	return mesh;
}

//cfg size, length
// function create_bond(cfg){
// 	const rsegment = 32; 
// 	const geometry = new THREE.CylinderGeometry( cfg.size, cfg.size, cfg.length, rsegment );
// 	const material = new THREE.MeshBasicMaterial( {color: cfg.color, wireframe: true} );
// 	const mesh = new THREE.Mesh( geometry, material );
// 	// mesh.position.z = -100;
// 	// mesh.position.x = 40;
// 	return mesh;
// }

function create_bond(pointX, pointY, material) {
    var direction = new THREE.Vector3().subVectors(pointY, pointX);
    var orientation = new THREE.Matrix4();
    orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4(1, 0, 0, 0,
                                           0, 0, 1, 0,
                                           0, -1, 0, 0,
                                           0, 0, 0, 1));
    var edgeGeometry = new THREE.CylinderGeometry(2, 2, direction.length(), 8, 1);
    var edge = new THREE.Mesh(edgeGeometry, material);
    edge.applyMatrix(orientation);
    // position based on midpoints - there may be a better solution than this
    edge.position.x = (pointY.x + pointX.x) / 2;
    edge.position.y = (pointY.y + pointX.y) / 2;
    edge.position.z = (pointY.z + pointX.z) / 2;
    return edge;
}