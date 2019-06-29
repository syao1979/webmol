export function appendInfo(txt, debug=false){
	if ( !debug || (debug && DEBUG) ){
		const ctxt = $("#info").val().trim();
		txt = ctxt == "" ? txt : `${ctxt}\n${txt.trim()}`;
		$("#info").val(txt);

		// scroll to bottom
		const psconsole = $('#info');
    	if(psconsole.length){
       		psconsole.scrollTop(psconsole[0].scrollHeight - psconsole.height());
    	}
	}
}


export function treeview(data){
	$("#moltree").tree({
	    data: data,
	    autoOpen: true,
	    dragAndDrop: true
	});
}