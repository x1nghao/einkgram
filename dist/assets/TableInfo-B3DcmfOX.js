const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./diamond-2r_zruE8.js","./teact-Bsp9jnk3.js","./fasterdom-BTJqHTPA.js","./core-wqAUrhUS.js","./rolldown-runtime-hePW80VL.js","./useBackgroundMode-WVjh5zcA.js","./animation-CB9yaHUg.js","./Modal-hj2ULeCS.js","./InputText-VCneym7I.js","./colors-CZMC3b3a.js","./jsx-dev-runtime-BZhSYc_C.js","./buffer-Bxh69E6y.js","./base64-_GGUqvD_.js","./teact-dom-By5bkah2.js","./preload-helper-CRzLMJPS.js","./usePriorityPlaybackCheck-CoKlj7-b.js","./InputText-Cj69WUze.css","./Modal-Dg5JqZy5.css","./WalletAppIcon-BE1B_bp0.js","./Transition-BjO_Leo9.js","./Transition-giLYO1y3.css","./WalletAppIcon-CMXQZ1iA.css","./scene-C3vtPeCl.js"])))=>i.map(i=>d[i]);
import{Bf as e,I as t,J as n,Kn as r,Op as i,Pt as a,U as o,f as s,n as c,p as l}from"./InputText-VCneym7I.js";import{on as u,r as d,t as f}from"./fasterdom-BTJqHTPA.js";import{S as p,_ as m,b as h,d as g,w as _,y as v}from"./teact-Bsp9jnk3.js";import{ut as y,x as b}from"./colors-CZMC3b3a.js";import{n as x,t as S}from"./jsx-dev-runtime-BZhSYc_C.js";import{i as C,t as w}from"./useBackgroundMode-WVjh5zcA.js";import{t as ee}from"./preload-helper-CRzLMJPS.js";import{D as T}from"./Transition-BjO_Leo9.js";import{n as E}from"./DropdownMenu-5YTWQpn9.js";import{r as D}from"./animation-CB9yaHUg.js";import{o as O}from"./resolveTransitionName-BSQgmEy8.js";var k=`/Users/hao/Projects/einkgram/src/components/ui/TextArea.tsx`,te=g(({ref:t,id:n,className:r,value:i,label:a,error:s,success:l,disabled:g,readOnly:_,placeholder:v,autoComplete:y,inputMode:b,maxLength:S,maxLengthIndicator:w,hasLengthIndicator:ee,tabIndex:T,onChange:E,onInput:D,onKeyPress:O,onKeyDown:te,onBlur:A,onPaste:j,noReplaceNewlines:M})=>{let N=p();t&&(N=t);let P=o(),F=s||l||a,I=e(`input-group`,i&&`touched`,s?`error`:l&&`success`,g&&`disabled`,_&&`disabled`,F&&`with-label`,r),L=p(),R=C(e=>{L.current=e.value,d(()=>{e.style.height=`0`,f(()=>{let t=e.scrollHeight;return()=>{e.style.height=`${t}px`}})})});h(()=>{let e=N.current;e&&e.value!==L.current&&R(e)},[i]);let ne=m(e=>{let t=e.currentTarget;if(!M){let e=t.selectionEnd;t.value=t.value.replace(/\n/g,` `),t.selectionEnd=e}R(t),E?.(e)},[M,E]);return x(`div`,{className:I,dir:P.isRtl?`rtl`:void 0,children:[x(`textarea`,{ref:N,className:`form-control`,id:n,dir:`auto`,value:i||``,tabIndex:T,placeholder:v,maxLength:S,autoComplete:y,spellCheck:!u&&void 0,inputMode:b,disabled:g,readOnly:_,onChange:ne,onInput:D,onKeyPress:O,onKeyDown:te,onBlur:A,onPaste:j,"aria-label":F},void 0,!1,{fileName:k,lineNumber:122,columnNumber:7},void 0),F&&x(`label`,{htmlFor:n,children:F},void 0,!1,{fileName:k,lineNumber:145,columnNumber:9},void 0),(w||ee&&S!==void 0)&&x(`div`,{className:`max-length-indicator`,children:x(c,{text:w||Math.max(0,S-(i||``).length).toString()},void 0,!1,{fileName:k,lineNumber:149,columnNumber:11},void 0)},void 0,!1,{fileName:k,lineNumber:148,columnNumber:9},void 0)]},void 0,!0,{fileName:k,lineNumber:121,columnNumber:5},void 0)}),A=b(`#0098EA`),j={blue:A,blueGradient:[b(`#0158AF`),b(`#67D0FF`)],purple:b(`#966FFE`),purpleGradient:[b(`#6B93FF`),b(`#E46ACE`)],gold:b(`#FFBF0A`),goldGradient:[b(`#FDEB32`),b(`#D75902`)]},M={particleCount:5,distanceLimit:1,fadeInTime:.05,minLifetime:3,maxLifetime:3,maxStartTimeDelay:0,selfDestroyTime:3,minSpawnRadius:5,maxSpawnRadius:50},N={width:350,height:230,particleCount:100,color:A,speed:18,baseSize:6,minSpawnRadius:35,maxSpawnRadius:70,distanceLimit:.7,fadeInTime:.25,fadeOutTime:1,minLifetime:4,maxLifetime:6,maxStartTimeDelay:3,edgeFadeZone:50,centerShift:[0,0],accelerationFactor:3,selfDestroyTime:0},P=.67,F=1.33,I=2.2,L=new Map;function R(e,t){let n=L.get(e);return n||(n=ne(e),L.set(e,n)),n.addSystem(t)}function ne(e){let t=e.getContext(`webgl`,{alpha:!0,antialias:!1,preserveDrawingBuffer:!1});if(!t)throw Error(`WebGL not supported`);let n=ae(t,t.VERTEX_SHADER,re),r=ae(t,t.FRAGMENT_SHADER,ie);if(!n||!r)throw Error(`Failed to create shaders`);let i=oe(t,n,r);if(!i)throw Error(`Failed to create shader program`);let a=window.devicePixelRatio||1,o=new Map,s={attributes:{startPosition:t.getAttribLocation(i,`a_startPosition`),velocity:t.getAttribLocation(i,`a_velocity`),startTime:t.getAttribLocation(i,`a_startTime`),lifetime:t.getAttribLocation(i,`a_lifetime`),size:t.getAttribLocation(i,`a_size`),baseOpacity:t.getAttribLocation(i,`a_baseOpacity`),color:t.getAttribLocation(i,`a_color`)},uniforms:{resolution:t.getUniformLocation(i,`u_resolution`),time:t.getUniformLocation(i,`u_time`),canvasWidth:t.getUniformLocation(i,`u_canvasWidth`),canvasHeight:t.getUniformLocation(i,`u_canvasHeight`),accelerationFactor:t.getUniformLocation(i,`u_accelerationFactor`),fadeInTime:t.getUniformLocation(i,`u_fadeInTime`),fadeOutTime:t.getUniformLocation(i,`u_fadeOutTime`),edgeFadeZone:t.getUniformLocation(i,`u_edgeFadeZone`),rotationMatrices:t.getUniformLocation(i,`u_rotationMatrices`),spawnCenter:t.getUniformLocation(i,`u_spawnCenter`)}},c,l;function u(e){let n=new se(e.seed),{config:r}=e,i=new Float32Array(r.particleCount*2),o=new Float32Array(r.particleCount*2),s=new Float32Array(r.particleCount),c=new Float32Array(r.particleCount),l=new Float32Array(r.particleCount),u=new Float32Array(r.particleCount),d=new Float32Array(r.particleCount*3);for(let t=0;t<r.particleCount;t++){let f=n.next()*Math.PI*2,p=n.nextBetween(r.minSpawnRadius,r.maxSpawnRadius),m=Math.cos(f),h=Math.sin(f),g=e.centerX+m*p,_=e.centerY+h*p;i[t*2]=g*a,i[t*2+1]=_*a,c[t]=n.nextBetween(r.minLifetime,r.maxLifetime),s[t]=n.next()*r.maxStartTimeDelay;let v=n.nextBetween(e.avgDistance*r.distanceLimit*.5,e.avgDistance*r.distanceLimit)/c[t]*a;o[t*2]=m*v,o[t*2+1]=h*v;let y=n.next();y<.3?l[t]=r.baseSize*P*a:y<.7?l[t]=r.baseSize*F*a:l[t]=r.baseSize*I*a,u[t]=n.nextBetween(.3,.8);let[b,x,S]=le(r.color,n).coords;d[t*3]=b||0,d[t*3+1]=x||0,d[t*3+2]=S||0}t.bindBuffer(t.ARRAY_BUFFER,e.buffers.startPosition),t.bufferData(t.ARRAY_BUFFER,i,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.velocity),t.bufferData(t.ARRAY_BUFFER,o,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.startTime),t.bufferData(t.ARRAY_BUFFER,s,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.lifetime),t.bufferData(t.ARRAY_BUFFER,c,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.size),t.bufferData(t.ARRAY_BUFFER,l,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.baseOpacity),t.bufferData(t.ARRAY_BUFFER,u,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.color),t.bufferData(t.ARRAY_BUFFER,d,t.STATIC_DRAW)}function d(){let n=0,r=0;o.forEach(e=>{n=Math.max(n,e.config.width),r=Math.max(r,e.config.height)}),o.size===0&&(n=N.width,r=N.height),(e.width!==n*a||e.height!==r*a)&&(e.width=n*a,e.height=r*a,e.style.width=n+`px`,e.style.height=r+`px`),t.viewport(0,0,e.width,e.height)}function f(){t.useProgram(i),t.uniform2f(s.uniforms.resolution,e.width,e.height),t.uniformMatrix2fv(s.uniforms.rotationMatrices,!1,ce()),t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA),t.clearColor(0,0,0,0)}function p(e){c&&=(t.clear(t.COLOR_BUFFER_BIT),o.forEach(n=>{let r=(e-n.startTime)/1e3;t.uniform1f(s.uniforms.time,r),t.uniform1f(s.uniforms.canvasWidth,n.config.width*a),t.uniform1f(s.uniforms.canvasHeight,n.config.height*a),t.uniform1f(s.uniforms.accelerationFactor,n.config.accelerationFactor),t.uniform1f(s.uniforms.fadeInTime,n.config.fadeInTime),t.uniform1f(s.uniforms.fadeOutTime,n.config.fadeOutTime),t.uniform1f(s.uniforms.edgeFadeZone,n.config.edgeFadeZone*a),t.uniform2f(s.uniforms.spawnCenter,n.centerX*a,n.centerY*a),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.startPosition),t.enableVertexAttribArray(s.attributes.startPosition),t.vertexAttribPointer(s.attributes.startPosition,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.velocity),t.enableVertexAttribArray(s.attributes.velocity),t.vertexAttribPointer(s.attributes.velocity,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.startTime),t.enableVertexAttribArray(s.attributes.startTime),t.vertexAttribPointer(s.attributes.startTime,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.lifetime),t.enableVertexAttribArray(s.attributes.lifetime),t.vertexAttribPointer(s.attributes.lifetime,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.size),t.enableVertexAttribArray(s.attributes.size),t.vertexAttribPointer(s.attributes.size,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.baseOpacity),t.enableVertexAttribArray(s.attributes.baseOpacity),t.vertexAttribPointer(s.attributes.baseOpacity,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.color),t.enableVertexAttribArray(s.attributes.color),t.vertexAttribPointer(s.attributes.color,3,t.FLOAT,!1,0,0),t.drawArrays(t.POINTS,0,n.config.particleCount)}),requestAnimationFrame(p))}function m(e){let n=y(),r={...N,...e},i={id:n,config:r,buffers:{startPosition:t.createBuffer(),velocity:t.createBuffer(),startTime:t.createBuffer(),lifetime:t.createBuffer(),size:t.createBuffer(),baseOpacity:t.createBuffer(),color:t.createBuffer()},startTime:performance.now(),seed:Math.floor(Math.random()*1e6),centerX:r.width/2+r.centerShift[0],centerY:r.height/2+r.centerShift[1],avgDistance:(r.width/2+r.height/2)/2};return o.set(n,i),u(i),d(),r.selfDestroyTime&&(i.selfDestroyTimeout=window.setTimeout(()=>{h(n)},r.selfDestroyTime*1e3)),o.size===1&&(f(),l=w.subscribe(()=>{let e=!w();e&&!c?c=requestAnimationFrame(p):!e&&c&&(cancelAnimationFrame(c),c=void 0)}),c=requestAnimationFrame(p)),()=>h(n)}function h(e){let n=o.get(e);n&&(n.selfDestroyTimeout&&clearTimeout(n.selfDestroyTimeout),Object.values(n.buffers).forEach(e=>{e&&t.deleteBuffer(e)}),o.delete(e),o.size===0&&g())}function g(){c!==void 0&&(cancelAnimationFrame(c),c=void 0),l?.(),o.clear(),t.deleteProgram(i),t.deleteShader(n),t.deleteShader(r),L.delete(e)}return{addSystem:m}}var re=`
    attribute vec2 a_startPosition;
    attribute vec2 a_velocity;
    attribute float a_startTime;
    attribute float a_lifetime;
    attribute float a_size;
    attribute float a_baseOpacity;
    attribute vec3 a_color;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_canvasWidth;
    uniform float u_canvasHeight;
    uniform float u_accelerationFactor;
    uniform float u_fadeInTime;
    uniform float u_fadeOutTime;
    uniform float u_edgeFadeZone;
    uniform mat2 u_rotationMatrices[18];
    uniform vec2 u_spawnCenter;

    varying float v_opacity;
    varying vec3 v_color;

    void main() {
        float totalAge = u_time - a_startTime;
        float age = mod(totalAge, a_lifetime);

        // For the initial animation, fade in all particles
        float globalFadeIn = min(u_time / u_fadeInTime, 1.0);

        float lifeRatio = age / a_lifetime;

        // Calculate rotation based on completed lifecycles
        float lifecycleCount = floor(totalAge / a_lifetime);
        int rotationIndex = int(mod(lifecycleCount, 18.0));

        // Get rotation matrix
        mat2 rotationMatrix = u_rotationMatrices[rotationIndex];

        // Rotate start position around spawn center
        vec2 startOffset = a_startPosition - u_spawnCenter;
        vec2 rotatedStartOffset = rotationMatrix * startOffset;
        vec2 rotatedStartPosition = u_spawnCenter + rotatedStartOffset;

        // Apply rotation matrix to velocity
        vec2 rotatedVelocity = rotationMatrix * a_velocity;

        // Apply shoot-out effect: fast initial speed that slows down
        float speedMultiplier = 1.0 + u_accelerationFactor * exp(-3.0 * lifeRatio);

        vec2 position = rotatedStartPosition + rotatedVelocity * age * speedMultiplier;

        float opacity = 1.0;
        if (lifeRatio < u_fadeInTime / a_lifetime) {
            opacity = (lifeRatio * a_lifetime) / u_fadeInTime;
        } else if (lifeRatio > 1.0 - u_fadeOutTime / a_lifetime) {
            opacity = (1.0 - lifeRatio) * a_lifetime / u_fadeOutTime;
        }
        opacity *= a_baseOpacity * globalFadeIn;

        float distToLeft = position.x;
        float distToRight = u_canvasWidth - position.x;
        float distToTop = position.y;
        float distToBottom = u_canvasHeight - position.y;
        float distToEdge = min(min(distToLeft, distToRight), min(distToTop, distToBottom));

        if (distToEdge < u_edgeFadeZone) {
            opacity *= distToEdge / u_edgeFadeZone;
        }

        vec2 clipSpace = ((position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
        gl_Position = vec4(clipSpace, 0, 1);
        gl_PointSize = a_size;
        v_opacity = opacity;
        v_color = a_color;
    }
`,ie=`
    precision mediump float;

    varying float v_opacity;
    varying vec3 v_color;

    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);

        // Create a four-pointed star
        float absX = abs(coord.x);
        float absY = abs(coord.y);

        // Star parameters
        float innerSize = 0.12;    // Size of center square
        float armLength = 0.45;    // Length of star arms
        float armWidth = 0.08;     // Half-width of star arms at base

        float dist = 1.0; // Default to outside

        // Center square
        if (absX <= innerSize && absY <= innerSize) {
            dist = max(absX, absY) - innerSize;
        }
        // Horizontal arms (left and right points)
        else if (absY <= armWidth && absX <= armLength) {
            // Taper the arms - they get narrower toward the tips
            float normalizedX = (absX - innerSize) / (armLength - innerSize);
            float taperFactor = 1.0 - normalizedX * 0.8; // Taper to 20% of original width
            float currentArmWidth = armWidth * taperFactor;
            dist = absY - currentArmWidth;
        }
        // Vertical arms (top and bottom points)
        else if (absX <= armWidth && absY <= armLength) {
            // Taper the arms - they get narrower toward the tips
            float normalizedY = (absY - innerSize) / (armLength - innerSize);
            float taperFactor = 1.0 - normalizedY * 0.8; // Taper to 20% of original width
            float currentArmWidth = armWidth * taperFactor;
            dist = absX - currentArmWidth;
        }

        // Use smoothstep for anti-aliasing to reduce subpixel artifacts
        float alpha = 1.0 - smoothstep(-0.01, 0.01, dist);

        if (alpha <= 0.0) {
            discard;
        }

        gl_FragColor = vec4(v_color * v_opacity * alpha, v_opacity * alpha);
    }
`;function ae(e,t,n){let r=e.createShader(t);if(r){if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))e.deleteShader(r);else return r}}function oe(e,t,n){let r=e.createProgram();if(r){if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))e.deleteProgram(r);else return r}}var se=class{seed;constructor(e){this.seed=e}next(){return this.seed=(this.seed*9301+49297)%233280,this.seed/233280}nextBetween(e,t){return e+(t-e)*this.next()}},z;function ce(){if(!z){z=new Float32Array(72);for(let e=0;e<18;e++){let t=220*Math.PI/180*e,n=Math.cos(t),r=Math.sin(t);z[e*4]=n,z[e*4+1]=r,z[e*4+2]=-r,z[e*4+3]=n}}return z}function le(e,t){if(`coords`in e)return e;let[n,r]=e,[i,a,o]=n.coords,[s,c,l]=r.coords;return b({space:`srgb`,coords:[t.nextBetween(i||0,s||0),t.nextBetween(a||0,c||0),t.nextBetween(o||0,l||0)]})}var ue={sparkles:`JxY8hVTW`},de=`/Users/hao/Projects/einkgram/src/components/common/InteractiveSparkles.tsx`,fe={centerShift:[0,-36]},pe=8,B=g(({color:t=`purple`,centerShift:n=fe.centerShift,isDisabled:r,className:i,onRequestAnimation:a})=>{let o=p(),s=p(0);return h(()=>{if(!r)return R(o.current,{color:j[`${t}Gradient`],centerShift:n})},[n,t,r]),v(()=>{a&&a(()=>{if(r)return;let e=Date.now();e-s.current<pe||(s.current=e,R(o.current,{color:j[`${t}Gradient`],centerShift:n,...M}))})},[n,t,r,a]),x(`canvas`,{ref:o,className:e(ue.sparkles,i)},void 0,!1,{fileName:de,lineNumber:63,columnNumber:5},void 0)}),V={root:`woZWPU7X`,preview:`-moeQylm`,previewHidden:`mGT1XdIL`,canvas:`fDA6MU2y`,ready:`UbJiz6U-`},H=`/Users/hao/Projects/einkgram/src/components/modals/wallet/WalletDiamond.tsx`,U=g(({size:n})=>{let i=p(),o=a(r),[c,u]=t(),[d,f]=t(),m=o&&!d;if(v(()=>{if(!m)return;let e=i.current,t,n=!1;return ee(async()=>{let{setupDiamond:e}=await import(`./diamond-2r_zruE8.js`);return{setupDiamond:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]),import.meta.url).then(({setupDiamond:r})=>{n||(t=r(e,u,f))},f),()=>{n=!0,t?.()}},[m]),!m)return x(E,{tgsUrl:l.BlueDiamond,previewUrl:s.BlueDiamond,size:n},void 0,!1,{fileName:H,lineNumber:47,columnNumber:7},void 0);let h=Math.round(n*(window.devicePixelRatio||1));return x(`div`,{className:V.root,style:`width: ${n}px; height: ${n}px`,children:[x(`img`,{src:s.BlueDiamond3d,alt:``,draggable:!1,className:e(V.preview,c&&V.previewHidden)},void 0,!1,{fileName:H,lineNumber:60,columnNumber:7},void 0),x(`canvas`,{ref:i,className:e(V.canvas,c&&V.ready),width:h,height:h,style:`width: ${n}px; height: ${n}px`},void 0,!1,{fileName:H,lineNumber:66,columnNumber:7},void 0)]},void 0,!0,{fileName:H,lineNumber:59,columnNumber:5},void 0)}),W={root:`CHDf16MJ`,diamond:`UM7C8oRj`},me=new URL(`diamond-57JalFxA.png`,import.meta.url).href,G=`/Users/hao/Projects/einkgram/src/components/modals/common/SpeedingDiamond.tsx`,he=5,ge=1,_e=300,ve=1500,K,q=!0,ye={isCancelled:!1};function be({className:t,onMouseMove:n}){let[r,i]=_(ge),a=C(()=>{K&&=(clearTimeout(K),void 0),K=window.setTimeout(()=>{let e=Date.now();q=!0,D(()=>{if(!q)return!1;let t=Math.min((Date.now()-e)/ve,1),n=4*(1-Se(t));return i(n),q=t<1&&n>1,q},d,ye)},_e),q=!1,i(he),n()});return x(`div`,{className:e(W.root,t),children:x(`div`,{className:W.diamond,onMouseMove:a,children:x(E,{speed:r,size:130,tgsUrl:l.Diamond,previewUrl:me,nonInteractive:!0,noLoop:!1},void 0,!1,{fileName:G,lineNumber:69,columnNumber:9},this)},void 0,!1,{fileName:G,lineNumber:65,columnNumber:7},this)},void 0,!1,{fileName:G,lineNumber:64,columnNumber:5},this)}var xe=g(be);function Se(e){return 1-(1-e)**2}var J={root:`QcfrGLdX`,star:`nDPg-zs5`,star_purple:`-f2S1Tk6`,starPurple:`-f2S1Tk6`},Ce=`/Users/hao/Projects/einkgram/src/components/modals/common/SwayingStar.tsx`,we=50;function Te({className:t,color:n,centerShift:r,onMouseMove:i}){let a=o(),s=p(),c=C(e=>{let t=e.currentTarget.getBoundingClientRect(),n=t.left+t.width/2+r[0],a=t.top+t.height/2+r[1],o=e.clientX-n,c=e.clientY-a,l=Math.max(-1,Math.min(1,o/we)),u=Math.max(-1,Math.min(1,c/we)),f=l*40,p=-u*40;d(()=>{s.current.style.transform=`scale(1.1) rotateX(${p}deg) rotateY(${f}deg)`}),i()}),l=C(()=>{d(()=>{s.current.style.transform=``})});return x(`div`,{className:e(J.root,t),onMouseMove:c,onMouseLeave:l,children:x(`div`,{ref:s,className:e(J.star,J[`star_${n}`]),role:`img`,"aria-label":a(`TelegramStars`)},void 0,!1,{fileName:Ce,lineNumber:60,columnNumber:7},this)},void 0,!1,{fileName:Ce,lineNumber:55,columnNumber:5},this)}var Ee=g(Te),Y={root:`cK6KQXnQ`,"ai-egg":`ZP86O9Hy`,aiEgg:`ZP86O9Hy`,title:`xRm-Im3m`,description:`IQdQ9MU9`,particles:`_8ooQ3s8b`,stickerWrapper:`hHs2sTV-`,diamond3d:`tPAJ2-tU`,diamond3D:`tPAJ2-tU`,cocoon:`Rlhm9gZk`},De=new URL(`cocoon-DzgJltGQ.webp`,import.meta.url).href,X=`/Users/hao/Projects/einkgram/src/components/modals/common/ParticlesHeader.tsx`,Z=8*n,Oe=130,ke={centerShift:[0,-36]};function Ae({model:t,sticker:n,color:r,title:i,description:a,isDisabled:o,className:s,modelClassName:c}){let l=p(),u=p(),d=C(()=>{u.current?.()}),f=C(e=>{u.current=e});return x(`div`,{className:e(Y.root,Y[t],s),children:[x(B,{color:r,centerShift:ke.centerShift,isDisabled:o,className:Y.particles,onRequestAnimation:f},void 0,!1,{fileName:X,lineNumber:62,columnNumber:7},this),t===`swaying-star`?x(Ee,{className:c,color:r,centerShift:ke.centerShift,onMouseMove:d},void 0,!1,{fileName:X,lineNumber:71,columnNumber:9},this):t===`ai-egg`?x(`img`,{src:De,alt:``,role:`presentation`,"aria-hidden":`true`,className:e(Y.cocoon,c),draggable:!1,onMouseMove:d},void 0,!1,{fileName:X,lineNumber:78,columnNumber:9},this):t===`speeding-diamond`?x(xe,{className:c,onMouseMove:d},void 0,!1,{fileName:X,lineNumber:88,columnNumber:9},this):t===`diamond-3d`?x(`div`,{className:e(Y.diamond3d,c),onMouseMove:d,children:x(U,{size:Oe},void 0,!1,{fileName:X,lineNumber:91,columnNumber:11},this)},void 0,!1,{fileName:X,lineNumber:90,columnNumber:9},this):t===`sticker`&&n&&x(`div`,{ref:l,className:e(Y.stickerWrapper,c),style:`width: ${Z}px; height: ${Z}px`,onMouseMove:d,children:x(T,{containerRef:l,sticker:n,size:Z,shouldPreloadPreview:!0,shouldLoop:!0},void 0,!1,{fileName:X,lineNumber:100,columnNumber:11},this)},void 0,!1,{fileName:X,lineNumber:94,columnNumber:9},this),x(`h2`,{className:Y.title,children:i},void 0,!1,{fileName:X,lineNumber:110,columnNumber:7},this),x(`div`,{className:Y.description,children:a},void 0,!1,{fileName:X,lineNumber:114,columnNumber:7},this)]},void 0,!0,{fileName:X,lineNumber:61,columnNumber:5},this)}var je=g(Ae),Q={table:`RMEi5Sgb`,cell:`AEl8NMjg`,title:`IypKoG1m`,value:`ZO-KCUSl`,fullWidth:`_1WIqSuNB`,chatItem:`J6it2-iy`},$=`/Users/hao/Projects/einkgram/src/components/modals/common/TableInfo.tsx`,Me=g(({tableData:t,className:n,onChatClick:r})=>{let{openChat:a}=i(),o=C(e=>{r?r(e):a({id:e})});if(t?.length)return x(`div`,{className:e(Q.table,n),children:t.map(([t,n])=>x(S,{children:[!!t&&x(`div`,{className:e(Q.cell,Q.title),children:t},void 0,!1,{fileName:$,lineNumber:45,columnNumber:30},void 0),x(`div`,{className:e(Q.cell,Q.value,!t&&Q.fullWidth),children:typeof n==`object`&&`chatId`in n?x(O,{peerId:n.chatId,className:Q.chatItem,forceShowSelf:!0,withEmojiStatus:n.withEmojiStatus,clickArg:n.chatId,onClick:o},void 0,!1,{fileName:$,lineNumber:48,columnNumber:15},void 0):n},void 0,!1,{fileName:$,lineNumber:46,columnNumber:11},void 0)]},void 0,!0,{fileName:$,lineNumber:44,columnNumber:9},void 0))},void 0,!1,{fileName:$,lineNumber:42,columnNumber:5},void 0)});export{te as a,B as i,je as n,U as r,Me as t};