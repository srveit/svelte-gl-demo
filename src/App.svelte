<script>
 import { onMount } from 'svelte';
 import * as GL from '@sveltejs/gl';
 import Cube from './Cube.svelte';

 export let color = '#ff3e00';
 let w = 1;
 let h = 1;
 let d = 1;
 let radius = 0.2;

 const from_hex = hex => parseInt(hex.slice(1), 16);

 const light = {
     x: 3,
     y: 4.5,
     z: 3
 };

 onMount(() => {
     let frame;

     const loop = () => {
   frame = requestAnimationFrame(loop);

         /* light.x = 3 * Math.sin(Date.now() * 0.001);
          * light.y = 2.5 + 2 * Math.sin(Date.now() * 0.0004);
          * light.z = 3 * Math.cos(Date.now() * 0.002);*/
     };

     loop();

     return () => cancelAnimationFrame(frame);
 });
</script>

<GL.Scene>
  <GL.Target id="center" location={[0, h/2, 0]}/>

  <GL.OrbitControls maxPolarAngle={Math.PI} let:location>
    <GL.PerspectiveCamera {location} lookAt="center" near={0.01} far={1000}/>
  </GL.OrbitControls>

  <GL.AmbientLight intensity={0.3}/>
  <GL.DirectionalLight direction={[-1,-1,-1]} intensity={0.5}/>

  <!-- floor -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[0,-0.01,0]}
    rotation={[-90,0,0]}
    scale={10}
    uniforms={{ color: 0xffffff }}
  />


  <Cube
    location={[0, h/2, 0]}
    scale={[w,h,d]}
    radius={radius}
    uniforms={{ color: 0x8080ff, alpha: 1.0 }}
  />

  <!-- spheres
       <GL.Mesh
       geometry={GL.sphere({ turns: 26, bands: 26, turns_chord: 0.25, bands_chord: 0.5 })}
       location={[-0.5, 1.0, 1.2]}
    scale={2.0}
    uniforms={{ color: 0xa8ee56, alpha: 1.0 }}
  />
     -->
  <!-- moving light -->
  <GL.Group location={[light.x,light.y,light.z]}>

    <GL.PointLight
      location={[0,0,0]}
      color={0xffffff}
      intensity={0.6}
    />
  </GL.Group>
</GL.Scene>

<div class="controls">
  <label>
    <input type="color" style="height: 40px" bind:value={color}>
  </label>

  <label>
    <input type="range" bind:value={w} min={0.1} max={5} step={0.1}> width ({w})
  </label>

  <label>
    <input type="range" bind:value={h} min={0.1} max={5} step={0.1}> height ({h})
  </label>

  <label>
    <input type="range" bind:value={d} min={0.1} max={5} step={0.1}> depth ({d})
  </label>
</div>

<style>
  .controls {
    position: absolute;
    top: 1em;
    left: 1em;
    background-color: rgba(255,255,255,0.7);
    padding: 1em;
    border-radius: 2px;
  }
</style>
