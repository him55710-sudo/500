// All default sounds are synthesized original effects. Personal music stays on this device.
export class Soundscape {
 constructor(){this.ctx=null;this.volume=.65;this.muted=false;this.musicActive=false;this.musicFile=null;this.beat=0;this.nextBeat=0;this.clockAt=0;this.sourcePos={x:-4.62,y:1.4,z:1.65};}
 async start(){
  if(!this.ctx){
   this.ctx=new AudioContext();const c=this.ctx;
   this.master=c.createGain();this.master.gain.value=this.volume;
   const compressor=c.createDynamicsCompressor();compressor.threshold.value=-12;compressor.ratio.value=5;this.master.connect(compressor);compressor.connect(c.destination);
   this.musicGain=c.createGain();this.musicGain.gain.value=.22;
   this.panner=c.createPanner();this.panner.panningModel='HRTF';this.panner.distanceModel='inverse';this.panner.refDistance=2;this.panner.maxDistance=20;this.panner.rolloffFactor=.65;this.panner.positionX.value=this.sourcePos.x;this.panner.positionY.value=this.sourcePos.y;this.panner.positionZ.value=this.sourcePos.z;this.musicGain.connect(this.panner);this.panner.connect(this.master);
   const len=c.sampleRate*6;const b=c.createBuffer(2,len,c.sampleRate);
   for(let ch=0;ch<2;ch++){let last=0;const d=b.getChannelData(ch);for(let i=0;i<len;i++){last=(last+(Math.random()*2-1)*.035)/1.02;d[i]=last;}}
   const rain=c.createBufferSource();rain.buffer=b;rain.loop=true;const filter=c.createBiquadFilter();filter.type='highpass';filter.frequency.value=450;const gain=c.createGain();gain.gain.value=.22;rain.connect(filter);filter.connect(gain);gain.connect(this.master);rain.start();this.rain=rain;this.ambienceGain=gain;this.ambienceFilter=filter;
  }
  if(this.ctx.state==='suspended')await this.ctx.resume();
 }
 setVolume(v){this.volume=v;if(this.master)this.master.gain.setTargetAtTime(this.muted?0:v,this.ctx.currentTime,.08);}
 setHeaven(v){
  this.heaven=v;this.heavenMusic=v;this.heavenBeat=0;this.heavenAt=0;
  if(v){this.musicActive=false;this.musicFile?.pause();if(this.ctx){this.ambienceFilter.type='lowpass';this.ambienceFilter.frequency.value=680;this.ambienceGain.gain.setTargetAtTime(.07,this.ctx.currentTime,1);this.panner.positionX.value=4.01;this.panner.positionY.value=1.5;this.panner.positionZ.value=4.6;}this.effect('chime');}
 }
 setMuted(v){this.muted=v;this.setVolume(this.volume);}
 setKitchen(v){this.kitchen=v;if(v){this.setRide(false);this.setHeaven(false);this.musicActive=false;this.musicFile?.pause();if(this.ctx){this.ambienceFilter.type='lowpass';this.ambienceFilter.frequency.value=350;this.ambienceGain.gain.setTargetAtTime(.025,this.ctx.currentTime,.3);}}}
 setRide(v){
  this.riding=v;this.rideBeat=0;
  if(v){this.heaven=false;this.musicActive=false;this.musicFile?.pause();if(this.ctx){this.ambienceFilter.type='lowpass';this.ambienceFilter.frequency.value=550;this.ambienceGain.gain.setTargetAtTime(.06,this.ctx.currentTime,.4);}}
 }
 updateRide(speed,phase,dt){
  if(!this.ctx||this.paused||!this.riding)return;
  this.ambienceGain.gain.setTargetAtTime(.06+speed*.018,this.ctx.currentTime,.18);this.ambienceFilter.frequency.setTargetAtTime(380+speed*80,this.ctx.currentTime,.18);
  this.rideBeat-=dt;if(this.rideBeat<=0&&speed>0){this.rideBeat=phase==='lift'?.17:Math.max(.09,1.8/speed);this.noise(.035,phase==='lift'?.065:.035,phase==='lift'?1500:460);if(phase==='lift')this.tone(170,.035,.014,'triangle');}
 }
 pause(v){this.paused=v; if(this.ctx){if(v){this.ctx.suspend();this.musicFile?.pause();}else{this.ctx.resume();if(this.musicActive)this.musicFile?.play().catch(()=>{});}}}
 tone(freq,duration=.15,volume=.1,type='sine',delay=0,target){
  if(!this.ctx)return;const c=this.ctx,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(target||this.master);o.start(t);o.stop(t+duration+.02);
 }
 noise(duration=.12,vol=.08,freq=1200){
  if(!this.ctx)return;const c=this.ctx,b=c.createBuffer(1,Math.floor(c.sampleRate*duration),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=freq;g.gain.value=vol;s.connect(f);f.connect(g);g.connect(this.master);s.start();
 }
 effect(name){
  if(name==='power'){this.noise(.08,.12,1100);this.tone(110,.35,.04,'sine');[440,660,880].forEach((f,i)=>this.tone(f,.3,.035,'sine',i*.08));}
  if(name==='sizzle'){this.noise(.65,.12,3400);this.noise(.18,.06,1700);}
  if(name==='chop'){[0,.13,.26].forEach(t=>this.tone(170,.055,.08,'triangle',t));}
  if(name==='wash')this.noise(.6,.09,2500);
  if(name==='order'){this.tone(659,.18,.065,'sine');this.tone(880,.4,.06,'sine',.15);}
  if(name==='doorbell'){this.tone(784,.7,.08,'sine');this.tone(622,.9,.07,'sine',.36);}
  if(name==='chime'){[523.25,659.25,783.99,1046.5].forEach((f,i)=>{this.tone(f,1.8,.055,'sine',i*.16);this.tone(f*2,.6,.009,'sine',i*.16);});}
  if(name==='dial'){this.noise(.035,.12,2600);this.tone(710,.04,.018,'triangle');}
  if(name==='step'){this.noise(.105,.15,230);this.tone(75,.065,.03,'sine');}
  if(name==='error'){this.tone(164,.17,.075,'triangle');this.tone(155,.2,.06,'triangle',.12);}
  if(name==='reveal'||name==='hatch'){this.noise(.44,.19,480);this.tone(95,.4,.1,'triangle');this.tone(830,.15,.05,'triangle',.2);}
  if(name==='success'||name==='painting'||name==='steaks'){[523,659,784].forEach((f,i)=>this.tone(f,.7,.07,'sine',i*.12));}
  if(name==='door'){this.noise(.8,.15,340);[262,330,392,523].forEach((f,i)=>this.tone(f,1.8,.08,'sine',i*.19));}
  if(name==='taste'){this.noise(.12,.055,1700);this.tone(920,.08,.015);}
  if(name==='scare'){this.noise(.24,.22,900);this.tone(70,.45,.10,'sine');}
  if(name==='paper'){this.noise(.28,.06,2700);}
 }
 startMusic(){this.musicActive=true;this.nextBeat=0;if(this.musicFile)this.musicFile.play().catch(()=>{});}
 async loadMusic(file){
  await this.start();if(this.musicFile){this.musicFile.pause();URL.revokeObjectURL(this.musicFile.src);this.mediaSource?.disconnect();}
  this.musicFile=new Audio(URL.createObjectURL(file));this.musicFile.loop=true;this.mediaSource=this.ctx.createMediaElementSource(this.musicFile);this.mediaSource.connect(this.musicGain);if(this.musicActive)this.musicFile.play().catch(()=>{});
 }
 update(pos,forward,time){
  if(!this.ctx||this.paused)return;const l=this.ctx.listener;
  if(l.positionX){l.positionX.value=pos.x;l.positionY.value=pos.y;l.positionZ.value=pos.z;l.forwardX.value=forward.x;l.forwardY.value=forward.y;l.forwardZ.value=forward.z;l.upY.value=1;}
  if(!this.heaven&&!this.riding&&!this.kitchen&&time>this.clockAt){this.clockAt=time+1;this.noise(.012,.019,2000);}
  if(this.heaven&&this.heavenMusic&&this.ctx.currentTime>=this.heavenAt){
   this.heavenAt=this.ctx.currentTime+.66;const melody=[72,76,79,84,81,79,76,0,74,77,81,86,84,81,79,0];const note=melody[this.heavenBeat++%melody.length];
   if(note){const f=440*2**((note-69)/12);this.tone(f,2,.15,'sine',0,this.musicGain);this.tone(f*2,.8,.026,'sine',0,this.musicGain);}
  }
  // Original gentle 3/4 placeholder, explicitly identified in the UI; never impersonates the requested recording.
  if(this.musicActive&&!this.musicFile&&this.ctx.currentTime>=this.nextBeat){
   this.nextBeat=this.ctx.currentTime+.36;
   const melody=[76,0,79,74,0,77,72,76,79,71,74,77,69,72,76,67,71,74,69,72,76,71,74,0];
   const note=melody[this.beat%melody.length];if(note)this.tone(440*2**((note-69)/12),.75,.11,'triangle',0,this.musicGain);
   const bass=[48,53,50,55][Math.floor(this.beat/6)%4];this.tone(440*2**(((this.beat%3===0?bass:bass+12)-69)/12),.48,.12,'sine',0,this.musicGain);this.beat++;
  }
 }
}
