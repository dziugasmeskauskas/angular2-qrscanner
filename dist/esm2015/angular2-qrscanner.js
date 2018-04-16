import { Component, EventEmitter, Input, Output, ViewChild, Renderer2, NgModule } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class AlignmentPattern {
    /**
     * @param {?} posX
     * @param {?} posY
     * @param {?} estimatedModuleSize
     */
    constructor(posX, posY, estimatedModuleSize) {
        this.count = 1;
        this.incrementCount = function () {
            this.count++;
        };
        this.aboutEquals = function (moduleSize, i, j) {
            if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
                var /** @type {?} */ moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
                return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
            }
            return false;
        };
        this.x = posX;
        this.y = posY;
        this.estimatedModuleSize = estimatedModuleSize;
    }
    /**
     * @return {?}
     */
    get EstimatedModuleSize() {
        return this.estimatedModuleSize;
    }
    ;
    /**
     * @return {?}
     */
    get Count() {
        return this.count;
    }
    ;
    /**
     * @return {?}
     */
    get X() {
        return Math.floor(this.x);
    }
    ;
    /**
     * @return {?}
     */
    get Y() {
        return Math.floor(this.y);
    }
    ;
}
class AlignmentPatternFinder {
    /**
     * @param {?} image
     * @param {?} startX
     * @param {?} startY
     * @param {?} width
     * @param {?} height
     * @param {?} moduleSize
     * @param {?} imageWidth
     * @param {?} imageHeight
     * @param {?} resultPointCallback
     */
    constructor(image, startX, startY, width, height, moduleSize, imageWidth, imageHeight, resultPointCallback) {
        this.possibleCenters = new Array();
        this.crossCheckStateCount = new Array(0, 0, 0);
        this.centerFromEnd = function (stateCount, end) {
            return (end - stateCount[2]) - stateCount[1] / 2.0;
        };
        this.foundPatternCross = function (stateCount) {
            var /** @type {?} */ moduleSize = this.moduleSize;
            var /** @type {?} */ maxVariance = moduleSize / 2.0;
            for (var /** @type {?} */ i = 0; i < 3; i++) {
                if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
                    return false;
                }
            }
            return true;
        };
        this.crossCheckVertical = function (startI, centerJ, maxCount, originalStateCountTotal) {
            var /** @type {?} */ image = this.image;
            var /** @type {?} */ maxI = this.imageHeight;
            var /** @type {?} */ stateCount = this.crossCheckStateCount;
            stateCount[0] = 0;
            stateCount[1] = 0;
            stateCount[2] = 0;
            // Start counting up from center
            var /** @type {?} */ i = startI;
            while (i >= 0 && image[centerJ + i * this.imageWidth] && stateCount[1] <= maxCount) {
                stateCount[1]++;
                i--;
            }
            // If already too many modules in this state or ran off the edge:
            // If already too many modules in this state or ran off the edge:
            if (i < 0 || stateCount[1] > maxCount) {
                return NaN;
            }
            while (i >= 0 && !image[centerJ + i * this.imageWidth] && stateCount[0] <= maxCount) {
                stateCount[0]++;
                i--;
            }
            if (stateCount[0] > maxCount) {
                return NaN;
            }
            // Now also count down from center
            i = startI + 1;
            while (i < maxI && image[centerJ + i * this.imageWidth] && stateCount[1] <= maxCount) {
                stateCount[1]++;
                i++;
            }
            if (i == maxI || stateCount[1] > maxCount) {
                return NaN;
            }
            while (i < maxI && !image[centerJ + i * this.imageWidth] && stateCount[2] <= maxCount) {
                stateCount[2]++;
                i++;
            }
            if (stateCount[2] > maxCount) {
                return NaN;
            }
            var /** @type {?} */ stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
            if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
                return NaN;
            }
            return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
        };
        this.handlePossibleCenter = function (stateCount, i, j) {
            var /** @type {?} */ stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
            var /** @type {?} */ centerJ = this.centerFromEnd(stateCount, j);
            var /** @type {?} */ centerI = this.crossCheckVertical(i, Math.floor(centerJ), 2 * stateCount[1], stateCountTotal);
            if (!isNaN(centerI)) {
                var /** @type {?} */ estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;
                var /** @type {?} */ max = this.possibleCenters.length;
                for (var /** @type {?} */ index = 0; index < max; index++) {
                    var /** @type {?} */ center = this.possibleCenters[index];
                    // Look for about the same center and module size:
                    // Look for about the same center and module size:
                    if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                        return new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
                    }
                }
                // Hadn't found this before; save it
                var /** @type {?} */ point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
                this.possibleCenters.push(point);
                if (this.resultPointCallback != null) {
                    this.resultPointCallback.foundPossibleResultPoint(point);
                }
            }
            return null;
        };
        this.find = function () {
            var /** @type {?} */ startX = this.startX;
            var /** @type {?} */ height = this.height;
            var /** @type {?} */ maxJ = startX + this.width;
            var /** @type {?} */ middleI = this.startY + (height >> 1);
            // We are looking for black/white/black modules in 1:1:1 ratio;
            // this tracks the number of black/white/black modules seen so far
            var /** @type {?} */ stateCount = new Array(0, 0, 0);
            for (var /** @type {?} */ iGen = 0; iGen < height; iGen++) {
                // Search from middle outwards
                var /** @type {?} */ i = middleI + ((iGen & 0x01) == 0 ? ((iGen + 1) >> 1) : -((iGen + 1) >> 1));
                stateCount[0] = 0;
                stateCount[1] = 0;
                stateCount[2] = 0;
                var /** @type {?} */ j = startX;
                // Burn off leading white pixels before anything else; if we start in the middle of
                // a white run, it doesn't make sense to count its length, since we don't know if the
                // white run continued to the left of the start point
                // Burn off leading white pixels before anything else; if we start in the middle of
                // a white run, it doesn't make sense to count its length, since we don't know if the
                // white run continued to the left of the start point
                while (j < maxJ && !this.image[j + this.imageWidth * i]) {
                    j++;
                }
                var /** @type {?} */ currentState = 0;
                while (j < maxJ) {
                    if (this.image[j + i * this.imageWidth]) {
                        // Black pixel
                        // Black pixel
                        if (currentState == 1) {
                            // Counting black pixels
                            stateCount[currentState]++;
                        }
                        else {
                            // Counting white pixels
                            // Counting white pixels
                            if (currentState == 2) {
                                // A winner?
                                // A winner?
                                if (this.foundPatternCross(stateCount)) {
                                    // Yes
                                    var /** @type {?} */ confirmed = this.handlePossibleCenter(stateCount, i, j);
                                    if (confirmed != null) {
                                        return confirmed;
                                    }
                                }
                                stateCount[0] = stateCount[2];
                                stateCount[1] = 1;
                                stateCount[2] = 0;
                                currentState = 1;
                            }
                            else {
                                stateCount[++currentState]++;
                            }
                        }
                    }
                    else {
                        // White pixel
                        // White pixel
                        if (currentState == 1) {
                            // Counting black pixels
                            currentState++;
                        }
                        stateCount[currentState]++;
                    }
                    j++;
                }
                if (this.foundPatternCross(stateCount)) {
                    var /** @type {?} */ confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
                    if (confirmed != null) {
                        return confirmed;
                    }
                }
            }
            // Hmm, nothing we saw was observed and confirmed twice. If we had
            // any guess at all, return it.
            // Hmm, nothing we saw was observed and confirmed twice. If we had
            // any guess at all, return it.
            if (!(this.possibleCenters.length == 0)) {
                return this.possibleCenters[0];
            }
            throw `Couldn't find enough alignment patterns`;
        };
        this.image = image;
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.height = height;
        this.moduleSize = moduleSize;
        this.resultPointCallback = resultPointCallback;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
