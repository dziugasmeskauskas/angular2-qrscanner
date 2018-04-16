import { PerspectiveTransform } from "./perpesctivetransform";
export declare class DetectorResult {
    bits: any;
    points: any;
    constructor(bits: any, points: any);
}
export declare class Detector {
    image: any;
    rawImage: any;
    width: number;
    height: number;
    constructor(image: any, rawImage: any, width: number, height: number);
    sizeOfBlackWhiteBlackRun(fromX: any, fromY: any, toX: any, toY: any): number;
    sizeOfBlackWhiteBlackRunBothWays(fromX: any, fromY: any, toX: any, toY: any): number;
    calculateModuleSizeOneWay: (pattern: any, otherPattern: any) => number;
    calculateModuleSize: (topLeft: any, topRight: any, bottomLeft: any) => number;
    distance: (pattern1: any, pattern2: any) => number;
    computeDimension: (topLeft: any, topRight: any, bottomLeft: any, moduleSize: any) => number;
    findAlignmentInRegion: (overallEstModuleSize: any, estAlignmentX: any, estAlignmentY: any, allowanceFactor: any) => any;
    createTransform: (topLeft: any, topRight: any, bottomLeft: any, alignmentPattern: any, dimension: any) => PerspectiveTransform;
    sampleGrid: (image: any, transform: any, dimension: any) => any;
    processFinderPatternInfo(info: any): any;
    detect: () => any;
}
