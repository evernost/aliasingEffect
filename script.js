let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillators = [];
let gains = [];
let masterGain = audioCtx.createGain();
let isPlaying = false;

const N_MAX_HARMONICS = 20;

// const freq1Slider = document.getElementById("freq1");
// const freq2Slider = document.getElementById("freq2");
// const freq1ValueDisplay = document.getElementById("freq1Value");
// const freq2ValueDisplay = document.getElementById("freq2Value");
const startStopButton = document.getElementById("startStop");

function startOscillators() 
{
  if (!isPlaying) 
  {
    for (let i = 0; i < 10; i++)
    {
      let osc = audioCtx.createOscillator();
      let gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.value = f0Slider.value*(i+1);
      gain.gain.value = 0.01;

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();

      oscillators.push(osc);
      gains.push(gain);
    }
    
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = volSlider.value;

    isPlaying = true;
    startStopButton.textContent = "Stop";
  }
}

function stopOscillators() 
{
  if (isPlaying) 
  {
    oscillators.forEach((osc, index) => 
    {
      osc.stop();
      osc.disconnect();
      gains[index].disconnect();
    }
    );

    // Clear arrays
    oscillators = [];
    gains = [];

    isPlaying = false;
    startStopButton.textContent = "Start";
    
    
    // osc1.stop();
    // osc2.stop();
    // osc1.disconnect();
    // osc2.disconnect();
    // gainNode.disconnect();
    // isPlaying = false;
    // startStopButton.textContent = "Start";
  }
}



// ============================================================================
// EVENT LISTENERS
// ============================================================================
volSlider.addEventListener("input", 
  function() 
  {
    volSliderDisplay.textContent = volSlider.value;
    if (isPlaying) 
    {
      masterGain.gain.setValueAtTime(volSlider.value, audioCtx.currentTime);
    }
  }
);

f0Slider.addEventListener("input", 
  function() 
  {
    f0ValDisplay.textContent = f0Slider.value + ' Hz';
    if (isPlaying) 
    {
      for (let i = 0; i < 10; i++)
      {
        oscillators[i].frequency.setValueAtTime(f0Slider.value*(i+1), audioCtx.currentTime);
      }
    }
  }
);

harmonicsSlider.addEventListener("input", 
  function() 
  {
    harmonicsValDisplay.textContent = harmonicsSlider.value;
    if (isPlaying) 
    {
      osc2.frequency.setValueAtTime(freq2Slider.value, audioCtx.currentTime);
    }
  }
);

decaySlider.addEventListener("input", 
  function() 
  {
    decayValDisplay.textContent = '(1/n)^' + decaySlider.value;
    if (isPlaying) 
    {
      for (let i = 0; i < 10; i++)
      {
        gains[i].gain.setValueAtTime(0.01*Math.pow(1 / (i+1), decaySlider.value), audioCtx.currentTime);
      }
    }
  }
);

startStopButton.addEventListener("click", 
  function() 
  {
    if (isPlaying) 
    {
      stopOscillators();
    }
    else 
    {
      startOscillators();
    }
  }
);


