function isValid(s) {
    s = s.split('');
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;

    for(let i = 0; i < s.length; i++){

        switch(s[i]) {
            case '(':
                count1++;
                break;
            case ')':
                count1--;
                break;
            case '[':
                count2++;
                break;
            case ']':
                count2--;
                break;
            case '{':
                count3++;
                break;
            case '}':
                count3--;
                break;
        }

        if(count1 < 0 || count2 < 0 || count3 < 0) return false;


    }

    return count1 == 0 && count2 == 0 && count3 == 0;
}
const str = '([)]';


function divide(dividend, divisor) {
    let sign = 1;
    if(dividend * divisor < 0) sign = -1;

    dividend = Math.abs(dividend);
    divisor = Math.abs(divisor);

    let remainder = dividend;
    let i = 0;
    while(remainder >= divisor){
        remainder -= divisor;
        i++;
    }

    return i * sign;
}

function triangularSum(nums) {
    const len = nums.length;
    for(let i = 0; i < len - 1; i++){

        let newNums = new Array(nums.length - 1);
        for(let j = 0; j < newNums.length; j++){
            newNums[j] = (nums[j] + nums[j+1]) % 10;
        }
        nums = newNums;
    }

    return nums[0];
}

function minMaxGame(nums) {
    while(nums.length > 1){
        let newNums = new Array(nums.length / 2);
        for(let i = 0; i < newNums.length; i += 2){
            newNums[i] = Math.min(nums[i*2],nums[i*2 + 1]);
        }
        for(let i = 1; i < newNums.length; i += 2){
            newNums[i] = Math.max(nums[i*2],nums[i*2 + 1]);
        }
        nums = newNums;
    }

    return nums[0];
}

function lastRemaining(n) {
    let arr = new Array(n);
    for(let i = 0; i < arr.length; i++){
        arr[i] = i + 1;
    }

    let j = 0;
    while (arr.length > 1){
        console.log(arr);
        let newArr = [];
        arr.forEach((e,i)=> {
            if(i % 2 == 1) newArr[j] = e;
            j++;
        });
        j = 0;
        arr = newArr;
    }

    return arr[0];
}

function iterPlay(arr) {
    for(let i = 0; i < arr.length; i++){
        for(let j = 0; j < arr.length - i; j++){
            process.stdout.write(String(arr[j]));
        }
        console.log('')
    }
}

iterPlay([1,2,3,4,5])