export declare class PerspectiveTransform {
    a11: number;
    a12: number;
    a13: number;
    a21: number;
    a22: number;
    a23: number;
    a31: number;
    a32: number;
    a33: number;
    constructor(a11: number, a21: number, a31: number, a12: number, a22: number, a32: number, a13: number, a23: number, a33: number);
    transformPoints1: (points: any) => void;
    transformPoints2: (xValues: any, yValues: any) => void;
    buildAdjoint: () => PerspectiveTransform;
    times: (other: any) => PerspectiveTransform;
    static quadrilateralToQuadrilateral(x0: any, y0: any, x1: any, y1: any, x2: any, y2: any, x3: any, y3: any, x0p: any, y0p: any, x1p: any, y1p: any, x2p: any, y2p: any, x3p: any, y3p: any): PerspectiveTransform;
    static squareToQuadrilateral(x0: any, y0: any, x1: any, y1: any, x2: any, y2: any, x3: any, y3: any): PerspectiveTransform;
    static quadrilateralToSquare(x0: any, y0: any, x1: any, y1: any, x2: any, y2: any, x3: any, y3: any): PerspectiveTransform;
}
