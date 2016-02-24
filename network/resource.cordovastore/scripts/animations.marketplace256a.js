// Marketplace Landing Page Wall Animation
$(function () {
    $('body.marketplace.landingPage .spotRow .collectionContainer').hoverPeek({ height: -141 });
    $('body.marketplace.landingPage div.appContainer.xxlarge').hoverPeek({ height: -292 });
    $('body.marketplace.landingPage div.appContainer.large').hoverPeek({ height: -141 });

    var elements = new Array();
    $('body.marketplace.landingPage div.appContainer.xxlarge, body.marketplace.landingPage div.appContainer.large, body.marketplace.landingPage .spotRow .collectionContainer').each(function () {
        elements.push($(this))
    });

    if (elements.length >= 4) {
        var animateWallTile = function animateWallTile() {
            var timeout = Math.floor(Math.random() * 5000);
            setTimeout(function () {
                // we don't consider the last 2 elements because they were already animated                
                var index = Math.floor(Math.random() * (elements.length - 3));
                var $element = elements[index];

                // add the animated element to the end of the list so that it doesn't get animated again
                elements.push(elements.splice(index, 1)[0]);

                if ($element.is('.hovered')) {
                    animateWallTile();
                } else {

                    var distance = 0;
                    if ($element.is('.appContainer.xxlarge')) {
                        distance = -$element.find('.appInfo .appTitle').height() - 32;  // 32 is the margin
                    } else if ($element.is('.appContainer.large')) {
                        distance = -$element.find('.appInfo .appTitle').height() - 16;  // 16 is the margin
                    } else if ($element.is('.collectionContainer')) {
                        distance = -$element.find('.collectionInfo .collectionTitle').height() - 16;  // 16 is the margin
                    }

                    $element.peek({
                        distance: distance,
                        duration: 1000,
                        completed: function () { $element.peek({ distance: 0, duration: 1000, delay: 5000, completed: animateWallTile }) }
                    });
                }
            }, timeout);
        }

        animateWallTile();
        animateWallTile();
    }
});

