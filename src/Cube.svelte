<script>
 import * as GL from '@sveltejs/gl';
 import CubeFace from './CubeFace.svelte';

 export let location = [0, 0, 0];
 export let scale = 1;
 export let radius = 0;
 export let uniforms = {};

 const faces = [
     {
         location: [1.0, 0.0, 0.0],
         rotation: [90, 0, 90],
         corners: true
     },
     {
         location: [0.0, 0.0, 0.0],
         rotation: [90, 0, -90],
         corners: true
     },
     {
         location: [0.5, 0.0, 0.5],
         rotation: [0, 0, 0],
         corners: false
     },
     {
         location: [0.5, 0.5, 0.0],
         rotation: [-90, 90, 0],
         corners: false
     },
     {
         location: [0.5, 0.0, -0.5],
         rotation: [0, 180, 0],
         corners: false
     },
     {
         location: [0.5, -0.5, 0.0],
         rotation: [90, -90, 0],
         corners: false
     }
 ];
 
 const from_hex = hex => parseInt(hex.slice(1), 16);
</script>

<GL.Group
  location={location}
  scale={scale}>

  {#each faces as face}

  <CubeFace
      location={face.location}
      rotation={face.rotation}
      uniforms={uniforms}
      radius={radius}
      corners={face.corners}
  />
  {/each}

</GL.Group>
