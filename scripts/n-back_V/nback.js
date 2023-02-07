/********************************/
/***** Visual N-Back Task *****/
/********************************/

/*
## Description
The n -back task is a continuous performance task that is commonly used
as an assessment in psychology and cognitive neuroscience to measure
a part of working memory and working memory capacity. 
The n -back was introduced by Wayne Kirchner in 1958. Participants must
monitor a continuous stream of stimuli (here, visual stimuli) and 
respond based on whether the current stimulus matches the one presented
'n' stimuli previously.

In this part of the script, participants complete several runs of an visual n-back 
task. Participants complete one run (30 scored trials) of the 1-back, and 2 runs 
of both the 2-back and 3-back for each image type. These variables are easy to
change (e.g., presenting a higher n, removing runs etc.)

The visual stimuli are easily customizable. At present, you can 
select from visual letters and spatial locations. Just change the
'imageType' variable.

In the main index.html script, you should reference two things:

1. You must push 'nback' to the timeline [i.e., timeline.push(nback);] when you want the task to run

2. Use the 'return_nback_folder' function to name your own folder for the image files (for preloading).
This is optional -- if you do not do this, you should specify that 'anb_imagess' is the variable to be
preloaded for images.


// Stephen Van Hedger, April 2020 & Shannon Heald, Lauren Kingsly 2023 //


*/	
	
//////////////////////////////////////	
//General parameters for the n-back //
//////////////////////////////////////

var defaultITI = 500; // default inter-trial-interval
var presentationRate = 2500; // presentation rate between items in the n-back
var NUM_NON_TARGETS = 20; // number of non-targets per run
var NUM_TARGETS = 10; // number of targets per run

var NB_SEQUENCE = [1,2,2,2,3,3,3]; // critical - this specifies the number of runs and the level (n)...e.g., [1,2,3] would be one run of each 1-back, 2-back, and 3-back (in order)
var NB_INDEX = 0; //selection index for nb sequence
var TRIAL_INDEX; //selection index for the trials within an n-back run  
var run_sequence;
	  	  
var HIT_1 = 0; //counter of total hits for 1-back
var HIT_2 = 0; //counter of total hits for 2-back
var HIT_3 = 0; //counter of total hits for 3-back
	  
var FA_1 = 0; //counter of total false alarms for 1-back
var FA_2 = 0; //counter of total false alarms for 2-back
var FA_3 = 0; //counter of total false alarms for 3-back

/*What images do you want to use? options: 
'letters' 
'spatial'  
*/	 
var imageType = 'spatial'; //change this line to use different images

var anb_images = []; //the ultimate array that will hold the images
var baseName = ['B.jpg', 'C.jpg', 'D.jpg', 'F.jpg', 'H.jpg', 'K.jpg', 'N.jpg', 'Q.jpg'];

for (var i=0; i<baseName.length; i++){
	if (imageType == 'letters'){
		var nbstim = 'letters/'+baseName[i];
		anb_images.push(nbstim);
	} else {
		var nbstim = 'spatial/'+baseName[i];
		anb_images.push(nbstim);	
	}	
}	


var n;  

//function to return the image files (for preloading in the main script) 
function return_nback_folder(){
	return anb_images;
};
 
/* Returns one random stimulus with replacement*/
   function getSample(stimList) {
        return jsPsych.randomization.sampleWithReplacement(stimList, 1);
      }
	  

