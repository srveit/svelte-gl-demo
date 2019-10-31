<script>
 import * as GL from '@sveltejs/gl';

 const h = 1,
       w = 1,
       d = 3,
       color = '#ff3e00';
 const from_hex = hex => parseInt(hex.slice(1), 16);
</script>

<GL.Mesh
    geometry={GL.box()}
    location={[0,h/2,0]}
    rotation={[0,-20,0]}
    scale={[w,h,d]}
    uniforms={{ color: from_hex(color) }}
/>

<GL.Mesh
    geometry={GL.cylinder({ turns: 26, bands: 1, turns_chord: 0.25 })}
    location={[-0.5, 1.0, 1.2]}
    scale={1.0}
    uniforms={{ color: 0xa8ee56, alpha: 1.0 }}
/>
