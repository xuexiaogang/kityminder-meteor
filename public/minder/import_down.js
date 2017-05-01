var import_down = (function () {
    var holder = document.getElementById('importfile');
    holder.ondragover = function () { return false; };
    holder.ondragend = function () { return false; };
    holder.ondrop = function (e) {
        console.log("importfile");
        e.preventDefault();
        var file = e.dataTransfer.files[0],
            reader = new FileReader();
        reader.onload = function (event) {
            editor.minder.importJson(JSON.parse(reader.result));
        };
        reader.readAsText(file);
        return false;
    };
    var savefilebutton = document.getElementById('downfile');
    savefilebutton.onclick = function (e) {
        console.log("downfile");
        e.preventDefault();
        var data = JSON.stringify(editor.minder.exportJson());
        var el = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        if (el) {
            el.href = 'data:text/plain,' + data;
            el.download = editor.minder.getRoot().data.text + '.km';;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            el.dispatchEvent(event);
        }
        return false;
    };
    var savesvgbutton = document.getElementById('savesvg');
    savesvgbutton.onclick = function (e) {
        console.log("savesvgfile");
        e.preventDefault();
        editor.minder.exportData("svg", "").then(function (data) {
            var el = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            if (el) {
                el.href = 'data:text/plain,' + data;
                el.download = editor.minder.getRoot().data.text + '.svg';;
                var event = document.createEvent('MouseEvents');
                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                el.dispatchEvent(event);
            }
        });
        return false;
    }
})();