class PerspectiveTransform {
    /**
     * @param {?} a11
     * @param {?} a21
     * @param {?} a31
     * @param {?} a12
     * @param {?} a22
     * @param {?} a32
     * @param {?} a13
     * @param {?} a23
     * @param {?} a33
     */
    constructor(a11, a21, a31, a12, a22, a32, a13, a23, a33) {
        this.transformPoints1 = function (points) {
            var /** @type {?} */ max = points.length;
            var /** @type {?} */ a11 = this.a11;
            var /** @type {?} */ a12 = this.a12;
            var /** @type {?} */ a13 = this.a13;
            var /** @type {?} */ a21 = this.a21;
            var /** @type {?} */ a22 = this.a22;
            var /** @type {?} */ a23 = this.a23;
            var /** @type {?} */ a31 = this.a31;
            var /** @type {?} */ a32 = this.a32;
            var /** @type {?} */ a33 = this.a33;
            for (var /** @type {?} */ i = 0; i < max; i += 2) {
                var /** @type {?} */ x = points[i];
                var /** @type {?} */ y = points[i + 1];
                var /** @type {?} */ denominator = a13 * x + a23 * y + a33;
                points[i] = (a11 * x + a21 * y + a31) / denominator;
                points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
            }
        };
        this.transformPoints2 = function (xValues, yValues) {
            var /** @type {?} */ n = xValues.length;
            for (var /** @type {?} */ i = 0; i < n; i++) {
                var /** @type {?} */ x = xValues[i];
                var /** @type {?} */ y = yValues[i];
                var /** @type {?} */ denominator = this.a13 * x + this.a23 * y + this.a33;
                xValues[i] = (this.a11 * x + this.a21 * y + this.a31) / denominator;
                yValues[i] = (this.a12 * x + this.a22 * y + this.a32) / denominator;
            }
        };
        this.buildAdjoint = function () {
            // Adjoint is the transpose of the cofactor matrix:
            // Adjoint is the transpose of the cofactor matrix:
            return new PerspectiveTransform(this.a22 * this.a33 - this.a23 * this.a32, this.a23 * this.a31 - this.a21 * this.a33, this.a21 * this.a32 - this.a22 * this.a31, this.a13 * this.a32 - this.a12 * this.a33, this.a11 * this.a33 - this.a13 * this.a31, this.a12 * this.a31 - this.a11 * this.a32, this.a12 * this.a23 - this.a13 * this.a22, this.a13 * this.a21 - this.a11 * this.a23, this.a11 * this.a22 - this.a12 * this.a21);
        };
        this.times = function (other) {
            return new PerspectiveTransform(this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13, this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23, this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33, this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13, this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23, this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33, this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13, this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23, this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33);
        };
        this.a11 = a11;
        this.a12 = a12;
        this.a13 = a13;
        this.a21 = a21;
        this.a22 = a22;
        this.a23 = a23;
        this.a31 = a31;
        this.a32 = a32;
        this.a33 = a33;
    }
    /**
     * @param {?} x0
     * @param {?} y0
     * @param {?} x1
     * @param {?} y1
     * @param {?} x2
     * @param {?} y2
     * @param {?} x3
     * @param {?} y3
     * @param {?} x0p
     * @param {?} y0p
     * @param {?} x1p
     * @param {?} y1p
     * @param {?} x2p
     * @param {?} y2p
     * @param {?} x3p
     * @param {?} y3p
     * @return {?}
     */
    static quadrilateralToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {
        var /** @type {?} */ qToS = this.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
        var /** @type {?} */ sToQ = this.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
        return sToQ.times(qToS);
    }
    /**
     * @param {?} x0
     * @param {?} y0
     * @param {?} x1
     * @param {?} y1
     * @param {?} x2
     * @param {?} y2
     * @param {?} x3
     * @param {?} y3
     * @return {?}
     */
    static squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3) {
        var /** @type {?} */ dy2 = y3 - y2;
        var /** @type {?} */ dy3 = y0 - y1 + y2 - y3;
        if (dy2 == 0.0 && dy3 == 0.0) {
            return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0.0, 0.0, 1.0);
        }
        else {
            var /** @type {?} */ dx1 = x1 - x2;
            var /** @type {?} */ dx2 = x3 - x2;
            var /** @type {?} */ dx3 = x0 - x1 + x2 - x3;
            var /** @type {?} */ dy1 = y1 - y2;
            var /** @type {?} */ denominator = dx1 * dy2 - dx2 * dy1;
            var /** @type {?} */ a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
            var /** @type {?} */ a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
            return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0, y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1.0);
        }
    }
    /**
     * @param {?} x0
     * @param {?} y0
     * @param {?} x1
     * @param {?} y1
     * @param {?} x2
     * @param {?} y2
     * @param {?} x3
     * @param {?} y3
     * @return {?}
     */
    static quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3) {
        // Here, the adjoint serves as the inverse:
        const /** @type {?} */ t = this.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3);
        return t.buildAdjoint();
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class BitMatrix {
    /**
     * @param {?} width
     * @param {?=} height
     */
    constructor(width, height) {
        if (!height)
            height = width;
        if (width < 1 || height < 1) {
            throw "Both dimensions must be greater than 0";
        }
        this.width = width;
        this.height = height;
        this.rowSize = width >> 5;
        if ((width & 0x1f) != 0) {
            this.rowSize++;
        }
        this.bits = new Array(this.rowSize * height);
        for (var /** @type {?} */ i = 0; i < this.bits.length; i++)
            this.bits[i] = 0;
    }
    /**
     * @return {?}
     */
    get Width() {
        return this.width;
    }
    ;
    /**
     * @return {?}
     */
    get Height() {
        return this.height;
    }
    ;
    /**
     * @return {?}
     */
    get Dimension() {
        if (this.width != this.height) {
            throw "Can't call getDimension() on a non-square matrix";
        }
        return this.width;
    }
    ;
    /**
     * @param {?} number
     * @param {?} bits
     * @return {?}
     */
    URShift(number, bits) {
        if (number >= 0)
            return number >> bits;
        else
            return (number >> bits) + (2 << ~bits);
    }
    /**
     * @param {?} x
     * @param {?} y
     * @return {?}
     */
    get_Renamed(x, y) {
        var /** @type {?} */ offset = y * this.rowSize + (x >> 5);
        return ((this.URShift(this.bits[offset], (x & 0x1f))) & 1) != 0;
    }
    /**
     * @param {?} x
     * @param {?} y
     * @return {?}
     */
    set_Renamed(x, y) {
        var /** @type {?} */ offset = y * this.rowSize + (x >> 5);
        this.bits[offset] |= 1 << (x & 0x1f);
    }
    /**
     * @param {?} x
     * @param {?} y
     * @return {?}
     */
    flip(x, y) {
        var /** @type {?} */ offset = y * this.rowSize + (x >> 5);
        this.bits[offset] ^= 1 << (x & 0x1f);
    }
    /**
     * @return {?}
     */
    clear() {
        var /** @type {?} */ max = this.bits.length;
        for (var /** @type {?} */ i = 0; i < max; i++) {
            this.bits[i] = 0;
        }
    }
    /**
     * @param {?} left
     * @param {?} top
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    setRegion(left, top, width, height) {
        if (top < 0 || left < 0) {
            throw "Left and top must be nonnegative";
        }
        if (height < 1 || width < 1) {
            throw "Height and width must be at least 1";
        }
        var /** @type {?} */ right = left + width;
        var /** @type {?} */ bottom = top + height;
        if (bottom > this.height || right > this.width) {
            throw "The region must fit inside the matrix";
        }
        for (var /** @type {?} */ y = top; y < bottom; y++) {
            var /** @type {?} */ offset = y * this.rowSize;
            for (var /** @type {?} */ x = left; x < right; x++) {
                this.bits[offset + (x >> 5)] |= 1 << (x & 0x1f);
            }
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class GridSampler {
    /**
     * @param {?} width
     * @param {?} height
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    /**
     * @param {?} image
     * @param {?} points
     * @return {?}
     */
    checkAndNudgePoints(image, points) {
        var /** @type {?} */ width = this.width;
        var /** @type {?} */ height = this.height;
        // Check and nudge points from start until we see some that are OK:
        var /** @type {?} */ nudged = true;
        for (var /** @type {?} */ offset = 0; offset < points.length && nudged; offset += 2) {
            var /** @type {?} */ x = Math.floor(points[offset]);
            var /** @type {?} */ y = Math.floor(points[offset + 1]);
            if (x < -1 || x > width || y < -1 || y > height) {
                throw "Error.checkAndNudgePoints ";
            }
            nudged = false;
            if (x == -1) {
                points[offset] = 0.0;
                nudged = true;
            }
            else if (x == width) {
                points[offset] = width - 1;
                nudged = true;
            }
            if (y == -1) {
                points[offset + 1] = 0.0;
                nudged = true;
            }
            else if (y == height) {
                points[offset + 1] = height - 1;
                nudged = true;
            }
        }
        // Check and nudge points from end:
        nudged = true;
        for (var /** @type {?} */ offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
            var /** @type {?} */ x = Math.floor(points[offset]);
            var /** @type {?} */ y = Math.floor(points[offset + 1]);
            if (x < -1 || x > width || y < -1 || y > height) {
                throw "Error.checkAndNudgePoints ";
            }
            nudged = false;
            if (x == -1) {
                points[offset] = 0.0;
                nudged = true;
            }
            else if (x == width) {
                points[offset] = width - 1;
                nudged = true;
            }
            if (y == -1) {
                points[offset + 1] = 0.0;
                nudged = true;
            }
            else if (y == height) {
                points[offset + 1] = height - 1;
                nudged = true;
            }
        }
    }
    /**
     * @param {?} image
     * @param {?} rawImage
     * @param {?} dimension
     * @param {?} transform
     * @return {?}
     */
    sampleGrid3(image, rawImage, dimension, transform) {
        var /** @type {?} */ bits = new BitMatrix(dimension, dimension);
        var /** @type {?} */ points = new Array(dimension << 1);
        for (var /** @type {?} */ y = 0; y < dimension; y++) {
            var /** @type {?} */ max = points.length;
            var /** @type {?} */ iValue = y + 0.5;
            for (var /** @type {?} */ x = 0; x < max; x += 2) {
                points[x] = (x >> 1) + 0.5;
                points[x + 1] = iValue;
            }
            transform.transformPoints1(points);
            // Quick check to see if points transformed to something inside the image;
            // sufficient to check the endpoints
            this.checkAndNudgePoints(image, points);
            try {
                for (var /** @type {?} */ x = 0; x < max; x += 2) {
                    var /** @type {?} */ xpoint = (Math.floor(points[x]) * 4) + (Math.floor(points[x + 1]) * this.width * 4);
                    var /** @type {?} */ bit = image[Math.floor(points[x]) + this.width * Math.floor(points[x + 1])];
                    rawImage.data[xpoint] = bit ? 255 : 0;
                    rawImage.data[xpoint + 1] = bit ? 255 : 0;
                    rawImage.data[xpoint + 2] = 0;
                    rawImage.data[xpoint + 3] = 255;
                    //bits[x >> 1][ y]=bit;
                    //bits[x >> 1][ y]=bit;
                    if (bit)
                        bits.set_Renamed(x >> 1, y);
                }
            }
            catch (/** @type {?} */ aioobe) {
                // This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
                // transform gets "twisted" such that it maps a straight line of points to a set of points
                // whose endpoints are in bounds, but others are not. There is probably some mathematical
                // way to detect this about the transformation that I don't know yet.
                // This results in an ugly runtime exception despite our clever checks above -- can't have
                // that. We could check each point's coordinates but that feels duplicative. We settle for
                // catching and wrapping ArrayIndexOutOfBoundsException.
                // This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
                // transform gets "twisted" such that it maps a straight line of points to a set of points
                // whose endpoints are in bounds, but others are not. There is probably some mathematical
                // way to detect this about the transformation that I don't know yet.
                // This results in an ugly runtime exception despite our clever checks above -- can't have
                // that. We could check each point's coordinates but that feels duplicative. We settle for
                // catching and wrapping ArrayIndexOutOfBoundsException.
                throw "Error.checkAndNudgePoints";
            }
        }
        return bits;
    }
    /**
     * @param {?} image
     * @param {?} dimension
     * @param {?} p1ToX
     * @param {?} p1ToY
     * @param {?} p2ToX
     * @param {?} p2ToY
     * @param {?} p3ToX
     * @param {?} p3ToY
     * @param {?} p4ToX
     * @param {?} p4ToY
     * @param {?} p1FromX
     * @param {?} p1FromY
     * @param {?} p2FromX
     * @param {?} p2FromY
     * @param {?} p3FromX
     * @param {?} p3FromY
     * @param {?} p4FromX
     * @param {?} p4FromY
     * @return {?}
     */
    sampleGridx(image, dimension, p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY) {
        var /** @type {?} */ transform = PerspectiveTransform.quadrilateralToQuadrilateral(p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY);
        return this.sampleGrid3(image, {}, dimension, transform);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class ErrorCorrectionLevel {
    /**
     * @param {?} ordinal
     * @param {?} bits
     * @param {?} name
     */
    constructor(ordinal, bits, name) {
        this.ordinal_Renamed_Field = ordinal;
        this.bits = bits;
        this.name = name;
    }
    /**
     * @param {?} bits
     * @return {?}
     */
    static forBits(bits) {
        if (bits < 0 || bits >= this.FOR_BITS.length) {
            throw "ArgumentException";
        }
        return this.FOR_BITS[bits];
    }
    /**
     * @return {?}
     */
    get Bits() {
        return this.bits;
    }
    ;
    /**
     * @return {?}
     */
    get Name() {
        return this.name;
    }
    ;
    /**
     * @return {?}
     */
    ordinal() {
        return this.ordinal_Renamed_Field;
    }
}
ErrorCorrectionLevel.L = new ErrorCorrectionLevel(0, 0x01, "L");
ErrorCorrectionLevel.M = new ErrorCorrectionLevel(1, 0x00, "M");
ErrorCorrectionLevel.Q = new ErrorCorrectionLevel(2, 0x03, "Q");
ErrorCorrectionLevel.H = new ErrorCorrectionLevel(3, 0x02, "H");
ErrorCorrectionLevel.FOR_BITS = new Array(ErrorCorrectionLevel.M, ErrorCorrectionLevel.L, ErrorCorrectionLevel.H, ErrorCorrectionLevel.Q);

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class FormatInformation {
    /**
     * @param {?} formatInfo
     */
    constructor(formatInfo) {
        this.Equals = function (o) {
            var /** @type {?} */ other = o;
            return this.errorCorrectionLevel == other.errorCorrectionLevel && this.dataMask == other.dataMask;
        };
        this.errorCorrectionLevel = ErrorCorrectionLevel.forBits((formatInfo >> 3) & 0x03);
        this.dataMask = (formatInfo & 0x07);
    }
    /**
     * @return {?}
     */
    get ErrorCorrectionLevel() {
        return this.errorCorrectionLevel;
    }
    ;
    /**
     * @return {?}
     */
    get DataMask() {
        return this.dataMask;
    }
    ;
    /**
     * @return {?}
     */
    GetHashCode() {
        return (this.errorCorrectionLevel.ordinal() << 3) | this.dataMask;
    }
    /**
     * @param {?} number
     * @param {?} bits
     * @return {?}
     */
    static URShift(number, bits) {
        if (number >= 0)
            return number >> bits;
        else
            return (number >> bits) + (2 << ~bits);
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    static numBitsDiffering(a, b) {
        a ^= b; // a now has a 1 bit exactly where its bit differs with b's
        // Count bits set quickly with a series of lookups:
        // Count bits set quickly with a series of lookups:
        return FormatInformation.BITS_SET_IN_HALF_BYTE[a & 0x0F]
            + FormatInformation.BITS_SET_IN_HALF_BYTE[(this.URShift(a, 4) & 0x0F)]
            + FormatInformation.BITS_SET_IN_HALF_BYTE[(this.URShift(a, 8) & 0x0F)]
            + FormatInformation.BITS_SET_IN_HALF_BYTE[(this.URShift(a, 12) & 0x0F)]
            + FormatInformation.BITS_SET_IN_HALF_BYTE[(this.URShift(a, 16) & 0x0F)]
            + FormatInformation.BITS_SET_IN_HALF_BYTE[(this.URShift(a, 20) & 0x0F)]
            + FormatInformation.BITS_SET_IN_HALF_BYTE[(this.URShift(a, 24) & 0x0F)]
            + FormatInformation.BITS_SET_IN_HALF_BYTE[(this.URShift(a, 28) & 0x0F)];
    }
    /**
     * @param {?} maskedFormatInfo
     * @return {?}
     */
    static decodeFormatInformation(maskedFormatInfo) {
        var /** @type {?} */ formatInfo = this.doDecodeFormatInformation(maskedFormatInfo);
        if (formatInfo != null) {
            return formatInfo;
        }
        // Should return null, but, some QR codes apparently
        // do not mask this info. Try again by actually masking the pattern
        // first
        // Should return null, but, some QR codes apparently
        // do not mask this info. Try again by actually masking the pattern
        // first
        return this.doDecodeFormatInformation(maskedFormatInfo ^ FormatInformation.FORMAT_INFO_MASK_QR);
    }
    /**
     * @param {?} maskedFormatInfo
     * @return {?}
     */
    static doDecodeFormatInformation(maskedFormatInfo) {
        // Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
        var /** @type {?} */ bestDifference = 0xffffffff;
        var /** @type {?} */ bestFormatInfo = 0;
        for (var /** @type {?} */ i = 0; i < FormatInformation.FORMAT_INFO_DECODE_LOOKUP.length; i++) {
            var /** @type {?} */ decodeInfo = FormatInformation.FORMAT_INFO_DECODE_LOOKUP[i];
            var /** @type {?} */ targetInfo = decodeInfo[0];
            if (targetInfo == maskedFormatInfo) {
                // Found an exact match
                // Found an exact match
                return new FormatInformation(decodeInfo[1]);
            }
            var /** @type {?} */ bitsDifference = FormatInformation.numBitsDiffering(maskedFormatInfo, targetInfo);
            if (bitsDifference < bestDifference) {
                bestFormatInfo = decodeInfo[1];
                bestDifference = bitsDifference;
            }
        }
        // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
        // differing means we found a match
        // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
        // differing means we found a match
        if (bestDifference <= 3) {
            return new FormatInformation(bestFormatInfo);
        }
        return null;
    }
    /**
     * @param {?} bits
     * @return {?}
     */
    static forBits(bits) {
        {
            if (bits < 0 || bits >= FormatInformation.FOR_BITS.length) {
                throw "ArgumentException";
            }
            return FormatInformation.FOR_BITS[bits];
        }
    }
}
FormatInformation.FORMAT_INFO_MASK_QR = 0x5412;
FormatInformation.FORMAT_INFO_DECODE_LOOKUP = new Array(new Array(0x5412, 0x00), new Array(0x5125, 0x01), new Array(0x5E7C, 0x02), new Array(0x5B4B, 0x03), new Array(0x45F9, 0x04), new Array(0x40CE, 0x05), new Array(0x4F97, 0x06), new Array(0x4AA0, 0x07), new Array(0x77C4, 0x08), new Array(0x72F3, 0x09), new Array(0x7DAA, 0x0A), new Array(0x789D, 0x0B), new Array(0x662F, 0x0C), new Array(0x6318, 0x0D), new Array(0x6C41, 0x0E), new Array(0x6976, 0x0F), new Array(0x1689, 0x10), new Array(0x13BE, 0x11), new Array(0x1CE7, 0x12), new Array(0x19D0, 0x13), new Array(0x0762, 0x14), new Array(0x0255, 0x15), new Array(0x0D0C, 0x16), new Array(0x083B, 0x17), new Array(0x355F, 0x18), new Array(0x3068, 0x19), new Array(0x3F31, 0x1A), new Array(0x3A06, 0x1B), new Array(0x24B4, 0x1C), new Array(0x2183, 0x1D), new Array(0x2EDA, 0x1E), new Array(0x2BED, 0x1F));
FormatInformation.BITS_SET_IN_HALF_BYTE = new Array(0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4);
FormatInformation.L = new ErrorCorrectionLevel(0, 0x01, "L");
FormatInformation.M = new ErrorCorrectionLevel(1, 0x00, "M");
FormatInformation.Q = new ErrorCorrectionLevel(2, 0x03, "Q");
FormatInformation.H = new ErrorCorrectionLevel(3, 0x02, "H");
FormatInformation.FOR_BITS = new Array(FormatInformation.M, FormatInformation.L, FormatInformation.H, FormatInformation.Q);

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class ECB {
    /**
     * @param {?} count
     * @param {?} dataCodewords
     */
    constructor(count, dataCodewords) {
        this.count = count;
        this.dataCodewords = dataCodewords;
    }
    /**
     * @return {?}
     */
    get Count() {
        return this.count;
    }
    ;
    /**
     * @return {?}
     */
    get DataCodewords() {
        return this.dataCodewords;
    }
    ;
}
class ECBlocks {
    /**
     * @param {?} ecCodewordsPerBlock
     * @param {?} ecBlocks1
     * @param {?=} ecBlocks2
     */
    constructor(ecCodewordsPerBlock, ecBlocks1, ecBlocks2) {
        this.getECBlocks = function () {
            return this.ecBlocks;
        };
        this.ecCodewordsPerBlock = ecCodewordsPerBlock;
        if (ecBlocks2)
            this.ecBlocks = new Array(ecBlocks1, ecBlocks2);
        else
            this.ecBlocks = new Array(ecBlocks1);
    }
    /**
     * @return {?}
     */
    get ECCodewordsPerBlock() {
        return this.ecCodewordsPerBlock;
    }
    ;
    /**
     * @return {?}
     */
    get TotalECCodewords() {
        return this.ecCodewordsPerBlock * this.NumBlocks;
    }
    ;
    /**
     * @return {?}
     */
    get NumBlocks() {
        var /** @type {?} */ total = 0;
        for (var /** @type {?} */ i = 0; i < this.ecBlocks.length; i++) {
            total += this.ecBlocks[i].length;
        }
        return total;
    }
    ;
}
class Version {
    /**
     * @param {?} versionNumber
     * @param {?} alignmentPatternCenters
     * @param {?} ecBlocks1
     * @param {?} ecBlocks2
     * @param {?} ecBlocks3
     * @param {?} ecBlocks4
     */
    constructor(versionNumber, alignmentPatternCenters, ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4) {
        this.buildFunctionPattern = function () {
            var /** @type {?} */ dimension = this.DimensionForVersion;
            var /** @type {?} */ bitMatrix = new BitMatrix(dimension);
            // Top left finder pattern + separator + format
            bitMatrix.setRegion(0, 0, 9, 9);
            // Top right finder pattern + separator + format
            bitMatrix.setRegion(dimension - 8, 0, 8, 9);
            // Bottom left finder pattern + separator + format
            bitMatrix.setRegion(0, dimension - 8, 9, 8);
            // Alignment patterns
            var /** @type {?} */ max = this.alignmentPatternCenters.length;
            for (var /** @type {?} */ x = 0; x < max; x++) {
                var /** @type {?} */ i = this.alignmentPatternCenters[x] - 2;
                for (var /** @type {?} */ y = 0; y < max; y++) {
                    if ((x == 0 && (y == 0 || y == max - 1)) || (x == max - 1 && y == 0)) {
                        // No alignment patterns near the three finder paterns
                        // No alignment patterns near the three finder paterns
                        continue;
                    }
                    bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
                }
            }
            // Vertical timing pattern
            bitMatrix.setRegion(6, 9, 1, dimension - 17);
            // Horizontal timing pattern
            bitMatrix.setRegion(9, 6, dimension - 17, 1);
            if (this.versionNumber > 6) {
                // Version info, top right
                bitMatrix.setRegion(dimension - 11, 0, 3, 6);
                // Version info, bottom left
                bitMatrix.setRegion(0, dimension - 11, 6, 3);
            }
            return bitMatrix;
        };
        this.getECBlocksForLevel = function (ecLevel) {
            return this.ecBlocks[ecLevel.ordinal()];
        };
        this.versionNumber = versionNumber;
        this.alignmentPatternCenters = alignmentPatternCenters;
        this.ecBlocks = new Array(ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4);
        var /** @type {?} */ total = 0;
        var /** @type {?} */ ecCodewords = ecBlocks1.ECCodewordsPerBlock;
        var /** @type {?} */ ecbArray = ecBlocks1.getECBlocks();
        for (var /** @type {?} */ i = 0; i < ecbArray.length; i++) {
            var /** @type {?} */ ecBlock = ecbArray[i];
            total += ecBlock.Count * (ecBlock.DataCodewords + ecCodewords);
        }
        this.totalCodewords = total;
    }
    /**
     * @return {?}
     */
    get VersionNumber() {
        return this.versionNumber;
    }
    ;
    /**
     * @return {?}
     */
    get AlignmentPatternCenters() {
        return this.alignmentPatternCenters;
    }
    ;
    /**
     * @return {?}
     */
    get TotalCodewords() {
        return this.totalCodewords;
    }
    ;
    /**
     * @return {?}
     */
    get DimensionForVersion() {
        return 17 + 4 * this.versionNumber;
    }
    ;
    /**
     * @param {?} versionNumber
     * @return {?}
     */
    static getVersionForNumber(versionNumber) {
        if (versionNumber < 1 || versionNumber > 40) {
            throw "ArgumentException";
        }
        return Version.VERSIONS[versionNumber - 1];
    }
    /**
     * @param {?} dimension
     * @return {?}
     */
    static getProvisionalVersionForDimension(dimension) {
        if (dimension % 4 != 1) {
            throw "Error getProvisionalVersionForDimension";
        }
        try {
            return Version.getVersionForNumber((dimension - 17) >> 2);
        }
        catch (/** @type {?} */ iae) {
            throw "Error getVersionForNumber";
        }
    }
    /**
     * @param {?} versionBits
     * @return {?}
     */
    static decodeVersionInformation(versionBits) {
        var /** @type {?} */ bestDifference = 0xffffffff;
        var /** @type {?} */ bestVersion = 0;
        for (var /** @type {?} */ i = 0; i < Version.VERSION_DECODE_INFO.length; i++) {
            var /** @type {?} */ targetVersion = Version.VERSION_DECODE_INFO[i];
            // Do the version info bits match exactly? done.
            // Do the version info bits match exactly? done.
            if (targetVersion == versionBits) {
                return this.getVersionForNumber(i + 7);
            }
            // Otherwise see if this is the closest to a real version info bit string
            // we have seen so far
            var /** @type {?} */ bitsDifference = FormatInformation.numBitsDiffering(versionBits, targetVersion);
            if (bitsDifference < bestDifference) {
                bestVersion = i + 7;
                bestDifference = bitsDifference;
            }
        }
        // We can tolerate up to 3 bits of error since no two version info codewords will
        // differ in less than 4 bits.
        // We can tolerate up to 3 bits of error since no two version info codewords will
        // differ in less than 4 bits.
        if (bestDifference <= 3) {
            return this.getVersionForNumber(bestVersion);
        }
        // If we didn't find a close enough match, fail
        // If we didn't find a close enough match, fail
        return null;
    }
    /**
     * @return {?}
     */
    static buildVersions() {
        return new Array(new Version(1, new Array(), new ECBlocks(7, new ECB(1, 19)), new ECBlocks(10, new ECB(1, 16)), new ECBlocks(13, new ECB(1, 13)), new ECBlocks(17, new ECB(1, 9))), new Version(2, new Array(6, 18), new ECBlocks(10, new ECB(1, 34)), new ECBlocks(16, new ECB(1, 28)), new ECBlocks(22, new ECB(1, 22)), new ECBlocks(28, new ECB(1, 16))), new Version(3, new Array(6, 22), new ECBlocks(15, new ECB(1, 55)), new ECBlocks(26, new ECB(1, 44)), new ECBlocks(18, new ECB(2, 17)), new ECBlocks(22, new ECB(2, 13))), new Version(4, new Array(6, 26), new ECBlocks(20, new ECB(1, 80)), new ECBlocks(18, new ECB(2, 32)), new ECBlocks(26, new ECB(2, 24)), new ECBlocks(16, new ECB(4, 9))), new Version(5, new Array(6, 30), new ECBlocks(26, new ECB(1, 108)), new ECBlocks(24, new ECB(2, 43)), new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)), new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))), new Version(6, new Array(6, 34), new ECBlocks(18, new ECB(2, 68)), new ECBlocks(16, new ECB(4, 27)), new ECBlocks(24, new ECB(4, 19)), new ECBlocks(28, new ECB(4, 15))), new Version(7, new Array(6, 22, 38), new ECBlocks(20, new ECB(2, 78)), new ECBlocks(18, new ECB(4, 31)), new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)), new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))), new Version(8, new Array(6, 24, 42), new ECBlocks(24, new ECB(2, 97)), new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)), new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)), new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))), new Version(9, new Array(6, 26, 46), new ECBlocks(30, new ECB(2, 116)), new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)), new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)), new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))), new Version(10, new Array(6, 28, 50), new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)), new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)), new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)), new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))), new Version(11, new Array(6, 30, 54), new ECBlocks(20, new ECB(4, 81)), new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)), new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)), new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))), new Version(12, new Array(6, 32, 58), new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)), new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)), new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)), new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))), new Version(13, new Array(6, 34, 62), new ECBlocks(26, new ECB(4, 107)), new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)), new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)), new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))), new Version(14, new Array(6, 26, 46, 66), new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)), new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)), new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)), new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))), new Version(15, new Array(6, 26, 48, 70), new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)), new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)), new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)), new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))), new Version(16, new Array(6, 26, 50, 74), new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)), new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)), new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)), new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))), new Version(17, new Array(6, 30, 54, 78), new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)), new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)), new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))), new Version(18, new Array(6, 30, 56, 82), new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)), new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)), new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))), new Version(19, new Array(6, 30, 58, 86), new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)), new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)), new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)), new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))), new Version(20, new Array(6, 34, 62, 90), new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)), new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)), new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)), new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))), new Version(21, new Array(6, 28, 50, 72, 94), new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)), new ECBlocks(26, new ECB(17, 42)), new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))), new Version(22, new Array(6, 26, 50, 74, 98), new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)), new ECBlocks(28, new ECB(17, 46)), new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)), new ECBlocks(24, new ECB(34, 13))), new Version(23, new Array(6, 30, 54, 74, 102), new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)), new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)), new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))), new Version(24, new Array(6, 28, 54, 80, 106), new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)), new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)), new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))), new Version(25, new Array(6, 32, 58, 84, 110), new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)), new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)), new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))), new Version(26, new Array(6, 30, 58, 86, 114), new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)), new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)), new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))), new Version(27, new Array(6, 34, 62, 90, 118), new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)), new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)), new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))), new Version(28, new Array(6, 26, 50, 74, 98, 122), new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)), new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)), new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))), new Version(29, new Array(6, 30, 54, 78, 102, 126), new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)), new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)), new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)), new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))), new Version(30, new Array(6, 26, 52, 78, 104, 130), new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)), new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)), new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))), new Version(31, new Array(6, 30, 56, 82, 108, 134), new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)), new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)), new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))), new Version(32, new Array(6, 34, 60, 86, 112, 138), new ECBlocks(30, new ECB(17, 115)), new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)), new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))), new Version(33, new Array(6, 30, 58, 86, 114, 142), new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)), new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))), new Version(34, new Array(6, 34, 62, 90, 118, 146), new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)), new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))), new Version(35, new Array(6, 30, 54, 78, 102, 126, 150), new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)), new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)), new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))), new Version(36, new Array(6, 24, 50, 76, 102, 128, 154), new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)), new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)), new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))), new Version(37, new Array(6, 28, 54, 80, 106, 132, 158), new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)), new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))), new Version(38, new Array(6, 32, 58, 84, 110, 136, 162), new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)), new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)), new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))), new Version(39, new Array(6, 26, 54, 82, 110, 138, 166), new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)), new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))), new Version(40, new Array(6, 30, 58, 86, 114, 142, 170), new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)), new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)), new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)), new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))));
    }
}
Version.VERSION_DECODE_INFO = new Array(0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6, 0x0C762, 0x0D847, 0x0E60D, 0x0F928, 0x10B78, 0x1145D, 0x12A17, 0x13532, 0x149A6, 0x15683, 0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB, 0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250, 0x209D5, 0x216F0, 0x228BA, 0x2379F, 0x24B0B, 0x2542E, 0x26A64, 0x27541, 0x28C69);
Version.VERSIONS = Version.buildVersions();

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
if (!Array.prototype.remove) {
    Array.prototype.remove = function (from) {
        var /** @type {?} */ rest = this.slice((from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
}
class FinderPattern {
    /**
     * @param {?} posX
     * @param {?} posY
     * @param {?} estimatedModuleSize
     */
    constructor(posX, posY, estimatedModuleSize) {
        this.incrementCount = function () {
            this.count++;
        };
        this.aboutEquals = function (moduleSize, i, j) {
            if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
                var /** @type {?} */ moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
                return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
            }
            return false;
        };
        this.x = posX;
        this.y = posY;
        this.count = 1;
        this.estimatedModuleSize = estimatedModuleSize;
    }
    /**
     * @return {?}
     */
    get EstimatedModuleSize() {
        return this.estimatedModuleSize;
    }
    ;
    /**
     * @return {?}
     */
    get Count() {
        return this.count;
    }
    ;
    /**
     * @return {?}
     */
    get X() {
        return this.x;
    }
    ;
    /**
     * @return {?}
     */
    get Y() {
        return this.y;
    }
    ;
}
FinderPattern.MIN_SKIP = 3;
FinderPattern.MAX_MODULES = 57;
FinderPattern.INTEGER_MATH_SHIFT = 8;
FinderPattern.CENTER_QUORUM = 2;
class FinderPatternInfo {
    /**
     * @param {?} patternCenters
     */
    constructor(patternCenters) {
        this.bottomLeft = patternCenters[0];
        this.topLeft = patternCenters[1];
        this.topRight = patternCenters[2];
    }
    /**
     * @return {?}
     */
    get BottomLeft() {
        return this.bottomLeft;
    }
    ;
    /**
     * @return {?}
     */
    get TopLeft() {
        return this.topLeft;
    }
    ;
    /**
     * @return {?}
     */
    get TopRight() {
        return this.topRight;
    }
    ;
}
class FinderPatternFinder {
    /**
     * @param {?} width
     * @param {?} height
     */
    constructor(width, height) {
        this.possibleCenters = new Array();
        this.hasSkipped = false;
        this.crossCheckStateCount = new Array(0, 0, 0, 0, 0);
        this.orderBestPatterns = function (patterns) {
            /**
             * @param {?} pattern1
             * @param {?} pattern2
             * @return {?}
             */
            function distance(pattern1, pattern2) {
                let /** @type {?} */ xDiff = pattern1.X - pattern2.X;
                let /** @type {?} */ yDiff = pattern1.Y - pattern2.Y;
                return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
            }
            /**
             * @param {?} pointA
             * @param {?} pointB
             * @param {?} pointC
             * @return {?}
             */
            function crossProductZ(pointA, pointB, pointC) {
                var /** @type {?} */ bX = pointB.x;
                var /** @type {?} */ bY = pointB.y;
                return ((pointC.x - bX) * (pointA.y - bY)) - ((pointC.y - bY) * (pointA.x - bX));
            }
            // Find distances between pattern centers
            var /** @type {?} */ zeroOneDistance = distance(patterns[0], patterns[1]);
            var /** @type {?} */ oneTwoDistance = distance(patterns[1], patterns[2]);
            var /** @type {?} */ zeroTwoDistance = distance(patterns[0], patterns[2]);
            var /** @type {?} */ pointA, /** @type {?} */ pointB, /** @type {?} */ pointC;
            // Assume one closest to other two is B; A and C will just be guesses at first
            // Assume one closest to other two is B; A and C will just be guesses at first
            if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
                pointB = patterns[0];
                pointA = patterns[1];
                pointC = patterns[2];
            }
            else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
                pointB = patterns[1];
                pointA = patterns[0];
                pointC = patterns[2];
            }
            else {
                pointB = patterns[2];
                pointA = patterns[0];
                pointC = patterns[1];
            }
            // Use cross product to figure out whether A and C are correct or flipped.
            // This asks whether BC x BA has a positive z component, which is the arrangement
            // we want for A, B, C. If it's negative, then we've got it flipped around and
            // should swap A and C.
            // Use cross product to figure out whether A and C are correct or flipped.
            // This asks whether BC x BA has a positive z component, which is the arrangement
            // we want for A, B, C. If it's negative, then we've got it flipped around and
            // should swap A and C.
            if (crossProductZ(pointA, pointB, pointC) < 0.0) {
                var /** @type {?} */ temp = pointA;
                pointA = pointC;
                pointC = temp;
            }
            patterns[0] = pointA;
            patterns[1] = pointB;
            patterns[2] = pointC;
        };
        this.foundPatternCross = function (stateCount) {
            var /** @type {?} */ totalModuleSize = 0;
            for (var /** @type {?} */ i = 0; i < 5; i++) {
                var /** @type {?} */ count = stateCount[i];
                if (count == 0) {
                    return false;
                }
                totalModuleSize += count;
            }
            if (totalModuleSize < 7) {
                return false;
            }
            var /** @type {?} */ moduleSize = Math.floor((totalModuleSize << FinderPattern.INTEGER_MATH_SHIFT) / 7);
            var /** @type {?} */ maxVariance = Math.floor(moduleSize / 2);
            // Allow less than 50% variance from 1-1-3-1-1 proportions
            // Allow less than 50% variance from 1-1-3-1-1 proportions
            return Math.abs(moduleSize - (stateCount[0]
                << FinderPattern.INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[1]
                << FinderPattern.INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(3 * moduleSize - (stateCount[2]
                << FinderPattern.INTEGER_MATH_SHIFT)) < 3 * maxVariance && Math.abs(moduleSize - (stateCount[3]
                << FinderPattern.INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[4]
                << FinderPattern.INTEGER_MATH_SHIFT)) < maxVariance;
        };
        this.centerFromEnd = function (stateCount, end) {
            return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
        };
        this.crossCheckVertical = function (startI, centerJ, maxCount, originalStateCountTotal) {
            var /** @type {?} */ image = this.image;
            var /** @type {?} */ maxI = this.height;
            var /** @type {?} */ stateCount = this.CrossCheckStateCount;
            // Start counting up from center
            var /** @type {?} */ i = startI;
            while (i >= 0 && image[centerJ + i * this.width]) {
                stateCount[2]++;
                i--;
            }
            if (i < 0) {
                return NaN;
            }
            while (i >= 0 && !image[centerJ + i * this.width] && stateCount[1] <= maxCount) {
                stateCount[1]++;
                i--;
            }
            // If already too many modules in this state or ran off the edge:
            // If already too many modules in this state or ran off the edge:
            if (i < 0 || stateCount[1] > maxCount) {
                return NaN;
            }
            while (i >= 0 && image[centerJ + i * this.width] && stateCount[0] <= maxCount) {
                stateCount[0]++;
                i--;
            }
            if (stateCount[0] > maxCount) {
                return NaN;
            }
            // Now also count down from center
            i = startI + 1;
            while (i < maxI && image[centerJ + i * this.width]) {
                stateCount[2]++;
                i++;
            }
            if (i == maxI) {
                return NaN;
            }
            while (i < maxI && !image[centerJ + i * this.width] && stateCount[3] < maxCount) {
                stateCount[3]++;
                i++;
            }
            if (i == maxI || stateCount[3] >= maxCount) {
                return NaN;
            }
            while (i < maxI && image[centerJ + i * this.width] && stateCount[4] < maxCount) {
                stateCount[4]++;
                i++;
            }
            if (stateCount[4] >= maxCount) {
                return NaN;
            }
            // If we found a finder-pattern-like section, but its size is more than 40% different than
            // the original, assume it's a false positive
            var /** @type {?} */ stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
            if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
                return NaN;
            }
            return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
        };
        this.crossCheckHorizontal = function (startJ, centerI, maxCount, originalStateCountTotal) {
            var /** @type {?} */ image = this.image;
            var /** @type {?} */ maxJ = this.width;
            var /** @type {?} */ stateCount = this.CrossCheckStateCount;
            var /** @type {?} */ j = startJ;
            while (j >= 0 && image[j + centerI * this.width]) {
                stateCount[2]++;
                j--;
            }
            if (j < 0) {
                return NaN;
            }
            while (j >= 0 && !image[j + centerI * this.width] && stateCount[1] <= maxCount) {
                stateCount[1]++;
                j--;
            }
            if (j < 0 || stateCount[1] > maxCount) {
                return NaN;
            }
            while (j >= 0 && image[j + centerI * this.width] && stateCount[0] <= maxCount) {
                stateCount[0]++;
                j--;
            }
            if (stateCount[0] > maxCount) {
                return NaN;
            }
            j = startJ + 1;
            while (j < maxJ && image[j + centerI * this.width]) {
                stateCount[2]++;
                j++;
            }
            if (j == maxJ) {
                return NaN;
            }
            while (j < maxJ && !image[j + centerI * this.width] && stateCount[3] < maxCount) {
                stateCount[3]++;
                j++;
            }
            if (j == maxJ || stateCount[3] >= maxCount) {
                return NaN;
            }
            while (j < maxJ && image[j + centerI * this.width] && stateCount[4] < maxCount) {
                stateCount[4]++;
                j++;
            }
            if (stateCount[4] >= maxCount) {
                return NaN;
            }
            // If we found a finder-pattern-like section, but its size is significantly different than
            // the original, assume it's a false positive
            var /** @type {?} */ stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
            if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
                return NaN;
            }
            return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, j) : NaN;
        };
        this.handlePossibleCenter = function (stateCount, i, j) {
            var /** @type {?} */ stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
            var /** @type {?} */ centerJ = this.centerFromEnd(stateCount, j); //float
            var /** @type {?} */ centerI = this.crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal); //float
            if (!isNaN(centerI)) {
                // Re-cross check
                centerJ = this.crossCheckHorizontal(Math.floor(centerJ), Math.floor(centerI), stateCount[2], stateCountTotal);
                if (!isNaN(centerJ)) {
                    var /** @type {?} */ estimatedModuleSize = stateCountTotal / 7.0;
                    var /** @type {?} */ found = false;
                    var /** @type {?} */ max = this.possibleCenters.length;
                    for (var /** @type {?} */ index = 0; index < max; index++) {
                        var /** @type {?} */ center = this.possibleCenters[index];
                        // Look for about the same center and module size:
                        // Look for about the same center and module size:
                        if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                            center.incrementCount();
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        var /** @type {?} */ point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
                        this.possibleCenters.push(point);
                        if (this.resultPointCallback != null) {
                            this.resultPointCallback.foundPossibleResultPoint(point);
                        }
                    }
                    return true;
                }
            }
            return false;
        };
        this.selectBestPatterns = function () {
            var /** @type {?} */ startSize = this.possibleCenters.length;
            if (startSize < 3) {
                // Couldn't find enough finder patterns
                // Couldn't find enough finder patterns
                throw `Couldn't find enough finder patterns (found: ${startSize})`;
            }
            // Filter outlier possibilities whose module size is too different
            // Filter outlier possibilities whose module size is too different
            if (startSize > 3) {
                // But we can only afford to do so if we have at least 4 possibilities to choose from
                var /** @type {?} */ totalModuleSize = 0.0;
                var /** @type {?} */ square = 0.0;
                for (var /** @type {?} */ i = 0; i < startSize; i++) {
                    //totalModuleSize +=  this.possibleCenters[i].EstimatedModuleSize;
                    var /** @type {?} */ centerValue = this.possibleCenters[i].EstimatedModuleSize;
                    totalModuleSize += centerValue;
                    square += (centerValue * centerValue);
                }
                var /** @type {?} */ average = totalModuleSize / startSize;
                this.possibleCenters.sort(function (center1, center2) {
                    var /** @type {?} */ dA = Math.abs(center2.EstimatedModuleSize - average);
                    var /** @type {?} */ dB = Math.abs(center1.EstimatedModuleSize - average);
                    if (dA < dB) {
                        return (-1);
                    }
                    else if (dA == dB) {
                        return 0;
                    }
                    else {
                        return 1;
                    }
                });
                var /** @type {?} */ stdDev = Math.sqrt(square / startSize - average * average);
                var /** @type {?} */ limit = Math.max(0.2 * average, stdDev);
                for (var /** @type {?} */ i = this.possibleCenters.length - 1; i >= 0; i--) {
                    var /** @type {?} */ pattern = this.possibleCenters[i];
                    //if (Math.abs(pattern.EstimatedModuleSize - average) > 0.2 * average)
                    //if (Math.abs(pattern.EstimatedModuleSize - average) > 0.2 * average)
                    if (Math.abs(pattern.EstimatedModuleSize - average) > limit) {
                        this.possibleCenters.remove(i);
                    }
                }
            }
            if (this.possibleCenters.length > 3) {
                // Throw away all but those first size candidate points we found.
                this.possibleCenters.sort(function (a, b) {
                    if (a.count > b.count) {
                        return -1;
                    }
                    if (a.count < b.count) {
                        return 1;
                    }
                    return 0;
                });
            }
            return new Array(this.possibleCenters[0], this.possibleCenters[1], this.possibleCenters[2]);
        };
        this.findRowSkip = function () {
            var /** @type {?} */ max = this.possibleCenters.length;
            if (max <= 1) {
                return 0;
            }
            var /** @type {?} */ firstConfirmedCenter = null;
            for (var /** @type {?} */ i = 0; i < max; i++) {
                var /** @type {?} */ center = this.possibleCenters[i];
                if (center.Count >= FinderPattern.CENTER_QUORUM) {
                    if (firstConfirmedCenter == null) {
                        firstConfirmedCenter = center;
                    }
                    else {
                        // We have two confirmed centers
                        // How far down can we skip before resuming looking for the next
                        // pattern? In the worst case, only the difference between the
                        // difference in the x / y coordinates of the two centers.
                        // This is the case where you find top left last.
                        this.hasSkipped = true;
                        return Math.floor((Math.abs(firstConfirmedCenter.X - center.X) - Math.abs(firstConfirmedCenter.Y - center.Y)) / 2);
                    }
                }
            }
            return 0;
        };
        this.haveMultiplyConfirmedCenters = function () {
            var /** @type {?} */ confirmedCount = 0;
            var /** @type {?} */ totalModuleSize = 0.0;
            var /** @type {?} */ max = this.possibleCenters.length;
            for (var /** @type {?} */ i = 0; i < max; i++) {
                var /** @type {?} */ pattern = this.possibleCenters[i];
                if (pattern.Count >= FinderPattern.CENTER_QUORUM) {
                    confirmedCount++;
                    totalModuleSize += pattern.EstimatedModuleSize;
                }
            }
            if (confirmedCount < 3) {
                return false;
            }
            // OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
            // and that we need to keep looking. We detect this by asking if the estimated module sizes
            // vary too much. We arbitrarily say that when the total deviation from average exceeds
            // 5% of the total module size estimates, it's too much.
            var /** @type {?} */ average = totalModuleSize / max;
            var /** @type {?} */ totalDeviation = 0.0;
            for (var /** @type {?} */ i = 0; i < max; i++) {
                pattern = this.possibleCenters[i];
                totalDeviation += Math.abs(pattern.EstimatedModuleSize - average);
            }
            return totalDeviation <= 0.05 * totalModuleSize;
        };
        this.findFinderPattern = function (image) {
            var /** @type {?} */ tryHarder = false;
            this.image = image;
            var /** @type {?} */ maxI = this.height;
            var /** @type {?} */ maxJ = this.width;
            var /** @type {?} */ iSkip = Math.floor((3 * maxI) / (4 * FinderPattern.MAX_MODULES));
            if (iSkip < FinderPattern.MIN_SKIP || tryHarder) {
                iSkip = FinderPattern.MIN_SKIP;
            }
            var /** @type {?} */ done = false;
            var /** @type {?} */ stateCount = new Array(5);
            for (var /** @type {?} */ i = iSkip - 1; i < maxI && !done; i += iSkip) {
                // Get a row of black/white values
                stateCount[0] = 0;
                stateCount[1] = 0;
                stateCount[2] = 0;
                stateCount[3] = 0;
                stateCount[4] = 0;
                var /** @type {?} */ currentState = 0;
                for (var /** @type {?} */ j = 0; j < maxJ; j++) {
                    if (image[j + i * this.width]) {
                        // Black pixel
                        // Black pixel
                        if ((currentState & 1) == 1) {
                            // Counting white pixels
                            currentState++;
                        }
                        stateCount[currentState]++;
                    }
                    else {
                        // White pixel
                        // White pixel
                        if ((currentState & 1) == 0) {
                            // Counting black pixels
                            // Counting black pixels
                            if (currentState == 4) {
                                // A winner?
                                // A winner?
                                if (this.foundPatternCross(stateCount)) {
                                    // Yes
                                    var /** @type {?} */ confirmed = this.handlePossibleCenter(stateCount, i, j);
                                    if (confirmed) {
                                        // Start examining every other line. Checking each line turned out to be too
                                        // expensive and didn't improve performance.
                                        iSkip = 2;
                                        if (this.hasSkipped) {
                                            done = this.haveMultiplyConfirmedCenters();
                                        }
                                        else {
                                            var /** @type {?} */ rowSkip = this.findRowSkip();
                                            if (rowSkip > stateCount[2]) {
                                                // Skip rows between row of lower confirmed center
                                                // and top of presumed third confirmed center
                                                // but back up a bit to get a full chance of detecting
                                                // it, entire width of center of finder pattern
                                                // Skip by rowSkip, but back off by stateCount[2] (size of last center
                                                // of pattern we saw) to be conservative, and also back off by iSkip which
                                                // is about to be re-added
                                                i += rowSkip - stateCount[2] - iSkip;
                                                j = maxJ - 1;
                                            }
                                        }
                                    }
                                    else {
                                        // Advance to next black pixel
                                        // Advance to next black pixel
                                        do {
                                            j++;
                                        } while (j < maxJ && !image[j + i * this.width]);
                                        j--; // back up to that last white pixel
                                    }
                                    // Clear state to start looking again
                                    currentState = 0;
                                    stateCount[0] = 0;
                                    stateCount[1] = 0;
                                    stateCount[2] = 0;
                                    stateCount[3] = 0;
                                    stateCount[4] = 0;
                                }
                                else {
                                    // No, shift counts back by two
                                    stateCount[0] = stateCount[2];
                                    stateCount[1] = stateCount[3];
                                    stateCount[2] = stateCount[4];
                                    stateCount[3] = 1;
                                    stateCount[4] = 0;
                                    currentState = 3;
                                }
                            }
                            else {
                                stateCount[++currentState]++;
                            }
                        }
                        else {
                            // Counting white pixels
                            stateCount[currentState]++;
                        }
                    }
                }
                if (this.foundPatternCross(stateCount)) {
                    var /** @type {?} */ confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
                    if (confirmed) {
                        iSkip = stateCount[0];
                        if (this.hasSkipped) {
                            // Found a third one
                            done = this.haveMultiplyConfirmedCenters();
                        }
                    }
                }
            }
            var /** @type {?} */ patternInfo = this.selectBestPatterns();
            this.orderBestPatterns(patternInfo);
            return new FinderPatternInfo(patternInfo);
        };
        this.width = width;
        this.height = height;
    }
    /**
     * @return {?}
     */
    get CrossCheckStateCount() {
        this.crossCheckStateCount[0] = 0;
        this.crossCheckStateCount[1] = 0;
        this.crossCheckStateCount[2] = 0;
        this.crossCheckStateCount[3] = 0;
        this.crossCheckStateCount[4] = 0;
        return this.crossCheckStateCount;
    }
    ;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class DetectorResult {
    /**
     * @param {?} bits
     * @param {?} points
     */
    constructor(bits, points) {
        this.bits = bits;
        this.points = points;
    }
}
class Detector {
    /**
     * @param {?} image
     * @param {?} rawImage
     * @param {?} width
     * @param {?} height
     */
    constructor(image, rawImage, width, height) {
        this.calculateModuleSizeOneWay = function (pattern, otherPattern) {
            var /** @type {?} */ moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(pattern.X), Math.floor(pattern.Y), Math.floor(otherPattern.X), Math.floor(otherPattern.Y));
            var /** @type {?} */ moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(otherPattern.X), Math.floor(otherPattern.Y), Math.floor(pattern.X), Math.floor(pattern.Y));
            if (isNaN(moduleSizeEst1)) {
                return moduleSizeEst2 / 7.0;
            }
            if (isNaN(moduleSizeEst2)) {
                return moduleSizeEst1 / 7.0;
            }
            // Average them, and divide by 7 since we've counted the width of 3 black modules,
            // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
            // Average them, and divide by 7 since we've counted the width of 3 black modules,
            // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
            return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
        };
        this.calculateModuleSize = function (topLeft, topRight, bottomLeft) {
            // Take the average
            // Take the average
            return (this.calculateModuleSizeOneWay(topLeft, topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
        };
        this.distance = function (pattern1, pattern2) {
            let /** @type {?} */ xDiff = pattern1.X - pattern2.X;
            let /** @type {?} */ yDiff = pattern1.Y - pattern2.Y;
            return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
        };
        this.computeDimension = function (topLeft, topRight, bottomLeft, moduleSize) {
            var /** @type {?} */ tltrCentersDimension = Math.round(this.distance(topLeft, topRight) / moduleSize);
            var /** @type {?} */ tlblCentersDimension = Math.round(this.distance(topLeft, bottomLeft) / moduleSize);
            var /** @type {?} */ dimension = ((tltrCentersDimension + tlblCentersDimension) >> 1) + 7;
            switch (dimension & 0x03) {
                // mod 4
                // mod 4
                case 0:
                    dimension++;
                    break;
                // 1? do nothing
                // 1? do nothing
                case 2:
                    dimension--;
                    break;
                case 3:
                    throw "Error";
            }
            return dimension;
        };
        this.findAlignmentInRegion = function (overallEstModuleSize, estAlignmentX, estAlignmentY, allowanceFactor) {
            // Look for an alignment pattern (3 modules in size) around where it
            // should be
            var /** @type {?} */ allowance = Math.floor(allowanceFactor * overallEstModuleSize);
            var /** @type {?} */ alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
            var /** @type {?} */ alignmentAreaRightX = Math.min(this.width - 1, estAlignmentX + allowance);
            if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
                throw "Error";
            }
            var /** @type {?} */ alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
            var /** @type {?} */ alignmentAreaBottomY = Math.min(this.height - 1, estAlignmentY + allowance);
            var /** @type {?} */ alignmentFinder = new AlignmentPatternFinder(this.image, alignmentAreaLeftX, alignmentAreaTopY, alignmentAreaRightX - alignmentAreaLeftX, alignmentAreaBottomY - alignmentAreaTopY, overallEstModuleSize, this.width, this.height, this.resultPointCallback);
            return alignmentFinder.find();
        };
        this.createTransform = function (topLeft, topRight, bottomLeft, alignmentPattern, dimension) {
            var /** @type {?} */ dimMinusThree = dimension - 3.5;
            var /** @type {?} */ bottomRightX;
            var /** @type {?} */ bottomRightY;
            var /** @type {?} */ sourceBottomRightX;
            var /** @type {?} */ sourceBottomRightY;
            if (alignmentPattern != null) {
                bottomRightX = alignmentPattern.X;
                bottomRightY = alignmentPattern.Y;
                sourceBottomRightX = sourceBottomRightY = dimMinusThree - 3.0;
            }
            else {
                // Don't have an alignment pattern, just make up the bottom-right point
                bottomRightX = (topRight.X - topLeft.X) + bottomLeft.X;
                bottomRightY = (topRight.Y - topLeft.Y) + bottomLeft.Y;
                sourceBottomRightX = sourceBottomRightY = dimMinusThree;
            }
            var /** @type {?} */ transform = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, dimMinusThree, 3.5, sourceBottomRightX, sourceBottomRightY, 3.5, dimMinusThree, topLeft.X, topLeft.Y, topRight.X, topRight.Y, bottomRightX, bottomRightY, bottomLeft.X, bottomLeft.Y);
            return transform;
        };
        this.sampleGrid = function (image, transform, dimension) {
            var /** @type {?} */ sampler = new GridSampler(this.width, this.height);
            return sampler.sampleGrid3(image, this.rawImage, dimension, transform);
        };
        this.detect = function () {
            var /** @type {?} */ info = new FinderPatternFinder(this.width, this.height).findFinderPattern(this.image);
            return this.processFinderPatternInfo(info);
        };
        this.image = image;
        this.rawImage = rawImage;
        this.height = height;
        this.width = width;
    }
    /**
     * @param {?} fromX
     * @param {?} fromY
     * @param {?} toX
     * @param {?} toY
     * @return {?}
     */
    sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY) {
        // Mild variant of Bresenham's algorithm;
        // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
        var /** @type {?} */ steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
        if (steep) {
            var /** @type {?} */ temp = fromX;
            fromX = fromY;
            fromY = temp;
            temp = toX;
            toX = toY;
            toY = temp;
        }
        var /** @type {?} */ dx = Math.abs(toX - fromX);
        var /** @type {?} */ dy = Math.abs(toY - fromY);
        var /** @type {?} */ error = -dx >> 1;
        var /** @type {?} */ ystep = fromY < toY ? 1 : -1;
        var /** @type {?} */ xstep = fromX < toX ? 1 : -1;
        var /** @type {?} */ state = 0; // In black pixels, looking for white, first or second time
        for (var /** @type {?} */ x = fromX, /** @type {?} */ y = fromY; x != toX; x += xstep) {
            var /** @type {?} */ realX = steep ? y : x;
            var /** @type {?} */ realY = steep ? x : y;
            if (state == 1) {
                // In white pixels, looking for black
                // In white pixels, looking for black
                if (this.image[realX + realY * this.width]) {
                    state++;
                }
            }
            else {
                if (!this.image[realX + realY * this.width]) {
                    state++;
                }
            }
            if (state == 3) {
                // Found black, white, black, and stumbled back onto white; done
                var /** @type {?} */ diffX = x - fromX;
                var /** @type {?} */ diffY = y - fromY;
                return Math.sqrt((diffX * diffX + diffY * diffY));
            }
            error += dy;
            if (error > 0) {
                if (y == toY) {
                    break;
                }
                y += ystep;
                error -= dx;
            }
        }
        var /** @type {?} */ diffX2 = toX - fromX;
        var /** @type {?} */ diffY2 = toY - fromY;
        return Math.sqrt((diffX2 * diffX2 + diffY2 * diffY2));
    }
    /**
     * @param {?} fromX
     * @param {?} fromY
     * @param {?} toX
     * @param {?} toY
     * @return {?}
     */
    sizeOfBlackWhiteBlackRunBothWays(fromX, fromY, toX, toY) {
        var /** @type {?} */ result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);
        // Now count other way -- don't run off image though of course
        var /** @type {?} */ scale = 1.0;
        var /** @type {?} */ otherToX = fromX - (toX - fromX);
        if (otherToX < 0) {
            scale = fromX / (fromX - otherToX);
            otherToX = 0;
        }
        else if (otherToX >= this.width) {
            scale = (this.width - 1 - fromX) / (otherToX - fromX);
            otherToX = this.width - 1;
        }
        var /** @type {?} */ otherToY = Math.floor(fromY - (toY - fromY) * scale);
        scale = 1.0;
        if (otherToY < 0) {
            scale = fromY / (fromY - otherToY);
            otherToY = 0;
        }
        else if (otherToY >= this.height) {
            scale = (this.height - 1 - fromY) / (otherToY - fromY);
            otherToY = this.height - 1;
        }
        otherToX = Math.floor(fromX + (otherToX - fromX) * scale);
        result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
        return result - 1.0; // -1 because we counted the middle pixel twice
    }
    /**
     * @param {?} info
     * @return {?}
     */
    processFinderPatternInfo(info) {
        var /** @type {?} */ topLeft = info.TopLeft;
        var /** @type {?} */ topRight = info.TopRight;
        var /** @type {?} */ bottomLeft = info.BottomLeft;
        var /** @type {?} */ moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
        if (moduleSize < 1.0) {
            throw "Error";
        }
        var /** @type {?} */ dimension = this.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
        var /** @type {?} */ provisionalVersion = Version.getProvisionalVersionForDimension(dimension);
        var /** @type {?} */ modulesBetweenFPCenters = provisionalVersion.DimensionForVersion - 7;
        var /** @type {?} */ alignmentPattern = null;
        // Anything above version 1 has an alignment pattern
        // Anything above version 1 has an alignment pattern
        if (provisionalVersion.AlignmentPatternCenters.length > 0) {
            // Guess where a "bottom right" finder pattern would have been
            var /** @type {?} */ bottomRightX = topRight.X - topLeft.X + bottomLeft.X;
            var /** @type {?} */ bottomRightY = topRight.Y - topLeft.Y + bottomLeft.Y;
            // Estimate that alignment pattern is closer by 3 modules
            // from "bottom right" to known top left location
            var /** @type {?} */ correctionToTopLeft = 1.0 - 3.0 / modulesBetweenFPCenters;
            var /** @type {?} */ estAlignmentX = Math.floor(topLeft.X + correctionToTopLeft * (bottomRightX - topLeft.X));
            var /** @type {?} */ estAlignmentY = Math.floor(topLeft.Y + correctionToTopLeft * (bottomRightY - topLeft.Y));
            // Kind of arbitrary -- expand search radius before giving up
            // Kind of arbitrary -- expand search radius before giving up
            for (var /** @type {?} */ i = 4; i <= 16; i <<= 1) {
                //try
                //{
                alignmentPattern = this.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY, i);
                break;
                //}
                //catch (re)
                //{
                // try next round
                //}
            }
            // If we didn't find alignment pattern... well try anyway without it
        }
        var /** @type {?} */ transform = this.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);
        var /** @type {?} */ bits = this.sampleGrid(this.image, transform, dimension);
        var /** @type {?} */ points;
        if (alignmentPattern == null) {
            points = new Array(bottomLeft, topLeft, topRight);
        }
        else {
            points = new Array(bottomLeft, topLeft, topRight, alignmentPattern);
        }
        return new DetectorResult(bits, points);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class GF256Poly {
    /**
     * @param {?} field
     * @param {?} coefficients
     */
    constructor(field, coefficients) {
        this.divide = function (other) {
            if (this.field != other.field) {
                throw "GF256Polys do not have same GF256 field";
            }
            if (other.Zero) {
                throw "Divide by 0";
            }
            var /** @type {?} */ quotient = this.field.Zero;
            var /** @type {?} */ remainder = this;
            var /** @type {?} */ denominatorLeadingTerm = other.getCoefficient(other.Degree);
            var /** @type {?} */ inverseDenominatorLeadingTerm = this.field.inverse(denominatorLeadingTerm);
            while (remainder.Degree >= other.Degree && !remainder.Zero) {
                var /** @type {?} */ degreeDifference = remainder.Degree - other.Degree;
                var /** @type {?} */ scale = this.field.multiply(remainder.getCoefficient(remainder.Degree), inverseDenominatorLeadingTerm);
                var /** @type {?} */ term = other.multiplyByMonomial(degreeDifference, scale);
                var /** @type {?} */ iterationQuotient = this.field.buildMonomial(degreeDifference, scale);
                quotient = quotient.addOrSubtract(iterationQuotient);
                remainder = remainder.addOrSubtract(term);
            }
            return new Array(quotient, remainder);
        };
        if (coefficients == null || coefficients.length == 0) {
            throw "System.ArgumentException";
        }
        this.field = field;
        var /** @type {?} */ coefficientsLength = coefficients.length;
        if (coefficientsLength > 1 && coefficients[0] == 0) {
            // Leading term must be non-zero for anything except the constant polynomial "0"
            var /** @type {?} */ firstNonZero = 1;
            while (firstNonZero < coefficientsLength && coefficients[firstNonZero] == 0) {
                firstNonZero++;
            }
            if (firstNonZero == coefficientsLength) {
                this.coefficients = field.Zero.coefficients;
            }
            else {
                this.coefficients = new Array(coefficientsLength - firstNonZero);
                for (var /** @type {?} */ i = 0; i < this.coefficients.length; i++)
                    this.coefficients[i] = 0;
                //Array.Copy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);
                //Array.Copy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);
                for (var /** @type {?} */ ci = 0; ci < this.coefficients.length; ci++)
                    this.coefficients[ci] = coefficients[firstNonZero + ci];
            }
        }
        else {
            this.coefficients = coefficients;
        }
    }
    /**
     * @return {?}
     */
    get Zero() {
        return this.coefficients[0] == 0;
    }
    ;
    /**
     * @return {?}
     */
    get Degree() {
        return this.coefficients.length - 1;
    }
    ;
    /**
     * @return {?}
     */
    get Coefficients() {
        return this.coefficients;
    }
    ;
    /**
     * @param {?} degree
     * @return {?}
     */
    getCoefficient(degree) {
        return this.coefficients[this.coefficients.length - 1 - degree];
    }
    /**
     * @param {?} a
     * @return {?}
     */
    evaluateAt(a) {
        if (a == 0) {
            // Just return the x^0 coefficient
            // Just return the x^0 coefficient
            return this.getCoefficient(0);
        }
        var /** @type {?} */ size = this.coefficients.length;
        if (a == 1) {
            // Just the sum of the coefficients
            var /** @type {?} */ result = 0;
            for (var /** @type {?} */ i = 0; i < size; i++) {
                result = GF256.addOrSubtract(result, this.coefficients[i]);
            }
            return result;
        }
        var /** @type {?} */ result2 = this.coefficients[0];
        for (var /** @type {?} */ i = 1; i < size; i++) {
            result2 = GF256.addOrSubtract(this.field.multiply(a, result2), this.coefficients[i]);
        }
        return result2;
    }
    /**
     * @param {?} other
     * @return {?}
     */
    addOrSubtract(other) {
        if (this.field != other.field) {
            throw "GF256Polys do not have same GF256 field";
        }
        if (this.Zero) {
            return other;
        }
        if (other.Zero) {
            return this;
        }
        var /** @type {?} */ smallerCoefficients = this.coefficients;
        var /** @type {?} */ largerCoefficients = other.coefficients;
        if (smallerCoefficients.length > largerCoefficients.length) {
            var /** @type {?} */ temp = smallerCoefficients;
            smallerCoefficients = largerCoefficients;
            largerCoefficients = temp;
        }
        var /** @type {?} */ sumDiff = new Array(largerCoefficients.length);
        var /** @type {?} */ lengthDiff = largerCoefficients.length - smallerCoefficients.length;
        // Copy high-order terms only found in higher-degree polynomial's coefficients
        //Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
        // Copy high-order terms only found in higher-degree polynomial's coefficients
        //Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
        for (var /** @type {?} */ ci = 0; ci < lengthDiff; ci++)
            sumDiff[ci] = largerCoefficients[ci];
        for (var /** @type {?} */ i = lengthDiff; i < largerCoefficients.length; i++) {
            sumDiff[i] = GF256.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
        }
        return new GF256Poly(this.field, sumDiff);
    }
    /**
     * @param {?} other
     * @return {?}
     */
    multiply1(other) {
        if (this.field != other.field) {
            throw "GF256Polys do not have same GF256 field";
        }
        if (this.Zero || other.Zero) {
            return this.field.Zero;
        }
        var /** @type {?} */ aCoefficients = this.coefficients;
        var /** @type {?} */ aLength = aCoefficients.length;
        var /** @type {?} */ bCoefficients = other.coefficients;
        var /** @type {?} */ bLength = bCoefficients.length;
        var /** @type {?} */ product = new Array(aLength + bLength - 1);
        for (var /** @type {?} */ i = 0; i < aLength; i++) {
            var /** @type {?} */ aCoeff = aCoefficients[i];
            for (var /** @type {?} */ j = 0; j < bLength; j++) {
                product[i + j] = GF256.addOrSubtract(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
            }
        }
        return new GF256Poly(this.field, product);
    }
    /**
     * @param {?} scalar
     * @return {?}
     */
    multiply2(scalar) {
        if (scalar == 0) {
            return this.field.Zero;
        }
        if (scalar == 1) {
            return this;
        }
        var /** @type {?} */ size = this.coefficients.length;
        var /** @type {?} */ product = new Array(size);
        for (var /** @type {?} */ i = 0; i < size; i++) {
            product[i] = this.field.multiply(this.coefficients[i], scalar);
        }
        return new GF256Poly(this.field, product);
    }
    /**
     * @param {?} degree
     * @param {?} coefficient
     * @return {?}
     */
    multiplyByMonomial(degree, coefficient) {
        if (degree < 0) {
            throw "System.ArgumentException";
        }
        if (coefficient == 0) {
            return this.field.Zero;
        }
        var /** @type {?} */ size = this.coefficients.length;
        var /** @type {?} */ product = new Array(size + degree);
        for (var /** @type {?} */ i = 0; i < product.length; i++)
            product[i] = 0;
        for (var /** @type {?} */ i = 0; i < size; i++) {
            product[i] = this.field.multiply(this.coefficients[i], coefficient);
        }
        return new GF256Poly(this.field, product);
    }
}
class GF256 {
    /**
     * @param {?} primitive
     */
    constructor(primitive) {
        this.expTable = new Array(256);
        this.logTable = new Array(256);
        var /** @type {?} */ x = 1;
        for (var /** @type {?} */ i = 0; i < 256; i++) {
            this.expTable[i] = x;
            x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
            if (x >= 0x100) {
                x ^= primitive;
            }
        }
        for (var /** @type {?} */ i = 0; i < 255; i++) {
            this.logTable[this.expTable[i]] = i;
        }
        // logTable[0] == 0 but this should never be used
        var /** @type {?} */ at0 = new Array(1);
        at0[0] = 0;
        this.zero = new GF256Poly(this, new Array(at0));
        var /** @type {?} */ at1 = new Array(1);
        at1[0] = 1;
        this.one = new GF256Poly(this, new Array(at1));
    }
    /**
     * @return {?}
     */
    get Zero() {
        return this.zero;
    }
    ;
    /**
     * @return {?}
     */
    get One() {
        return this.one;
    }
    ;
    /**
     * @param {?} degree
     * @param {?} coefficient
     * @return {?}
     */
    buildMonomial(degree, coefficient) {
        if (degree < 0) {
            throw "System.ArgumentException";
        }
        if (coefficient == 0) {
            return this.zero;
        }
        var /** @type {?} */ coefficients = new Array(degree + 1);
        for (var /** @type {?} */ i = 0; i < coefficients.length; i++)
            coefficients[i] = 0;
        coefficients[0] = coefficient;
        return new GF256Poly(this, coefficients);
    }
    /**
     * @param {?} a
     * @return {?}
     */
    exp(a) {
        return this.expTable[a];
    }
    /**
     * @param {?} a
     * @return {?}
     */
    log(a) {
        if (a == 0) {
            throw "System.ArgumentException";
        }
        return this.logTable[a];
    }
    /**
     * @param {?} a
     * @return {?}
     */
    inverse(a) {
        if (a == 0) {
            throw "System.ArithmeticException";
        }
        return this.expTable[255 - this.logTable[a]];
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    multiply(a, b) {
        if (a == 0 || b == 0) {
            return 0;
        }
        if (a == 1) {
            return b;
        }
        if (b == 1) {
            return a;
        }
        return this.expTable[(this.logTable[a] + this.logTable[b]) % 255];
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    static addOrSubtract(a, b) {
        return a ^ b;
    }
}
GF256.QR_CODE_FIELD = new GF256(0x011D);
GF256.DATA_MATRIX_FIELD = new GF256(0x012D);

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class ReedSolomonDecoder {
    /**
     * @param {?} field
     */
    constructor(field) {
        this.field = field;
    }
    /**
     * @param {?} received
     * @param {?} twoS
     * @return {?}
     */
    decode(received, twoS) {
        var /** @type {?} */ poly = new GF256Poly(this.field, received);
        var /** @type {?} */ syndromeCoefficients = new Array(twoS);
        for (var /** @type {?} */ i = 0; i < syndromeCoefficients.length; i++)
            syndromeCoefficients[i] = 0;
        var /** @type {?} */ dataMatrix = false; //this.field.Equals(GF256.DATA_MATRIX_FIELD);
        var /** @type {?} */ noError = true;
        for (var /** @type {?} */ i = 0; i < twoS; i++) {
            // Thanks to sanfordsquires for this fix:
            var /** @type {?} */ evalu = poly.evaluateAt(this.field.exp(dataMatrix ? i + 1 : i));
            syndromeCoefficients[syndromeCoefficients.length - 1 - i] = evalu;
            if (evalu != 0) {
                noError = false;
            }
        }
        if (noError) {
            return;
        }
        var /** @type {?} */ syndrome = new GF256Poly(this.field, syndromeCoefficients);
        var /** @type {?} */ sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS, 1), syndrome, twoS);
        var /** @type {?} */ sigma = sigmaOmega[0];
        var /** @type {?} */ omega = sigmaOmega[1];
        var /** @type {?} */ errorLocations = this.findErrorLocations(sigma);
        var /** @type {?} */ errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations, dataMatrix);
        for (var /** @type {?} */ i = 0; i < errorLocations.length; i++) {
            var /** @type {?} */ position = received.length - 1 - this.field.log(errorLocations[i]);
            if (position < 0) {
                throw "ReedSolomonException Bad error location";
            }
            received[position] = GF256.addOrSubtract(received[position], errorMagnitudes[i]);
        }
    }
    /**
     * @param {?} a
     * @param {?} b
     * @param {?} R
     * @return {?}
     */
    runEuclideanAlgorithm(a, b, R) {
        // Assume a's degree is >= b's
        // Assume a's degree is >= b's
        if (a.Degree < b.Degree) {
            var /** @type {?} */ temp = a;
            a = b;
            b = temp;
        }
        var /** @type {?} */ rLast = a;
        var /** @type {?} */ r = b;
        var /** @type {?} */ sLast = this.field.One;
        var /** @type {?} */ s = this.field.Zero;
        var /** @type {?} */ tLast = this.field.Zero;
        var /** @type {?} */ t = this.field.One;
        // Run Euclidean algorithm until r's degree is less than R/2
        // Run Euclidean algorithm until r's degree is less than R/2
        while (r.Degree >= Math.floor(R / 2)) {
            var /** @type {?} */ rLastLast = rLast;
            var /** @type {?} */ sLastLast = sLast;
            var /** @type {?} */ tLastLast = tLast;
            rLast = r;
            sLast = s;
            tLast = t;
            // Divide rLastLast by rLast, with quotient in q and remainder in r
            // Divide rLastLast by rLast, with quotient in q and remainder in r
            if (rLast.Zero) {
                // Oops, Euclidean algorithm already terminated?
                // Oops, Euclidean algorithm already terminated?
                throw "r_{i-1} was zero";
            }
            r = rLastLast;
            var /** @type {?} */ q = this.field.Zero;
            var /** @type {?} */ denominatorLeadingTerm = rLast.getCoefficient(rLast.Degree);
            var /** @type {?} */ dltInverse = this.field.inverse(denominatorLeadingTerm);
            while (r.Degree >= rLast.Degree && !r.Zero) {
                var /** @type {?} */ degreeDiff = r.Degree - rLast.Degree;
                var /** @type {?} */ scale = this.field.multiply(r.getCoefficient(r.Degree), dltInverse);
                q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
                r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
                //r.EXE();
            }
            s = q.multiply1(sLast).addOrSubtract(sLastLast);
            t = q.multiply1(tLast).addOrSubtract(tLastLast);
        }
        var /** @type {?} */ sigmaTildeAtZero = t.getCoefficient(0);
        if (sigmaTildeAtZero == 0) {
            throw "ReedSolomonException sigmaTilde(0) was zero";
        }
        var /** @type {?} */ inverse = this.field.inverse(sigmaTildeAtZero);
        var /** @type {?} */ sigma = t.multiply2(inverse);
        var /** @type {?} */ omega = r.multiply2(inverse);
        return new Array(sigma, omega);
    }
    /**
     * @param {?} errorLocator
     * @return {?}
     */
    findErrorLocations(errorLocator) {
        // This is a direct application of Chien's search
        var /** @type {?} */ numErrors = errorLocator.Degree;
        if (numErrors == 1) {
            // shortcut
            // shortcut
            return new Array(errorLocator.getCoefficient(1));
        }
        var /** @type {?} */ result = new Array(numErrors);
        var /** @type {?} */ e = 0;
        for (var /** @type {?} */ i = 1; i < 256 && e < numErrors; i++) {
            if (errorLocator.evaluateAt(i) == 0) {
                result[e] = this.field.inverse(i);
                e++;
            }
        }
        if (e != numErrors) {
            throw "Error locator degree does not match number of roots";
        }
        return result;
    }
    /**
     * @param {?} errorEvaluator
     * @param {?} errorLocations
     * @param {?} dataMatrix
     * @return {?}
     */
    findErrorMagnitudes(errorEvaluator, errorLocations, dataMatrix) {
        // This is directly applying Forney's Formula
        var /** @type {?} */ s = errorLocations.length;
        var /** @type {?} */ result = new Array(s);
        for (var /** @type {?} */ i = 0; i < s; i++) {
            var /** @type {?} */ xiInverse = this.field.inverse(errorLocations[i]);
            var /** @type {?} */ denominator = 1;
            for (var /** @type {?} */ j = 0; j < s; j++) {
                if (i != j) {
                    denominator = this.field.multiply(denominator, GF256.addOrSubtract(1, this.field.multiply(errorLocations[j], xiInverse)));
                }
            }
            result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse), this.field.inverse(denominator));
            // Thanks to sanfordsquires for this fix:
            // Thanks to sanfordsquires for this fix:
            if (dataMatrix) {
                result[i] = this.field.multiply(result[i], xiInverse);
            }
        }
        return result;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class DataMask000 {
    constructor() {
        this.isMasked = function (i, j) {
            return ((i + j) & 0x01) == 0;
        };
    }
    /**
     * @param {?} bits
     * @param {?} dimension
     * @return {?}
     */
    unmaskBitMatrix(bits, dimension) {
        for (var /** @type {?} */ i = 0; i < dimension; i++) {
            for (var /** @type {?} */ j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }
}
class DataMask001 {
    constructor() {
        this.isMasked = function (i, j) {
            return (i & 0x01) == 0;
        };
    }
    /**
     * @param {?} bits
     * @param {?} dimension
     * @return {?}
     */
    unmaskBitMatrix(bits, dimension) {
        for (var /** @type {?} */ i = 0; i < dimension; i++) {
            for (var /** @type {?} */ j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }
}
class DataMask010 {
    constructor() {
        this.isMasked = function (i, j) {
            return j % 3 == 0;
        };
    }
    /**
     * @param {?} bits
     * @param {?} dimension
     * @return {?}
     */
    unmaskBitMatrix(bits, dimension) {
        for (var /** @type {?} */ i = 0; i < dimension; i++) {
            for (var /** @type {?} */ j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }
}
class DataMask011 {
    constructor() {
        this.isMasked = function (i, j) {
            return (i + j) % 3 == 0;
        };
    }
    /**
     * @param {?} bits
     * @param {?} dimension
     * @return {?}
     */
    unmaskBitMatrix(bits, dimension) {
        for (var /** @type {?} */ i = 0; i < dimension; i++) {
            for (var /** @type {?} */ j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }
}
class DataMask100 {
    constructor() {
        this.isMasked = function (i, j) {
            return (((this.URShift(i, 1)) + (j / 3)) & 0x01) == 0;
        };
    }
    /**
     * @param {?} bits
     * @param {?} dimension
     * @return {?}
     */
    unmaskBitMatrix(bits, dimension) {
        for (var /** @type {?} */ i = 0; i < dimension; i++) {
            for (var /** @type {?} */ j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }
    /**
     * @param {?} number
     * @param {?} bits
     * @return {?}
     */
    URShift(number, bits) {
        if (number >= 0)
            return number >> bits;
        else
            return (number >> bits) + (2 << ~bits);
    }
}
class DataMask101 {
    constructor() {
        this.isMasked = function (i, j) {
            var /** @type {?} */ temp = i * j;
            return (temp & 0x01) + (temp % 3) == 0;
        };
    }
    /**
     * @param {?} bits
     * @param {?} dimension
     * @return {?}
     */
    unmaskBitMatrix(bits, dimension) {
        for (var /** @type {?} */ i = 0; i < dimension; i++) {
            for (var /** @type {?} */ j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }
}
class DataMask110 {
    constructor() {
        this.isMasked = function (i, j) {
            var /** @type {?} */ temp = i * j;
            return (((temp & 0x01) + (temp % 3)) & 0x01) == 0;
        };
    }
    /**
     * @param {?} bits
     * @param {?} dimension
     * @return {?}
     */
    unmaskBitMatrix(bits, dimension) {
        for (var /** @type {?} */ i = 0; i < dimension; i++) {
            for (var /** @type {?} */ j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }
}
class DataMask111 {
    constructor() {
        this.isMasked = function (i, j) {
            return ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) == 0;
        };
    }
    /**
     * @param {?} bits
     * @param {?} dimension
     * @return {?}
     */
    unmaskBitMatrix(bits, dimension) {
        for (var /** @type {?} */ i = 0; i < dimension; i++) {
            for (var /** @type {?} */ j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i);
                }
            }
        }
    }
}
class DataMask {
    /**
     * @param {?} reference
     * @return {?}
     */
    static forReference(reference) {
        if (reference < 0 || reference > 7) {
            throw "System.ArgumentException";
        }
        return DataMask.DATA_MASKS[reference];
    }
}
DataMask.DATA_MASKS = new Array(new DataMask000(), new DataMask001(), new DataMask010(), new DataMask011(), new DataMask100(), new DataMask101(), new DataMask110(), new DataMask111());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
class BitMatrixParser {
    /**
     * @param {?} bitmatrix
     */
    constructor(bitmatrix) {
        var /** @type {?} */ dimension = bitmatrix.Dimension;
        if (dimension < 21 || (dimension & 0x03) != 1) {
            throw "Error BitMatrixParser";
        }
        this.bitMatrix = bitmatrix;
    }
    /**
     * @param {?} i
     * @param {?} j
     * @param {?} versionBits
     * @return {?}
     */
    copyBit(i, j, versionBits) {
        return this.bitMatrix.get_Renamed(i, j) ? (versionBits << 1) | 0x1 : versionBits << 1;
    }
    /**
     * @return {?}
     */
    readFormatInformation() {
        if (this.parsedFormatInfo != null) {
            return this.parsedFormatInfo;
        }
        // Read top-left format info bits
        var /** @type {?} */ formatInfoBits = 0;
        for (var /** @type {?} */ i = 0; i < 6; i++) {
            formatInfoBits = this.copyBit(i, 8, formatInfoBits);
        }
        // .. and skip a bit in the timing pattern ...
        formatInfoBits = this.copyBit(7, 8, formatInfoBits);
        formatInfoBits = this.copyBit(8, 8, formatInfoBits);
        formatInfoBits = this.copyBit(8, 7, formatInfoBits);
        // .. and skip a bit in the timing pattern ...
        // .. and skip a bit in the timing pattern ...
        for (var /** @type {?} */ j = 5; j >= 0; j--) {
            formatInfoBits = this.copyBit(8, j, formatInfoBits);
        }
        this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
        if (this.parsedFormatInfo != null) {
            return this.parsedFormatInfo;
        }
        // Hmm, failed. Try the top-right/bottom-left pattern
        var /** @type {?} */ dimension = this.bitMatrix.Dimension;
        formatInfoBits = 0;
        var /** @type {?} */ iMin = dimension - 8;
        for (var /** @type {?} */ i = dimension - 1; i >= iMin; i--) {
            formatInfoBits = this.copyBit(i, 8, formatInfoBits);
        }
        for (var /** @type {?} */ j = dimension - 7; j < dimension; j++) {
            formatInfoBits = this.copyBit(8, j, formatInfoBits);
        }
        this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
        if (this.parsedFormatInfo != null) {
            return this.parsedFormatInfo;
        }
        throw "Error readFormatInformation";
    }
    /**
     * @return {?}
     */
    readVersion() {
        if (this.parsedVersion != null) {
            return this.parsedVersion;
        }
        var /** @type {?} */ dimension = this.bitMatrix.Dimension;
        var /** @type {?} */ provisionalVersion = (dimension - 17) >> 2;
        if (provisionalVersion <= 6) {
            return Version.getVersionForNumber(provisionalVersion);
        }
        // Read top-right version info: 3 wide by 6 tall
        var /** @type {?} */ versionBits = 0;
        var /** @type {?} */ ijMin = dimension - 11;
        for (var /** @type {?} */ j = 5; j >= 0; j--) {
            for (var /** @type {?} */ i = dimension - 9; i >= ijMin; i--) {
                versionBits = this.copyBit(i, j, versionBits);
            }
        }
        this.parsedVersion = Version.decodeVersionInformation(versionBits);
        if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
            return this.parsedVersion;
        }
        // Hmm, failed. Try bottom left: 6 wide by 3 tall
        versionBits = 0;
        for (var /** @type {?} */ i = 5; i >= 0; i--) {
            for (var /** @type {?} */ j = dimension - 9; j >= ijMin; j--) {
                versionBits = this.copyBit(i, j, versionBits);
            }
        }
        this.parsedVersion = Version.decodeVersionInformation(versionBits);
        if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
            return this.parsedVersion;
        }
        throw "Error readVersion";
    }
    /**
     * @return {?}
     */
    readCodewords() {
        var /** @type {?} */ formatInfo = this.readFormatInformation();
        var /** @type {?} */ version = this.readVersion();
        // Get the data mask for the format used in this QR Code. This will exclude
        // some bits from reading as we wind through the bit matrix.
        var /** @type {?} */ dataMask = DataMask.forReference(formatInfo.DataMask);
        var /** @type {?} */ dimension = this.bitMatrix.Dimension;
        dataMask.unmaskBitMatrix(this.bitMatrix, dimension);
        var /** @type {?} */ functionPattern = version.buildFunctionPattern();
        var /** @type {?} */ readingUp = true;
        var /** @type {?} */ result = new Array(version.TotalCodewords);
        var /** @type {?} */ resultOffset = 0;
        var /** @type {?} */ currentByte = 0;
        var /** @type {?} */ bitsRead = 0;
        // Read columns in pairs, from right to left
        // Read columns in pairs, from right to left
        for (var /** @type {?} */ j = dimension - 1; j > 0; j -= 2) {
            if (j == 6) {
                // Skip whole column with vertical alignment pattern;
                // saves time and makes the other code proceed more cleanly
                j--;
            }
            // Read alternatingly from bottom to top then top to bottom
            // Read alternatingly from bottom to top then top to bottom
            for (var /** @type {?} */ count = 0; count < dimension; count++) {
                var /** @type {?} */ i = readingUp ? dimension - 1 - count : count;
                for (var /** @type {?} */ col = 0; col < 2; col++) {
                    // Ignore bits covered by the function pattern
                    // Ignore bits covered by the function pattern
                    if (!functionPattern.get_Renamed(j - col, i)) {
                        // Read a bit
                        bitsRead++;
                        currentByte <<= 1;
                        if (this.bitMatrix.get_Renamed(j - col, i)) {
                            currentByte |= 1;
                        }
                        // If we've made a whole byte, save it off
                        // If we've made a whole byte, save it off
                        if (bitsRead == 8) {
                            result[resultOffset++] = currentByte;
                            bitsRead = 0;
                            currentByte = 0;
                        }
                    }
                }
            }
            readingUp = !readingUp; // readingUp = !readingUp; // switch directions
        }
        if (resultOffset != version.TotalCodewords) {
            throw "Error readCodewords";
        }
        return result;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class DataBlock {
    /**
     * @param {?} numDataCodewords
     * @param {?} codewords
     */
    constructor(numDataCodewords, codewords) {
        this.numDataCodewords = numDataCodewords;
        this.codewords = codewords;
    }
    /**
     * @return {?}
     */
    get NumDataCodewords() {
        return this.numDataCodewords;
    }
    /**
     * @return {?}
     */
    get Codewords() {
        return this.codewords;
    }
    /**
     * @param {?} rawCodewords
     * @param {?} version
     * @param {?} ecLevel
     * @return {?}
     */
    static getDataBlocks(rawCodewords, version, ecLevel) {
        if (rawCodewords.length != version.TotalCodewords) {
            throw "ArgumentException";
        }
        // Figure out the number and size of data blocks used by this version and
        // error correction level
        var /** @type {?} */ ecBlocks = version.getECBlocksForLevel(ecLevel);
        // First count the total number of data blocks
        var /** @type {?} */ totalBlocks = 0;
        var /** @type {?} */ ecBlockArray = ecBlocks.getECBlocks();
        for (var /** @type {?} */ i = 0; i < ecBlockArray.length; i++) {
            totalBlocks += ecBlockArray[i].Count;
        }
        // Now establish DataBlocks of the appropriate size and number of data codewords
        var /** @type {?} */ result = new Array(totalBlocks);
        var /** @type {?} */ numResultBlocks = 0;
        for (var /** @type {?} */ j = 0; j < ecBlockArray.length; j++) {
            var /** @type {?} */ ecBlock = ecBlockArray[j];
            for (var /** @type {?} */ i = 0; i < ecBlock.Count; i++) {
                var /** @type {?} */ numDataCodewords = ecBlock.DataCodewords;
                var /** @type {?} */ numBlockCodewords = ecBlocks.ECCodewordsPerBlock + numDataCodewords;
                result[numResultBlocks++] = new DataBlock(numDataCodewords, new Array(numBlockCodewords));
            }
        }
        // All blocks have the same amount of data, except that the last n
        // (where n may be 0) have 1 more byte. Figure out where these start.
        var /** @type {?} */ shorterBlocksTotalCodewords = result[0].codewords.length;
        var /** @type {?} */ longerBlocksStartAt = result.length - 1;
        while (longerBlocksStartAt >= 0) {
            var /** @type {?} */ numCodewords = result[longerBlocksStartAt].codewords.length;
            if (numCodewords == shorterBlocksTotalCodewords) {
                break;
            }
            longerBlocksStartAt--;
        }
        longerBlocksStartAt++;
        var /** @type {?} */ shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.ECCodewordsPerBlock;
        // The last elements of result may be 1 element longer;
        // first fill out as many elements as all of them have
        var /** @type {?} */ rawCodewordsOffset = 0;
        for (var /** @type {?} */ i = 0; i < shorterBlocksNumDataCodewords; i++) {
            for (var /** @type {?} */ j = 0; j < numResultBlocks; j++) {
                result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
            }
        }
        // Fill out the last data block in the longer ones
        // Fill out the last data block in the longer ones
        for (var /** @type {?} */ j = longerBlocksStartAt; j < numResultBlocks; j++) {
            result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
        }
        // Now add in error correction blocks
        var /** @type {?} */ max = result[0].codewords.length;
        for (var /** @type {?} */ i = shorterBlocksNumDataCodewords; i < max; i++) {
            for (var /** @type {?} */ j = 0; j < numResultBlocks; j++) {
                var /** @type {?} */ iOffset = j < longerBlocksStartAt ? i : i + 1;
                result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
            }
        }
        return result;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
class QRCodeDataBlockReader {
    /**
     * @param {?} blocks
     * @param {?} version
     * @param {?} numErrorCorrectionCode
     */
    constructor(blocks, version, numErrorCorrectionCode) {
        this.blockPointer = 0;
        this.bitPointer = 7;
        this.dataLength = 0;
        this.blocks = blocks;
        this.numErrorCorrectionCode = numErrorCorrectionCode;
        if (version <= 9)
            this.dataLengthMode = 0;
        else if (version >= 10 && version <= 26)
            this.dataLengthMode = 1;
        else if (version >= 27 && version <= 40)
            this.dataLengthMode = 2;
    }
    /**
     * @param {?} numBits
     * @return {?}
     */
    getNextBits(numBits) {
        var /** @type {?} */ bits = 0;
        if (numBits < this.bitPointer + 1) {
            // next word fits into current data block
            var /** @type {?} */ mask = 0;
            for (var /** @type {?} */ i = 0; i < numBits; i++) {
                mask += (1 << i);
            }
            mask <<= (this.bitPointer - numBits + 1);
            bits = (this.blocks[this.blockPointer] & mask) >> (this.bitPointer - numBits + 1);
            this.bitPointer -= numBits;
            return bits;
        }
        else if (numBits < this.bitPointer + 1 + 8) {
            // next word crosses 2 data blocks
            var /** @type {?} */ mask1 = 0;
            for (var /** @type {?} */ i = 0; i < this.bitPointer + 1; i++) {
                mask1 += (1 << i);
            }
            bits = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
            this.blockPointer++;
            bits += ((this.blocks[this.blockPointer]) >> (8 - (numBits - (this.bitPointer + 1))));
            this.bitPointer = this.bitPointer - numBits % 8;
            if (this.bitPointer < 0) {
                this.bitPointer = 8 + this.bitPointer;
            }
            return bits;
        }
        else if (numBits < this.bitPointer + 1 + 16) {
            // next word crosses 3 data blocks
            var /** @type {?} */ mask1 = 0; // mask of first block
            var /** @type {?} */ mask3 = 0; // mask of 3rd block
            //bitPointer + 1 : number of bits of the 1st block
            //8 : number of the 2nd block (note that use already 8bits because next word uses 3 data blocks)
            //numBits - (bitPointer + 1 + 8) : number of bits of the 3rd block
            //bitPointer + 1 : number of bits of the 1st block
            //8 : number of the 2nd block (note that use already 8bits because next word uses 3 data blocks)
            //numBits - (bitPointer + 1 + 8) : number of bits of the 3rd block
            for (var /** @type {?} */ i = 0; i < this.bitPointer + 1; i++) {
                mask1 += (1 << i);
            }
            var /** @type {?} */ bitsFirstBlock = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
            this.blockPointer++;
            var /** @type {?} */ bitsSecondBlock = this.blocks[this.blockPointer] << (numBits - (this.bitPointer + 1 + 8));
            this.blockPointer++;
            for (var /** @type {?} */ i = 0; i < numBits - (this.bitPointer + 1 + 8); i++) {
                mask3 += (1 << i);
            }
            mask3 <<= 8 - (numBits - (this.bitPointer + 1 + 8));
            var /** @type {?} */ bitsThirdBlock = (this.blocks[this.blockPointer] & mask3) >> (8 - (numBits - (this.bitPointer + 1 + 8)));
            bits = bitsFirstBlock + bitsSecondBlock + bitsThirdBlock;
            this.bitPointer = this.bitPointer - (numBits - 8) % 8;
            if (this.bitPointer < 0) {
                this.bitPointer = 8 + this.bitPointer;
            }
            return bits;
        }
        else {
            return 0;
        }
    }
    /**
     * @return {?}
     */
    NextMode() {
        if ((this.blockPointer > this.blocks.length - this.numErrorCorrectionCode - 2))
            return 0;
        else
            return this.getNextBits(4);
    }
    /**
     * @param {?} modeIndicator
     * @return {?}
     */
    getDataLength(modeIndicator) {
        var /** @type {?} */ index = 0;
        while (true) {
            if ((modeIndicator >> index) == 1)
                break;
            index++;
        }
        return this.getNextBits(QRCodeDataBlockReader.sizeOfDataLengthInfo[this.dataLengthMode][index]);
    }
    /**
     * @param {?} dataLength
     * @return {?}
     */
    getRomanAndFigureString(dataLength) {
        var /** @type {?} */ length = dataLength;
        var /** @type {?} */ intData = 0;
        var /** @type {?} */ strData = "";
        var /** @type {?} */ tableRomanAndFigure = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '$', '%', '*', '+', '-', '.', '/', ':');
        do {
            if (length > 1) {
                intData = this.getNextBits(11);
                var /** @type {?} */ firstLetter = Math.floor(intData / 45);
                var /** @type {?} */ secondLetter = intData % 45;
                strData += tableRomanAndFigure[firstLetter];
                strData += tableRomanAndFigure[secondLetter];
                length -= 2;
            }
            else if (length == 1) {
                intData = this.getNextBits(6);
                strData += tableRomanAndFigure[intData];
                length -= 1;
            }
        } while (length > 0);
        return strData;
    }
    /**
     * @param {?} dataLength
     * @return {?}
     */
    getFigureString(dataLength) {
        var /** @type {?} */ length = dataLength;
        var /** @type {?} */ intData = 0;
        var /** @type {?} */ strData = "";
        do {
            if (length >= 3) {
                intData = this.getNextBits(10);
                if (intData < 100)
                    strData += "0";
                if (intData < 10)
                    strData += "0";
                length -= 3;
            }
            else if (length == 2) {
                intData = this.getNextBits(7);
                if (intData < 10)
                    strData += "0";
                length -= 2;
            }
            else if (length == 1) {
                intData = this.getNextBits(4);
                length -= 1;
            }
            strData += intData;
        } while (length > 0);
        return strData;
    }
    /**
     * @param {?} dataLength
     * @return {?}
     */
    get8bitByteArray(dataLength) {
        var /** @type {?} */ length = dataLength;
        var /** @type {?} */ intData = 0;
        var /** @type {?} */ output = new Array();
        do {
            intData = this.getNextBits(8);
            output.push(intData);
            length--;
        } while (length > 0);
        return output;
    }
    /**
     * @param {?} dataLength
     * @return {?}
     */
    getKanjiString(dataLength) {
        var /** @type {?} */ length = dataLength;
        var /** @type {?} */ intData = 0;
        var /** @type {?} */ unicodeString = "";
        do {
            intData = this.getNextBits(13);
            var /** @type {?} */ lowerByte = intData % 0xC0;
            var /** @type {?} */ higherByte = intData / 0xC0;
            var /** @type {?} */ tempWord = (higherByte << 8) + lowerByte;
            var /** @type {?} */ shiftjisWord = 0;
            if (tempWord + 0x8140 <= 0x9FFC) {
                // between 8140 - 9FFC on Shift_JIS character set
                shiftjisWord = tempWord + 0x8140;
            }
            else {
                // between E040 - EBBF on Shift_JIS character set
                shiftjisWord = tempWord + 0xC140;
            }
            //var tempByte = new Array(0,0);
            //tempByte[0] = (sbyte) (shiftjisWord >> 8);
            //tempByte[1] = (sbyte) (shiftjisWord & 0xFF);
            //unicodeString += new String(SystemUtils.ToCharArray(SystemUtils.ToByteArray(tempByte)));
            unicodeString += String.fromCharCode(shiftjisWord);
            length--;
        } while (length > 0);
        return unicodeString;
    }
    /**
     * @return {?}
     */
    get DataByte() {
        var /** @type {?} */ output = new Array();
        var /** @type {?} */ MODE_NUMBER = 1;
        var /** @type {?} */ MODE_ROMAN_AND_NUMBER = 2;
        var /** @type {?} */ MODE_8BIT_BYTE = 4;
        var /** @type {?} */ MODE_KANJI = 8;
        do {
            var /** @type {?} */ mode = this.NextMode();
            //canvas.println("mode: " + mode);
            //canvas.println("mode: " + mode);
            if (mode == 0) {
                if (output.length > 0)
                    break;
                else
                    throw "Empty data block";
            }
            //if (mode != 1 && mode != 2 && mode != 4 && mode != 8)
            //	break;
            //}
            //if (mode != 1 && mode != 2 && mode != 4 && mode != 8)
            //	break;
            //}
            if (mode != MODE_NUMBER && mode != MODE_ROMAN_AND_NUMBER && mode != MODE_8BIT_BYTE && mode != MODE_KANJI) {
                /*					canvas.println("Invalid mode: " + mode);
                                 mode = guessMode(mode);
                                 canvas.println("Guessed mode: " + mode); */
                /*					canvas.println("Invalid mode: " + mode);
                 mode = guessMode(mode);
                 canvas.println("Guessed mode: " + mode); */
                throw "Invalid mode: " + mode + " in (block:" + this.blockPointer + " bit:" + this.bitPointer + ")";
            }
            let /** @type {?} */ dataLength = this.getDataLength(mode);
            if (dataLength < 1)
                throw "Invalid data length: " + dataLength;
            //canvas.println("length: " + dataLength);
            //canvas.println("length: " + dataLength);
            switch (mode) {
                case MODE_NUMBER:
                    //canvas.println("Mode: Figure");
                    var /** @type {?} */ temp_str = this.getFigureString(dataLength);
                    var /** @type {?} */ ta = new Array(temp_str.length);
                    for (var /** @type {?} */ j = 0; j < temp_str.length; j++)
                        ta[j] = temp_str.charCodeAt(j);
                    output.push(ta);
                    break;
                case MODE_ROMAN_AND_NUMBER:
                    //canvas.println("Mode: Roman&Figure");
                    var /** @type {?} */ temp_str = this.getRomanAndFigureString(dataLength);
                    var /** @type {?} */ ta = new Array(temp_str.length);
                    for (var /** @type {?} */ j = 0; j < temp_str.length; j++)
                        ta[j] = temp_str.charCodeAt(j);
                    output.push(ta);
                    //output.Write(SystemUtils.ToByteArray(temp_sbyteArray2), 0, temp_sbyteArray2.Length);
                    //output.Write(SystemUtils.ToByteArray(temp_sbyteArray2), 0, temp_sbyteArray2.Length);
                    break;
                case MODE_8BIT_BYTE:
                    //canvas.println("Mode: 8bit Byte");
                    //sbyte[] temp_sbyteArray3;
                    var /** @type {?} */ temp_sbyteArray3 = this.get8bitByteArray(dataLength);
                    output.push(temp_sbyteArray3);
                    //output.Write(SystemUtils.ToByteArray(temp_sbyteArray3), 0, temp_sbyteArray3.Length);
                    //output.Write(SystemUtils.ToByteArray(temp_sbyteArray3), 0, temp_sbyteArray3.Length);
                    break;
                case MODE_KANJI:
                    //canvas.println("Mode: Kanji");
                    //sbyte[] temp_sbyteArray4;
                    //temp_sbyteArray4 = SystemUtils.ToSByteArray(SystemUtils.ToByteArray(getKanjiString(dataLength)));
                    //output.Write(SystemUtils.ToByteArray(temp_sbyteArray4), 0, temp_sbyteArray4.Length);
                    var /** @type {?} */ temp_str = this.getKanjiString(dataLength);
                    output.push(temp_str);
                    break;
            }
            //
            //canvas.println("DataLength: " + dataLength);
            //Console.out.println(dataString);
        } while (true);
        return output;
    }
    ;
}
QRCodeDataBlockReader.sizeOfDataLengthInfo = [[10, 9, 8, 8], [12, 11, 16, 10], [14, 13, 16, 12]];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
  Ported to JavaScript by Lazar Laszlo 2011
  lazarsoft@gmail.com, www.lazarsoft.info
*/
/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class Decoder {
    constructor() {
        this.rsDecoder = new ReedSolomonDecoder(GF256.QR_CODE_FIELD);
        this.decode = function (bits) {
            var /** @type {?} */ parser = new BitMatrixParser(bits);
            var /** @type {?} */ version = parser.readVersion();
            var /** @type {?} */ ecLevel = parser.readFormatInformation().ErrorCorrectionLevel;
            // Read codewords
            var /** @type {?} */ codewords = parser.readCodewords();
            // Separate into data blocks
            var /** @type {?} */ dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel);
            // Count total number of data bytes
            var /** @type {?} */ totalBytes = 0;
            for (var /** @type {?} */ i = 0; i < dataBlocks.length; i++) {
                totalBytes += dataBlocks[i].NumDataCodewords;
            }
            var /** @type {?} */ resultBytes = new Array(totalBytes);
            var /** @type {?} */ resultOffset = 0;
            // Error-correct and copy data blocks together into a stream of bytes
            // Error-correct and copy data blocks together into a stream of bytes
            for (var /** @type {?} */ j = 0; j < dataBlocks.length; j++) {
                var /** @type {?} */ dataBlock = dataBlocks[j];
                var /** @type {?} */ codewordBytes = dataBlock.Codewords;
                var /** @type {?} */ numDataCodewords = dataBlock.NumDataCodewords;
                this.correctErrors(codewordBytes, numDataCodewords);
                for (var /** @type {?} */ i = 0; i < numDataCodewords; i++) {
                    resultBytes[resultOffset++] = codewordBytes[i];
                }
            }
            // Decode the contents of that stream of bytes
            var /** @type {?} */ reader = new QRCodeDataBlockReader(resultBytes, version.VersionNumber, ecLevel.Bits);
            return reader;
            //return DecodedBitStreamParser.decode(resultBytes, version, ecLevel);
        };
    }
    /**
     * @param {?} codewordBytes
     * @param {?} numDataCodewords
     * @return {?}
     */
    correctErrors(codewordBytes, numDataCodewords) {
        var /** @type {?} */ numCodewords = codewordBytes.length;
        // First read into an array of ints
        var /** @type {?} */ codewordsInts = new Array(numCodewords);
        for (var /** @type {?} */ i = 0; i < numCodewords; i++) {
            codewordsInts[i] = codewordBytes[i] & 0xFF;
        }
        var /** @type {?} */ numECCodewords = codewordBytes.length - numDataCodewords;
        try {
            this.rsDecoder.decode(codewordsInts, numECCodewords);
            //var corrector = new ReedSolomon(codewordsInts, numECCodewords);
            //corrector.correct();
        }
        catch (/** @type {?} */ rse) {
            throw rse;
        }
        // Copy back into array of bytes -- only need to worry about the bytes that were data
        // We don't care about errors in the error-correction codewords
        // Copy back into array of bytes -- only need to worry about the bytes that were data
        // We don't care about errors in the error-correction codewords
        for (var /** @type {?} */ i = 0; i < numDataCodewords; i++) {
            codewordBytes[i] = codewordsInts[i];
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class QRCode {
    constructor() {
        this.debug = false;
        this.maxImgSize = 1024 * 1024;
        this.sizeOfDataLengthInfo = [[10, 9, 8, 8], [12, 11, 16, 10], [14, 13, 16, 12]];
    }
    /**
     * @param {?} canvas
     * @return {?}
     */
    decode(canvas) {
        let /** @type {?} */ context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.imagedata = context.getImageData(0, 0, this.width, this.height);
        this.result = this.process(context);
        if (this.myCallback != null)
            this.myCallback(this.result);
        return this.result;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    process(context) {
        var /** @type {?} */ start = new Date().getTime();
        var /** @type {?} */ image = this.grayScaleToBitmap(this.grayscale());
        if (this.debug) {
            for (var /** @type {?} */ y = 0; y < this.height; y++) {
                for (var /** @type {?} */ x = 0; x < this.width; x++) {
                    var /** @type {?} */ point = (x * 4) + (y * this.width * 4);
                    this.imagedata.data[point] = image[x + y * this.width] ? 0 : 0;
                    this.imagedata.data[point + 1] = image[x + y * this.width] ? 0 : 0;
                    this.imagedata.data[point + 2] = image[x + y * this.width] ? 255 : 0;
                }
            }
            context.putImageData(this.imagedata, 0, 0);
        }
        var /** @type {?} */ detector = new Detector(image, this.imagedata, this.width, this.height);
        var /** @type {?} */ qRCodeMatrix = detector.detect();
        if (this.debug)
            context.putImageData(this.imagedata, 0, 0);
        var /** @type {?} */ decoder = new Decoder();
        var /** @type {?} */ reader = decoder.decode(qRCodeMatrix.bits);
        var /** @type {?} */ data = reader.DataByte;
        var /** @type {?} */ str = "";
        for (var /** @type {?} */ i = 0; i < data.length; i++) {
            for (var /** @type {?} */ j = 0; j < data[i].length; j++)
                str += String.fromCharCode(data[i][j]);
        }
        var /** @type {?} */ end = new Date().getTime();
        var /** @type {?} */ time = end - start;
        console.log(time);
        return str;
    }
    /**
     * @param {?} grayScale
     * @return {?}
     */
    grayScaleToBitmap(grayScale) {
        var /** @type {?} */ middle = this.getMiddleBrightnessPerArea(grayScale);
        var /** @type {?} */ sqrtNumArea = middle.length;
        var /** @type {?} */ areaWidth = Math.floor(this.width / sqrtNumArea);
        var /** @type {?} */ areaHeight = Math.floor(this.height / sqrtNumArea);
        var /** @type {?} */ bitmap = new Array(this.height * this.width);
        for (var /** @type {?} */ ay = 0; ay < sqrtNumArea; ay++) {
            for (var /** @type {?} */ ax = 0; ax < sqrtNumArea; ax++) {
                for (var /** @type {?} */ dy = 0; dy < areaHeight; dy++) {
                    for (var /** @type {?} */ dx = 0; dx < areaWidth; dx++) {
                        bitmap[areaWidth * ax + dx + (areaHeight * ay + dy) * this.width] = (grayScale[areaWidth * ax + dx + (areaHeight * ay + dy) * this.width] < middle[ax][ay]) ? true : false;
                    }
                }
            }
        }
        return bitmap;
    }
    /**
     * @return {?}
     */
    grayscale() {
        var /** @type {?} */ ret = new Array(this.width * this.height);
        for (var /** @type {?} */ y = 0; y < this.height; y++) {
            for (var /** @type {?} */ x = 0; x < this.width; x++) {
                var /** @type {?} */ gray = this.getPixel(x, y);
                ret[x + y * this.width] = gray;
            }
        }
        return ret;
    }
    /**
     * @param {?} x
     * @param {?} y
     * @return {?}
     */
    getPixel(x, y) {
        if (this.width < x) {
            throw "point error";
        }
        if (this.height < y) {
            throw "point error";
        }
        let /** @type {?} */ point = (x * 4) + (y * this.width * 4);
        let /** @type {?} */ p = (this.imagedata.data[point] * 33 + this.imagedata.data[point + 1] * 34 + this.imagedata.data[point + 2] * 33) / 100;
        return p;
    }
    /**
     * @param {?} image
     * @return {?}
     */
    getMiddleBrightnessPerArea(image) {
        var /** @type {?} */ numSqrtArea = 4;
        //obtain middle brightness((min + max) / 2) per area
        var /** @type {?} */ areaWidth = Math.floor(this.width / numSqrtArea);
        var /** @type {?} */ areaHeight = Math.floor(this.height / numSqrtArea);
        var /** @type {?} */ minmax = new Array(numSqrtArea);
        for (var /** @type {?} */ i = 0; i < numSqrtArea; i++) {
            minmax[i] = new Array(numSqrtArea);
            for (var /** @type {?} */ i2 = 0; i2 < numSqrtArea; i2++) {
                minmax[i][i2] = new Array(0, 0);
            }
        }
        for (var /** @type {?} */ ay = 0; ay < numSqrtArea; ay++) {
            for (var /** @type {?} */ ax = 0; ax < numSqrtArea; ax++) {
                minmax[ax][ay][0] = 0xFF;
                for (var /** @type {?} */ dy = 0; dy < areaHeight; dy++) {
                    for (var /** @type {?} */ dx = 0; dx < areaWidth; dx++) {
                        var /** @type {?} */ target = image[areaWidth * ax + dx + (areaHeight * ay + dy) * this.width];
                        if (target < minmax[ax][ay][0])
                            minmax[ax][ay][0] = target;
                        if (target > minmax[ax][ay][1])
                            minmax[ax][ay][1] = target;
                    }
                }
                //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
            }
        }
        var /** @type {?} */ middle = new Array(numSqrtArea);
        for (var /** @type {?} */ i3 = 0; i3 < numSqrtArea; i3++) {
            middle[i3] = new Array(numSqrtArea);
        }
        for (var /** @type {?} */ ay = 0; ay < numSqrtArea; ay++) {
            for (var /** @type {?} */ ax = 0; ax < numSqrtArea; ax++) {
                middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
                //Console.out.print(middle[ax][ay] + ",");
            }
            //Console.out.println("");
        }
        //Console.out.println("");
        //Console.out.println("");
        return middle;
    }
}

//
//
// Array.prototype.remove = function(from, to) {
//   var rest = this.slice((to || from) + 1 || this.length);
//   this.length = from < 0 ? this.length + from : from;
//   return this.push.apply(this, rest);
// };

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class QrScannerComponent {
    /**
     * @param {?} renderer
     */
    constructor(renderer) {
        this.renderer = renderer;
        this.canvasWidth = 640;
        this.canvasHeight = 480;
        this.debug = false;
        this.stopAfterScan = true;
        this.updateTime = 500;
        this.capturedQr = new EventEmitter();
        this.foundCameras = new EventEmitter();
        this.chooseCamera = new Subject();
    }
    /**
     * @return {?}
     */
    get isCanvasSupported() {
        const /** @type {?} */ canvas = this.renderer.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    }
    /**
     * @return {?}
     */
    ngOnInit() {
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.chooseCamera$.unsubscribe();
        this.stopScanning();
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        if (this.debug)
            console.log('[QrScanner] ViewInit, isSupported: ', this.isCanvasSupported);
        if (this.isCanvasSupported) {
            this.gCtx = this.qrCanvas.nativeElement.getContext('2d');
            this.gCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.qrCode = new QRCode();
            if (this.debug)
                this.qrCode.debug = true;
            this.qrCode.myCallback = (decoded) => this.QrDecodeCallback(decoded);
        }
        this.chooseCamera$ = this.chooseCamera.subscribe((camera) => this.useDevice(camera));
        this.getMediaDevices().then(devices => this.foundCameras.next(devices));
    }
    /**
     * @param {?} device
     * @return {?}
     */
    startScanning(device) {
        this.useDevice(device);
    }
    /**
     * @return {?}
     */
    stopScanning() {
        if (this.captureTimeout) {
            clearTimeout(this.captureTimeout);
            this.captureTimeout = 0;
        }
        const /** @type {?} */ stream = this.stream && this.stream.getTracks().length && this.stream;
        if (stream) {
            stream.getTracks().forEach(track => track.enabled && track.stop());
            this.stream = null;
        }
    }
    /**
     * @return {?}
     */
    getMediaDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
            return Promise.resolve([]);
        return navigator.mediaDevices.enumerateDevices()
            .then((devices) => devices)
            .catch((error) => {
            if (this.debug)
                console.warn('Error', error);
            return [];
        });
    }
    /**
     * @param {?} decoded
     * @return {?}
     */
    QrDecodeCallback(decoded) {
        this.capturedQr.next(decoded);
        if (this.stopAfterScan) {
            clearTimeout(this.captureTimeout);
            this.captureTimeout = 0;
        }
        else {
            this.captureTimeout = setTimeout(() => this.captureToCanvas(), this.updateTime);
        }
    }
    /**
     * @return {?}
     */
    captureToCanvas() {
        try {
            this.gCtx.drawImage(this.videoElement, 0, 0, this.canvasWidth, this.canvasHeight);
            this.qrCode.decode(this.qrCanvas.nativeElement);
        }
        catch (/** @type {?} */ e) {
            if (this.debug)
                console.log('[QrScanner] Thrown', e);
            if (!this.stream)
                return;
            this.captureTimeout = setTimeout(() => this.captureToCanvas(), this.updateTime);
        }
    }
    /**
     * @param {?} stream
     * @return {?}
     */
    setStream(stream) {
        this.stream = stream;
        this.videoElement.srcObject = stream;
        this.captureTimeout = setTimeout(() => this.captureToCanvas(), this.updateTime);
    }
    /**
     * @param {?} _device
     * @return {?}
     */
    useDevice(_device) {
        const /** @type {?} */ _navigator = navigator;
        if (this.captureTimeout) {
            this.stopScanning();
        }
        if (!this.videoElement) {
            this.videoElement = this.renderer.createElement('video');
            this.videoElement.setAttribute('autoplay', 'true');
            // Video tag needs to have playsinline property for it to work on ios devices
            this.videoElement.setAttribute('playsinline', 'true');
            this.videoElement.setAttribute('muted', 'true');
            this.renderer.appendChild(this.videoWrapper.nativeElement, this.videoElement);
        }
        const /** @type {?} */ self = this;
        let /** @type {?} */ constraints;
        if (_device) {
            // A "hack" to always use rear camera on a device if possible
            constraints = { audio: false, video: { facingMode: { exact: "environment" } } };
        }
        else {
            constraints = { audio: false, video: true };
        }
        _navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            self.setStream(stream);
        }).catch(function (err) {
            return self.debug && console.warn('Error', err);
        });
    }
}
QrScannerComponent.decorators = [
    { type: Component, args: [{
                selector: 'qr-scanner',
                styles: [
                    ':host video {height: auto; width: 100%;}',
                    ':host .mirrored { transform: rotateY(180deg); -webkit-transform:rotateY(180deg); -moz-transform:rotateY(180deg); }',
                    ':host {}'
                ],
                template: `
        <ng-container [ngSwitch]="isCanvasSupported">
            <ng-container *ngSwitchDefault>
                <canvas #qrCanvas hidden="true" [width]="canvasWidth" [height]="canvasHeight"></canvas>
                <div #videoWrapper [style.width]="canvasWidth" [style.height]="canvasHeight"></div>
            </ng-container>
            <ng-container *ngSwitchCase="false">
                <p>
                    You are using an <strong>outdated</strong> browser.
                    Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.
                </p>
            </ng-container>
        </ng-container>`
            },] },
];
/** @nocollapse */
QrScannerComponent.ctorParameters = () => [
    { type: Renderer2, },
];
QrScannerComponent.propDecorators = {
    "canvasWidth": [{ type: Input },],
    "canvasHeight": [{ type: Input },],
    "debug": [{ type: Input },],
    "stopAfterScan": [{ type: Input },],
    "updateTime": [{ type: Input },],
    "capturedQr": [{ type: Output },],
    "foundCameras": [{ type: Output },],
    "videoWrapper": [{ type: ViewChild, args: ['videoWrapper',] },],
    "qrCanvas": [{ type: ViewChild, args: ['qrCanvas',] },],
    "chooseCamera": [{ type: Input },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class NgQrScannerModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: NgQrScannerModule
        };
    }
}
NgQrScannerModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [QrScannerComponent],
                exports: [QrScannerComponent]
            },] },
];
/** @nocollapse */
NgQrScannerModule.ctorParameters = () => [];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { NgQrScannerModule, QrScannerComponent };
//# sourceMappingURL=angular2-qrscanner.js.map
