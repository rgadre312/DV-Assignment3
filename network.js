
function simulate(data,svg)
{

    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const main_group = svg.append("g")
        .attr("transform", `translate(0, 50)`)

   //calculate degree of the nodes:
    const node_degree={}; //initiate an object
   d3.map(data.links, d=>
        {
          
            if(d.source in node_degree)
            {
                node_degree[d.source]++
            }
            else{
                node_degree[d.source]=0
            }
            if(d.target in node_degree)
            {
                node_degree[d.target]++
            }
            else{
                node_degree[d.target]=0
            }
   });

    const scale_radius = d3.scaleLinear()
        .domain(d3.extent(Object.values(node_degree)))
        .range([3,12])
    const scale_link_stroke_width = d3.scaleLinear()
        .domain(d3.extent(data.links,d=>d.year))
        .range([1,5])

    const color = d3.scaleSequential()
          .domain([1995,2020])
          .interpolator(d3.interpolateBuGn);

    const treatPublisherClass = (Publisher)=>{
      let temp=Publisher.toString().split(' ').join('');
      temp = temp.split(".").join('');
      temp = temp.split(",").join('');
      temp = temp.split("/").join('');
      return "gr"+temp
    }
    const link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke-width", d=>scale_link_stroke_width(10));
    const node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class",function(d){ 
            return treatPublisherClass(d.Publisher)
        })
        .on("mouseover", function (d,data){
            d3.select(".title").text(data.title).attr('transform',`translate(20,-530)`)
            node_elements.classed("inactive",true)
            const sel_class = d3.select(this).attr("class").split(" ")[0];
            console.log(sel_class)
            d3.select("."+sel_class).classed("inactive",false)
        })
        .on("mouseout",function(d){
            d3.selectAll(".title").text(" ")
            d3.selectAll(".inactive").classed("inactive",false)   
        })
    node_elements.append("circle")
        .attr("r", (d,i)=> {return scale_radius(node_degree[d['id']]*1.2)})
        .attr("fill", (d)=>{ return color(d.year)})

    node_elements.append("text")
        .attr("class","title")
        .attr("text-anchor","middle")
        .text(d=>d.title)
        console.log(node_elements)
    const ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius((d,i)=>{ return scale_radius(node_degree[i])*4}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(d=>d.id)
            .distance(5)
            .strength(1)
        )
        .on("tick", ticked);
        console.log(node_elements)

    function ticked()
    {
    node_elements
        .attr('transform', (d)=>`translate(${d.x},${d.y})`)

        link_elements
            .attr("x1",d=>d.source.x)
            .attr("x2",d=>d.target.x)
            .attr("y1",d=>d.source.y)
            .attr("y2",d=>d.target.y)
        }

}
