<script>
 import * as GL from '@sveltejs/gl';

 export let corners = true;
 export let radius = 0;
 export let scale = 1;
 export let name = 'face';
 // pass to group
 export let location = undefined;
 export let lookAt = undefined;
 export let up = undefined;
 export let rotation = undefined;
 // pass to meshes
 export let vert = undefined;
 export let frag = undefined;
 export let uniforms = undefined;
 export let blend = undefined;
 export let depthTest = undefined;
 export let transparent = undefined;

 $: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;
 $: w = scale_array[0];
 $: h = scale_array[1];
 $: d = scale_array[2];

 $: edges = [
     {
         location: [w * 0.5 - radius, 0.0, -radius],
         rotation: [0, 90, 0],
         scale: [radius, h - 2 * radius, radius]
     },
     {
         location: [-w * 0.5 + radius, 0.0, -radius],
         rotation: [0, 0, 0],
         scale: [radius, h - 2 * radius, radius]
     }
 ];

 $: cube_corners =
   corners ?
   [
     {
         location: [w * 0.5 - radius, h * 0.5 - radius, -radius],
         rotation: [0, 90, 0]
     },
     {
         location: [radius - w * 0.5, h * 0.5 - radius, -radius],
         rotation: [0, 0, 0]
     },
     {
         location: [w * 0.5 - radius, radius - h * 0.5, -radius],
         rotation: [90, 90, 0]
     },
     {
         location: [radius - w * 0.5, radius - h * 0.5, -radius],
         rotation: [90, 0, 0]
     }
   ] :
   [];
</script>

<GL.Group
  location={location}
  lookAt={lookAt}
  up={up}
  rotation={rotation}
>

  {#each edges as edge}

    <GL.Mesh
      geometry={GL.cylinder({ turns: 26, turns_chord: 0.25 })}
      location={edge.location}
      rotation={edge.rotation}
      scale={edge.scale}
      vert={vert}
      frag={frag}
      uniforms={uniforms}
      blend={blend}
      depthTest={depthTest}
      transparent={transparent}
    />
  {/each}

  {#each cube_corners as corner}
    <GL.Mesh
      geometry={GL.sphere({ turns: 26, bands: 26, turns_chord: 0.25, bands_chord: 0.5 })}
      location={corner.location}
      rotation={corner.rotation}
      scale={radius}
      vert={vert}
      frag={frag}
      uniforms={uniforms}
      blend={blend}
      depthTest={depthTest}
      transparent={transparent}
    />
  {/each}

  <!-- face -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[0,0,0]}
    rotation={[0,0,0]}
    scale={[w * 0.5 - radius, h * 0.5 - radius, 1]}
    vert={vert}
    frag={frag}
    uniforms={uniforms}
    blend={blend}
    depthTest={depthTest}
    transparent={transparent}
  />

</GL.Group>
