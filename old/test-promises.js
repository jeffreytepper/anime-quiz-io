const block  = () => new Promise((resolve) => {
     
    let n = 3000000000;

    while(n > 0) {
        n--;
    }

    resolve();

});

const wait5 = () => new Promise((resolve) => {

    setTimeout(() => resolve(), 5000);
})

console.log('start');
wait5().then(() => console.log('done'));
//block().then(() => console.log('done'));
console.log('end');