
function renderbg() {

	var fg = document.getElementById('fg');
	var footer = document.getElementsByTagName('footer')[0];
	
	var width = window.innerWidth;
	var height = fg.clientHeight + footer.clientHeight;
	
	var canvas = document.getElementById('bg-canvas');
	canvas.width = width;
	canvas.height = height;

	// canvas.style.height = height+'px';
	
	var ctx = canvas.getContext('2d');

	ctx.fillStyle = "red";
	ctx.fillRect(0, 0, width, height);


	var COLORS = d3.interpolateHcl('#21313E', '#EFEE69');
	var PT_RAD = 2;

	var voronoi = d3.geom.voronoi();

	function getCellSizes(cells) {
		var cellSizes = [];
		for (var k = 0; k < cells.length; ++k) {
			var area = 0;
			var c = cells[k];
			if (c != undefined && c.length != 0) {
				for (var i = 0; i < c.length; ++i) {
					j = (i + 1) % c.length;
					area += c[i][0] * c[j][1];
					area -= c[j][0] * c[i][1];
				}
				cellSizes.push(Math.abs(area/2));
			}
		}
		return cellSizes;
	}

	voronoi.clipExtent([[0,0],[width, height]]);
	var pts = [];

	for (var i = 0; i < 1024; ++i) {
		pts.push([Math.random()*width, Math.random()*height]);
	}

	var cells = voronoi(pts).filter(function(x) { return (x != undefined); });

	var cellSizes = getCellSizes(cells);
	var minSize = Math.min.apply(null, cellSizes);
	cellSizes = cellSizes.map(function(x) { return x - minSize; });
	var maxSize = Math.max.apply(null, cellSizes);
	var weights = cellSizes.map(function(x) { return x/maxSize; });

	for (var i = 0; i < cells.length; ++i) {
		cell = cells[i];
		if (cell != undefined && cell.length != 0) {
			ctx.beginPath();
			ctx.moveTo(cell[0][0], cell[0][1]);
			for (var j = 1, m = cell.length; j < m; ++j) {
				ctx.lineTo(cell[j][0], cell[j][1]);
			}
			ctx.closePath();
			ctx.fillStyle = COLORS(weights[i]);
			ctx.fill();
			ctx.strokeStyle = COLORS(1-weights[i]);
			ctx.stroke();
			if (true) {
				ctx.fillStyle = COLORS(1-weights[i]);
				ctx.beginPath();
				ctx.arc(cell.point[0], cell.point[1], PT_RAD, 2*Math.PI, false);
				ctx.fill();
				ctx.closePath();
			}
		}
	}

}

window.addEventListener('resize', renderbg);
window.addEventListener('load', renderbg);

