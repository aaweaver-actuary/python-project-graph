interface SVGElement {
  getBBox(): {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  getScreenCTM(): {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    inverse(): unknown;
  } | null;
}
