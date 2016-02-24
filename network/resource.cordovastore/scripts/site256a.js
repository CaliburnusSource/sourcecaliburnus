// *** Common Initialization ***//
var rtl = $("html").attr("dir") == "rtl";
var isIpad = navigator.platform.indexOf("iPad") != -1;

// Site
$(function () {

    // Pages with video components
    if (!Modernizr.video.h264 && !Modernizr.video.ogg) {
        $('.watchVideo').hide();
        $('.videoPlayButton').hide();        
        $('.fillVideoFallback').show();
    }
    else {
        $('.fillVideoContainer').show();
    }

    $(".commerceSignOut").each(function () {
        $(this).click(function () {
            $.get('/auth/commerce-signout');
        });
    });

    $("div.fillVideoButtonContainer").hover(
        function () {
            if (!isIpad) {
                $(this).children(".videoPlayHoverButton").show();
                $(this).children(".videoPlayButton").hide();
            }
        }, function () {
            if (!isIpad) {
                $(this).children(".videoPlayHoverButton").hide();
                $(this).children(".videoPlayButton").show();
            }
        });

    $("a.hoverButton").hover(
        function () {
            if (!isIpad) {
                $(this).find("img.hover").css("display", "inline-block");
                $(this).find("img.normal").css("display", "none");
            }
        }, function () {
            if (!isIpad) {
                $(this).find("img.normal").css("display", "inline-block");
                $(this).find("img.hover").css("display", "none");
            }
        });

});

// Search pages
$(function () {

    $('#deviceFilter input[type="radio"]').change(function (e) {
        var url = $('#deviceFilter').attr("action");
        if (url.indexOf("?") >= 0) {
            url = url + "&";
        } else {
            url = url + "?";
        }
        window.location.href = url + "wpv=" + $('#deviceFilter input:checked').val();
    });

    $('#searchButton[type="image"]').click(function (e) {
        e.preventDefault();
        if (!$('#searchInput[type="text"]').data("locked")) {
            $(this).parents('form').submit();
        }
    });
    $('#searchInput[type="text"]').blur(function () {
        if ($.trim($(this).val()) === "") {
            $(this).placeholder(GlobalSettings.SearchPlaceHolder);
        };
    }).keydown(function (e) {
        switch (e.which) {
            case 13: // enter
                e.preventDefault();
                if ($.trim($(this).val()) !== "" && !$('#searchInput[type="text"]').data("locked")) {
                    $(this).parents('form').submit();
                }
                break;
            default:
                return;
        }
    });
});

$(function () {
    var $menu = $('#userArea .dropmenu');
    var $items = $('a', $menu);

    var index = 0;
    var clickedOpen = false;

    if ($menu.length == 0) {
        return;
    }

    $('li.menuitem.activatable', $menu).bind('focusin mouseenter', function (e) {
        $('li.menuitem.active', $menu).removeClass('active');

        $(this).addClass('active');
    });

    $('li.activatable', $menu).click(function (e) {
        if ($(e.target).is('a')) {
            return;
        }

        e.preventDefault();
        document.location = $('a', $(this)).attr('href');
    });

    $menu.bind('show', function () {
        if ($menu.hasClass('visible')) {
            return;
        }

        index = 0;
        $('li.menuitem.active', $menu).removeClass('active');
        $(document).bind('keydown', keyHandler);
        $(document).bind('click', clickHandler);
        $menu.addClass('visible');
    });

    $menu.bind('hide', function () {
        if (!$menu.hasClass('visible')) {
            return;
        }

        $(document).unbind('keydown', keyHandler);
        $(document).unbind('click', clickHandler);
        $menu.removeClass('visible');
        clickedOpen = false;
    });

    $menu.bind('focusin mouseenter', function (e) {
        if ($menu.hasClass('visible')) {
            return;
        }

        e.preventDefault();
        $menu.trigger('show');
    });

    $menu.bind('mouseup', function (e) {
        clickedOpen = true;
    });

    $menu.bind('blur mouseleave', function (e) {
        if (clickedOpen) {
            return;
        }

        e.preventDefault();
        $menu.trigger('hide');
    });

    function clickHandler(e) {
        $target = $(e.target);
        if ($target.parents('.#userArea .dropmenu').length == 0) {
            $menu.trigger('hide');
        }
    };

    function keyHandler(e) {
        var tabbed = false;
        switch (e.which) {
            case 27: //escape
                e.preventDefault();
                $menu.trigger('hide');
                return;
            case 9: // tab
                if (e.shiftKey) {
                    index--;
                }
                else {
                    index++;
                }

                tabbed = true;
                break;
            case 38: // up arrow
                index--;
                break;
            case 40: // down arrow
                index++;
                break;
            default:
                return;
        }

        if (tabbed) {
            if (index < 0 || index >= $items.length) {
                $menu.trigger('hide');
                return;
            }
        }

        if (index < 0) {
            index = 0;
        } else if (index >= $items.length) {
            index = $items.length - 1;
        }

        e.preventDefault();
        $items[index].focus();
    }
});

