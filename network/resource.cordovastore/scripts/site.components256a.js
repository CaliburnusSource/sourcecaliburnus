// Custom Easings
$(function () {
    $.easing.easeInExpoPhone = function (t) {
        return Math.pow(t, 12 / 10);
    };

    $.easing.easeOutExpoPhone = function (t) {
        return Math.pow(t, 10 / 12);
    };
});

// Bidi Check
function IsRTL() {
    var isRtl = false;
    if ($("body").hasClass("rtl")) {
        isRtl = true;
    }

    return isRtl;
}

// String endsWith function
String.prototype.endsWith = function (suffix) {
    if (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    }
    return false;
}; 


// Read More slider
$.fn.textToggle = function (readMoreString, readLessString) {    
    var isRTL = IsRTL();
    var id = $(this).attr("id");
    var $textContainer = $("#" + id + " > :nth-child(1) > :nth-child(1)");
    $textContainer.css({ "float": isRTL ? "right" : "left" });
    var textContainerHeight = $textContainer.height();
    var $wrapperContainer = $("#" + id + " > :nth-child(1)");
    $wrapperContainer.css({ "float": isRTL ? "right" : "left", "overflow": "hidden", "width": "100%" });
    var minTextContainerHeight = $wrapperContainer.height();
    if (textContainerHeight > minTextContainerHeight) {
        $("#" + id + " .expand").show();
    } else {
        $("#" + id + " .expand").remove();
    }

    $("#" + id + " .expand").click(function (e) {
        e.preventDefault();

        var $readMore = $("#" + id + " > a");
        var minHeight = textContainerHeight;
        var classValue = 'collapse';
        var linkText = readLessString;
        if (!$readMore.hasClass('expand')) {
            minHeight = minTextContainerHeight;
            classValue = 'expand';
            linkText = readMoreString;
        }

        $wrapperContainer.animate({
            "max-height": minHeight + "px"
        }, 500, function () {
            $readMore.attr('class', classValue + " inline");
            $readMore.text(linkText);
        });
    });
};

// Newsticker used on the home page
$.fn.rotator = function (PauseTimeSecs, InitialOffsetPixels, AnimationTimeSecs) {
    $(this).each(function () {
        var i = 0;
        var j = 1;
        var isHovering = false;
        var newsItems = $(this).children("li");

        newsItems.hide();
        newsItems.eq(i).show();

        newsItems.bind('mouseover', function () {
            isHovering = true;
        });

        newsItems.bind('mouseout', function () {
            isHovering = false;
        });

        function showNext() {
            if (!isHovering) {
                var isRTL = IsRTL();
                if (isRTL) {
                    newsItems.eq(j).css({ "right": InitialOffsetPixels + "px", "top": "0px" });
                    newsItems.eq(j).animate({ opacity: 'toggle', right: "0px" }, { duration: AnimationTimeSecs * 1000 });
                }
                else {
                    newsItems.eq(j).css({ "left": InitialOffsetPixels + "px", "top": "0px" });
                    newsItems.eq(j).animate({ opacity: 'toggle', left: "0px" }, { duration: AnimationTimeSecs * 1000 });
                }
                newsItems.eq(i).animate({ opacity: 'toggle' }, { duration: AnimationTimeSecs * 1000 });

                i++;
                j++;

                if (i >= newsItems.length) {
                    i = 0;
                }

                if (j >= newsItems.length) {
                    j = 0;
                }
            }
        }

        if (newsItems.length > 1) {
            var interval = setInterval(showNext, PauseTimeSecs * 1000);
        }
    });
};

