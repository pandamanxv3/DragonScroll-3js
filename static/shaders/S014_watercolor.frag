#ifdef GL_ES
precision mediump float;
#endif

uniform vec2    u_resolution;
uniform float   u_time;

void main(){
    vec2 coord = -10.0 * gl_FragCoord.xy / u_resolution + 15.0; //bouger la 1er val pour dezoomer/zoomer et le signe pour le sens

    for(int n = 1; n < 9; n++){ //bouger le < 2 pour different result
        float i = float(n);
        coord += vec2(0.7 / i * sin(i * coord.y + u_time + 0.3) + 4.0, 0.4 / i * sin(coord.x + u_time + 0.3 * i) + 1.6);
    }
    
    
    vec3 color = vec3(0.2 * sin(coord.x)  + 0.5, 0.1 * sin(coord.y) + 0.1, sin(coord.x +coord.y));
    gl_FragColor = vec4(color, 1.0);
}