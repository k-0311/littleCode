```javascript
//1.反转字符串
const rever = str => str.split('').reduce((res, cur) => cur + res)
// console.log(rever('abcd'))

//2.回文
const isPalindrome = str => rever(str) === str 
// console.log(isPalindrome('eyaye'))

//3.整数反转
const IntegerReversal = num => parseInt(num.toString().split('').reverse().join('')) * Math.sign(num) 
// console.log(IntegerReversal(1234))

//4.记录出现最多的字符
const maxWord = str => {
    const obj = {}
    let max = 0
    let character = ''
    for (const val of str) {
        obj[val] = obj[val] + 1 || 1
    }
    for (let key of Object.keys(obj)) {
        if (obj[key] > max) {
            max = obj[key]
            character = key
        }
    }
    return character
}
// console.log(maxWord('shdgsjdbkskssssss'))

//5.元音字母字数
const aeuio = str => {
    let match = str.match(/[aeuio]/gi)
    return match && match.length || 0
}
// console.log(aeuio('qqqqqqq'))

//6.数组拆分
const chunk = (arr, size) => {
    let res = []
    for (i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size))
    }
    return res
}
// console.log(chunk([1,2,3,4,5,6,7,8,9,0],9))

//7.反转单词
const reverseWord = str => str.split(' ').map(word => word.split('').reverse().join('')).join(' ')
// console.log(reverseWord('fuck tr and vs'))
```