// Home page
$(function () {
    $("ul.newsticker").rotator(10, 150, 0.5);
});

// Video Player
$(function () {
    function hideCurrentVideo() {
        $(document).unbind('keydown', videoPlayerKeyHandler);
        $('.videoPlayerPopup').hide();
        $('.videoPlayer').hide();
    }

    function videoPlayerKeyHandler(e) {
        if (e.which == 27) {
            hideCurrentVideo();
        }
    }
    $("iframe[data-videoUrl]").each(
    function () {
        if (!Modernizr.video.h264 && !Modernizr.video.ogg) {
            return false;
        }

        if (isIpad) {
            return false;
        }

        var iframe = this;
        function func() {
            $(iframe).css("visibility", "visible");
            $(iframe).siblings(".inlineVideoImage").fadeOut();
        }
        $(this).load(function () {
            setTimeout(func, 300);
        });
        $(this).attr("src", $(this).attr("data-videoUrl"));

        function hideVideo() {
            if ($(iframe).css("visibility") == "visible") {
                $(iframe).hide();
            }
        }
        window.onbeforeunload = hideVideo;
    });
    $("a.fillVideoCloseButton").click(
        function () {
            if (!Modernizr.video.h264 && !Modernizr.video.ogg) {
                return false;
            }

            // Pause video and hide video
            var iframe = $(this).siblings("iframe");
            var iframeDoc = document.getElementById($(iframe).attr("id"));
            iframeDoc.contentWindow.postMessage("video.pause", $(iframe).attr("src").split('/', 3).join('/'));
            $(iframe).fadeOut();

            var parent = $(this).closest("div.fillVideoPlayerContainer");
            $(parent).fadeOut();

            $(iframe).parent().css("position", "absolute");
            $(iframe).closest(".fillVideoPlayerContainer").css("position", "absolute");
            $(iframe).closest(".content").css("position", "relative");
            var closestPanel = $(iframe).closest(".panel");
            closestPanel.css("position", "relative");
            closestPanel.find(".innerContent").css("visibility", "visible");

            var closestGroup = $(iframe).closest(".group");
            closestGroup.css("position", "relative");
            closestGroup.find(".innerContent").css("visibility", "visible");
        });

    $("a.fillVideoPlayButton").click(
        function () {
            if (!Modernizr.video.h264 && !Modernizr.video.ogg) {
                return false;
            }

            // If user somehow went offline, do not bother with FillVideos
            if (!navigator.onLine) {
                return false;
            }

            // If its a mobile browser or Ipad, just send them the direct link to the mp4
            if ($("body").attr("data-mobileBrowser") == "true" || isIpad) {
                location.href = $(this).attr("data-videoMobileUrl");
                return false;
            }
            else {
                // Identify parent and video player group
                var videoMode = $(this).attr("data-videoMode");
                var parent = $(this).closest(".panel");
                if (videoMode == "FillGroup") {
                    parent = $(this).closest(".group");
                }

                var videoPlayer = $(parent).children("div.fillVideoPlayerContainer").find("div.fillVideoPlayerGroup");

                // Set the video player group to be same width and height as video
                $(videoPlayer).width($(this).attr("data-videoWidth"));
                $(videoPlayer).height($(this).attr("data-videoHeight"));

                // Absolute center the video player group
                $(videoPlayer).css("margin-top", "-" + $(this).attr("data-videoHeight") / 2 + "px");
                $(videoPlayer).css("margin-left", "-" + $(this).attr("data-videoWidth") / 2 + "px");

                // Remove existing iframe
                $(videoPlayer).find(".fillVideoIframe").remove();

                // Recreate the iframe
                var iframeHtml = '<iframe data-videoAtlasId="' + $(this).attr("data-videoAtlasId") + '" width="' + $(this).attr("data-videoWidth") + '" height="' + $(this).attr("data-videoHeight") + '" id="' + "fillVideo_" + $(this).attr("data-videoId") + '" style="visibility:hidden; z-index:81" class="fillVideoIframe fillVideoGroup" frameborder="0" scrolling="no" allowTransparency="true" src="' + $(this).attr("data-videoSource") + '"></iframe>';
                $(videoPlayer).append(iframeHtml);

                // Set the background color and height of the video player
                var backgroundColor = $(this).closest("div.panel").css("background-color");
                if (backgroundColor == "transparent") {
                    backgroundColor = "#fff";
                }
                $(videoPlayer).parent().height($(parent).outerHeight()).css("background-color", backgroundColor);

                // Fade in containers
                $(videoPlayer).parent().fadeIn();
                $(videoPlayer).fadeIn();

                // Show iframe after its loaded
                iframe = $(videoPlayer).find("iframe");

                function func() {
                    $(iframe).css("visibility", "visible");
                }
                $(iframe).load(function () {
                    setTimeout(func, 300);
                    $(parent).find(".innerContent").css("visibility", "hidden");
                });
                // setup hovers and mouse clicks
                $(iframe).hover(function () {
                    $(this).siblings("a.fillVideoCloseButton").show();
                }, function () {
                    $(this).siblings("a.fillVideoCloseButton").hide();
                });

                $(iframe).parent().find("a.fillVideoCloseButton").mouseover(function () {
                    $(this).siblings("iframe").trigger('mouseover');
                });
                $(iframe).parent().find("a.fillVideoCloseButton").mouseout(function () {
                    $(this).siblings("iframe").trigger('mouseout');
                });
                $(iframe).parent().find("a.fillVideoCloseButton").mousemove(function () {
                    $(this).siblings("iframe").trigger('mousemove');
                });

                function hideVideo() {
                    if ($(iframe).css("visibility") == "visible") {
                        $(iframe).hide();
                    }
                }
                window.onbeforeunload = hideVideo;
            }
        });
    $('.watchVideo a[data-videoPlayerUrl]').click(function () {
        if ($('.videoPlayerPopup').length == 0) {
            $('<div class="videoPlayerPopup"><div>').appendTo('body');
        } else {
            $('.videoPlayerPopup').show();
        }

        var $iframe = $(this).data('iframe');
        if ($iframe == null) {
            $iframe = $('<iframe class="videoPlayer" frameborder="0" scrolling="no" allowTransparency="true" src=' + $(this).attr('data-videoPlayerUrl') + '></iframe>').appendTo('body');
            $(this).data('iframe', $iframe);
        }

        $iframe.show();
        $(document).bind('keydown', videoPlayerKeyHandler);
    });

    // auto play fill video if hash tag exists
    if (window.location.hash) {
        var stringToCheck = "#play-";
        if (window.location.hash.slice(0, stringToCheck.length) == stringToCheck) {
            var videoId = window.location.hash.slice(stringToCheck.length);
            if ($("a[data-videoId='" + videoId + "']").length > 0) {
                $("a[data-videoId='" + videoId + "']").trigger("click");
            }
        }
    }

    var scrollPos = 0;
    var originalParent;
    $(window).bind('message', function (e) {

        if (!e.originalEvent.origin.endsWith(GlobalSettings.CdnBase)) {
            return;
        }

        // Video id is always the last segment
        var videoArray = e.originalEvent.data.split('.');
        var videoId = videoArray[videoArray.length - 1];

        var iframe;
        var isFillVideo = false;

        // Get the video iframe
        if ($("iframe#fillVideo_" + videoId).length > 0) {
            iframe = $("iframe#fillVideo_" + videoId);
            isFillVideo = true;
        }
        else {
            iframe = $("iframe#inlineVideo_" + videoId);
        }

        // Check if the iframe url has as=1 for autostart video
        if (!isFillVideo && iframe.attr("src").toLowerCase().indexOf("as=1") >= 0) {
            return;
        }

        if (e.originalEvent.data.indexOf('video.close') >= 0) {
            hideCurrentVideo();
        } else if (e.originalEvent.data.indexOf('video.start') >= 0) {
            WpsTracking.omnitureCustomTrack(WpsTracking.properties["videoStart"], videoId);

            // Fire atlas tag if it exists
            var atlasId = $(iframe).attr("data-videoAtlasId");
            if (atlasId && atlasId != "") {
                WpsTracking.atlasTrack(atlasId);
            }
        } else if (e.originalEvent.data.indexOf('video.end') >= 0) {
            WpsTracking.omnitureCustomTrack(WpsTracking.properties["videoEnd"], videoId);

            // Auto hide fill videos
            if (isFillVideo) {
                function func() {
                    $(iframe).siblings("a.fillVideoCloseButton").trigger("click");
                }

                setTimeout(func, 10);
            }
        } else if (e.originalEvent.data.indexOf('video.progress.25') >= 0) {
            WpsTracking.omnitureCustomTrack(WpsTracking.properties["video25%"], videoId);
        } else if (e.originalEvent.data.indexOf('video.progress.50') >= 0) {
            WpsTracking.omnitureCustomTrack(WpsTracking.properties["video50%"], videoId);
        } else if (e.originalEvent.data.indexOf('video.progress.75') >= 0) {
            WpsTracking.omnitureCustomTrack(WpsTracking.properties["video75%"], videoId);
        } else if (e.originalEvent.data.indexOf('video.error') >= 0) {
            WpsTracking.omnitureCustomTrack(WpsTracking.properties["videoError"], videoId);

            // Auto hide fill videos since video player error out
            if (isFillVideo) {
                function func() {
                    $(iframe).siblings("a.fillVideoCloseButton").trigger("click");
                }

                setTimeout(func, 10);
            }
        } else if (e.originalEvent.data.indexOf('video.fullscreen-on') >= 0) {
            if (!isFillVideo) {
                scrollPos = $(document).scrollTop();
                $(iframe).addClass("inlineVideoPlayerFull");

                // fix all parent nodes
                $(iframe).parent().css("position", "static");
                $(iframe).closest(".content").css("position", "static");
                $(iframe).closest(".innerContent").css("position", "static");
                $(iframe).closest(".panel").css("position", "static");
                $(iframe).closest(".group").css("position", "static");

                // hide scroll bar and move to top where the full screen video player is
                $("body").css("overflow", "hidden");
                $(document).scrollTop(0);
            }
            else {
                scrollPos = $(document).scrollTop();
                $(iframe).addClass("fillVideoIframeFull");

                // hide scroll bar and move to top where the full screen video player is
                $("body").css("overflow", "hidden");
                $(document).scrollTop(0);

                // fix all parent nodes
                $(iframe).parent().css("position", "static");
                $(iframe).closest(".content").css("position", "static");
                $(iframe).closest(".fillVideoPlayerContainer").css("position", "static");
                $(iframe).closest(".panel").css("position", "static");
                $(iframe).closest(".group").css("position", "static");
                $(iframe).height("100%");
                $(iframe).width("100%");
            }
        } else if (e.originalEvent.data.indexOf('video.fullscreen-off') >= 0) {
            if (!isFillVideo) {
                $("iframe#inlineVideo_" + videoId).removeClass("inlineVideoPlayerFull");

                $(iframe).parent().css("position", "relative");
                $(iframe).closest(".innerContent").css("position", "relative");
                $(iframe).closest(".content").css("position", "relative");
                $(iframe).closest(".panel").css("position", "relative");
                $(iframe).closest(".group").css("position", "relative");

                $("body").css("overflow", "auto");
                $(document).scrollTop(scrollPos);
            }
            else {
                $(iframe).removeClass("fillVideoIframeFull");

                $("body").css("overflow", "auto");
                $(document).scrollTop(scrollPos);

                $(iframe).parent().css("position", "absolute");
                $(iframe).closest(".fillVideoPlayerContainer").css("position", "absolute");
                $(iframe).closest(".content").css("position", "relative");
                $(iframe).closest(".panel").css("position", "relative");
                $(iframe).closest(".group").css("position", "relative");
            }
        }
    }, true);
});

