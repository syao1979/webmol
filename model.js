import { Atom, Bond } from './js/molbase';

const parsePdb = require('parse-pdb');
const { readFileSync } = require('fs');

class MModel{
	constructor(){
		this.mol = { };		// molecule data structure
		this.status = false;				// 
	}

	loadMol(datastr, datatype="pdb", mname="Mol"){
		let acnt = 0;
		if (datatype.toLowerCase() == "pdb"){
			const mjson = parsePdb(datastr);
	        console.log(mjson)
	        if (mjson.atoms.length > 0){
	            while (mname in this.mol){
					mname += "_"
				}

				mjson.atoms.forEach( (a) => {
					a.molecule = mname
					let atom = new Atom(a)
					if (atom.OK){
						this._addobj(atom);
						acnt++;
					}
				})
	        }
		}
		
		return acnt > 0 ? mname : null;
	}


	_addobj(atom){
		if ( !(atom.molecule in this.mol) ){
			this.mol[atom.molecule] = {};
		}

		if ( !(atom.chainID in this.mol[atom.molecule]) ){
			this.mol[atom.molecule][atom.chainID] = {};
		}
		
		if ( !(atom.resName in this.mol[atom.molecule][atom.chainID]) ){
			this.mol[atom.molecule][atom.chainID][atom.resName] = [];
		}

		this.mol[atom.molecule][atom.chainID][atom.resName].push(atom)
	}

	get_gl_objects(mname, model="cpk"){
		if ( !(mname in this.mol)) {
			return null;
		}

		let atomlist = this.atomlist(mname);
		if (!atomlist || atomlist.length == 0){
			return null;
		}

		// console.dir(atomlist)

		let alist = [];
		model = model.toLowerCase()
		// console.log(`get_gl_objects : ${model}`)
		if ( model == "cpk" || model.indexOf("stick") > -1 ) {
			let [qual, size] = [36, 1.0];
			if ( model == "ballstick" || model == "ballstick2" ){
				[qual, size] = [24, 0.15];
			} else if ( model == "stick" ){
				[qual, size] = [24, -1];
			}

			atomlist.forEach( (o) => {
				alist.push(o.ball(qual, size))
			})
		}

		if ( model.indexOf("wire") > -1 ){
			for (let i=1; i<atomlist.length; i++){
				for(let n = 0; n<i; n++){
					let afrom = atomlist[i];
					let ato = atomlist[n];
					if (Bond.bondto(afrom, ato)){
						let bond = new Bond({from : afrom, to : ato})
						if (model == "wire"){
							alist.push(bond.color_divide_line());
						} else {
							alist.push(bond.color_gradient_line());
						}
					}
				}
			}
		} else if ( model.indexOf("stick") > -1 ){
			let cone = (model == "ballstick2") ? true: false;
			for (let i=1; i<atomlist.length; i++){
				for(let n = 0; n<i; n++){
					let afrom = atomlist[i];
					let ato = atomlist[n];
					if (Bond.bondto(afrom, ato)){
						let bond = new Bond({from : afrom, to : ato})
						bond.cylinder(cone).forEach( (mesh) => { alist.push(mesh) });
					}
				}
			}
		}


			// let geometry, meterial;

			// geometry = new THREE.SphereGeometry(0.5, 10, 10);
			// 	// let geometry = new THREE.BoxGeometry(1, 1, 1);
			// meterial = new THREE.MeshLambertMaterial(
			// 	{
			// 		color: 0xFF00ff,
			// 	});
			// meterial.opacity = 0.5;
			// var m = new THREE.Mesh(geometry, meterial);
			// // alist.push(m)

			// geometry = new THREE.SphereGeometry(1, 10, 10);
			// // let geometry = new THREE.BoxGeometry(1, 1, 1);
			// meterial = new THREE.MeshLambertMaterial(
			// 	{
			// 		color: 0xFFCC00,
			// 		transparent : true,
			// 		opacity: 0.8
			// 	});

			// var meshobj = new THREE.Mesh(geometry, meterial);
			// alist.push(meshobj)

		return alist;
	}

	//for a given molecule name, retur a list of all atoms
	atomlist(mname, centerize=true){
		if ( !(mname in this.mol)) {
			return null;
		}

		let xmax = -100000;
		let ymax = -100000;
		let zmax = -100000;
		let xmin = 100000;
		let ymin = 100000;
		let zmin = 100000;

		let atomlist = [];
		Object.keys(this.mol[mname]).forEach ( (chain) => {
				Object.keys(this.mol[mname][chain]).forEach( (group) =>{
					this.mol[mname][chain][group].forEach( (atom) => {
						if(centerize){
							xmax = Math.max(xmax, atom.x);
							ymax = Math.max(ymax, atom.y);
							zmax = Math.max(zmax, atom.z);
							xmin = Math.min(xmin, atom.x);
							ymin = Math.min(ymin, atom.y);
							zmin = Math.min(zmin, atom.z);
						}

						atomlist.push(atom);
					})
				})
			})

		// molecule center xyz
		if (centerize){
			let xm = (xmax + xmin) * 0.5;
			let ym = (ymax + ymin) * 0.5;
			let zm = (zmax + zmin) * 0.5;

			// move molecule center to origin
			atomlist.forEach( (atom) => {
				atom.set(atom.x-xm, atom.y-ym, atom.z-zm)
			})
		}

		return atomlist;
	}

	center(){
		let xmax = -100000;
		let ymax = -100000;
		let zmax = -100000;
		let xmin = 100000;
		let ymin = 100000;
		let zmin = 100000;
		this.mol.chain.forEach( (o) => {
			let x = o.position.x;
			let y = o.position.y;
			let z = o.position.z;
			// console.log(` ${o.name} (${x}, ${y}, ${z})`)
			xmax = Math.max(xmax, x);
			ymax = Math.max(ymax, y);
			zmax = Math.max(zmax, z);
			xmin = Math.min(xmin, x);
			ymin = Math.min(ymin, y);
			zmin = Math.min(zmin, z);
		})
		// console.log(`limits : x(${xmax}, ${xmin}); y(${ymax}, ${ymin}); z(${zmax}, ${zmin})`)

		return [ (xmax + xmin) * 0.5, (ymax + ymin) * 0.5, (zmax + zmin) * 0.5 ];
	}

	get(name){
		let obj = null;
		for(let i=0; i<this.mol.chain.length; i++){
			if (this.mol.chain[i].name === name){
				obj = this.mol.chain[i];
				break;
			}
		}
		return obj;
	}
}

export default MModel;
