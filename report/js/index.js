activateToggle = function (element) {

    var tidNo = element.getAttribute('tid');
    var eles = document.querySelectorAll('[class="hide"][tid="' + tidNo + '"]');

    for (var i = 0; i < eles.length; ++i) {
        eles[i].style.display = eles[i].style.display === 'none' ? '' : 'none';
    }

    $(document).ready(function () {
        $(document).ready(function () {
            $('[class^="group-"]').each(function (index) {
                var clName = '\'' + $(this).attr('class') + '\'';
                $(this).colorbox({rel: clName});
            });
        });
    });


};
