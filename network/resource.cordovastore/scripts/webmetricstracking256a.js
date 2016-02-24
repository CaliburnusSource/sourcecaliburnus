var WebMetricsSettings = {};

// Parent class
function WebMetricsData(eventId) {
    this.dataIsValid = false;

    this.properties = {
        "eventId": eventId,
        "url": "",
        "activityId": ""
    };

    this.uploadPageLoadTimeWebMetrics = function () {
        if (this.dataIsValid) {
            this.properties.url = WebMetricsSettings.urls.currentUrl;
            this.properties.activityId = WebMetricsSettings.activityId;
            $.ajax({
                type: 'POST',
                url: WebMetricsSettings.urls.trackingUrl,
                data: JSON.stringify(this.properties),
                contentType: 'application/json; charset=utf-8',
                cache: false,
                dataType: 'json'
            });
        }
    };
}

PageLoadTimeData.prototype = new WebMetricsData(1);

function PageLoadTimeData() {
    this.properties = $.extend({}, this.properties, {
        "userAgent": "None",
        "locale": "en-US",
        "isUserSignedIn": false,
        "numberOfUserDevices": -1,
        "overallPlt": -1,
        "unloadPreviousDocumentLatency": -1,
        "dnsLatency": -1,
        "connectionRequestLatency": -1,
        "requestLatency": -1,
        "responseLatency": -1,
        "htmlLatency": -1,
        "assetLatency": -1,
        "windowLoadEventLatency": -1,
        "isRecurrentUser": false
    });
}

PageLoadTimeData.prototype.calculatePageLoadTimeMetrics = function () {
    try {
        var timing = window.performance.timing;

        // Page Overall Page Load Time
        if (timing.navigationStart > 0) {
            this.properties.overallPlt = timing.loadEventEnd - timing.navigationStart;
        } else {
            // in case navigationStart is 0, get fetchStart time instead
            this.properties.overallPlt = timing.loadEventEnd - timing.fetchStart;
        }

        // Latency of unloading previous document that is from the same origin
        this.properties.unloadPreviousDocumentLatency = timing.unloadEventEnd - timing.unloadEventStart;

        // DNS resolution time
        this.properties.dnsLatency = timing.domainLookupEnd - timing.domainLookupStart;

        // Connection latency from client side measures latency of client establishes a connection with server
        this.properties.connectionRequestLatency = timing.connectEnd - timing.connectStart;

        // Latency of client from when it starts request of current document to receives first byte from server or caches from local resources
        this.properties.requestLatency = timing.responseStart - timing.requestStart;

        // Latency of server sending the current document to client or client gets caches from local resources
        this.properties.responseLatency = timing.responseEnd - timing.responseStart;

        // Latency for HTML data load
        this.properties.htmlLatency = timing.domInteractive - timing.domLoading;

        // Extra latency from end of dom construction to assets finish loading
        this.properties.assetLatency = timing.domComplete - timing.domInteractive;

        // Latency of window onload event
        this.properties.windowLoadEventLatency = timing.loadEventEnd - timing.loadEventStart;

        this.properties.userAgent = navigator.userAgent;
        this.properties.locale = WebMetricsSettings.locale;
        this.properties.isUserSignedIn = WebMetricsSettings.isUserSignedIn;
        this.properties.numberOfUserDevices = WebMetricsSettings.numberOfUserDevices;
        this.properties.isRecurrentUser = WebMetricsSettings.isRecurrentUser;
        this.dataIsValid = true;
    } catch (e) {
    }
};

ResourceLoadTimeData.prototype = new WebMetricsData(2);
function ResourceLoadTimeData() {
    this.dataIsValid = false;
    this.properties = $.extend({}, this.properties, {
        "resources": ""
    });
}

ResourceLoadTimeData.prototype.calculatePageLoadTimeMetrics = function () {
    try {
        var entries = window.performance.getEntries();
        var re = new RegExp("img|subdocument|embed");
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].initiatorType !== undefined && entries[i].initiatorType.toString().match(re)) {
                this.properties.resources += entries[i].initiatorType + "@@" + entries[i].name + "@@" + entries[i].duration;
                this.properties.resources += "##";
            }
        }
        this.dataIsValid = true;
    } catch (e) {
    }
};

$(window).load(function () {
    setTimeout(function () {
        try {
            if (window.performance !== undefined) {
                var webMetricsData = new PageLoadTimeData();
                webMetricsData.calculatePageLoadTimeMetrics();
                webMetricsData.uploadPageLoadTimeWebMetrics();

                if (window.performance.getEntries !== undefined) {
                    var resourceLoadTime = new ResourceLoadTimeData();
                    resourceLoadTime.calculatePageLoadTimeMetrics();
                    resourceLoadTime.uploadPageLoadTimeWebMetrics();
                }
            }
        } catch (e) {
        }
    }, 100);
});