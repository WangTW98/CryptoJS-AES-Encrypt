// 使用 require 方法加载 fs 核心模块
let fs = require('fs')
let os = require('os')
let path = require("path");
let readline = require("readline");

const CryptoJS = require('./crypto-js');  //引用AES源码js

const readliner = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname, './base.obj')),
});

// AES加密
function Encrypt(word) {
    const key = CryptoJS.enc.Utf8.parse("1234567812345678");  //十六位十六进制数作为密钥
    const iv = CryptoJS.enc.Utf8.parse('8765432187654321');   //十六位十六进制数作为密钥偏移量
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}
// AES解密
function Decrypt(word) {
    const key = CryptoJS.enc.Utf8.parse("1234567812345678");  //十六位十六进制数作为密钥
    const iv = CryptoJS.enc.Utf8.parse('8765432187654321');   //十六位十六进制数作为密钥偏移量
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

// 每行数据单独加密
// readliner.on('line', function(chunk) {
// 	//处理每一行数据
//     console.log(chunk)
//     // Encrypt(chunk)
//     fs.appendFileSync('out.txt',Encrypt(chunk)+os.EOL);
// });
 
// 分段加密
let count = 0 // 读取行数计数
let strBuffer = '' // 读取数据暂存
readliner.on('line', function(chunk) {
	//处理每一行数据
    strBuffer+=chunk // 获取当前行数据
    strBuffer+=os.EOL // 每读取一行，添加对应系统下的换行符
    count+=1 // 读取行数计数自增
    if (count === 100000){ // count:每读取100000行数据加密一次
        // Encrypt(chunk)
        fs.appendFileSync('out.txt',Encrypt(strBuffer)); // 加密数据追加写入到out.txt中
        fs.appendFileSync('out.txt','nextBlock'); // 以‘nextBlock’作为分割符，分段解密时以此为依据进行分割
        count = 0 // 读取行数计数清零
        strBuffer = '' // 清空读取数据暂存内容
    }
});

readliner.on('close', function() {
	//文件读取结束
    console.log('read finished')
    fs.appendFileSync('out.txt',Encrypt(strBuffer));
});


// 同步读取文件
// let contentText = fs.readFileSync('base.obj','utf-8'); // 读取xxx.obj
// console.log(contentText);


// let outStr = Encrypt(contentText);
// 同步写文件
// fs.writeFileSync('out.txt',Encrypt(contentText)); // 输出加密文件
// fs.writeFileSync('out.obj',Decrypt(outStr)); // 输出解密文件