<script>
 import * as GL from '@sveltejs/gl';
 import CubeFace from './CubeFace.svelte';

 export let scale = 1;
 export let radius = 0;

 // pass to Group
 export let location = undefined;
 export let lookAt = undefined;
 export let up = undefined;
 export let rotation = undefined;
 // pass to CubeFaces
 export let vert = undefined;
 export let frag = undefined;
 export let uniforms = undefined;
 export let blend = undefined;
 export let depthTest = undefined;
 export let transparent = undefined;

 $: [w, h, d] = typeof scale === 'number' ? [scale, scale, scale] : scale;

 $: faces = [
     {
         name: 'right',
         location: [w * 0.5, 0.0, 0.0],
         rotation: [90, 0, 90],
         corners: false,
         scale: [h, d, 1]
     },
     {
         name: 'left',
         location: [-w * 0.5, 0.0, 0.0],
         rotation: [90, 0, -90],
         corners: false,
         scale: [h, d, 1]
     },
     {
         name: 'top',
         location: [0.0, h * 0.5, 0.0],
         rotation: [-90, 90, 0],
         corners: false,
         scale: [d, w, 1]
     },
     {
         name: 'bottom',
         location: [0.0, -h * 0.5, 0.0],
         rotation: [90, -90, 0],
         corners: false,
         scale: [d, w, 1]
     },
     {
         name: 'front',
         location: [0.0, 0.0, d * 0.5],
         rotation: [0, 0, 0],
         corners: true,
         scale: [w, h, 1]
     },
     {
         name: 'back',
         location: [0.0, 0.0, -d * 0.5],
         rotation: [0, 180, 0],
         corners: true,
         scale: [w, h, 1]
     }
 ];

</script>

<GL.Group
  location={location}
  lookAt={lookAt}
  up={up}
  rotation={rotation}
>

  {#each faces as face}

  <CubeFace
      corners={face.corners}
      radius={radius}
      location={face.location}
      rotation={face.rotation}
      scale={face.scale}
      name={face.name}
      vert={vert}
      frag={frag}
      uniforms={uniforms}
      blend={blend}
      depthTest={depthTest}
      transparent={transparent}
  />
  {/each}

</GL.Group>
