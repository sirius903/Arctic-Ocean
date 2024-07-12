const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


let dx = canvas.width / 2;
let dy = canvas.height / 2;

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    dx = canvas.width / 2;
    dy = canvas.height / 2;
}

window.onload = resize();
window.addEventListener("resize", e => resize());

let timer = 0;

ctx.strokeStyle = 'white';
ctx.lineWidth = 2;

function dot(x = dx, y = dy){
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.fillStyle = 'black';

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.fillStyle = 'white';
}

let types;
let objects = [];
fetch("./src/json/Types.json").then((res) => {
    return res.json();
}).then(($types) => {
    types = $types;
    fetch("./src/json/Objects.json").then((res) => {
      return res.json();
    }).then(($objects) => {
        objects = $objects;
        objects.forEach(x => {
            if(typeof(x.type) == 'number'){
                let type = types[x.type];
                if(x.v ?? true) x.v = type.v;
                if(x.wave ?? true) x.wave = type.wave;
                x.image = new Image();
                x.image.src = 'images/' + type.src + '.' + (type.type ?? 'png');
                x.image.addEventListener('load', () => {
                    x.load = false;
                });
            }else{
                if(x.src ?? false){
                    x.image = new Image();
                    x.image.src = 'images/' + x.src + '.' + (x.file ?? 'png');
                    x.image?.addEventListener('load', () => {
                        x.load = false;
                        // console.log(1);
                    });
                }
            }
        })
    })
})


setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    timer += 1;
    function wave(color, v, w){
        function xy(i = 0, v = 5, w = 0){
            return[canvas.width * i / 100, 15 * Math.sin((timer * v + i * 5 + w) / 120 * Math.PI) + dy]
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(...xy(0, v, w));
        for(let i = 1; i <= 100; i++){
            ctx.lineTo(...xy(i, v, w))
        }
        ctx.lineTo(2 * dx, 2 * dy);
        ctx.lineTo(0, 2 * dy);
        ctx.fill();
        ctx.fillStyle = 'white';
    }
    wave('#a1e4ff50');
    wave('#34aeeb50', 6.1, 67);
    wave('#6fa7e350', 3.7, 23);
    if(objects.filter(x => (x.type ?? false) && (x.load ?? true)).length == 0){
        objects.forEach(x => {
            if(typeof(x.type) == 'number'){
                let size = types[x.type].ratio.map(y => y * x.scale);
                // console.log(size);
                let xy = [dx * x.xy[0] / 50 - size[0] / 2, dy * x.xy[1] / 50 - size[1] / 2 + Math.sin(x.xy[0] / 2) * x.wave, size[0], size[1]];
                ctx.drawImage(x.image, ...xy);
                x.xy[0] -= x.v;
                if(x.xy[0] < -100) x.xy[0] += 300;
                if(x.xy[0] > 200) x.xy[0] -= 300;   
            }else{
                let xy = [dx * x.xy[0] / 50 - x.size[0] / 2, dy * x.xy[1] / 50 - x.size[1] / 2 + Math.sin(x.xy[0] / 2) * x.wave, x.size[0], x.size[1]];
                if(x.src ?? false){
                    ctx.drawImage(x.image, ...xy);
                }else{
                    ctx.fillRect(...xy);
                }
                x.xy[0] -= x.v;
                if(x.xy[0] < -100) x.xy[0] += 300;
                if(x.xy[0] > 200) x.xy[0] -= 300;
            }
        })
    }
}, 20);