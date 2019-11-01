<script>
 import * as GL from '@sveltejs/gl';

 export let location = [0, 0, 0],
            rotation = [0, 0, 0],
            radius = 0.1;
 const h = 1,
       w = 1,
       d = 3,
       color = '#ff3e00',
       edges = [
           {
               location: [0.5, 0.0, -0.5],
               rotation: [0, 0, 0]
           },
           {
               location: [0.5, 0.0, -0.5],
               rotation: [0, 0, 0]
           }
       ];
 
 const from_hex = hex => parseInt(hex.slice(1), 16);
</script>

<GL.Group location={location}>

  {#each edges as edge}

  <GL.Mesh
    geometry={GL.cylinder({ turns: 26, bands: 1, turns_chord: 1.0 })}
    location={edge.location}
    scale={radius}
    uniforms={{ color: 0xa8ee56, alpha: 1.0 }}
  />
  {/each}
</GL.Group>
