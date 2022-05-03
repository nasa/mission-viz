
// Constructor to generate objects that identify orbital elements.
function Trajectory(name, smA,oI,aP,oE,aN,mAe,Sidereal){

   this.name = name                          // name the object
   this.smA = smA                            // semi major axis
   this.oI = oI * 0.01745329                 // orbital inclination --> convert degrees to radians
   this.aP = aP * 0.01745329                 // argument of Perigee --> convert degrees to radians
   this.oE = oE                              // orbital eccentricity
   this.aN = aN * 0.01745329                 // ascending node --> convert degrees to radians
   this.period = Sidereal                    // siderial period as a multiple of Earth's orbital period
   this.epochMeanAnomaly = mAe * 0.01745329  // mean anomaly at epoch 
   this.trueAnomoly = 0                      // initialize to mean anomaly at epoch
   this.position = [0,0,0] 
   this.time = 0 
}
//--------------------------------------------
//        Trajectory Propagator
//--------------------------------------------
Trajectory.prototype.propagate = function(uA){
// Purpose: Determine a position on an orbital trajectory based on a true anomoly.
// Used by the traceOrbits function to draw the orbits.
var pos = [] ;
var xdot; var ydot; var zdot;            // velocity coordinates
var theta = uA;                          // Update true anomaly.
var smA = this.smA;                      // Semi-major Axis
var oI =  this.oI ;                      // Orbital Inclination
var aP = this.aP ;                       // Get the object's orbital elements.
var oE = this.oE;                        // Orbital eccentricity
var aN = this.aN ;                       // ascending Node
var sLR = smA * (1 - oE^2) ;             // Compute Semi-Latus Rectum.
var r = sLR/(1 + oE * Math.cos(theta));  // Compute radial distance.

// Compute position coordinates pos[0] is x, pos[1] is y, pos[2] is z
pos[0] = r * (Math.cos(aP + theta) * Math.cos(aN) - Math.cos(oI) * Math.sin(aP + theta) * Math.sin(aN)) ;  
pos[1] = r * (Math.cos(aP + theta) * Math.sin(aN) + Math.cos(oI) * Math.sin(aP + theta) * Math.cos(aN)) ;
pos[2] = r * (Math.sin(aP + theta) * Math.sin(oI)) ;

return pos ;
}
//-----------------------------------------------------------------------------------------------------
function traceOrbits()  
	{  // Generate line segments from points around the trajectory of the orbiting objects.
	   // Trace the orbits for the following array of objects.
	  var geometry ;
	  var material = new THREE.LineBasicMaterial({color: 0xCCCCFF });  
	console.log("Entering traceOrbits " + heavenlyBodies.length) ;
	for (var hB in heavenlyBodies) {
	   var orbPos = [];
	   var j = 0;                // Initialize the orbit index, which will build the orbIndices list. 
	   geometry = new THREE.Geometry();   // Create an object for each orbit.
	   var i = 0.0 ;
	   while (i <= 6.28) {
	     orbPos = heavenlyBodies[hB].propagate(i) ;   // Propagate the orbits.
		 // Store the vertices.
		 geometry.vertices.push(new THREE.Vector3(orbPos[0].toFixed(2), orbPos[1].toFixed(2), orbPos[2].toFixed(2)));

		 i = i + 0.0785
		 j = j + 1 ;          // Increment the orbit index.
        }
	    line = new THREE.Line(geometry, material);
		var orbitName = heavenlyBodies[hB].name.value + "_trace" ; 
		line.name = orbitName ;

		scene.add(line);
		console.log("line name  " + orbitName ) ;
	 }
	 console.log("Exiting traceOrbits") ;
  };
/*-------------------------------------------------------------*
 *   Utility functions for true, eccentric and mean anomalies  *
 *-------------------------------------------------------------*/
 function trueToEccentricAnomaly(e,f) {
// http://mmae.iit.edu/~mpeet/Classes/MMAE441/Spacecraft/441Lecture19.pdf slide 7 
 var eccentricAnomaly = 2* Math.atan(Math.sqrt((1-e)/(1+e))* Math.tan(f/2));

	return eccentricAnomaly ;
}
function meanToEccentricAnomaly (e, M) {
// Solves for eccentric anomaly, E from a given mean anomaly, M
// and eccentricty, e.  Performs a simple Newton-Raphson iteration
// Code derived from Matlab scripts written by Richard Rieber, 1/23/2005
// http://www.mathworks.com/matlabcentral/fileexchange/6779-calce-m
   var tol = 0.0001;  // tolerance
   var eAo = M;       // initialize eccentric anomaly with mean anomaly
   var ratio = 1;     // set ratio higher than the tolerance
while (Math.abs(ratio) > tol) {
    var f_E = eAo - e * Math.sin(eAo) - M;
    var f_Eprime = 1 - e * Math.cos(eAo);
    ratio = f_E / f_Eprime;
    if (Math.abs(ratio) > tol) {
        eAo = eAo - ratio;
	 // console.log ("ratio  " + ratio) ;
	  }
    else
        eccentricAnomaly = eAo;
   }
    return eccentricAnomaly 
} 
function eccentricToTrueAnomaly(e, E) {
 // http://mmae.iit.edu/~mpeet/Classes/MMAE441/Spacecraft/441Lecture19.pdf slide 8
	var trueAnomaly = 2 * Math.atan(Math.sqrt((1+e)/(1-e))* Math.tan(E/2));
	return trueAnomaly
}
   function updateTheDate() 
   { // Display the simulated date to the right of the model.
   //  epoch.setTime(epoch.getTime() + simSpeed * 86400)
	 if (simSpeed == 1) {
	   epoch.setDate(epoch.getDate() + 1) ;            // At maximum speed, increment calendar by a day for each clock-cycle.
	 } else {  epoch.setTime(epoch.getTime() + simSpeed * 24 * 3600000) ; }  // 24 hours * milliseconds in an hour * simSpeed 

//	 document.getElementById("modelDate").innerHTML = (epoch.getMonth() + 1) + "-" + epoch.getDate() + "-" + epoch.getFullYear() ;
   }

