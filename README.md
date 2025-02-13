# aliasingEffect
Deep dive into a _controlled_ aliasing effect, and explore the consequences in realtime.

## Content
The projet is an offline HTML page with some Javascript under the hood for the sound generation.

It is a great educating tool to play around with additive synthesis, but it is also pretty cool to explore some _weird_ effects affecting the spectrum.

## What does it do?
The app generates sound using additive synthesis: once you have set the fundamental frequency, you can:
- configure the **number of harmonics** (up to 30)
- configure how the amplitude of the harmonics **decays** as they get higher in frequency
- define a **"wiggle"**: how much (in percentage) the frequency of an harmonic deviates from its pure theoretical frequency

And most importantly: 
- configure a **reflection** frequency

Just like the good old aliasing in digital sampling, here you can set a _limit_ frequency beyond which any harmonic will be reflected.

More formally: ```f_new = 2*f_s - f_old``` where ```f_s``` is the limit frequency you have set, ```f_old``` and ```f_new``` the frequency of the harmonic before and after reflection.

Similarly, reflected frequencies going below 0 Hz will be reflected back and so on, like 2 mirrors facing each other.

You can set the upper reflector by simply dragging & dropping the dashed line. Check out on the demo below.

Setting the frequency of the lower reflection will come soon.

## Visual demo
![Animation](https://github.com/user-attachments/assets/6e32918e-9784-4732-90c7-6df0419b23d0)

The best part being that you try it for yourself. And you'll get the sound!

## Advanced options
The interface has a ```Lock upper reflection``` option.

When the option is enabled, the upper reflection frequency will adjust **automatically** as you change the fundamental frequency.

With this option, the harmonic structure and ratios are all preserved, which is handy when you just want to hear the sound at a different pitch. Without this option, changing the fundamental would change the entire distribution of harmonics since the upper reflection is fixed.


## Projet status 

The project is still **massively** under construction. The main features work, but the interface might feel odd and clunky.

Also, I tend to add features as inspiration and ideas come, which can lead to chaotic design. The project was mainly developed out of curiosity. I had no idea if anything interesting would come out of it.

The list of TODO below gives some ideas about the whereabouts of the project.

## TODO / ideas

- [X] add the possibility (somehow) to sync the upper aliasing frequency with the fundamental, thus preserving the spectrum when the fundamental changes.
- [ ] a right click on a slider resets its value.
- [ ] show the reflection order with a color code.
- [ ] add the possibility to snap the higher harmonics to a frequency with a simpler ratio.
- [ ] add an envelope generator, swinging the upper reflection between two tuned values
- [ ] add an envelope generator for the amplitude
- [ ] read MIDI inputs (if possible)

