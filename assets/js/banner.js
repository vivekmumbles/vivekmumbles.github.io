
var MorphingCurve = function(context, displayWidth, displayHeight) {

	var numCircles;
	var maxMaxRad;
	var minMaxRad;
	var minRadFactor;
	var circles;
	var iterations;
	var timer;
	var drawsPerFrame;
	var drawCount;
	var bgColor,urlColor;
	var TWO_PI = 2*Math.PI;
	var lineWidth;

	this.init = function() {
		/*
		In other experiments, you may wish to use more fractal curves ("circles")
		and allow the radius of them to vary. If so, modify the next three variables.
		*/
		numCircles = 1;
		maxMaxRad = 200;
		minMaxRad = 200;
		
		/*
		We draw closed curves with varying radius. The factor below should be set between 0 and 1,
		representing the size of the smallest radius with respect to the largest possible.
		*/ 
		minRadFactor = 0;
		
		/*
		The number of subdividing steps to take when creating a single fractal curve. 
		Can use more, but anything over 10 (thus 1024 points) is overkill for a moderately sized canvas.
		*/
		iterations = 8;
		
		//number of curves to draw on every tick of the timer
		drawsPerFrame = 4;
		
		bgColor = "#FFFFFF";
		urlColor = "#EEEEEE";
		
		lineWidth = 1;
		
		startGenerate();
	}
	
	function startGenerate() {
		drawCount = 0;
		context.setTransform(1,0,0,1,0,0);
		
		context.clearRect(0,0,displayWidth,displayHeight);
		
		setCircles();
		
		if(timer) {clearInterval(timer);}
		timer = setInterval(onTimer,1000/50);
	}
	
	function setCircles() {
		var i;
		var r,g,b,a;
		var maxR, minR;
		var grad;
		
		circles = [];
		
		for (i = 0; i < numCircles; i++) {
			maxR = minMaxRad+Math.random()*(maxMaxRad-minMaxRad);
			minR = minRadFactor*maxR;
			
			//define gradient

			// grad = context.createLinearGradient(-0.85*maxR,0,0.7*maxR,0);
			// grad.addColorStop(1,"rgba(255,0,0,0.2)");
			// grad.addColorStop(0,"rgba(255,190,20,0.4)");

			grad = context.createRadialGradient(0,0,minR,0,0,maxR);
			// grad.addColorStop(1,"rgba(0,170,200,0.2)");
			// grad.addColorStop(0,"rgba(0,20,170,0.2)");

			grad.addColorStop(1,"rgba(36, 123, 160, .2)");
			grad.addColorStop(0,"rgba(243, 255, 189, .2)");

			// grad.addColorStop(1,"rgba(63, 136, 197, .2)");
			// grad.addColorStop(0,"rgba(255, 186, 8, .2)");
			
			var newCircle = {
				centerX: -maxR,
				centerY: displayHeight/2-50,
				maxRad : maxR,
				minRad : minR,
				color: grad, //can set a gradient or solid color here.
				//fillColor: "rgba(0,0,0,1)",
				param : 0,
				changeSpeed : 1/250,
				phase : Math.random()*TWO_PI, //the phase to use for a single fractal curve.
				globalPhase: Math.random()*TWO_PI //the curve as a whole will rise and fall by a sinusoid.
				};
			circles.push(newCircle);
			newCircle.pointList1 = setLinePoints(iterations);
			newCircle.pointList2 = setLinePoints(iterations);
		}
	}
	
	function onTimer() {
		var i,j;
		var c;
		var rad;
		var point1,point2;
		var x0,y0;
		var cosParam;
		
		var xSqueeze = 0.75; //cheap 3D effect by shortening in x direction.
		
		var yOffset;
		
		//draw circles
		for (j = 0; j < drawsPerFrame; j++) {
			
			drawCount++;
			
			for (i = 0; i < numCircles; i++) {
				c = circles[i];
				c.param += c.changeSpeed;
				if (c.param >= 1) {
					c.param = 0;
					
					c.pointList1 = c.pointList2;
					c.pointList2 = setLinePoints(iterations);
				}
				cosParam = 0.5-0.5*Math.cos(Math.PI*c.param);
				
				context.strokeStyle = c.color;
				context.lineWidth = lineWidth;
				//context.fillStyle = c.fillColor;
				context.beginPath();
				point1 = c.pointList1.first;
				point2 = c.pointList2.first;
				
				//slowly rotate
				c.phase += 0.0002;
				
				theta = c.phase;
				rad = c.minRad + (point1.y + cosParam*(point2.y-point1.y))*(c.maxRad - c.minRad);
				
				//move center
				c.centerX += 0.5;
				c.centerY += 0.04;
				yOffset = 40*Math.sin(c.globalPhase + drawCount/1000*TWO_PI);
				//stop when off screen
				if (c.centerX > displayWidth + maxMaxRad) {
					clearInterval(timer);
					timer = null;
				}			
				
				//we are drawing in new position by applying a transform. We are doing this so the gradient will move with the drawing.
				context.setTransform(xSqueeze,0,0,1,c.centerX,c.centerY+yOffset)
				
				//Drawing the curve involves stepping through a linked list of points defined by a fractal subdivision process.
				//It is like drawing a circle, except with varying radius.
				x0 = xSqueeze*rad*Math.cos(theta);
				y0 = rad*Math.sin(theta);
				context.lineTo(x0, y0);
				while (point1.next != null) {
					point1 = point1.next;
					point2 = point2.next;
					theta = TWO_PI*(point1.x + cosParam*(point2.x-point1.x)) + c.phase;
					rad = c.minRad + (point1.y + cosParam*(point2.y-point1.y))*(c.maxRad - c.minRad);
					x0 = xSqueeze*rad*Math.cos(theta);
					y0 = rad*Math.sin(theta);
					context.lineTo(x0, y0);
				}
				context.closePath();
				context.stroke();
				//context.fill();		
					
			}
		}
	}
		
	//Here is the function that defines a noisy (but not wildly varying) data set which we will use to draw the curves.
	function setLinePoints(iterations) {
		var pointList = {};
		pointList.first = {x:0, y:1};
		var lastPoint = {x:1, y:1}
		var minY = 1;
		var maxY = 1;
		var point;
		var nextPoint;
		var dx, newX, newY;
		var ratio;
		
		var minRatio = 0.5;
				
		pointList.first.next = lastPoint;
		for (var i = 0; i < iterations; i++) {
			point = pointList.first;
			while (point.next != null) {
				nextPoint = point.next;
				
				dx = nextPoint.x - point.x;
				newX = 0.5*(point.x + nextPoint.x);
				newY = 0.5*(point.y + nextPoint.y);
				newY += dx*(Math.random()*2 - 1);
				
				var newPoint = {x:newX, y:newY};
				
				//min, max
				if (newY < minY) {
					minY = newY;
				}
				else if (newY > maxY) {
					maxY = newY;
				}
				
				//put between points
				newPoint.next = nextPoint;
				point.next = newPoint;
				
				point = nextPoint;
			}
		}
		
		//normalize to values between 0 and 1
		if (maxY != minY) {
			var normalizeRate = 1/(maxY - minY);
			point = pointList.first;
			while (point != null) {
				point.y = normalizeRate*(point.y - minY);
				point = point.next;
			}
		}
		//unlikely that max = min, but could happen if using zero iterations. In this case, set all points equal to 1.
		else {
			point = pointList.first;
			while (point != null) {
				point.y = 1;
				point = point.next;
			}
		}
		
		return pointList;		
	}

}

window.onload = function() {
	var canvas = document.getElementById('banner-canvas');
	canvas.width = screen.width;
	canvas.height = 128;
	var context = canvas.getContext('2d');
	mc = new MorphingCurve(context, canvas.width, canvas.height);
	mc.init();
}
