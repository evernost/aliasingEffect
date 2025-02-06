let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillators = [];
let gains = [];
let masterGain = audioCtx.createGain();

let isPlaying = false;

const canvas = document.getElementById('spectrumCanvas');
const ctx = canvas.getContext('2d');

const N_MAX_HARMONICS = 20;
const REF_LEVEL = 0.05;



class BounceLine
{
  constructor(x0, y0, x1, y1) 
  {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.isDragging = false;
  }

  isMouseNearLine(mx, my) 
  {
      const dist = Math.abs((this.y1 - this.y0) * mx - (this.x1 - this.x0) * my + this.x1 * this.y0 - this.y1 * this.x0) /
                   Math.sqrt((this.y1 - this.y0) ** 2 + (this.x1 - this.x0) ** 2);
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

  move(dx, dy) 
  {
    this.x0 += dx;
    this.y0 += dy;
    this.x1 += dx;
    this.y1 += dy;
  }
}


let lowBounceLine = new BounceLine(100, 0, 100, canvas.height);
let highBounceLine = new BounceLine(canvas.width - 100, 0, canvas.width - 100, canvas.height);



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
          // gains[i].gain.setValueAtTime(0.0, audioCtx.currentTime);
          gains[i].gain.value = 0.0;
        }
        else
        {
          // gains[i].gain.setValueAtTime(REF_LEVEL*Math.pow(1.0 / (i+1), decaySlider.value), audioCtx.currentTime);
          gains[i].gain.value = REF_LEVEL*Math.pow(1.0 / (i+1), decaySlider.value)
        }
      }
      else
      {
        // gains[i].gain.setValueAtTime(0.0, audioCtx.currentTime);
        gains[i].gain.value = 0.0;
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



canvas.addEventListener('mousedown', (e) => 
  {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (lowBounceLine.isMouseNearLine(mouseX, mouseY)) 
    {
      // selectedLine = line;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      lowBounceLine.isDragging = true;
    }
  }
);

canvas.addEventListener('mousemove', (e) => 
  {
    if (lowBounceLine.isDragging)
    {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
    
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
    
      lowBounceLine.move(dx, dy);
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    
      lowBounceLine.draw();
    }

    
  }
);

canvas.addEventListener('mouseup', () => {
  selectedLine = null;
});
















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
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);

  for (let i = 0; i < N_MAX_HARMONICS; i++)
  {
    if (i <= harmonicsSlider.value)
    {
      let level = gains[i].gain.value*100/REF_LEVEL
      drawOvertone((i+1)*50, canvas.height / 2, (canvas.height / 2) - level, 'green', 2);
    }
  }

  // Draw the axis
  lowBounceLine.draw();
  highBounceLine.draw();
}

