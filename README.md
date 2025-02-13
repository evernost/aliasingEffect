# aliasingEffect
Deep dive into a _controlled_ aliasing effect, and explore the consequences in realtime.

## Content
The projet is an offline HTML page with some Javascript under the hood for the sound generation.

It is a great educating tool to play around with additive synthesis, but it is also pretty cool to explore some _weird_ effects affecting the spectrum.

## What does it do?
The app generates sound using additive synthesis: once you have set the fundamental frequency, you can:
- configure the number of harmonics (up to 30)
- configure how the amplitude of the harmonics decays as they get higher in frequency
- define a "wiggle": how much (in percentage) the frequency of an harmonic deviates from its pure theoretical frequency

And most importantly: 
- configure a **reflection** frequency

Just like the good old aliasing in digital sampling, here you can set a _limit_ frequency beyond which any harmonic will be reflected.

More formally: f_new = 2*f_s - f_old where f_s is the limit frequency you have set.

Similarly, reflected frequencies going below 0 Hz will be reflected back and so on, like 2 mirrors facing each other.

Setting the frequency of the lower reflection will come soon.

## Advanced options
The interface has a "Lock upper reflection" option.

When the option is enabled, the upper reflection frequency will adjust automatically as you change the fundamental frequency.

Use this option when you want to hear the sound at a different pitch, while preserving the harmonic structure.


## Projet status 

The project is still **massively** under construction. The main features work, but the interface might feel odd and clunky.

Also, I tend to add features as inspiration and ideas come, which can lead to chaotic design.

The list of TODO below gives some ideas about the whereabouts of the project.

## TODO / ideas

- [X] add the possibility (somehow) to sync the upper aliasing frequency with the fundamental, thus preserving the spectrum when the fundamental changes.
- [ ] show the reflection order with a color code.
- [ ] add the possibility to snap the higher harmonics to a frequency with a simpler ratio.
- [ ] add an envelope generator, swinging the upper reflection between two tuned values
- [ ] add an envelope generator for the amplitude
- [ ] read MIDI inputs (if possible)