// Terms of Service
$(function () {
    $acceptTermsOfServiceCheckbox = $('.manageTermsOfService #acceptTermsOfServiceCheckbox');
    $acceptTermsOfServiceButton = $('.manageTermsOfService #acceptTermsOfService input#accept');

    $acceptTermsOfServiceCheckbox.change(function () {
        $('#acceptTermsOfService input#accept').attr('disabled', !$acceptTermsOfServiceCheckbox.attr('checked'));
    });

    $acceptTermsOfServiceButton.attr('disabled', true);
});

// News
$(function () {
    $videoTitleLinks = $(".videoTitle > a");

    $videoTitleLinks.mouseover(function () {
        $(this).parent().parent().find(".hoverButton").trigger("mouseover");
    });
    $videoTitleLinks.mouseout(function () {
        $(this).parent().parent().find(".hoverButton").trigger("mouseout");
    });
});

// Support Topic page
$(function () {
    if ($("body.support.topicPage").length) {
        if (Modernizr.video.h264 || Modernizr.video.ogg) {
            // Replace video tags with iframe
            $("video[data-videoPlayerUrl]").each(function () {
                var url = $(this).attr('data-videoPlayerUrl');
                var height = $(this).attr('data-videoPlayerHeight');
                var width = $(this).attr('data-videoPlayerWidth');
                var videoId = "inlineVideo_" + $(this).attr('data-videoId');
                $(this).parent().prepend('<iframe id="' + videoId + '" class="inlineVideoPlayer" height="' + height + 'px" width="' + width + 'px" frameborder="0" scrolling="no" allowTransparency="true" src=' + url + '></iframe>');
                $(this).remove();
            });
        }

        // Set the correct css class for the link in the toc
        $('#toc a').each(function (i, n) {
            var href = $(n).attr("href").toLowerCase();
            if (href == (location.pathname.toLowerCase()))
                $(n).addClass("active");
        });

        // collapse all answer
        $('ul.faqList > li > div.answer').hide();
        $('ul.faqList > li > div.question > a > span.arrow').html('►');

        // setup click handlers
        $('ul.faqList > li > div.question > a').click(function (e) {
            e.preventDefault();
            var parentDiv = $(this).parent().parent();
            var answer = parentDiv.find('div.answer');
            var arrow = $(this).find('span.arrow');

            // If self is already open, close self
            if (answer.is(':visible')) {
                arrow.html('►');
                answer.hide();
            }
            else {
                // collapse all answer
                $('ul.faqList > li > div.answer').hide();
                $('ul.faqList > li > div.question > a > span.arrow').html('►');

                // change current icon
                arrow.html('▼');

                // show current answer
                answer.show();
            }
        });

        // collapse all answer on startup
        $('ul.faqList > li > div.question > a').first().click();

        // setup feedback click handlers
        $("#feedbackRating a").click(function (e) {
            e.preventDefault();
            $("#feedbackComment").append("<iframe src='" + $(this).attr('data-iframeUrl') + "' />");
            $("#feedbackComment").show();
            $("#feedbackRating").hide();
        });
    }
});

