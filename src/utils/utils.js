export function stringToBytes(str){
    var bytes = new Array();
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        var s = parseInt(c).toString(2);
        if(c >= parseInt("000080",16) && c <= parseInt("0007FF",16)){
            var af = "";
            for(var j = 0; j < (11 - s.length); j++){
                af += "0";
            }
            af += s;
            var n1 = parseInt("110" + af.substring(0,5),2);
            var n2 = parseInt("110" + af.substring(5),2);
            if(n1 > 127) n1 -= 256;
            if(n2 > 127) n2 -= 256;
            bytes.push(n1);
            bytes.push(n2);
        }else if(c >= parseInt("000800",16) && c <= parseInt("00FFFF",16)){
            var af = "";
            for(var j = 0; j < (16 - s.length); j++){
                af += "0";
            }
            af += s;
            var n1 = parseInt("1110" + af.substring(0,4),2);
            var n2 = parseInt("10" + af.substring(4,10),2);
            var n3 = parseInt("10" + af.substring(10),2);
            if(n1 > 127) n1 -= 256;
            if(n2 > 127) n2 -= 256;
            if(n3 > 127) n3 -= 256;
            bytes.push(n1);
            bytes.push(n2);
            bytes.push(n3);
        }else if(c >= parseInt("010000",16) && c <= parseInt("10FFFF",16)){
            var af = "";
            for(var j = 0; j < (21 - s.length); j++){
                af += "0";
            }
            af += s;
            var n1 = parseInt("11110" + af.substring(0,3),2);
            var n2 = parseInt("10" + af.substring(3,9),2);
            var n3 = parseInt("10" + af.substring(9,15),2);
            var n4 = parseInt("10" + af.substring(15),2);
            if(n1 > 127) n1 -= 256;
            if(n2 > 127) n2 -= 256;
            if(n3 > 127) n3 -= 256;
            if(n4 > 127) n4 -= 256;
            bytes.push(n1);
            bytes.push(n2);
            bytes.push(n3);
            bytes.push(n4);
        }else{
            bytes.push(c & 0xff);
        }
    }
    return bytes;
}
// 中文转换需要特殊处理。喷了
export function Utf8ArrayToStr(array) {
    var out, i, len, c
    var char2, char3

    out = ""
    len = array.length
    i = 0
    while (i < len) {
        c = array[i++]
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c)
                break
            case 12:
            case 13:
                // 110x xxxx 10xx xxxx
                char2 = array[i++]
                out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
                break
            case 14:
                // 1110 xxxx 10xx xxxx 10xx xxxx
                char2 = array[i++]
                char3 = array[i++]
                out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0))
                break
        }
    }

    return out
}

export function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf))
}

export function uuid() {
    var s = []
    var hexDigits = "0123456789abcdef"
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
    }
    s[14] = "4" // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-"

    var uuid = s.join("")

    return uuid.replaceAll("-","")
}



