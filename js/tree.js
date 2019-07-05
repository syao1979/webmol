/*
 * D3 indented collapsible tree view class
 * Ref :
 * dependencies:
 *
 * Shijie Yao
 * 20190524
 */

class IndentedCollapsibleTree{

    constructor(divid, ajson){
        this.data = ajson;
        this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        let divObj = $(`#${divid}`);

        this.width = divObj.width();
        this.height = divObj.height();

        if (this.height  === 0){
            const size = 350;
            divObj.css("height", size);
            this.height = size;
        }

        if (this.width  === 0){
            const size = 250;
            divObj.css("width", size);
            this.width = size;
        }

        //console.log(`final w=${this.width}; h=${this.height}`)
        this.barHeight = 20;
        this.barWidth = this.width * .8;
        this.i = 0;
        this.duration = 750;

        this.tree = d3.tree().nodeSize([0, 30]);
        this.root = this.tree(d3.hierarchy(ajson));

        this.root.each( (d)=>{
            // d.name = d.id; //transferring name to a name variable
            d.id = this.i; //Assigning numerical Ids
            this.i++;
        });

        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        let exfactor = 8;
        this.zoomListener = d3.zoom()
                  .scaleExtent([0.5, 3])
                  .translateExtent([
                      [-this.width * exfactor, -this.height * exfactor],
                      [this.width * exfactor, this.height * exfactor]
                  ])
                  .on("zoom", ()=>{ this.zoomed() });


        this.root.x0 = this.root.x;
        this.root.y0 = this.root.y;
        this.svg = d3.select(`#${divid}`).append('svg');
        this.view = this.svg.append('g')

        this.svg.attr('width', "100%")
        this.svg.attr('height', "100%")
        this.svg.call(this.zoomListener);
        this.svg.call(this.zoomListener.transform, d3.zoomIdentity.translate(10, 10));

        // this.root.children.forEach(this.collapse);
        // d3.select("#collapse-all").classed("active", true); 
        // d3.select("#expand-all").classed("active", false);
        this.update(this.root);
    }

    zoomed(){
        this.view.attr("transform", d3.event.transform)
    }

    connector(d){
        return `M${d.parent.y},${d.parent.x}V${d.x}H${d.y}`;
    }