// Checkboxes and radio buttons
$(function () {
    $("input[type=checkbox]").each(function () {
        $(this).after("<input type=\"button\" class=\"checkbox\" />");
        $(this).hide();

        $(this).syncControlStates();

        $(this).next("input[type=button]").click(function (evt) {
            $(this).toggleClass("checked");
            $(this).prev("input[type=checkbox]").attr("checked", $(this).hasClass("checked"));
            $(this).prev("input[type=checkbox]").change();
            $("input[type=checkbox]").syncControlStates();

            evt.stopPropagation();
        });
    });

    $("input[type=radio]").each(function () {
        $(this).after("<input type=\"button\" class=\"radiobutton\" />");
        $(this).hide();

        $(this).syncControlStates();

        $(this).next("input[type=button]").click(function (evt) {
            if (!$(this).hasClass("checked")) {
                $(this).toggleClass("checked");
                $(this).prev("input[type=radio]").attr("checked", true);
                $(this).prev("input[type=radio]").change();
                $("input[type=radio]").syncControlStates();
            }
            evt.stopPropagation();
        });
    });

    $("input[type=checkbox]").change(function () {
        $("input[type=checkbox]").syncControlStates();
    });

    $("input[type=radio]").change(function () {
        $("input[type=radio]").syncControlStates();
    });
});

