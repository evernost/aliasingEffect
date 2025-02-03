let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillators = [];
let gains = [];
let masterGain = audioCtx.createGain();

let isPlaying = false;

const canvas = document.getElementById('spectrumCanvas');
const ctx = canvas.getContext('2d');

const N_MAX_HARMONICS = 20;



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
      
      if (i % 2 === 0)
      {
        if (oddOnlyCheckbox.checked)
        {
          gain.gain.value = 0.01*Math.pow(1 / (i+1), decaySlider.value);
        }
        else
        {
          gain.gain.value = 0.0;
        }
      }
      else
      {
        gain.gain.value = 0.01*Math.pow(1 / (i+1), decaySlider.value);
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
          gains[i].gain.setValueAtTime(0.01*Math.pow(1 / (i+1), decaySlider.value), audioCtx.currentTime);
        }
      }
      else
      {
        gains[i].gain.setValueAtTime(0.0, audioCtx.currentTime);
      }
    }
  }
}



if (isPlaying) 
  {
    if (oddOnlyCheckbox.checked)
    {
      for (let i = 1; i < N_MAX_HARMONICS; i+=2)
      {
        gains[i].gain.setValueAtTime(0.0, audioCtx.currentTime);
      }
    }
    else
    {
      for (let i = 0; i < N_MAX_HARMONICS; i++)
      {
        gains[i].gain.setValueAtTime(0.01*Math.pow(1 / (i+1), decaySlider.value), audioCtx.currentTime);
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
    if (isPlaying) 
    {
      for (let i = 0; i < N_MAX_HARMONICS; i++)
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
    updateGains()
    // if (isPlaying) 
    // {
    //   osc2.frequency.setValueAtTime(freq2Slider.value, audioCtx.currentTime);
    // }
  }
);

decaySlider.addEventListener("input", 
  function() 
  {
    decayValDisplay.textContent = '(1/n)^' + decaySlider.value;
    updateGains()
    // if (isPlaying) 
    // {
    //   for (let i = 0; i < 10; i++)
    //   {
    //     gains[i].gain.setValueAtTime(0.01*Math.pow(1 / (i+1), decaySlider.value), audioCtx.currentTime);
    //   }
    // }
  }
);

wiggleSlider.addEventListener("input", 
  function() 
  {
    wiggleValDisplay.textContent = wiggleSlider.value + '%';
    if (isPlaying) 
    {
      for (let i = 1; i < N_MAX_HARMONICS; i++)
      {
        if (i % 2 === 0)
        {
          oscillators[i].frequency.setValueAtTime(f0Slider.value*(i+1)*(1 + 0.01*wiggleSlider.value), audioCtx.currentTime);
        }
        else 
        {
          oscillators[i].frequency.setValueAtTime(f0Slider.value*(i+1)*(1 - 0.01*wiggleSlider.value), audioCtx.currentTime);
        }
          
      }
    }
  }
);

oddOnlyCheckbox.addEventListener("input", 
  function() 
  {
    updateGains()
    // if (isPlaying) 
    // {
    //   if (oddOnlyCheckbox.checked)
    //   {
    //     for (let i = 1; i < N_MAX_HARMONICS; i+=2)
    //     {
    //       gains[i].gain.setValueAtTime(0.0, audioCtx.currentTime);
    //     }
    //   }
    //   else
    //   {
    //     for (let i = 0; i < N_MAX_HARMONICS; i++)
    //     {
    //       gains[i].gain.setValueAtTime(0.01*Math.pow(1 / (i+1), decaySlider.value), audioCtx.currentTime);
    //     }
    //   } 
    // }
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


function drawSpectrum() 
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);

  const time = audioCtx.currentTime;
  for (let x = 0; x < canvas.width; x++) 
    {
      let y = 0;
      oscillators.forEach((oscillator, index) => {
          y += 10*Math.sin(2 * Math.PI * oscillator.frequency.value * (x / canvas.width) + time) * gains[index].gain.value;
      });
      ctx.lineTo(x, canvas.height / 2 + y * canvas.height / 4);
  }

  ctx.strokeStyle = 'blue';
  ctx.stroke();


  requestAnimationFrame(drawSpectrum);
}

drawSpectrum();

