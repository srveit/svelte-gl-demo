<script>
 import * as GL from '@sveltejs/gl';
 import CubeFace from './CubeFace.svelte';

 export let location = [0, 0.5, 0],
            radius = 0.2;
 const h = 1,
       w = 1,
       d = 1,
       color = '#ff3e00',
       faces = [
           {
               location: [0.5, 0.0, -0.5],
               rotation: [0, 0, 0]
           }
       ];
 
 const from_hex = hex => parseInt(hex.slice(1), 16);
</script>

<GL.Mesh
    geometry={GL.box()}
    location={[0,h/2,0]}
    rotation={[0,0,0]}
    scale={[w,h,d]}
    uniforms={{ color: from_hex(color) }}
/>

<GL.Group location={location}>

  {#each faces as face}

  <CubeFace
      radius={radius}
  />
  <GL.Mesh
    geometry={GL.cylinder({ turns: 26, bands: 1, turns_chord: 0.25 })}
    location={edge.location}
    scale={1.0}
    uniforms={{ color: 0xa8ee56, alpha: 1.0 }}
  />
  {/each}
</GL.Group>
