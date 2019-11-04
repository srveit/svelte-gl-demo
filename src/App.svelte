<script>
 import { onMount } from 'svelte';
 import * as GL from '@sveltejs/gl';
 import Cube from './Cube.svelte';
 import LabeledCube from './LabeledCube.svelte';

 export let color = '#ff3e00';
 export let name = 'App';
 let w = 1;
 let h = 1;
 let d = 1;
 let radius = 0.06;
 let margin = 0.08;
 let move_light = false;
 let show_light = false;
 let show_labeled = false;
 let light_color = '#ffffff';

 const from_hex = hex => parseInt(hex.slice(1), 16);

 const light = {
     x: 3,
     y: 4.5,
     z: 3
 };

 const label_uniforms = {
     front:  {color: 0xf1f5fe, specularity: 0.3}, // white
     left:   {color: 0x8080ff, specularity: 0.3}, // blue
     top:    {color: 0xd4001e, specularity: 0.3}, // red
     right:  {color: 0x008452, specularity: 0.3}, // green
     bottom: {color: 0xf46c3a, specularity: 0.3}, // orange
     back:   {color: 0xf7e42d, specularity: 0.3}  // yellow
 };

 onMount(() => {
     let frame;

     const loop = () => {
   frame = requestAnimationFrame(loop);

         if (move_light) {
             light.x = 3 * Math.sin(Date.now() * 0.001);
             light.y = 2.5 + 2 * Math.sin(Date.now() * 0.0004);
             light.z = 3 * Math.cos(Date.now() * 0.002);
         }
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

  <GL.AmbientLight intensity={0.5}/>
  <GL.DirectionalLight direction={[-1,-1,-1]} intensity={0.5}/>

  <!-- floor -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[0,-0.01,0]}
    rotation={[-90,0,0]}
    scale={10}
    uniforms={{ color: 0xffffff }}
  />

  {#if show_labeled}
    <LabeledCube
      location={[0, h/2, 0]}
      rotation={[0,20,0]}
      scale={[w,h,d]}
      radius={radius}
      margin={margin}
      label_uniforms={label_uniforms}
      uniforms={{ color: 0x101010, specularity: 0.4, alpha: 1.0 }}
    />
  {:else}
    <Cube
      location={[0, h/2, 0]}
      rotation={[0,20,0]}
      scale={[w,h,d]}
      radius={radius}
      uniforms={{ color: from_hex(color), alpha: 1.0 }}
    />
  {/if}
  <!-- moving light -->
  <GL.Group location={[light.x,light.y,light.z]}>
    {#if show_light}
      <GL.Mesh
        geometry={GL.sphere({ turns: 36, bands: 36 })}
        location={[0,0.2,0]}
        scale={0.1}
	uniforms={{ color: from_hex(light_color), emissive: 0xcccc99 }}
      />
    {/if}
    <GL.PointLight
      location={[0,0,0]}
      color={from_hex(light_color)}
      intensity={0.6}
    />
  </GL.Group>
</GL.Scene>

<div class="controls">
  <label>
    <input type="color" style="height: 40px" bind:value={color}> box ({color})
  </label>
  <label>
    <input type="color" style="height: 40px" bind:value={light_color}> light ({light_color})
  </label>
  <label>
    <input type="checkbox" bind:checked={show_light} /> Show light?
  </label>
  <label>
    <input type="checkbox" bind:checked={move_light} /> Move light?
  </label>
  <label>
    <input type="checkbox" bind:checked={show_labeled} /> Labeled?
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

  <label>
    <input type="range" bind:value={radius} min={0.01} max={0.5} step={0.01}> radius ({radius})
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