$.fn.syncControlStates = function () {
    $(this).each(function () {
        if ($(this).is(":checked")) {
            $(this).next("input[type=button]").addClass("checked");
        } else {
            $(this).next("input[type=button]").removeClass("checked");
        }

        if ($(this).attr("disabled")) {
            $(this).next("input[type=button]").attr("disabled", "disabled");
        } else {
            $(this).next("input[type=button]").attr("disabled", "");
        }
    });
};

//*** Common Components ***//
$(function () {
    $('#switchMobileView').click(function () {
        $.cookie('wpView', 'mobile');
        document.location.reload();
    });
});

// Search suggestions autocomplete
(function ($) {
    var currentId = 0;
    var selectedIndex = -1;
    var cache = new Array();

    $.searchSuggestions = function (element, suggestUrl, searchUrl) {
        var $container;
        var containerFocus = false;
        var visible = false;
        var timeout = null;

        createContainer();
        cache[''] = '[]';

        element.keyup(function (e) {
            if (e.which == 27) {
                e.preventDefault();
                return;
            }

            show();

            clearTimeout(timeout);
            timeout = setTimeout(function () {
                getSuggestions(element.val())
            }, 250);
        });

        function getSuggestions(q) {
            if (q.length < 2) {
                return;
            }

            var result = cache[q];
            if (result == null) {
                $.ajax({
                    type: 'GET',
                    dataType: 'html',
                    url: suggestUrl + '?q=' + encodeURIComponent(q),
                    success: function (result) {
                        cache[q] = result;
                        handleResult(result);
                    }
                });
            } else {
                handleResult(result);
            }
        }

        function handleResult(result) {
            var $list = $('ul:eq(0)', $container);
            $list.html('');
            var suggestions = $.parseJSON(result);
            if (suggestions.length == 0) {
                hide();
            } else {
                for (var i = 0; i < suggestions.length; i++) {
                    var suggestion = suggestions[i];
                    $list.append(getSearchItem(suggestion.Title));
                    $('li:eq(' + i + ') a', $list).text(suggestion.Title);
                }
                show();
            }
        }

        function show() {
            if (!visible) {
                if (element.val().length < 2 || $('ul:eq(0) li').length == 0) {
                    return;
                }

                selectedIndex = -1;
                $(document).bind('click', clickHandler);
                $(document).bind('keydown', keyHandler);
                visible = true;
                containerFocus = false;
                $container.show();
            }
        }

        function hide() {
            $(document).unbind('click', clickHandler);
            $(document).unbind('keydown', keyHandler);
            visible = false;
            $container.hide();
        }

        function clickHandler(e) {
            $target = $(e.target);
            if ($target.parents('.searchSuggestions').length == 0) {
                hide();
            }
        }

        function keyHandler(e) {
            var update = false;
            switch (e.which) {
                case 9: //tab
                    //Is this the search input
                    if (element.context == e.target) {
                        hide();
                    } else if (containerFocus) {
                        e.preventDefault();
                        hide();
                        element.next().focus();
                    }
                    return;
                case 27: //escape
                    e.preventDefault();
                    hide();
                    element.focus();
                    return;
                case 38: // up arrow
                    selectedIndex--;
                    update = true;
                    break;
                case 40: // down arrow
                    selectedIndex++;
                    update = true;
                    break;
            }

            if (update) {
                e.preventDefault();
                containerFocus = true;
                if (selectedIndex < 0) {
                    selectedIndex = -1;
                    element.focus();
                } else {
                    var $items = $('li a', $container);
                    if (selectedIndex >= $items.length) {
                        selectedIndex = $items.length - 1;
                    }

                    $('li a', $container).eq(selectedIndex).focus();
                }
            }
        }

        function createContainer() {
            var left = element.position().left + 'px';
            var top = (element.position().top + element.outerHeight()) + 'px';
            var id = 'searchSuggestions' + currentId++;

            var container = '<div id="' + id + '" class="searchSuggestions" style="left: ' + left + '; top: ' + top + ';"><ul></ul></div>'
            element.parents('form').append(container);
            $container = $('#' + id);
            var width = element.outerWidth() - parseInt($container.css('border-left-width')) - parseInt($container.css('border-right-width'));
            $container.width(width);

            $container.focusin(function () {
                containerFocus = true;
            });

            $container.focusout(function (e) {
                if (containerFocus && $(e.target).parents('.searchSuggestions').length == 0) {
                    hide();
                }
            });
        }

        function getSearchItem(title) {
            return '<li><a data-os="combinedSearch" data-ov="' + encodeURIComponent(title) + '" href="' + searchUrl + '?q=' + encodeURIComponent(title) + '"></a></li>'
        }
    }

    $.fn.searchSuggestions = function (suggestUrl, searchUrl) {
        return this.each(function () {
            new $.searchSuggestions($(this), suggestUrl, searchUrl);
        });
    };

})(jQuery);

