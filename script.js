let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillators = [];
let gains = [];
let masterGain = audioCtx.createGain();

let isPlaying = false;

const canvas = document.getElementById('spectrumCanvas');
const ctx = canvas.getContext('2d');

const N_MAX_HARMONICS = 20;
const REF_LEVEL = 0.01;



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
          gains[i].gain.setValueAtTime(0.0, audioCtx.currentTime);
        }
        else
        {
          gains[i].gain.setValueAtTime(REF_LEVEL*Math.pow(1.0 / (i+1), decaySlider.value), audioCtx.currentTime);
        }
      }
      else
      {
        gains[i].gain.setValueAtTime(0.0, audioCtx.currentTime);
      }
    }
    
    console.log('Slider:', decaySlider.value);
    console.log('gains[2] from <updateGains>:', gains[2].gain.value);
    console.log('Math.pow(1.0 / 3, decaySlider.value):', Math.pow(1.0 / (2+1), decaySlider.value));
  }

  drawSpectrum() 
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
        oscillators[i].frequency.setValueAtTime(freq, audioCtx.currentTime);
      }
    }
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

oddOnlyCheckbox.addEventListener("input", 
  function() 
  {
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


function drawOvertone(x, y1, y2, color = 'black', lineWidth = 2) 
{
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y2, 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}



function drawSpectrum() 
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);

  console.log('gains[2] from <drawSpectrum>:', gains[2].gain.value);

  for (let i = 0; i < N_MAX_HARMONICS; i++)
  {
    if (i <= harmonicsSlider.value)
    {
      let level = gains[i].gain.value*100/REF_LEVEL
      drawOvertone((i+1)*50, canvas.height / 2, (canvas.height / 2) - level, 'green', 2);
    }
  }

  // ctx.strokeStyle = 'blue';
  // ctx.stroke();

}

// drawSpectrum();

