;(function (designWidth, maxWidth) {
   
    var doc = document,
        win = window,
        docEl = doc.documentElement,
        remStyle = document.createElement("style"),
        tid
    function refreshRem() {
        var width = docEl.getBoundingClientRect().width
        maxWidth = maxWidth || 540
        width > maxWidth && (width = maxWidth)
        // 这里之所以是100 是因为设定的基准单位是100 这个值是多少都无所谓我感觉 
        // 因为100px 基准100 的话转换就是 1rem  否则按比例转换就是了 所以这个基准单位不重要

        // 其实他就是定义好了 在宽度 750px 的情况下 1rem = 100px
        // 那么随着屏幕的缩小 根据 占比 来搜索 所以就等于 当前屏幕 width / desighwidth * 100 
        // 如果设计稿 单位= 375 那么只要把 desigWidth = 375 即可 那么 在375的情况下1rem = 100px
        // 那么直接截图出 宽度 写上px 然后再转成 rem即可
        var rem = (width * 100) / designWidth
        if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
        } else if (/iPad/i.test(navigator.userAgent)) {
        } else {
            rem = 50
        }
        //console.log("width = " ,width ,"px = ",rem,"designWidth = ",designWidth)
        remStyle.innerHTML = "html{font-size:" + rem + "px;}"
    }

    if (docEl.firstElementChild) {
        docEl.firstElementChild.appendChild(remStyle)
    } else {
        var wrap = doc.createElement("div")
        wrap.appendChild(remStyle)
        doc.write(wrap.innerHTML)
        wrap = null
    }
    refreshRem()

    win.addEventListener(
        "resize",
        function () {
            clearTimeout(tid)
            tid = setTimeout(refreshRem, 300)
        },
        false
    )

    win.addEventListener(
        "pageshow",
        function (e) {
            if (e.persisted) {
                clearTimeout(tid)
                tid = setTimeout(refreshRem, 300)
            }
        },
        false
    )

    if (doc.readyState === "complete") {
        doc.body.style.fontSize = "16px"
    } else {
        doc.addEventListener(
            "DOMContentLoaded",
            function (e) {
                doc.body.style.fontSize = "16px"
            },
            false
        )
    }
})(375, 375)
