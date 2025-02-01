let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let osc1 = null, osc2 = null, gainNode = null;
let isPlaying = false;

const N_MAX_HARMONICS = 20;

const freq1Slider = document.getElementById("freq1");
const freq2Slider = document.getElementById("freq2");
const freq1ValueDisplay = document.getElementById("freq1Value");
const freq2ValueDisplay = document.getElementById("freq2Value");
const startStopButton = document.getElementById("startStop");

function startOscillators() 
{
  if (!isPlaying) 
  {
    osc1 = audioCtx.createOscillator();
    osc2 = audioCtx.createOscillator();
    gainNode = audioCtx.createGain(); // To control volume if needed

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = freq1Slider.value;
    osc2.frequency.value = freq2Slider.value;

    // Mix the two oscillators by connecting them to the same gain node
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    isPlaying = true;
    startStopButton.textContent = "Stop";
  }
}

function stopOscillators() 
{
  if (isPlaying) 
  {
    osc1.stop();
    osc2.stop();
    osc1.disconnect();
    osc2.disconnect();
    gainNode.disconnect();
    isPlaying = false;
    startStopButton.textContent = "Start";
  }
}

f0Slider.addEventListener("input", 
  function() 
  {
    f0ValDisplay.textContent = f0Slider.value + ' Hz';
    if (isPlaying) 
    {
      osc1.frequency.setValueAtTime(f0Slider.value, audioCtx.currentTime);
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
    // if (isPlaying) 
    // {
    //   osc2.frequency.setValueAtTime(freq2Slider.value, audioCtx.currentTime);
    // }
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