// Bing Maps
(function ($) {
    $.fn.bingMap = function (options) {

        var settings = $.extend({
            showCircle: true
        }, options);

        return this.each(function () {
            var $this = $(this);
            var circle = null;
            var pushpin = null;
            var viewBoundary = null;

            var map = new Microsoft.Maps.Map(this,
            {
                credentials: settings.key,
                mapTypeId: Microsoft.Maps.MapTypeId.road,
                showCopyright: false,
                showLogo: false,
                showScalebar: false,
                disableKeyboardInput: true,
                showDashboard: settings.showDashBoard == null ? true : settings.showDashBoard
            });

            $this.bind('updateLocation', updateLocation);
            $this.bind('center', center);

            function updateLocation(event, location) {

                var R = 6371; // earth's mean radius in km
                var lat = (location.latitude * Math.PI) / 180; //rad
                var lon = (location.longitude * Math.PI) / 180; //rad
                var radius = location.accuracy / 1000;
                var d = parseFloat(radius) / R;  // d = angular distance covered on earth's surface
                var circlePoints = new Array();
                for (x = 0; x <= 360; x++) {
                    var p2 = new Microsoft.Maps.Location(0, 0)
                    brng = x * Math.PI / 180; //rad
                    p2.latitude = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brng));
                    p2.longitude = ((lon + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(p2.latitude))) * 180) / Math.PI;
                    p2.latitude = (p2.latitude * 180) / Math.PI;
                    circlePoints.push(p2);
                }

                if (settings.showCircle) {
                    var circleFillColor = new Microsoft.Maps.Color.fromHex('#' + settings.accent);
                    var circleStrokeColor = circleFillColor.clone();
                    circleFillColor.a = 51; // 20% of 255
                    circleStrokeColor.a = 255; // 100% of 255 

                    clear();
                    circle = new Microsoft.Maps.Polygon(circlePoints, { fillColor: circleFillColor, strokeColor: circleStrokeColor, strokeThickness: 2 });
                    map.entities.push(circle);
                }

                // The image is 26, 26 pixels. Anchor it to 13, 13 so the location is at the center of the pushpin
                pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(location.latitude, location.longitude), { icon: '/Images/me_poi.png', anchor: new Microsoft.Maps.Point(13, 13) });
                map.entities.push(pushpin);

                viewBoundary = Microsoft.Maps.LocationRect.fromLocations(circlePoints);
                center();
            }

            function center() {
                if (viewBoundary) {
                    map.setView({ bounds: viewBoundary });
                }
            }

            function clear() {
                viewBoundary = null;

                if (circle) {
                    map.entities.remove(circle);
                    circle = null;
                }

                if (pushpin) {
                    map.entities.remove(pushpin);
                    pushpin = null;
                }
            }
        });

    }
})(jQuery);


/**
* jQuery.placeholder - Placeholder plugin for input fields
* Usage: 
*   Create a text input with an attr placeholderText that contains the text to put in the textbox
*   Call $("#id").placeholder() 
*   This adds the on focus and on blur functions that triggers the value to be in the textbox. 
*   It will also add a class "placeholder" to the input for styling purposes
*
* Override:
*   If you prefer to pass the text in via the creation call, you just need a default text input and call
*   $("#id").placeholder("overriding text");
*   That will replace or add the attr for the input text
*
**/
(function ($) {
    $.fn.placeholder = function (overrideText) {
        var text;

        if (overrideText) {
            text = overrideText;

            // Make sure to set the attribute too
            $(this).data("placeholderText", text);
        }
        else if ($(this).data("placeholderText") != null) {
            text = $(this).data("placeholderText");
        }
        else {
            // If no overriding text or attribute not defined, do nothing to the element
            return $(this);
        }

        // Initialize value and styling
        $(this).val(text);
        $(this).addClass("placeholder");
        $(this).data("locked", true)

        return this.focus(function () {
            if ($.trim($(this).val()) === $(this).data("placeholderText") && $(this).data("locked"))
            {
                $(this).removeClass("placeholder").val("");
                $(this).data("locked", false);
            }
        }).blur(function () {
            setDefaultText($(this));
        }).keydown(function (e) {
            switch (e.which) {
                case 27: // escape
                    e.preventDefault();
                    setDefaultText();
                    $(this).blur();
                    break;
                default:
                    return;
            }
        });

        function setDefaultText(rootElement)
        {
            var $element = rootElement;
            if ($.trim($element.val()) === "")
            {
                $element.addClass("placeholder").val($element.data("placeholderText"));
                $element.data("locked", true);
            }
        }
    };
})(jQuery);

