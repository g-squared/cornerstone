var cornerstone = (function (cornerstone) {

    "use strict";

    if (cornerstone === undefined) {
        cornerstone = {};
    }

    var overlayRenderCanvas = document.createElement('canvas');
    var overlayRenderCanvasContext;
    var overlayRenderCanvasData;

    var lastRenderedImageId;

    function getRenderOverlay(overlay, image, invalidated) {
        
        if(image.imageId === lastRenderedImageId && invalidated !== true )
            return overlayRenderCanvas;

        if(overlayRenderCanvas.width !== image.width || overlayRenderCanvas.height != image.height) {
            overlayRenderCanvas.width = overlay.width;
            overlayRenderCanvas.height = overlay.height;

            // NOTE - we need to fill the render canvas with white pixels since we control the luminance
            // using the alpha channel to improve rendering performance.
            overlayRenderCanvasContext = overlayRenderCanvas.getContext('2d');
            overlayRenderCanvasContext.fillStyle = 'green';
            overlayRenderCanvasContext.fillRect(0, 0, overlayRenderCanvas.width, overlayRenderCanvas.height);
            overlayRenderCanvasData = overlayRenderCanvasContext.getImageData(0, 0, overlay.width, overlay.height);
        }
        
        var numPixels=overlay.width*overlay.height*4;
        var renderIdx=3;
                
        var ovlDataIdx=0;
        var ovlData=overlay.data.getUint8(ovlDataIdx);
        var ovlBitIdx=0;
        
        while( renderIdx < numPixels ) {
            var bit=0x1 << ovlBitIdx;
            var mask=ovlData & bit;
            
            overlayRenderCanvasData.data[renderIdx]=( mask ? 255 : 0 );
            renderIdx+=4;
            
            if( ++ovlBitIdx === 8 ) {
                ovlBitIdx=0;
                ovlDataIdx++;
                if( ovlDataIdx >= overlay.data.byteLength )
                    break;
                ovlData=overlay.data.getUint8(ovlDataIdx);
            }
        }
        
        overlayRenderCanvasContext.putImageData(overlayRenderCanvasData, 0, 0);
        lastRenderedImageId=image.imageId;
        
        return overlayRenderCanvas;
    }

    // Module exports
    cornerstone.getRenderOverlay = getRenderOverlay;

    return cornerstone;
}(cornerstone));