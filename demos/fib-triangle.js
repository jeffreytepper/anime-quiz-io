

function fibTriangle(rows) {
    let bigArr = [];

    for(let i = 0; i < rows; i++){
        bigArr[i] = new Array(i + 1);
        bigArr[i].fill(0);
    }

    bigArr[0][0] = 1;

    for(let i = 1; i < rows; i++) {
        for(let j = 0; j < bigArr[i].length; j++) {
            let left = bigArr[i - 1][j - 1];
            let right = bigArr[i - 1][j];
            if(isNaN(left)) left = 0;
            if(isNaN(right)) right = 0;
            bigArr[i][j] = left + right;
        }
    }

    let newArr = [];
    for(let i = 0; i < bigArr.length; i++) {
        newArr[i] = new Array(bigArr[i].length * 2 - 1);
        for(let j = 0; j < bigArr[i].length; j++) {
            newArr[i][j * 2] = bigArr[i][j];
            if(j * 2 + 1 < newArr[i].length) newArr[i][j * 2 + 1] = '  ';
        }
    }


    let pad = Math.floor(newArr[rows-1].length/2)
    for(let i = 0; i < newArr.length; i++) {
        for(j = 0; j < pad - i; j++){
            newArr[i].unshift('  ');
            newArr[i].push('  ');
        }
    }

    for(let i = 0; i < newArr.length; i++) {
        console.log(newArr[i].join(''));
    }
}

fibTriangle(11);