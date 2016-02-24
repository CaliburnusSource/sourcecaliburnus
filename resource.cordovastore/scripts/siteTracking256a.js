// inputs must be a comma delimited string
String.prototype.format = function (inputs) {
    if (inputs) {
        var args = inputs.split(",");
        return this.replace(/{(\d+)}/g, function (match, number) {
            return args[number] !== undefined ? args[number] : match;
        });
    }

    return this;
};

// If isSynthetic, not tracking
// If preview, not tracking
var shouldTrack = $("body").attr("data-synthetic") != "true" && $("body").attr("data-preview") != "true";

var WpsTracking = {

    // None of the {d} should have '=' in the values. If we do need something like that, will revisit the track function
    // This are by no means final, when we do a final pass of decorating our elements, the dev who is doing that should check this.
    properties: {
        "app": "event13, products={0}",
        "appCategories": "prop7={0}",
        "appLanding": "event13, event3, prop34={1}, eVar34={1}, products={0}",
        "appPagination": "prop7={0}",
        "buyApp": "event27, products={0}",
        "combinedSearch": "prop4={0}, eVar4={0}, event6, eVar14=Combined, prop16=Combined:Search, eVar13=Search",
        "combinedSearchPagination": "prop16=Combined:Page Change",
        "combinedSearchResult": "prop6={0}, eVar6={0}, event7, eVar14=Combined, eVar42={1}, prop16=Combined:Result Click",
        "combinedSearchMoreApps": "event34",
        "downloadApp": "event28, products={0}",
        "getApp": "eVar7={1}, event26, products={0}",
        "heroLink": "prop33={0}, eVar33={0}, event2",
        "internalContent": "eVar34={0}, prop34={0}, event3",
        "myFamilyAction": "prop36={0}",
        "myFamilyAddChild": "event48",
        "myFamilyAddParent": "event47",
        "myFamilyGetStarted": "event45",
        "myFamilyMissingInfoParent": "event47",
        "myFamilyMissingInfoChild": "event50",
        "myPhoneFailure": "event66, eVar46={0}",
        "myPhoneFeature": "prop20={0}, prop11",
        "myPhoneStart": "eVar45={0}",
        "myPhoneSuccess": "event65, eVar46={0}",
        "myPhoneTimeout": "event67",
        "navigation": "prop7={0}",
        "newsArticle": "prop12={0}, eVar12={0}, event11",
        "oneclickReinstall": "event30",
        "oneclickReinstallCompleted": "event31, eVar41={0}",
        "partnerTransfer": "prop10={0}, eVar10={0}, event4",
        "phoneCompare": "prop9={0}, event14, eVar13=Compare",
        "phoneDetails": "event15, prop8={0}, eVar8={0}",
        "promoModule": "eVar32={0}, event25",
        "signIn": "event16",
        "socialShare": "prop15={0}, eVar15={0}, event5",
        "storeSearch": "prop4={0}, eVar4={0}, event6, eVar14=Store, prop16=Store:Search, eVar13=Search",
        "storeSearchPagination": "prop16=Store:Page Change",
        "storeSearchResult": "prop6={0}, eVar6={0}, event7, eVar14=Store, eVar42=App, prop16=Store:Result Click",
        "storeSearchGotoCombinedMode": "event35",
        "supportFeedback": "prop30={0}, eVar30={0}, prop29={1},",
        "supportLink": "event12, prop38={0}, eVar38={0}",
        "video25%": "event21, eVar9={0}",
        "video50%": "event22, eVar9={0}",
        "video75%": "event23, eVar9={0}",
        "videoEnd": "event24, eVar9={0}",
        "videoError": "event33, eVar9={0}",
        "videoLink": "eVar29={0}",
        "videoStart": "event20, eVar9={0}, eVar13=Video",
        "win8appClickthrough": "event44",
        "win8appNavigate": "prop7={0}",
        "custom": "{0}"
    },

    experimentIds: "",

    initialPropSet: "",

    // Append value to variable
    appendValueToVariable: function (variable, value) {
        if (!variable) {
            variable = value;
        } else {
            variable += ',' + value;
        }

        return variable;
    },

    appendProperties: function (name, value) {
        if (s) {
            s.linkTrackVars = this.appendValueToVariable(s.linkTrackVars, name);
            if (value) {
                s[name] = decodeURIComponent(value);
            }
        }
    },

    track: function (propSet, linkType, linkName) {
        if (s) {
            try {

                s.linkTrackVars = 'channel';
                s.events = null;

                propSetArray = propSet.split(',');

                for (var i = 0; i < propSetArray.length; i++) {
                    if (propSetArray[i]) {
                        var pairs = propSetArray[i].split('=');
                        pairs[0] = $.trim(pairs[0]);
                        pairs[1] = $.trim(pairs[1]);

                        if (pairs[0] == "products") {
                            s.products = pairs[1];
                            s.products += ";;;;"
                            if (s.eVar26) {
                                s.products += "eVar26=" + s.eVar26 + "|";
                            }

                            if (s.eVar27) {
                                s.products += "eVar27=" + s.eVar27;
                            }

                            this.appendProperties("products", s.products);
                        }
                        else if (pairs[0].lastIndexOf("event", 0) === 0) {
                            // this is an event
                            s.events = this.appendValueToVariable(s.events, pairs[0]);
                        }
                        else {
                            this.appendProperties(pairs[0], pairs[1]);
                        }
                    }
                }

                if (s.events) {
                    s.linkTrackEvents = s.events;
                    this.appendValueToVariable(s.linkTrackVars, 'events');
                }

                if (!linkType) {
                    linkType = 'o';
                }

                if (!linkName) {
                    linkName = s.pageName;
                }

                if (this.experimentIds) {                
                    this.appendProperties('eVar75', WpsTracking.experimentIds);
                }

                if (shouldTrack) {
                    s.tl(this, linkType, linkName);
                }

                // Clean up all the variables in case we do this again without page reloading
                for (var i = 0; i < propSetArray.length; i++) {
                    var pairs = propSetArray[i].split('=');
                    if (pairs[0].lastIndexOf("event", 0) !== 0) {
                        s[pairs[0]] = "";
                    }
                }
                s.linkTrackVars = 'None';
                s.linkTrackEvents = 'None';

                this.initialPropSet = "";
            } catch (ex) {
            }
        }
    },

    atlasTrack: function (id) {
        if (shouldTrack) {
            $.ajax({
                url: "//view.atdmt.com/jaction/" + id,
                dataType: 'script',
                timeout: 3000
            });
        }
    },

    omnitureCustomTrack: function (property, value) {
        var propSet = $.trim(property).format($.trim(value));
        if (propSet) {
            this.track(propSet);
        }
    },

    omnitureTrack: function (element) {
        // check if its in a panel, if so append the panel Id to the value
        var panel = $(element).closest("div.panel");
        var panelPrefix = "";
        if (panel.length == 1 && $(panel).attr("data-panelId")) {
            panelPrefix = $.trim($(panel).attr("data-panelId")) + ":";
        }

        var id = $.trim(element.attr("data-os"));
        var id2 = $.trim(element.attr("data-os2"));

        var propSet = "";
        if (this.initialPropSet) {
            propSet = this.initialPropSet + ",";
        }

        if (id && this.properties[id]) {
            var value = panelPrefix + $.trim(element.attr("data-ov"));
            propSet += this.properties[id].format(value) + ",";
        }

        if (id2 && this.properties[id2]) {
            var value = panelPrefix + $.trim(element.attr("data-ov2"));
            propSet += this.properties[id2].format(value);
        }

        if (propSet) {
            this.track(propSet);
        }
    }
}

