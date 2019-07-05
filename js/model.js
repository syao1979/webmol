import { Atom, Bond } from './molbase';

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
			console.log(`model.loadMol: parsePdb done:`)
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
		// console.log(atom)
		if ( !(atom.molecule in this.mol) ){
			this.mol[atom.molecule] = {};
		}

		if ( !(atom.chain in this.mol[atom.molecule]) ){
			this.mol[atom.molecule][atom.chain] = {};
		}
		
		if ( !(atom.group in this.mol[atom.molecule][atom.chain]) ){
			this.mol[atom.molecule][atom.chain][atom.group] = [];
		}

		this.mol[atom.molecule][atom.chain][atom.group].push(atom)
	}

	get_gl_objects(mname, model="CPK"){
		if ( !(mname in this.mol)) {
			return null;
		}

		let atomlist = this.atomlist(mname);
		if (!atomlist || atomlist.length == 0){
			return null;
		}

		// console.dir(atomlist)

		let alist = [];

		if (model.indexOf("Wire") == -1){
			atomlist.forEach( (o) => {
				const mesh = o.model(model, atomlist);
				if (mesh){
					mesh.model = model;
					alist.push(mesh)
				}	
			})
		}
			
		if (model != "CPK"){
			for (let i=1; i<atomlist.length; i++){
				for(let n = 0; n<i; n++){
					let afrom = atomlist[i];
					let ato = atomlist[n];
					if (Bond.bondto(afrom, ato)){
						let bond = new Bond({from : afrom, to : ato})
						let mesh = bond.model(model, atomlist)
						if (mesh){
							mesh.forEach( (m) => { 
								m.model = model;
								alist.push(m); 
							})
						}
					}
				}
			}
		}

		return alist;
	}

	get_tree_data(){
		let data = { 
			name : "model",
			children : [],
		};
		if ( Object.entries(this.mol).length > 0 ){
			// console.log(this.mol)
			for (let mol in this.mol){
				let mobj = { name : mol, children : []};
				data.children.push(mobj);
				for (let chain in this.mol[mol]) {
					// console.log('chain ...')
					// console.log(chain)
					let cobj = { name : chain, children : []};
					mobj.children.push(cobj);
					for (let group in this.mol[mol][chain]){
						let gobj = { name : group, children : []};
						cobj.children.push(gobj);
						this.mol[mol][chain][group].forEach ( (atm) => {
							gobj.children.push({ name : atm.name });
						})
					}
				}
			}
		}

		return data;
	}

	get_tree_data2(){
		let data = [];

        const zNodes =[
            { id:1, pId:0, name:"pNode 1", open:true},
            { id:11, pId:1, name:"pNode 11"},
            { id:111, pId:11, name:"leaf node 111"},
            { id:112, pId:11, name:"leaf node 112"},
            { id:113, pId:11, name:"leaf node 113"},
            { id:114, pId:11, name:"leaf node 114"},
            { id:12, pId:1, name:"pNode 12"},
            { id:121, pId:12, name:"leaf node 121"},
            { id:122, pId:12, name:"leaf node 122"},
            { id:123, pId:12, name:"leaf node 123"},
            { id:124, pId:12, name:"leaf node 124"},
            { id:13, pId:1, name:"pNode 13 - no child", isParent:true},
            { id:2, pId:0, name:"pNode 2"},
            { id:21, pId:2, name:"pNode 21", open:true},
            { id:211, pId:21, name:"leaf node 211"},
            { id:212, pId:21, name:"leaf node 212"},
            { id:213, pId:21, name:"leaf node 213"},
            { id:214, pId:21, name:"leaf node 214"},
            { id:22, pId:2, name:"pNode 22"},
            { id:221, pId:22, name:"leaf node 221"},
            { id:222, pId:22, name:"leaf node 222"},
            { id:223, pId:22, name:"leaf node 223"},
            { id:224, pId:22, name:"leaf node 224"},
            { id:23, pId:2, name:"pNode 23"},
            { id:231, pId:23, name:"leaf node 231"},
            { id:232, pId:23, name:"leaf node 232"},
            { id:233, pId:23, name:"leaf node 233"},
            { id:234, pId:23, name:"leaf node 234"},
            { id:3, pId:0, name:"pNode 3 - no child", isParent:true}
        ];

        Object.keys(this.mol).forEach ( (mname) => {
        	const mid = mname;
        	data.push({id: mid, pId: 0, name: mname, open: true});
			Object.keys(this.mol[mname]).forEach ( (chain) => {
				const cid = `${mid}-${chain}`;
				data.push({id: cid, pId: mid, name: chain, open: true});
					Object.keys(this.mol[mname][chain]).forEach( (group) =>{
						const gid = `${cid}-${group}`;
						data.push({id: gid, pId: cid, name: group})
						this.mol[mname][chain][group].forEach( (atom) => {
							data.push({id: atom.treeId(), pId: gid, name: atom.name})
						})
					})
				})
		})
		return data;
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
