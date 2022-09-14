fn c_func(z:vec2<f32>, a:f32, select_id:i32) -> vec2<f32>{
    var fz:vec2<f32> = z;
    if (select_id == 0) {
        let f1 = z - vec2<f32>(a, 0.0);
        let f2 = c_mul(z,z) + z + vec2<f32>(a, 0.0);
        fz = c_div(f1, f2); 
    } else if (select_id == 1) {
        fz = c_sqrt(c_div(c_log(vec2<f32>(-z.y - 3.0*a, z.x)), c_log(vec2<f32>(-z.y + a, z.x))));
    } else if (select_id == 2){
        fz = a*c_sin(a*z);
    } else if(select_id == 3){
        fz = (a+0.5)*c_tan(c_tan((a+0.5)*z));
    } else if(select_id == 4){
        fz = a*c_tan(c_sin((a+0.5)*z));
    } else if (select_id == 5){
        fz = c_sqrt(vec2<f32>(a + z.x, z.y)) + c_sqrt(vec2<f32>(a - z.x, -z.y));
    } else if (select_id == 6){
        fz = c_div(c_tan(c_exp2((0.5+a)*z)), z);
    } else if (select_id == 7){
        fz = c_div(c_sin(c_cos(c_sin((a+0.5)*z))), c_mul(z,z) - a);
    } else if (select_id == 8){
        fz = (a+0.5)*c_inv(c_add(c_pow((a+0.5)*z,5.0), 1.0));
    } else if (select_id == 9){
        fz = c_div(c_sin((a+0.5)*z), c_mul(c_cos(c_exp2((a+0.5)*z)), c_mul(z,z)- vec2<f32>((a+0.5)*(a+0.5),0.0)));
    } else if (select_id == 10) {
        fz = c_inv(z + vec2<f32>(a, 0.0)) + c_inv(z - vec2<f32>(a, 0.0));
    } 
    return fz;
}

// vertex shader
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {    
    var pos = array<vec2<f32>,4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0,  1.0),
    );
    return vec4<f32>(pos[in_vertex_index], 0.0, 1.0);
}

// fragment shader
struct FragUniforms {
    a: f32,
    width: f32,
    height: f32,     
    select_func: f32,      
    select_color: f32,             
};
@binding(0) @group(0) var<uniform> f_uniforms: FragUniforms;  

@fragment
fn fs_main(@builtin(position) coord_in : vec4<f32>) -> @location(0) vec4<f32> {
    let a = f_uniforms.a;    
    let w:f32 = f_uniforms.width;
    let h:f32 = f_uniforms.height;
    let select_id = i32(f_uniforms.select_func);
    let color_id = i32(f_uniforms.select_color);
    let scale = 7.0;
    let z = vec2<f32>(scale*(coord_in.x - 0.5*w)/w, -scale*(h/w)*(coord_in.y - 0.5*h)/h);

    let fz = c_func(z, a, select_id);

    if (color_id > 0) { // colormaps
        return vec4<f32>(colormap_to_rgb(fz, color_id), 1.0);
    } else { // default hsv to rgb
        return vec4<f32>(hsv_to_rgb(fz), 1.0); 
    }
}