$(function () {
    /** Windowsphone.com site specific tracking **/
    s.trackExternalLinks = false;

    // Search result on submit requires pulling in the query from input
    $("form[data-os='combinedSearch']").submit(function () {
        $(this).attr("data-ov", $("input[type=text]").val());
    });

    // Search on device compare requires pulling in all selected devices
    $("form#phoneCompare[data-os]").submit(function () {
        var selectedDevices = new Array();
        $("form#phoneCompare input:checked").each(function () { selectedDevices.push($(this).attr("data-displayName")) });
        $(this).attr("data-ov", selectedDevices.join("|"));
    });

    // Append event18 for register of newsletter
    if (s && s.getQueryParam('regsrc')) { s.events = WpsTracking.appendValueToVariable(s.events, 'event18'); }

    // Append event17 for successful sign
    if (s && s.getQueryParam('signin')) { s.events = WpsTracking.appendValueToVariable(s.events, 'event17'); }

    // Special tracking for links in HH2 topics
    $("body.support.topicPage div#helpContent a").click(function () {
        WpsTracking.initialPropSet = WpsTracking.properties["supportLink"].format($(this).attr("href"));
    });

    // Omniture tracking for links
    $("body").delegate("a", "mousedown", function () {
        if (s) {
            if ($(this).attr("data-os") == "partnerTransfer") {
                if ($(this).attr("data-ov")) {
                    WpsTracking.track(WpsTracking.properties["partnerTransfer"].format($(this).attr("data-ov")), 'e', s.pageName + ":" + $(this).attr("href"));
                }
                else {
                    // Non partner exit links
                    if (shouldTrack) {
                        s.tl(this, 'e', s.pageName + ":" + $(this).attr("href"));
                    }
                }
            }
            else if ($(this).attr("data-os")) {
                WpsTracking.omnitureTrack($(this));
            }
            else {
                // If we didn't instrument this link, let omniture decide if they want to track it.
                s.trackExternalLinks = true;

                // Turn external link tracking back off
                setTimeout(function () {
                    s.trackExternalLinks = false;
                }, 1000);
            }
        }
    });

    // Omniture tracking for input
    $("input[data-os]").click(function () {
        WpsTracking.omnitureTrack($(this));
    });

    // Omniture tracking for forms
    $("form[data-os]").submit(function () {
        WpsTracking.omnitureTrack($(this));
    });

    // Atlas tracking
    $("a[data-atlas]").click(function () {
        WpsTracking.atlasTrack($(this).attr("data-atlas"));
    });

    // Fire off page view using s.t()
    if (s && distinctPage) {
        // Special promo module logic
        s.list1 = "";
        $("div#promoModules h5 a[data-os='promoModule']").each(function () {
            s.list1 += $(this).attr("data-ov") + "|";
        });

        if (s.list1) {
            s.events = WpsTracking.appendValueToVariable(s.events, 'event19');
        }

        s.events = WpsTracking.appendValueToVariable(s.events, 'event1');

        if (WpsTracking.experimentIds) {
            s.events = WpsTracking.appendValueToVariable(s.events, 'event75');
            WpsTracking.appendProperties('eVar75', WpsTracking.experimentIds);
        }

        if (shouldTrack) {
            var s_code = s.t(); if (s_code) document.write(s_code);
        }
    }
});