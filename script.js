var Truss = "[node(1,4,4),node(2,8,4),node(3,12,4),node(4,8,1),node(5,15,1),member(1,1,2),member(2,2,3),member(3,2,4),member(4,1,4),member(5,4,5),member(6,3,5),member(7,3,4),support(pin,3),support(rollerx,2),load(4,x)]";

function extractSubstrings(str) {
    const regex = /{(.*?)}/g;
    let matches = str.match(regex);

    if (matches) {
        return matches.map(element => element.slice(1, -1));
    } else {
        return [];
    }
}

function updateGearPosition() {
    var x = document.getElementById('result').offsetLeft + 75;
    document.getElementById('progressBarContainer').style.left = x+'px';
}


function showProgressBar() {
    updateGearPosition();
    document.getElementById('progressBarContainer').style.display = 'block'; 
}

function hideProgressBar() {
    document.getElementById('progressBarContainer').style.display = 'none';
}

let myWorker = new Worker('webWorker.js');

// Function to initialize the worker
function initializeWorker() {
    return new Promise((resolve, reject) => {
        myWorker.postMessage({ command: 'initialize'});

        myWorker.onmessage = function(e) {
            if (e.data.status === 'initialized') {
                resolve();
            }
        };

        myWorker.onerror = function(error) {
            reject(error);
        };
    });
}

// Function to process prolog using the worker
function goProlog() {
    return new Promise((resolve, reject) => {
        myWorker.postMessage({ command: 'calculate', truss: Truss});

        myWorker.onmessage = function(e) {
            if (e.data.result) {
                resolve(e.data.result);
            }
        };

        myWorker.onerror = function(error) {
            reject(error);
        };
    });
}

// Async function to run the factorial computation
async function runFunction() {
    done = true;
    encode();
    deselectALL();
    disableMenu(true);  
    document.getElementById('submit').style.display = 'none';
    document.getElementById("reset").disabled = true;
    document.getElementById('reset').style.display = 'block';

    if (array4.length == 0){
        document.getElementById("result").innerHTML = '<div><p>None of the truss members carry any axial force as the structure is not subjected to any loads.</p></div>'; 
        document.getElementById("reset").disabled = false;
    }
    else{
        try {
            document.getElementById('result').innerHTML = '';
            document.getElementById('countdown').innerText = "Processing ... ";        
            showProgressBar();
            
            if (selectedTruss == 'truss1'){ timerDuration = 2}
            else if (selectedTruss == 'truss2'){timerDuration = 6}
            else if (selectedTruss == 'truss3'){ timerDuration = 4}
            else if (selectedTruss == 'truss4'){ timerDuration = 2}
            else if (selectedTruss == 'truss5'){timerDuration = 8}
            else if (selectedTruss == 'truss6'){timerDuration = 8}
            else if (selectedTruss == 'truss7'){ timerDuration = 2}
            else if (selectedTruss == 'truss8'){timerDuration = 16}
            else if (selectedTruss == 'truss9'){timerDuration = 2}
            else if (selectedTruss == 'truss10'){timerDuration = 3}
            else if (selectedTruss == 'truss11'){timerDuration = 3}
            else if (selectedTruss == 'truss12'){timerDuration = 16}
            else if (selectedTruss == 'truss13'){timerDuration = 8}
            else if (selectedTruss == 'truss14'){timerDuration = 7}
            else if (selectedTruss == 'truss15'){timerDuration = 24}
            else {timerDuration = 20}
            timerOn = true;
            startCountdown(timerDuration);

            const Result = await goProlog();
            const out = extractSubstrings(Result);

            process(out);
        } catch (error) {
            console.error('Worker error:', error);
        } finally {
            timerOn = false;            
            hideProgressBar();
            document.getElementById('reset').style.display = 'block';
            document.getElementById("reset").disabled = false;
        }
    }

}

async function initProlog(){
    await initializeWorker();
    console.log('Prolog engine has been initialized');
}
initProlog();


let timerOn = false;  // Flag to control the timer

function startCountdown(duration) {
    let timer = duration;
    let seconds;

    let interval = setInterval(function () {
        if (timerOn) {
            seconds = parseInt(timer % 60, 10);

            document.getElementById('countdown').innerText = "Processing ... "+seconds;

            if (--timer < 0) {
                timer = duration; // Reset the timer to the start number
            }
        } else {
            // Stop the countdown if timerOn is false
            clearInterval(interval);
            console.log("Countdown stopped.");
            document.getElementById('countdown').innerText = "Processing ... ";
        }
    }, 1000);
}

var timerDuration = 10;

