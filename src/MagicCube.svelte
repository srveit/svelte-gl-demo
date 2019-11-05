<script>
  import * as GL from '@sveltejs/gl';
  import LabeledCube from './LabeledCube.svelte';

 // pass to Group
 export let scale = 1;
 export let face_angle = 20;
 export let location = undefined;
 export let lookAt = undefined;
 export let up = undefined;
 export let rotation = undefined;
 $: facePositions = [
     {
         location: [0, 0, 1/3],
         rotation: [0, 0, face_angle]
     },
     {
         location: [0, 0, 0],
         rotation: [0, 0, 0]
     },
     {
         location: [0, 0, -1/3],
         rotation: [0, 0, 0]
     }
 ];

 const radius = 0.06,
   margin = 0.08,
   uniforms = { color: 0x101010, specularity: 0.4, alpha: 1.0 },
   label_uniforms = {
       front:  {color: 0xffffff, specularity: 0.3}, // white
       left:   {color: 0x0000ff, specularity: 0.3}, // blue
       top:    {color: 0xff0000, specularity: 0.3}, // red
       right:  {color: 0x00ff00, specularity: 0.3}, // green
       bottom: {color: 0xffa500, specularity: 0.3}, // orange
       back:   {color: 0xffff00, specularity: 0.3}  // yellow
   },
   cubesLabeledSides = [
       [
           [['front', 'left', 'top'], ['front', 'top'], ['front', 'top', 'right']],
           [['left', 'front'], ['front'], ['front', 'right']],
           [['front', 'left', 'bottom'], ['front', 'bottom'], ['front', 'bottom', 'right']]
       ],
       [
           [['left', 'top'], ['top'], ['top', 'right']],
           [['left'], [], ['right']],
           [['left', 'bottom'], ['bottom'], ['bottom', 'right']]
       ],
       [
           [['back', 'left', 'top'], ['back', 'top'], ['back', 'top', 'right']],
           [['left', 'back'], ['back'], ['back', 'right']],
           [['back', 'left', 'bottom'], ['back', 'bottom'], ['back', 'bottom', 'right']]
       ]
   ];

</script>

<GL.Group
  {location}
  {lookAt}
  {up}
  {rotation}
  {scale}
>

  {#each [0, 1, 2] as face}
    <GL.Group
      location = {facePositions[face].location}
      rotation = {facePositions[face].rotation}
    >
      {#each [0, 1, 2] as row}
        {#each [0, 1, 2] as column}
          <LabeledCube
            scale={1/3}
            location = {[(column - 1)/3, (1 - row)/3, 0]}
            radius={radius/3}
            margin={margin/3}
              {label_uniforms}
              labeled_sides={cubesLabeledSides[face][row][column]}
            {uniforms}
          />
        {/each}
      {/each}
    </GL.Group>
  {/each}
</GL.Group>