// modal dialog
(function ($) {
    $.modalDialog = function (element) {
        var scrollLeft;
        var scrollTop;
        var showCallback;
        var hideCallback;

        element.css('position', 'fixed');
        element.css('z-index', '203');
        element.bind('show', show);
        element.bind('hide', hide);
        element.wrap('<div class="modal"/>');

        $('.closePopup', element).click(function (e) {
            e.preventDefault();
            $(e.target).parents('.popup').trigger('hide');
        });

        function setShowCallback(callback) {
            if (typeof callback == 'function') { // make sure the callback is a function
                showCallback = callback;
            }
        }

        function setHideCallback(callback) {
            if (typeof callback == 'function') { // make sure the callback is a function
                hideCallback = callback;
            }
        }

        function show() {
            scrollLeft = $(document).scrollLeft();
            scrollTop = $(document).scrollTop();
            $(window).bind('resize', positionElement);
            $(document).bind('focusin', focusHandler);
            $(document).bind('keydown', keyHandler);
            createBackground();
            $(element).parent().show();
            element.show();
            positionElement();
            $(':input:enabled[type!="hidden"]', element).first().focus();

            // fire callbacks
            if (showCallback != null) {
                showCallback.call(this);
            }
        }

        function hide() {
            removeBackground();
            $(element).parent().hide();
            element.hide();
            $(document).unbind('keydown', keyHandler);
            $(document).unbind('focusin', focusHandler);
            $(window).unbind('resize', positionElement);
            $(document).scrollLeft(scrollLeft);
            $(document).scrollTop(scrollTop);

            // fire callbacks
            if (hideCallback != null) {
                hideCallback.call(this);
            }
        }

        function positionElement() {
            var top = ($(window).height() - element.height()) / 2
            var left = ($(window).width() - element.width()) / 2
            element.css('top', top + 'px');
            element.css('left', left + 'px');
        }

        function createBackground() {
            element.after('<div class="background"/>');
        }

        function removeBackground() {
            element.next('.background').remove();
        }

        function keyHandler(e) {
            // escape
            if (e.which == 27) {
                hide();
            }
        }

        function focusHandler(e) {
            if (!$(e.target).parents('.modal').length) {
                e.preventDefault();
                if (e.shiftKey) {
                    $(':input:enabled[type!="hidden"], a', element).last().focus();
                } else {
                    $(':input:enabled[type!="hidden"], a', element).first().focus();
                }
            }
        }
    }

    $.fn.modalDialog = function () {
        return this.each(function () {
            new $.modalDialog($(this));
        });
    };
})(jQuery);

// toggle
(function ($) {
    $.toggleSlider = function (element, state, callback) {        
        var callback = callback;
        var isRTL = IsRTL();      
        var state;
        
        updateState(state);          

        $(".handle", element).draggable({ axis: 'x', containment: 'parent', 
            stop : function(event, ui) {                
                var left = parseInt($(this).css('left').replace('px', ''));
                if (left < 14) 
                {
                    $(this).css('left', '-4px');    
                    updateInner();            
                    if (state) {                                            
                        updateState(!state);                           
                        executeCallback(element);
                    }
                } else {
                    $(this).css('left', '30px');
                    updateInner();
                    if (!state) {                                                
                        updateState(!state);                           
                        executeCallback(element);
                    }                                        
                }                
            },
            drag: function(event, ui) {                
                updateInner();
            }        
        });

        $(element).bind('on', on);
        $(element).bind('off', off);
        $(element).bind('flip', flip);
        $(element).bind('enable', enable);
        $(element).bind('disable', disable);

        $(".outer", element).click(function (event) {
            event.preventDefault();
            if (!element.hasClass("disabled")) {
                updateState(!state);
                if (state) {
                    if (!isRTL) {
                        $(".inner, .handle", element).animate({ left: '+=34px' }, 250, executeCallback(element));
                    }
                    else {
                        $(".inner, .handle", element).animate({ right: '+=34px' }, 250, executeCallback(element));
                    }
                }
                else {
                    if (!isRTL) {
                        $(".inner, .handle", element).animate({ left: '-=34px' }, 250, executeCallback(element));
                    }
                    else {
                        $(".inner, .handle", element).animate({ right: '-=34px' }, 250, executeCallback(element));
                    }
                }
            }
        });        

        function updateInner() {        
            var left = parseInt($('.handle', element).css('left').replace('px', ''));
            $('.inner.left', element).css('left', (left - 32) + 'px');
            $('.inner.right', element).css('left', (left + 12) + 'px');  
        }

        function updateState(newState) {                     
            state = newState;
            if (state) {
                element.removeClass('off');
                element.addClass('on');                
                $(".offStatus", element).hide();
                $(".onStatus", element).show();
            } else {
                element.removeClass('on');
                element.addClass('off');                
                $(".onStatus", element).hide();
                $(".offStatus", element).show();
            }
        }

        function enable() {
            element.removeClass('disabled');
            $(".handle", element).draggable( { disabled: false });
        }

        function disable() {
            element.addClass('disabled'); 
            $(".handle", element).draggable( { disabled: true });
        }

        function flip() {
            updateState(!state);
            if (state) {                
                if (!isRTL) {
                    $(".inner, .handle", element).animate({ left: '+=34px' }, 250);
                }
                else {
                    $(".inner, .handle", element).animate({ right: '+=34px' }, 250);
                }
            }
            else {                
                if (!isRTL) {
                    $(".inner, .handle", element).animate({ left: '-=34px' }, 250);
                }
                else {
                    $(".inner, .handle", element).animate({ right: '-=34px' }, 250);
                }
            }
        }

        function on() {
            if (!state) {
                flip();
            }
        }

        function off() {
            if (state) {
                flip();
            }
        }        

        function executeCallback(element) {
            if (callback != null) {
                callback(element, state);
            }
        }
    }

    $.fn.toggleSlider = function (state, callback) {
        return this.each(function () {
            new $.toggleSlider($(this), state, callback);
        });
    };
})(jQuery);

