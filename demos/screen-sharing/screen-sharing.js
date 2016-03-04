(function ($) {

    // 声明变量
    var session;
    var localStream;
    var mediaList = document.querySelector('#media-list');

    // 获取token并初始化session
    $.ajax({
        url: "http://localhost:8080/tokens/screen-sharing",
        method: 'GET',
        success: function (resp) {
            var token = resp.uuid;
            initSession(token);
        }
    });

    $("#share-screen").click(function () {
        RTCat.extensionId = 'kopddpjmdlllnpkpcphndjiaohbakkjb';
        initStream({screen: true, ratio: 1.33}, function (stream) {
            displayStream('self', stream)
        });
    });

    // 初始化流
    function initStream(options, callback) {
        localStream = new RTCat.Stream(options);
        localStream.on('access-accepted', function () {
                session.send({stream: localStream, data: true});
                callback(localStream);
            }
        );
        localStream.on('access-failed', function (err) {
            console.log(err);
        });

        localStream.on('play-error', function (err) {
            console.log(err);
        });
        localStream.init();
    }

    // 显示流
    function displayStream(id, stream) {

        // Video container
        var videoContainer = document.createElement("div");
        videoContainer.setAttribute('class', "col-md-6");

        // Video player
        var videoPlayer = document.createElement('div');
        videoPlayer.setAttribute("id", "peer-" + id);
        videoPlayer.setAttribute("class", "video-player");

        videoContainer.appendChild(videoPlayer);
        mediaList.appendChild(videoContainer);

        stream.play("peer-" + id, {width:530, height:400});
    }

    function initSession(token){
        session = new RTCat.Session(token);

        session.connect();

        session.on('connected', function (users) {
            console.log('Session connected');
        });

        session.on('in', function (token) {
            if (localStream) {
                session.sendTo({to: token, stream: localStream, data: true});
            }
            console.log('someone in');
        });

        session.on('out', function (token) {
            console.log('someone out');
        });

        session.on('remote', function (r_channel) {
            var id = r_channel.getId();
            r_channel.on('stream', function (stream) {
                displayStream(id, stream);
            });
            r_channel.on('close', function () {
                $('#peer-' + id).parent().remove();
            });
        });

    }

}).apply(this, [jQuery]);