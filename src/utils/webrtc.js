
class WebRtcWrapper {
    eventType;
    action;
    sdp;
    answer;
    iceCondidate;

}
export default  {
    WebRtcEventType_1 : 1,
    WebRtcEventType_2 : 2,
    WebRtcEventType_3 : 3,
    WebRtcEventType_4 : 4,
    WebRtcEventType_5 : 5,


    WebRtcActionEventType_1 : 1,
    WebRtcActionEventType_2 : 2,
    WebRtcActionEventType_3 : 3,
}
class Action {
    eventType;
    // 是否同意
    allow;
    // 拨打人
    from;
    // 接收人
    to;
    // msg
    msg;
}

export function  getInit() {
    let webRtcWrapper = new WebRtcWrapper();
    webRtcWrapper.action = new Action();
    return webRtcWrapper;
}

let iceservers = [
    {
        urls: "stun:35.221.188.213:3478"
    },
    {
        urls: ["turn:35.221.188.213:3478"],
        username: "kurento",
        credential: "kurento"
    }
]

export function options(localVideo,remoteVideo,onicecandidate,oncandidategatheringdone
                        ,onMessage
                        ,onOpen
                        ,onbufferedamountlow
                        ,onClosed
                        ,onerror) {
    return {
        localVideo : localVideo,
        remoteVideo : remoteVideo,
        onicecandidate:onicecandidate,
        oncandidategatheringdone:oncandidategatheringdone,
        configuration:{
            iceServers:	iceservers
        },
        onerror:function (erro) {
            console.log("webrtc 发生错误",erro)
        }
        // dataChannels : true,
        // dataChannelConfig: {
        //     id :randomNum(100,20000),
        //     onmessage : onMessage,
        //     onopen : onOpen,
        //     onclose : onClosed,
        //     onbufferedamountlow : onbufferedamountlow,
        //     onerror : onerror
        // },
    }
}


function randomNum(minNum,maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10);
            break;
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
            break;
        default:
            return 0;
            break;
    }
}