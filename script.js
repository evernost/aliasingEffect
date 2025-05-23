// ============================================================================
// Project       : aliasingEffect
// Module name   : -
// File name     : script.js
// File type     : Javascript
// Purpose       : application entry point
// Author        : QuBi (nitrogenium@outlook.fr)
// Creation date : Friday, 31 January 2025
// ----------------------------------------------------------------------------
// Best viewed with space indentation (2 spaces)
// ============================================================================

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillators = [];
let gains = [];
let masterGain = audioCtx.createGain();

let isPlaying = false;

const canvas = document.getElementById('spectrumCanvas');
const ctx = canvas.getContext('2d');

const N_MAX_HARMONICS = 30;
const REF_LEVEL = 0.05;

const DISPLAY_FMAX = 4000.0;
const DISPLAY_FMIN = -100.0;

let lockRatio = 1.0;


if (navigator.requestMIDIAccess) 
{
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} 
else
{
  console.error("Web MIDI API is not supported in your browser.");
}


class BounceLine
{
  constructor(frequency, y0, y1) 
  {
    this.frequency = frequency;
    this.x0 = freqToCoord_X(frequency);
    this.y0 = y0;
    this.x1 = freqToCoord_X(frequency);
    this.y1 = y1;
    this.isDragging = false;
  }

  isMouseNearLine(mx) 
  {
    const dist = Math.abs(this.x0 - mx);
    return dist < 10;
  }

  draw() 
  {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(this.x0, this.y0);
    ctx.lineTo(this.x1, this.y1);
    ctx.stroke();
  }

  move(dx) 
  {
    this.x0 += dx;
    this.x1 += dx;
    this.frequency += dx*(DISPLAY_FMAX - DISPLAY_FMIN)/canvas.width;
  }

  setFrequency(f)
  {
    this.x0 = freqToCoord_X(f);
    this.x1 = freqToCoord_X(f);
    this.frequency  = f;
  }
}

let lowerBounceLine = new BounceLine(0, 0, canvas.height);
let upperBounceLine = new BounceLine(3000, 0, canvas.height);



// ============================================================================
// MAIN CODE
// ============================================================================
function startOscillators() 
{
  if (!isPlaying) 
  {
    for (let i = 0; i < N_MAX_HARMONICS; i++)
    {
      let osc = audioCtx.createOscillator();
      let gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.value = f0Slider.value*(i+1);
      
      if (i <= harmonicsSlider.value)
      {
        if (oddOnlyCheckbox.checked && (i % 2 === 1))
        {
          gain.gain.value = 0.0;
        }
        else
        {
          gain.gain.value = REF_LEVEL*Math.pow(1 / (i+1), decaySlider.value);
        }
      }
      else
      {
        gain.gain.value = 0.0;
      }

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();

      oscillators.push(osc);
      gains.push(gain);
    }
    
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = volSlider.value;

    isPlaying = true;
    startStop.textContent = "Stop";
    drawSpectrum()
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

    oscillators = [];
    gains = [];

    isPlaying = false;
    startStop.textContent = "Start";
  }
}



function updateGains()
{
  if (isPlaying)
  {
    for (let i = 0; i < N_MAX_HARMONICS; i++)
    {
      if (i <= harmonicsSlider.value)
      {
        if (oddOnlyCheckbox.checked && (i % 2 === 1))
        {
          gains[i].gain.value = 0.0;
        }
        else
        {
          gains[i].gain.value = REF_LEVEL*Math.pow(1.0 / (i+1), decaySlider.value);

          // Apply the comb filter transfer function
          let alpha = combFeedbackSlider.value;
          let f = combFreqSlider.value;
          gains[i].gain.value = Math.sqrt(1 + alpha*alpha + 2*alpha*Math.cos(2*Math.PI*f*i)) * gains[i].gain.value;
        }
      }
      else
      {
        gains[i].gain.value = 0.0;
      }
    }
  }

  drawSpectrum();
}

function updateFrequencies()
{
  if (isPlaying)
  {
    for (let i = 0; i < N_MAX_HARMONICS; i++)
    {
      if (i <= harmonicsSlider.value)
      {
        let freq = 0.0;
        if (i === 0)
        {
          freq = f0Slider.value;
        }
        else
        {
          if (i % 2 === 0)
          {
            freq = f0Slider.value*(i+1)*(1 + 0.01*wiggleSlider.value/i);
          }
          else
          {
            freq = f0Slider.value*(i+1)*(1 - 0.01*wiggleSlider.value/i);
          }
        }
                
        // Reflect harmonics
        while ((freq < 0) || (freq > upperBounceLine.frequency))
        {
          if (freq > upperBounceLine.frequency)
          {
            freq = (2*upperBounceLine.frequency) - freq;
          }
          if (freq < 0)
          {
            freq = 0.0 - freq;
          } 
        }

        oscillators[i].frequency.value = freq;
      }
    }

    drawSpectrum();
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
      masterGain.gain.value = volSlider.value;
    }
  }
);