    collapse (d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(_this.collapse);
          d.children = null;
        }
    };

    update (source) {
        // Compute the new tree layout.
        let nodes = this.tree(this.root);
        let nodesSort = [];
        nodes.eachBefore( (n) => {
            nodesSort.push(n);
        });

        this.height = Math.max(500, nodesSort.length * this.barHeight + this.margin.top + this.margin.bottom);
        let links = nodesSort.slice(1);
        // Compute the "layout".
        nodesSort.forEach( (n, i)=>{
            n.x = i * this.barHeight;
        });

        this.view.transition()
                        .duration(this.duration)
                        .attr("height", this.height);

        // Update the nodes…
        let node = this.view.selectAll('g.node')
                  .data(nodesSort, (d) => {
                      return d.id || (d.id = ++this.i);
                  });

        // Enter any new nodes at the parent's previous position.
        let nodeEnter = node.enter().append('g')
                  .attr('class', 'node')
                  .attr('transform', () => {
                    return `translate(${source.y0}, ${source.x0})`
                  })
                  .on('click', (d) => {
                        if (d.children) {
                            d._children = d.children;
                            d.children = null;
                        } else {
                            d.children = d._children;
                            d._children = null;
                        }
                        this.update(d);
                  });

        // nodeEnter.append('circle');
        nodeEnter.each(function(d){
            let thisGroup = d3.select(this);
            if (d.data.size){ // use circle for terminal node, and square for middle nodes
                return thisGroup.append('circle');
            } else {
                return thisGroup.append('rect');
            }
        })

        nodeEnter.append('text')
                  .attr('x', (d) => {
                      return d.children || d._children ? 10 : 10;
                  })
                  .attr('dy', '.35em')
                  .attr('text-anchor', (d) => {
                      return d.children || d._children ? 'start' : 'start';
                  })
                  .text( (d) => {
                      let name = d.data.name;     // name in format of, eg. "phylum: Actinobacteria"; mosue over will show "phylum"
                      if (name.indexOf(":") > -1){
                          name = name.split(":")[1].trim()
                      }
                      if (d.data.size) {
                          name = `${name} : ${d.data.size}`
                      }

                      return name
                  })
                  .style("fill", (d)=>{
                      return ( !d.data.size && (d.data.name[0] == d.data.name[0].toLowerCase()) ) ? "#0B7500" : "#000";
                  })
                  .style("font-style", (d)=>{

                      return ( !d.data.size && (d.data.name[0] == d.data.name[0].toLowerCase()) ) ? "italic" : "normal"
                  })
                  .style("font-weight", (d)=>{
                      return ( !d.data.size && (d.data.name[0] == d.data.name[0].toLowerCase()) ) ? "bold" : "normal"
                  })
                  .style("opacity", (d)=>{
                      return ( !d.data.size && (d.data.name[0] == d.data.name[0].toLowerCase()) ) ? 0.5 : 1.0
                  })
                  .style('fill-opacity', 1e-6);
                  nodeEnter.append('svg:title').text( (d) => {
                      let name = d.data.name;     // name in format of, eg. "phylum: Actinobacteria"; mosue over will show "phylum"
                      if (name.indexOf(":") > -1){
                          name = name.split(":")[0].trim()
                      }
                      return name;
                  });


        // Transition nodes to their new position.
        let nodeUpdate = node.merge(nodeEnter)
                .transition()
                .duration(this.duration);

        nodeUpdate.
                attr('transform', (d)=>{
                    return `translate(${d.y}, ${d.x})`
                });

        // nodeUpdate.select('circle')
        //         .attr('r', 4.5)
        //         .style('fill', (d)=>{
        //               // d._children not null => collapsed node
        //               if ( !d.data.size && (d.data.name[0] == d.data.name[0].toLowerCase()) ){
        //                   return d._children ? '#bbb' : '#0B7500';
        //               } else {
        //                   if (!d.data.size) {
        //                       return d._children ? 'lightsteelblue' : '#fff';
        //                   } else {
        //                       return '#FFD700';
        //                   }
        //               }
        //         });

        nodeUpdate.select('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr("x", -5)
                .attr("y", -5)
                // .attr('style', d => 'fill:#fff;opacity:0.2')
                //.attr("style", d => 'fill:#eee;opacity:1.0')
                .attr('style', (d)=>{
                      return d._children ? 'fill:#FFD700' : 'fill:#eee';
                })
                .style("stroke-width", 0.5)
                .style("stroke", "#777")

                //.style("stroke-width", 0.5)
                //.style("stroke", "#888")
                //.style('fill', (d)=>{
                //      return "#eee"
                //});

        nodeUpdate.select('text')
                .style('fill-opacity', 1);

        // Transition exiting nodes to the parent's new position (and remove the nodes)
        let nodeExit = node.exit().transition().duration(this.duration);

        nodeExit
                .attr('transform', (d)=>{
                  return `translate(${source.y},${source.x})`
                })
                .remove();

        nodeExit
                .select('circle')
                .attr('r', 1e-6);

        nodeExit
                .select('rect')
                .attr('width', 1e-6)
                .attr('height', 1e-6);

        nodeExit
                .select('text')
                .style('fill-opacity', 1e-6);


        // Update the links…
        let link = this.view.selectAll('path.link')
                .data(links, (d) => {
                    // return d.target.id;
                    let id = d.id + '->' + d.parent.id;
                    return id;
                });

        // Enter any new links at the parent's previous position.
        let linkEnter = link.enter().insert('path', 'g')
                .attr('class', 'link')
                .attr('d',  (d) => {
                    let o = { x: source.x0, y: source.y0, parent: { x: source.x0, y: source.y0 } };
                    return this.connector(o);
                });

        // Transition links to their new position.
        link.merge(linkEnter).transition()
                  .duration(this.duration)
                  .attr('d', this.connector);

        // // Transition exiting nodes to the parent's new position.
        link.exit().transition()
                  .duration(this.duration)
                  .attr('d', (d) => {
                      let o = { x: source.x, y: source.y, parent: { x: source.x, y: source.y } };
                      return this.connector(o);
                  })
                  .remove();

        // Stash the old positions for transition.
        nodesSort.forEach( (d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    };
}

export default IndentedCollapsibleTree;