function updatePosition() 
	{  // With each tick of the clock, propagate the position and set the translation attribute.
	  // Update the position for the following array of objects.
	  var currentPosition = [] ;
      var deltaTime = 0 ;
	  
	  for (var hB in heavenlyBodies) {
	    
		var hbTAnomoly = heavenlyBodies[hB].trueAnomoly ;
	    currentPosition = heavenlyBodies[hB].propagate(hbTAnomoly) ;  // Determine the current position.
		
	    var Xpos = currentPosition[0] ;
	    var Ypos = currentPosition[1] ;
	    var Zpos = currentPosition[2] ;
	    var hBName = heavenlyBodies[hB].name;   // get the name of the current object and update translation
		
		curObj = scene.getObjectByName(hBName) ;
		curObj.position.set (Xpos, Ypos, Zpos) ;
		
	//	console.log(curObj.name + "  " + curObj.position.x + ",  " + curObj.position.y + ",  " + curObj.position.z  ) ;
		  
	 // Calculate mean motion n:
		 var n = (2 * Math.PI) / (heavenlyBodies[hB].period * 365.25) ;   // radians per day
		 
	 // Calculate Eccentric Anomaly E based on the orbital eccentricity and previous true anomaly:
	    var e = heavenlyBodies[hB].oE ;
		var f = heavenlyBodies[hB].trueAnomoly          // heavenlyBodies[hB].trueAnomoly ;
        var eA = trueToEccentricAnomaly(e,f)            // convert from true anomaly to eccentric anomaly
		
	 // Calculate current Mean Anomaly	
		var m0 = eA - e * Math.sin(eA);	
	   
	 // deltaTime = (Math.abs(m0/n) - heavenlyBodies[hB].time) * simSpeed
    //  deltaTime = Math.abs(m0/n) * simSpeed
	    deltaTime = simSpeed * n

	 // Update Mean anomaly by adding the Mean Anomaly at Epoch to the mean motion * delaTime
         var mA = deltaTime + m0
		
		heavenlyBodies[hB].time = heavenlyBodies[hB].time +  deltaTime // increment timer

        eA = meanToEccentricAnomaly (e, mA) 
        var trueAnomaly = eccentricToTrueAnomaly(e, eA) 
		heavenlyBodies[hB].trueAnomoly = trueAnomaly
		
//    console.log(hBName + " time = " +  heavenlyBodies[hB].time + "  delta time " + dt)		
//	  console.log(hBName + " eccentric anomaly " + E + " sin(f) " + sinf + " cos(f) " + cosf )
//	  console.log(hBName + " mean anomaly " + mA + " eccentric anomaly " + eA ) 		
//    console.log (hBName + " trueAnomaly = " + trueAnomaly + "   true Anomaly  " + heavenlyBodies[hB].trueAnomoly + "  mean motion = " + n) ;
//	  console.log(hBName + " eccentricity " + e + " true anomaly " + f + " Eccentric anomaly " + eA + " Mean anomaly " + m0 + " mean motion " + n) 	 
	  }
	  updateTheDate() ;
	  
	};

/*----------------------------------------------------------------------------------------------*
 *                            {--- Global variables --}                                         *
 *----------------------------------------------------------------------------------------------*/
var epoch = new Date('December 9, 2014');  // start the calendar 
var simSpeed = 0.75 ;                        // value from the scroll control
var solid = false;                        // start simulation with solid rendering of orbits
var solidLabels = false;                  // start simulation with solid rendering of Labels

// Specify trajectories' sMA, oI, aP, oE, aN, mAe, Sidereal <-- refer to Trajectory constructor.
// Orbital elements source: http://www.met.rdg.ac.uk/~ross/Astronomy/Planets.html#rates
// Orbital period source: http://en.wikipedia.org/wiki/Orbital_period
// Mean Anomoly at epoch for planets http://farside.ph.utexas.edu/teaching/celestial/Celestial/node34.html
// Source: http://neo.jpl.nasa.gov/cgi-bin/neo_elem?type=PHA;hmax=all;max_rows=20;action=Display%20Table;show=1&sort=moid&sdir=ASC