f0Slider.addEventListener("input", 
  function() 
  {
    f0ValDisplay.textContent = f0Slider.value + ' Hz';
    
    if (upperMirrorLockCheckbox.checked)
    {
      upperBounceLine.setFrequency(f0Slider.value*lockRatio);
    }
    
    
    updateFrequencies()
  }
);

harmonicsSlider.addEventListener("input", 
  function() 
  {
    harmonicsValDisplay.textContent = harmonicsSlider.value;
    updateFrequencies()
    updateGains()
  }
);

decaySlider.addEventListener("input", 
  function() 
  {
    decayValDisplay.textContent = '(1/n)^' + decaySlider.value;
    updateGains()
  }
);

wiggleSlider.addEventListener("input", 
  function() 
  {
    wiggleValDisplay.textContent = wiggleSlider.value + '%';
    updateFrequencies()
  }
);

combFeedbackSlider.addEventListener("input", 
  function() 
  {
    combFeedbackDisplay.textContent = combFeedbackSlider.value;
    updateGains()
  }
);

combFreqSlider.addEventListener("input", 
  function() 
  {
    combFreqDisplay.textContent = combFreqSlider.value;
    updateGains()
  }
);

oddOnlyCheckbox.addEventListener("input", 
  function() 
  {
    updateGains()
  }
);

// lowerMirrorCheckbox.addEventListener("input", 
//   function() 
//   {
//     TODO!
//   }
// );

// upperMirrorCheckbox.addEventListener("input", 
//   function() 
//   {
//     TODO!
//   }
// );

upperMirrorLockCheckbox.addEventListener("input", 
  function() 
  {
    lockRatio = upperBounceLine.frequency / f0Slider.value;
    updateGains()
  }
);

startStop.addEventListener("click", 
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



canvas.addEventListener('mousedown', (e) => 
  {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (upperBounceLine.isMouseNearLine(mouseX)) 
    {
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      upperBounceLine.isDragging = true;
    }
  }
);

canvas.addEventListener('mousemove', (e) => 
  {
    if (upperBounceLine.isDragging)
    {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
    
      const dx = mouseX - lastMouseX;
    
      upperBounceLine.move(dx);
      lastMouseX = mouseX;
    
      drawSpectrum()
      updateFrequencies()
    }
  }
);

canvas.addEventListener('mouseup', () => 
  {
    upperBounceLine.isDragging = false;
  }
);



function drawOvertone(x, y1, y2, color = 'black', lineWidth = 2) 
{
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y2, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'blue';
  ctx.fill();
  ctx.closePath();
}



function drawSpectrum() 
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the overtones
  for (let i = 0; i < N_MAX_HARMONICS; i++)
  {
    if (i <= harmonicsSlider.value)
    {
      let level = gains[i].gain.value*200/REF_LEVEL;
      coordX = freqToCoord_X(oscillators[i].frequency.value);
      drawOvertone(coordX, canvas.height / 2, (canvas.height / 2) - level, 'green', 2);
    }
  }

  // Draw the reflectors
  lowerBounceLine.draw();
  upperBounceLine.draw();
}

function freqToCoord_X(frequency)
{
  const x = canvas.width*(frequency - DISPLAY_FMIN)/(DISPLAY_FMAX - DISPLAY_FMIN);
  return x;
}


// ============================================================================
// MIDI MANAGEMENT FUNCTION
// ============================================================================
function onMIDISuccess(midiAccess) 
{
  const inputs = midiAccess.inputs;
  
  let lastNoteFrequency = null;
  
  inputs.forEach((input) => {
    console.log(`Input: ${input.name}`);
    input.onmidimessage = onMIDIMessage;
  });
}


function onMIDIFailure() 
{
  console.error("Could not access your MIDI devices.");
}


function onMIDIMessage(event)
{
  const [command, note, velocity] = event.data;
  
  if ((command & 0xf0) === 0x90 && velocity > 0) 
  {
    const frequency = 440 * Math.pow(2, (note - 69) / 12);
    console.log(`Frequency: ${frequency.toFixed(2)} Hz`);
    
    lastNoteFrequency = frequency;
    f0Slider.value = frequency;
    
    
    if (upperMirrorLockCheckbox.checked)
    {
      upperBounceLine.setFrequency(f0Slider.value*lockRatio);
    }
    
    updateFrequencies()
  }
}