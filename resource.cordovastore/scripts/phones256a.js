// Landing
$(function () {
    $('body.phonesPage input:checkbox').change(function (e) {
        var $phones = $('.phones');
        if ($("input:checked", $phones).length > 1) {
            $("input:submit", $phones).attr("disabled", "");

            if ($("input:checked", $phones).length > 2) {
                $("input:checkbox", $phones).not(':checked').attr("disabled", "disabled");
            }
            else {
                $("input:checkbox", $phones).attr("disabled", "");
            }
        } else {
            $("input:submit", $phones).attr("disabled", "disabled");
        }
    });

    $('body.phonesPage input:checkbox').change();
});

// Details
$(function () {
    $('#buyNow .droparrow').mouseenter(function (e) {
        $('#buyNow .droparrow').addClass('hover');
        $('#buyNow .dropmenu').show();
    });

    $('#buyNow').mouseleave(function (e) {
        $('#buyNow .dropmenu').hide();
        $('#buyNow .droparrow').removeClass('hover');
    });
});