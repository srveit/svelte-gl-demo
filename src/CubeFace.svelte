<script>
 import * as GL from '@sveltejs/gl';

 export let location = [0, 0, 0];
 export let rotation = [0, 0, 0];
 export let uniforms = {};
 export let radius = 0;
 export let corners = true;

 const edges = [
     {
         location: [0.5 - radius, 0.0, -radius],
         rotation: [0, 90, 0]
     },
     {
         location: [-0.5 + radius, 0.0, -radius],
         rotation: [0, 0, 0]
     }
 ];
 const cube_corners =
   corners ?
   [
     {
         location: [0.5 - radius, 0.5 - radius, -radius],
         rotation: [0, 90, 0]
     },
     {
         location: [radius - 0.5, 0.5 - radius, -radius],
         rotation: [0, 0, 0]
     },
     {
         location: [0.5 - radius, radius - 0.5, -radius],
         rotation: [90, 90, 0]
     },
     {
         location: [radius - 0.5, radius - 0.5, -radius],
         rotation: [90, 0, 0]
     }
   ] :
   [];
     
 
 const from_hex = hex => parseInt(hex.slice(1), 16);
</script>

<GL.Group
  location={location}
  rotation={rotation}>

  {#each edges as edge}

    <GL.Mesh
      geometry={GL.cylinder({ turns: 26, turns_chord: 0.25 })}
      location={edge.location}
      rotation={edge.rotation}
      scale={[radius, 1 - radius - radius, radius]}
      uniforms={uniforms}
    />
  {/each}

  {#each cube_corners as corner}
    <GL.Mesh
      geometry={GL.sphere({ turns: 26, bands: 26, turns_chord: 0.25, bands_chord: 0.5 })}
      location={corner.location}
      rotation={corner.rotation}
      scale={radius}
      uniforms={uniforms}
    />
  {/each}

  <!-- face -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[0,0,0]}
    rotation={[0,0,0]}
    scale={0.5 - radius}
    uniforms={uniforms}
  />

</GL.Group>