/////////////////////////////////////////////////////
// Reminder of N-Back Run, Preparation of Sequence //
/////////////////////////////////////////////////////

	  var instrBack = {
			type: "html-button-response",
			stimulus: function(){n = NB_SEQUENCE[NB_INDEX]; return'<p>You will now complete a <strong>'+n+'-back.</strong></p><p>Remember, this means that you should press SPACEBAR every time the image you see matches the one presented <strong>'+n+'</strong> position(s) previously.</p>';},
		    choices: ['Continue'],
			on_start: function(){
				n = NB_SEQUENCE[NB_INDEX]; //this selects the level (n) from the array defined at the beginning
				TRIAL_INDEX = 0; //trial index is reset prior to each run
				var imageStimuli = []; //this is the array that will hold the sequence of images
				//now we push three trial types to an array (finalArray) - first n trials (FIRSTS), non-targets (NT) and targets (T)
				var FIRSTS = ["FIRSTS"];
				var NT = ["NT"];
				var T = ["T"];
				var FIRSTS2 = jsPsych.randomization.repeat(FIRSTS, n); 
				var NT2 = jsPsych.randomization.repeat(NT, NUM_NON_TARGETS); 
				var T2 = jsPsych.randomization.repeat(T, NUM_TARGETS); 
				var TESTTRIALS = NT2.concat(T2); 
				var TESTTRIALS_SHUFFLED = jsPsych.randomization.repeat(TESTTRIALS, 1); // randomize the combined array of targets and non-targets
				var finalArray = [];
				
		
				for (i = 0;  i < FIRSTS2.length; i++) {
					finalArray.push(FIRSTS2[i]) //push first trials to the final array
				};
		
				for (i = 0;  i < TESTTRIALS_SHUFFLED.length; i++) {
					finalArray.push(TESTTRIALS_SHUFFLED[i]) //push randomized target/non-target (i.e., the scored trials) to the array after the first trials)
				};
		
				var imageTarget;
				var imageSample;
				  
				for (var i = 0; i < finalArray.length; i++) {  
					if (finalArray[i] == "FIRSTS") {
						imageStimuli.push;
					} else {
						imageTarget = imageStimuli[i-n];
						imageSample = imageTarget;
		   // if the trial type is NT, the script removes the target stim from the array, selects a image, then puts the target back into the array
		  		 if (finalArray[i] == "NT") {	
					for( var j = 0; j < anb_images.length; j++){ 
						if (anb_images[j] == imageTarget) {
							target_temp = anb_images.slice(j, j+1); //temporary store for the target
							anb_images.splice(j, 1); //array of images minus the target
							}
						imageSample = getSample(anb_images);	
						}		
					anb_images.push(target_temp[0]);
					}
				}
			}
			run_sequence = {image: imageStimuli, type: finalArray};
		}		
    };
		
     
///////////////////////////////
// image Presentation Trial //
///////////////////////////////
   
	var nb_trial = {
		type: "image-keyboard-response",
		stimulus: function(){return run_sequence.image[TRIAL_INDEX];},
        trial_duration: presentationRate,
        choices: [' '],  
        response_ends_trial: false,
        on_finish: function (trialData) {
            var rt = JSON.parse(trialData.rt);
			var keyresp = JSON.parse(trialData.key_press);
			var wasatarget = (run_sequence.type[TRIAL_INDEX] == "T") ? 1 : 0;
			var ttype = run_sequence.type[TRIAL_INDEX];
			var n_level = n;
            var rtImage = rt;
			var HIT;
			var FA;
			TRIAL_INDEX += 1; 

			//calculate hits and false alarms for each trial
			if (wasatarget === 1) {
				if (keyresp == 32) {
					HIT = 1;
				if (n_level == 1) {
					HIT_1 += 1;
				} else if (n_level == 2) {
					HIT_2 += 1;
				} else {
					HIT_3 += 1;
				}
				} else {
					HIT = 0;
			}
			  } else if (wasatarget === 0){
				if (keyresp == 32) {
				FA = 1;
				if (n_level == 1) {
					FA_1 += 1;
				} else if (n_level == 2) {
					FA_2 += 1;
				} else {
					FA_3 += 1;
				}
			} else {
				FA = 0;
			}		
				
			 } else {
				HIT = '';
				FA = '';
			 }
			  
              var extraData = {
                rt_image: rtImage,
				designation: 'n-back-trial',
                responded_to_image: (rtImage == null ? 0 : 1),
				N: n_level,
				TYPE: ttype,
				HIT: HIT,
				FA:FA
              };
              jsPsych.data.addDataToLastTrial(extraData);
            }
          };		


//looping function to repeat the trial for the length of the stim array (30 + n)
	var trial_loop_node = {
		timeline: [nb_trial],
		loop_function: function(data){
			if(typeof run_sequence.type[TRIAL_INDEX] !== "undefined"){
				return true;
			} else {
				return false;
			}
		}
	}


     
	var shortBreak = {
		type: "html-button-response",
		stimulus: '<p>You may take a short break if you wish.</p><p>Click the button below when you are ready to continue.</p>',
		choices: ['Continue'],
		on_finish: function(){
			NB_INDEX += 1; //this advances the index to search for the next 'n' level in NB_SEQUENCE
		
		}
    };

//looping function to repeat n-back runs until 'NB_SEQUENCE' runs out
	var anb_loop_node = {
		timeline: [instrBack, trial_loop_node, shortBreak],
		loop_function: function(data){
			if(typeof NB_SEQUENCE[NB_INDEX] !== "undefined"){
				return true;
			} else {
				return false;
			}
		}
	}


/*************************/	  
/** N-Back Instructions **/	  
/*************************/	  

//Dynamic instructions based on imageType

if(imageType == 'letters'){
	var nonLetterClarify = "<p></p>";
	} else {
	var nonLetterClarify = "<p><em>Note: The instructions use letters for illustration purposes only. Remember, you will be seeing "+imageType+" images, not letters.</em></p>";
	};
	
