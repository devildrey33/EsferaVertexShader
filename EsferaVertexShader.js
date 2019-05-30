
var EsferaVShader = function() {
    // Llamo al constructor del ObjetoBanner
    if (ObjetoCanvas.call(this, { 
        'Tipo'          : 'THREE',
        'Ancho'         : 'Auto',
        'Alto'          : 'Auto',
        'Entorno'       : 'Normal',
        'MostrarFPS'    : true,
        'BotonLogo'     : false,
        'Pausar'        : true,
        'ElementoRaiz'  : "",
        'CapturaEjemplo': "EsferaVShader.png"
    }) === false) { return false; }
};


EsferaVShader.prototype = Object.assign( Object.create(ObjetoCanvas.prototype) , {
    constructor     : EsferaVShader, 
    // Función que se llama al redimensionar el documento
    Redimensionar   : function() {    },
    // Función que se llama al hacer scroll en el documento    
    Scroll          : function() {    },
    // Función que se llama al mover el mouse por el canvas
    MouseMove       : function(Evento) { },
    // Función que se llama al presionar un botón del mouse por el canvas
    MousePresionado : function(Evento) { },
    // Función que se llama al soltar un botón del mouse por el canvas
    MouseSoltado    : function(Evento) { this.Uniforms.MouseDentro.value = !this.Uniforms.MouseDentro.value; },
    // Función que se llama al entrar con el mouse en el canvas
    MouseEnter      : function(Evento) {  },
    // Función que se llama al salir con el mouse del canvas
    MouseLeave      : function(Evento) {  },
    // Función que se llama al presionar una tecla
    TeclaPresionada : function(Evento) { },
    // Función que se llama al soltar una tecla
    TeclaSoltada    : function(Evento) { },
    
    Iniciar         : function() {
//        this.MouseDentro = false;
        
        this.Tiempo = Date.now();

        // Se ha creado el canvas, inicio los valores de la animación ... 
        this.Escena = new THREE.Scene();
        this.Camara = new THREE.PerspectiveCamera(75, this.Ancho / this.Alto, 0.5, 10000);
        this.Camara.position.set(0, 0, 6);
        this.Escena.add(this.Camara);

        // Parrilla para iniciar la plantilla (se puede eliminar)
/*        this.Parrilla = new THREE.GridHelper(50, 50, new THREE.Color(0xFF4040), new THREE.Color(0xFF8080));
        this.Parrilla.position.y = -8;
        this.Escena.add(this.Parrilla);*/

        var geo = new THREE.SphereBufferGeometry(3,64,64);

        this.Uniforms = {
            MouseDentro : { type: 'bool', value: false },
            Color       : { type: 'vec3', value: new THREE.Color(0xFF4040) },
            Tiempo      : { type: '1f', value: 0 }
        };


        var shaderMaterial = new THREE.ShaderMaterial({
//            attributes: 	attributesS6,
            uniforms:		this.Uniforms,
            vertexShader:   document.getElementById('vertexshader').innerHTML,   // this.Shaders.Vertex, 
            fragmentShader: document.getElementById('fragmentshader').innerHTML, // this.Shaders.Fragment, 
            transparent : true,
            wireframe: true
        });

        // now create a sphere
        var Esfera = new THREE.Mesh(geo, shaderMaterial);

        this.Escena.add(Esfera);
        
        
        this.Rotacion_Grados    = 0;
        this.Rotacion_Avance    = 0.005;
        this.Rotacion_Distancia = 6;
        this.Camara.position.set(0, 0, this.Rotacion_Distancia);
        
        this.Cargando(false);
        
    },
    
    // Función que pinta cada frame de la animación
    Pintar          : function() {  
        if (this.Uniforms.MouseDentro.value === false) {
            if (this.Rotacion_Distancia < 6) {
                this.Rotacion_Distancia += 0.33;
            }
        }
        else {
            if (this.Rotacion_Distancia > 0) {
                this.Rotacion_Distancia -= 0.33;
            }
        }
        var tiempo = Date.now();
        var delta = tiempo - this.Tiempo;
        this.Tiempo = tiempo;
        
        this.Uniforms.Tiempo.value += delta / 1000;
        
        this.Rotacion_Grados += this.Rotacion_Avance;
        this.Camara.position.x = this.Rotacion_Distancia * Math.cos(this.Rotacion_Grados);
        this.Camara.position.z = this.Rotacion_Distancia * Math.sin(this.Rotacion_Grados);
        this.Camara.lookAt(this.Escena.position);
        this.Context.render(this.Escena, this.Camara);  
    },
    
    /* 
    // Para el banner necesito tener los shaders dentro del mismo script
    Shaders         : {
        'Vertex'    : [ "precision highp float;",
                        "uniform bool   MouseDentro;",
                        "uniform float  Tiempo;",
                        "//",
                        "// https://github.com/hughsk/glsl-noise/blob/master/classic/3d.glsl",
                        "//",
                        '// GLSL textureless classic 3D noise "cnoise",',
                        '// with an RSL-style periodic variant "pnoise".',
                        "// Author:  Stefan Gustavson (stefan.gustavson@liu.se)",
                        "// Version: 2011-10-11",
                        "//",
                        "// Many thanks to Ian McEwan of Ashima Arts for the",
                        "// ideas for permutation and gradient selection.",
                        "//",
                        "// Copyright (c) 2011 Stefan Gustavson. All rights reserved.",
                        "// Distributed under the MIT license. See LICENSE file.",
                        "// https://github.com/ashima/webgl-noise",
                        "//",
                        "vec3 mod289(vec3 x)        { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
                        "vec4 mod289(vec4 x)        { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
                        "vec4 permute(vec4 x)       { return mod289(((x*34.0)+1.0)*x); }",
                        "vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }",
                        "vec3 fade(vec3 t)          { return t*t*t*(t*(t*6.0-15.0)+10.0); }",
                        "// Classic Perlin noise",
                        "float cnoise(vec3 P) {",
                            "vec3 Pi0 = floor(P);", // Integer part for indexing
                            "vec3 Pi1 = Pi0 + vec3(1.0);", // Integer part + 1
                            "Pi0 = mod289(Pi0);",
                            "Pi1 = mod289(Pi1);",
                            "vec3 Pf0 = fract(P);", // Fractional part for interpolation
                            "vec3 Pf1 = Pf0 - vec3(1.0);", // Fractional part - 1.0
                            "vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                            "vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                            "vec4 iz0 = Pi0.zzzz;",
                            "vec4 iz1 = Pi1.zzzz;",
                            "vec4 ixy = permute(permute(ix) + iy);",
                            "vec4 ixy0 = permute(ixy + iz0);",
                            "vec4 ixy1 = permute(ixy + iz1);",
                            "vec4 gx0 = ixy0 * (1.0 / 7.0);",
                            "vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                            "gx0 = fract(gx0);",
                            "vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                            "vec4 sz0 = step(gz0, vec4(0.0));",
                            "gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                            "gy0 -= sz0 * (step(0.0, gy0) - 0.5);",
                            "vec4 gx1 = ixy1 * (1.0 / 7.0);",
                            "vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                            "gx1 = fract(gx1);",
                            "vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                            "vec4 sz1 = step(gz1, vec4(0.0));",
                            "gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                            "gy1 -= sz1 * (step(0.0, gy1) - 0.5);",
                            "vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                            "vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                            "vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                            "vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                            "vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                            "vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                            "vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                            "vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",
                            "vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                            "g000 *= norm0.x;",
                            "g010 *= norm0.y;",
                            "g100 *= norm0.z;",
                            "g110 *= norm0.w;",
                            "vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                            "g001 *= norm1.x;",
                            "g011 *= norm1.y;",
                            "g101 *= norm1.z;",
                            "g111 *= norm1.w;",
                            "float n000 = dot(g000, Pf0);",
                            "float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                            "float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                            "float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                            "float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                            "float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                            "float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                            "float n111 = dot(g111, Pf1);",
                            "vec3 fade_xyz = fade(Pf0);",
                            "vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                            "vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                            "float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);",
                            "return 2.2 * n_xyz;",
                        "}",
                        "void main() {",
                            "float Amplitud = (MouseDentro == false) ? 0.75 : 2.5;",
                            "float Frequencia = (MouseDentro == false) ? 0.43 : 1.0;",
                            // Get a 3d noise using the position
                            "float Desplazamiento = Amplitud * cnoise(Frequencia * position + Tiempo);",
                            "vec3 newPosition = position + normal * Desplazamiento;",
                            "gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);",
                        "}"].join("\n"),                       
        

        'Fragment'  : [ "precision highp float;", 
                        "uniform vec3    Color;",
                        //    uniform bool    MouseDentro;
                        "void main() {",
                            "gl_FragColor = vec4(Color, 0.6);", 
                        "}"].join("\n")
    }*/
});

var Canvas = new EsferaVShader;
//window.addEventListener('load', function() { Canvas = new EsferaVShader; });