(function ($) {
    $.dateFormatter = function (format, date, apStrings) {
        var ap = apStrings.am;
        if (date.getHours() > 11) {
            ap = apStrings.pm;
        }

        var hour = date.getHours();
        if (hour < 10) {
            hour = '0' + hour;
        }

        var minute = date.getMinutes();
        if (minute < 10) {
            minute = '0' + minute;
        }

        var formattedDate = format.replace(
            '{0}', date.getMonth() + 1).replace(
            '{1}', date.getDate()).replace(
            '{2}', date.getFullYear()).replace(
            '{3}', hour).replace(
            '{4}', minute).replace(
            '{5}', ap);

        return formattedDate;
    };
})(jQuery);

(function ($) {
    var methods = {
        set: function (name, value, options) {
            var expires = '';
            if (options.expiresInDays != null && options.expiresInDays != undefined) {
                var expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + options.expiresInDays);
                expires = "; expires=" + expirationDate.toUTCString();
            }

            document.cookie = name + "=" + escape(value) + expires + "; path=/";
        },

        get: function (name) {
            var cookies = document.cookie.split('; ');
            for (var i = 0; i < cookies.length; i++) {
                var cookieName = cookies[i].split('=')[0];
                if (cookieName == name) {
                    return cookies[i].split('=')[1];
                }
            }

            return null;
        }
    };

    $.cookie = function (name, value, options) {
        options = $.extend({}, options);

        if (value == null || value == undefined) {
            return methods.get(name);
        }
        else {
            methods.set(name, value, options);
        }
    };
})(jQuery);

// checkbox
(function ($) {
    $.checkbox = function (element, callback) {
        var callback = callback;
        $(element).change(function() {
            if (callback != null) {
                callback(element, $(element).is(':checked'));
            }            
        });
    }

    $.fn.checkbox = function (updateUrl) {
        return this.each(function () {
            new $.checkbox($(this), updateUrl);
        });
    };
})(jQuery);

(function ($) {
    $.fn.hoverPeek = function (options) {
        var options = $.extend({
            height: 0,
            duration: 500,
            delay: 500
        }, options);

        return this.each(function () {
            var $this = $(this);
            $this.hover(function () {
                $this.addClass('hovered');
                var timeoutId = setTimeout(function () {
                    $this.peek({ distance: options.height, duration: options.duration, easing: 'easeOutQuart' });
                }, options.delay);
                $this.data('timeoutId', timeoutId);
            }, function () {
                clearTimeout($this.data('timeoutId'));
                $this.removeClass('hovered');
                $this.peek({ distance: 0, duration: options.duration, delay: options.delay, easing: 'easeOutQuart' });
            });
        });
    };
})(jQuery);

(function ($) {
    $.fn.peek = function (options) {
        var options = $.extend({
            duration: 500,
            distance: 0,
            easing: 'easeOutQuart',
            delay: 0,
            completed: function () { }
        }, options);

        return this.each(function () {
            var $this = $(this);
            setTimeout(function () {
                $this.animate({ 'top': options.distance + 'px' }, options.duration, options.easing, options.completed);
            }, options.delay);
        });
    };
})(jQuery);
