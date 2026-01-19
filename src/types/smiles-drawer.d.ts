declare module "smiles-drawer" {
  interface SmilesDrawerOptions {
    width?: number;
    height?: number;
    bondThickness?: number;
    bondLength?: number;
    shortBondLength?: number;
    bondSpacing?: number;
    atomVisualization?: string;
    isomeric?: boolean;
    debug?: boolean;
    terminalCarbons?: boolean;
    explicitHydrogens?: boolean;
    overlapSensitivity?: number;
    overlapResolutionIterations?: number;
    compactDrawing?: boolean;
    fontSizeLarge?: number;
    fontSizeSmall?: number;
    padding?: number;
    experimentalSSSR?: boolean;
    kkThreshold?: number;
    kkInnerThreshold?: number;
    kkMaxIteration?: number;
    kkMaxInnerIteration?: number;
    kkMaxEnergy?: number;
    themes?: Record<string, Record<string, string>>;
  }

  class Drawer {
    constructor(options?: SmilesDrawerOptions);
    draw(
      tree: unknown,
      canvas: HTMLCanvasElement | null,
      theme?: string
    ): void;
  }

  interface SmilesDrawerModule {
    Drawer: typeof Drawer;
    parse(
      smiles: string,
      callback: (tree: unknown) => void,
      errorCallback?: (error: Error) => void
    ): void;
  }

  const SmilesDrawer: SmilesDrawerModule;
  export default SmilesDrawer;
}
