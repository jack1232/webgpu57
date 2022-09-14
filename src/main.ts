import { InitGPU, CreateAnimation } from './helper';
import shader from './shader.wgsl';
import shader_func from './shader_func.wgsl'
import $ from 'jquery';

const CreateDomainColor = async (select_func = 0, select_color = 0) => {
    let t0 = Date.now();
    let max_iter = 2;

    const gpu = await InitGPU();
    const device = gpu.device;

    const shaders =shader_func.concat(shader);
    const pipeline = device.createRenderPipeline({
        layout:'auto',
        vertex: {
            module: device.createShaderModule({                    
                code: shaders
            }),
            entryPoint: "vs_main",
        },
        fragment: {
            module: device.createShaderModule({                    
                code: shaders
            }),
            entryPoint: "fs_main",
            targets: [
                {
                    format: gpu.format as GPUTextureFormat
                }
            ]
        },
        primitive:{
            topology: "triangle-strip",
            stripIndexFormat: "uint32",
        },
    });

    // create uniform buffer
    const uniformBuffer = device.createBuffer({
        size: 20,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: uniformBuffer,
                offset: 0,
                size: 20
            }
        }]
    });

    let textureView = gpu.context.getCurrentTexture().createView();

    const renderPassDescription = {
        colorAttachments: [{
            view: textureView,
            clearValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 }, //background color
            loadOp: 'clear',
            storeOp: 'store'
        }],
    };
    
    function draw() {
        let t = Date.now();
        let dt = t - t0;
        if(dt >= 10){
            let a = 100;
            let m = (max_iter - a) % (4*a);
            let m_iter = Math.abs(m - 2*a);
            let param_data = new Float32Array([m_iter/100, gpu.canvas.width, gpu.canvas.height, select_func, select_color]);
            gpu.device.queue.writeBuffer(uniformBuffer, 0, param_data);
            max_iter += 1;
            t0 = t;
        }

        textureView = gpu.context.getCurrentTexture().createView();
        renderPassDescription.colorAttachments[0].view = textureView;
        const commandEncoder = device.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass(renderPassDescription as GPURenderPassDescriptor);

        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, uniformBindGroup);
        renderPass.draw(4);
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
    }

    CreateAnimation(draw, [0,0,0], false);
}

let colormap_index = 0;
let function_index = 0;
CreateDomainColor(function_index, colormap_index);
$('#id-equation').html(`
    $$ f(z) = \\frac{z-a}{z^2+z+a} $$ 
`)

$('#id-colormap').on('change',function(){
    const ele = this as any;
    colormap_index = ele.selectedIndex;
    CreateDomainColor(function_index, colormap_index);
});

$('#id-function').on('change',function(){
    const ele = this as any;
    function_index = ele.selectedIndex;
    if(function_index == 0){
        $('#id-equation').html(`
            $$ f(z) = \\frac{z-a}{z^2+z+a} $$ 
       `)
    } else if (function_index == 1){
        $('#id-equation').html(`
            $$ f(z) = \\sqrt{\\frac{\\log(i z-3a)}{\\log(i z + a)}}$$ 
       `)
    } else if (function_index == 2){
        $('#id-equation').html(`
            $$ f(z) = a \\sin(az)$$ 
       `)
    } else if (function_index == 3){
        $('#id-equation').html(`
            $$ f(z) = a \\tan(\\tan(az)) $$ 
       `) 
    } else if (function_index == 4){
        $('#id-equation').html(`
            $$ f(z) = a \\tan(\\sin(az)) $$ 
       `)
    } else if (function_index == 5){
        $('#id-equation').html(`
            $$ f(z) = \\sqrt{a+z} + \\sqrt{a-z} $$ 
       `)
    } else if (function_index == 6){
        $('#id-equation').html(`
            $$ f(z) = \\frac{\\tan(az)^2}{z} $$ 
       `)
    } else if (function_index == 7){
        $('#id-equation').html(`
            $$ f(z) = \\frac{\\sin(\\cos(\\sin(az)))}{z^2-a} $$ 
       `)
    } else if (function_index == 8){
        $('#id-equation').html(`
            $$ f(z) = \\frac{a}{a^5z^5+1} $$ 
       `)
    } else if (function_index == 9){
        $('#id-equation').html(`
            $$ f(z) = \\frac{\\sin(az)}{(z^2-a^2)\\cos(az)^2} $$ 
       `)
    } else if (function_index == 10){
        $('#id-equation').html(`
            $$ f(z) = \\frac{1}{z+1} + \\frac{1}{z-1} $$ 
       `)
    } else {
        $('#id-equation').html(`
            $$ f(z) = z $$ 
       `)
    }
    // @ts-ignore
    MathJax.typesetPromise([document.getElementById('id-equation')]).then(() => {});
    CreateDomainColor(function_index, colormap_index);
});

