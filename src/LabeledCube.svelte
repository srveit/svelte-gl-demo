<script>
  import * as GL from '@sveltejs/gl';
  import Cube from './Cube.svelte';

 export let radius = 0.1;
 export let margin = 0.2;
 export let label_radius = 0.06;
 export let label_uniforms = {};
 export let labeled_sides = ['right', 'left', 'top', 'bottom', 'front', 'back'];

  // pass to Group
  export let location = undefined;
  export let lookAt = undefined;
  export let up = undefined;
  export let rotation = undefined;
  // pass to Cube
  export let scale = 1;
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
         location: [w * 0.5 + spacing, 0.0, 0.0],
         rotation: [90, 0, 90],
         scale: [h/2 - margin, d/2 - margin, 1/2],
         uniforms: label_uniforms.right
     },
     {
         name: 'left',
         location: [-w * 0.5 - spacing, 0.0, 0.0],
         rotation: [90, 0, -90],
         scale: [h/2 - margin, d/2 - margin, 1/2],
         uniforms: label_uniforms.left
     },
     {
         name: 'top',
         location: [0.0, h * 0.5 + spacing, 0.0],
         rotation: [-90, 90, 0],
         scale: [d/2 - margin, w/2 - margin, 1/2],
         uniforms: label_uniforms.top
     },
     {
         name: 'bottom',
         location: [0.0, -h * 0.5 - spacing, 0.0],
         rotation: [90, -90, 0],
         corners: false,
         scale: [d/2 - margin, w/2 - margin, 1/2],
         uniforms: label_uniforms.bottom
     },
     {
         name: 'front',
         location: [0.0, 0.0, d * 0.5 + spacing],
         rotation: [0, 0, 0],
         corners: true,
         scale: [w/2 - margin, h/2 - margin, 1/2],
         uniforms: label_uniforms.front
     },
     {
         name: 'back',
         location: [0.0, 0.0, -d * 0.5 - spacing],
         rotation: [0, 180, 0],
         corners: true,
         scale: [w/2 - margin, h/2 - margin, 1/2],
         uniforms: label_uniforms.back
     }
 ];

 const spacing = 0.001;
</script>


<GL.Group
  location={location}
  lookAt={lookAt}
  up={up}
  rotation={rotation}
>

  <Cube
    radius={radius}
    scale={scale}
    vert={vert}
    frag={frag}
    uniforms={uniforms}
    blend={blend}
    depthTest={depthTest}
    transparent={transparent}
  />

  {#each faces as face}
  {#if labeled_sides.includes(face.name)}
      <GL.Mesh
        geometry={GL.plane()}
        location={face.location}
        rotation={face.rotation}
        scale={face.scale}
        vert={vert}
        frag={frag}
        uniforms={face.uniforms}
        blend={blend}
        depthTest={depthTest}
        transparent={transparent}
      />
    {/if}
  {/each}
</GL.Group>