var anb_inst_1 = {
        type: "html-button-response",
        stimulus: '<p>You will now complete an visual memory task. This will take approximately 15 minutes.</p><p>To learn more about the task, please advance to the next screen.',
		choices: ['Continue'],
		post_trial_gap: 250
    };

var anb_inst_2 = {
        type: "html-button-response",
        stimulus: '<p>In this task, you will see a sequence of '+imageType+' images. The '+imageType+' images will be presented one at a time, and a new image will shown every '+Math.round(presentationRate)/1000+' seconds.' +
				  '<p>Your job is to closely watch these images for specific kinds of <b>repeats</b>.</p>',
		choices: ['Continue'],
		post_trial_gap: 250
    };

var anb_inst_3 = {
        type: "html-button-response",
        stimulus: '<p>If you are asked to complete a <b>1-back</b>, you must press SPACEBAR every time the current image matches the image presented <b>one</b> position previously.<br>' +
				  "Otherwise, you do not have to respond.</p><p>For example, imagine you saw the following image sequence:</p><p style='color:darkblue'>B...D...<b style='color:red'>D</b>...F...<b style='color:red'>F</b>...<b style='color:red'>F</b>...C...E...</p>" +
				  "<p>You would respond to the image printed in <b style='color:red'>red</b>, as these were repeated <b>one</b> position previously.</p>"+
				  nonLetterClarify,
		choices: ['Continue'],
		post_trial_gap: 250
    };	

var anb_inst_4 = {
        type: "html-button-response",
        stimulus: '<p>If you are asked to complete a <b>2-back</b>, you must press SPACEBAR every time the current image matches the image presented <b>two</b> positions previously.<br>' +
				  "Otherwise, you do not have to respond.</p><p>For example, imagine you heard the following image sequence:</p><p style='color:darkblue'>B...D...<b style='color:red'>B</b>...C...<b style='color:red'>B</b>...<b style='color:red'>C</b>...E...F...</p>" +
				  "<p>You would respond to the images printed in <b style='color:red'>red</b>, as these were repeated <b>two</b> positions previously.</p>"+
				   nonLetterClarify,
		choices: ['Continue'],
		post_trial_gap: 250
    };		
 
var anb_inst_5 = {
        type: "html-button-response",
        stimulus: '<p>If you are asked to complete a <b>3-back</b>, you must press SPACEBAR every time the current image matches the image presented <b>three</b> positions previously.<br>' +
				  "Otherwise, you do not have to respond.</p><p>For example, imagine you heard the following image sequence:</p><p style='color:darkblue'>B...D...G...<b style='color:red'>B</b>...<b style='color:red'>D</b>...C...E...<b style='color:red'>D</b>...</p>" +
				  "<p>You would respond to the images printed in <b style='color:red'>red</b>, as these were repeated <b>three</b> positions previously.</p>" +
				  nonLetterClarify,
		choices: ['Continue'],
		post_trial_gap: 250
    };

var anb_inst_6 = {
        type: "html-button-response",
        stimulus: '<p>As you can imagine, the task becomes harder as the delay (1, 2, or 3) increases.</p>' +
				  '<p>Please make sure you are in a quiet listening environment and free from distraction.<br>You will receive breaks approximately every 90 seconds to minimize fatigue.</p>',
		choices: ['Continue'],
		post_trial_gap: 250
    };

		 
var anb_inst_7 = {
        type: "html-button-response",
        stimulus: '<p>This concludes the introduction to the memory task.</p>'+
				  '<p>Please advance to the next screen to receive further instructions.</p>',
		choices: ['Begin'],
		post_trial_gap: 250
    };


var anb_instruct_final = {	 
	timeline: [anb_inst_1, anb_inst_2, anb_inst_3, anb_inst_4, anb_inst_5, anb_inst_6, anb_inst_7]		
};
	

//N-Back Wrap-Up  
    var anb_wrapup = {
        type: "html-button-response",
        stimulus: '<p>Thank you for your responses.</p><p>This concludes the auditory memory task.</p>',
		choices: ['Continue'],
		on_finish: function(data){	
			//change depending on the levels of n-back you are testing
			jsPsych.data.addDataToLastTrial({
			  designation: "ANB-SUMMARY",
			  HIT_1B: HIT_1,
			  HIT_2B: HIT_2,
			  HIT_3B: HIT_3,
			  FA_1B: FA_1,
			  FA_2B: FA_2,
			  FA_3B: FA_3	
            });			
		}
      };
      


var nback = {
	timeline: [anb_instruct_final, anb_loop_node, anb_wrapup]
}

      