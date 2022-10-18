

let arr = [];
for(let i = 0; i < 100; i++){
    let space = (i + 1 < 10) ? '  ' : ' '
    arr[i] = String(i + 1) + space;
}

let bigArr = [];
let i = 0;
let j = 0;
let k = 1;
let m = 0;
while(i < 100){

    bigArr[m] = new Array(k);

    while(j < k){
        
        bigArr[m][j] = arr[i];
        j++;
        i++;

    }

    j = 0;
    k++;
    m++;
}

function doubleFill(a, spacer) {
    let b = [];
    for(let i = 0; i < a.length; i++){
        b[i * 2] = a[i];
        if(i != a.length -1) b[i * 2 + 1] = spacer;
    }

    return b;
}


bigArr = bigArr.map(arr => {
    return doubleFill(arr, ' ');
});

let pad = (bigArr.at(-1).length - 1) /2;

for(let i = 0; i < bigArr.length; i++){
    for(let j = 0; j < pad - i; j++){
        bigArr[i].unshift('  ');
        bigArr[i].push('  ');
    }
}

bigArr.map(arr => {
    return arr.join('');
}).forEach(console.log);



// bigArr.forEach((arr, i) => {
//     console.log(arr.join("").padStart(pad - i,"___").padEnd(pad - i,"___"))
// })

