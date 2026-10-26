import * as THREE from 'three';

export interface SnowCellResult {
  clearedCount: number;
  isPlowing: boolean;
  specialDriftHit: boolean;
}

export class SnowSystem {
  public mapSize: number;
  public resolution: number; // e.g. 512
  public groundMesh: THREE.Mesh;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private snowTexture: THREE.CanvasTexture;
  private totalPlowablePixels: number = 0;
  private clearedPixels: number = 0;
  private roadMaskCanvas: HTMLCanvasElement;
  private roadMaskCtx: CanvasRenderingContext2D;

  // Track coordinates for mini-map or compass
  public roadSegments: { x1: number; z1: number; x2: number; z2: number; width: number }[] = [];

  constructor(mapSize = 80, resolution = 512) {
    this.mapSize = mapSize;
    this.resolution = resolution;

    // Create 2D offscreen canvases
    this.canvas = document.createElement('canvas');
    this.canvas.width = resolution;
    this.canvas.height = resolution;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;

    this.roadMaskCanvas = document.createElement('canvas');
    this.roadMaskCanvas.width = resolution;
    this.roadMaskCanvas.height = resolution;
    this.roadMaskCtx = this.roadMaskCanvas.getContext('2d', { willReadFrequently: true })!;

    this.initSnowField();

    // Create Three.js Texture & Material
    this.snowTexture = new THREE.CanvasTexture(this.canvas);
    this.snowTexture.colorSpace = THREE.SRGBColorSpace;
    this.snowTexture.minFilter = THREE.LinearFilter;
    this.snowTexture.magFilter = THREE.LinearFilter;

    const groundGeo = new THREE.PlaneGeometry(mapSize, mapSize, 64, 64);
    groundGeo.rotateX(-Math.PI / 2);

    const groundMat = new THREE.MeshStandardMaterial({
      map: this.snowTexture,
      roughness: 0.65,
      metalness: 0.05,
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.receiveShadow = true;
    this.groundMesh.position.y = 0;
  }

  // World coordinates to Canvas pixel coordinates
  private worldToCanvas(x: number, z: number): { px: number; py: number } {
    const half = this.mapSize / 2;
    const u = (x + half) / this.mapSize;
    const v = (z + half) / this.mapSize;
    const px = Math.floor(u * this.resolution);
    const py = Math.floor(v * this.resolution);
    return { px, py };
  }

  // Define roads and driveways on the map
  public setupRoads(segments: { x1: number; z1: number; x2: number; z2: number; width: number }[]) {
    this.roadSegments = segments;
    this.roadMaskCtx.fillStyle = '#000000';
    this.roadMaskCtx.fillRect(0, 0, this.resolution, this.resolution);

    this.roadMaskCtx.fillStyle = '#ffffff';
    this.roadMaskCtx.lineCap = 'round';
    this.roadMaskCtx.lineJoin = 'round';

    segments.forEach((seg) => {
      const p1 = this.worldToCanvas(seg.x1, seg.z1);
      const p2 = this.worldToCanvas(seg.x2, seg.z2);
      const strokeW = (seg.width / this.mapSize) * this.resolution;

      this.roadMaskCtx.lineWidth = strokeW;
      this.roadMaskCtx.beginPath();
      this.roadMaskCtx.moveTo(p1.px, p1.py);
      this.roadMaskCtx.lineTo(p2.px, p2.py);
      this.roadMaskCtx.stroke();
    });

    // Count how many road pixels are eligible to be plowed
    const imgData = this.roadMaskCtx.getImageData(0, 0, this.resolution, this.resolution).data;
    let roadPixels = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      if (imgData[i] > 128) {
        roadPixels++;
      }
    }
    this.totalPlowablePixels = Math.max(1, roadPixels);
    this.clearedPixels = 0;
  }

  // Initialize pristine fresh snowfall across the entire map
  public initSnowField() {
    // Fill canvas with deep cozy snow texture
    this.ctx.fillStyle = '#f1f5f9';
    this.ctx.fillRect(0, 0, this.resolution, this.resolution);

    // Add subtle procedural drift noise
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * this.resolution;
      const ry = Math.random() * this.resolution;
      const rad = 15 + Math.random() * 40;
      const grad = this.ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(226, 232, 240, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (this.snowTexture) {
      this.snowTexture.needsUpdate = true;
    }
  }

  /**
   * Clears snow at the current plow blade position and angle
   */
  public plowSnow(
    bladeX: number,
    bladeZ: number,
    bladeAngle: number,
    bladeWidth: number,
    spreaderRadius = 0
  ): SnowCellResult {
    const { px, py } = this.worldToCanvas(bladeX, bladeZ);
    const pixelWidth = (bladeWidth / this.mapSize) * this.resolution;
    const pixelLength = Math.max(3, (1.2 / this.mapSize) * this.resolution);

    let newlyCleared = 0;
    const sampleRadius = Math.ceil(pixelWidth / 2);

    // Quick sample before clearing to see if snow was present on road
    const startX = Math.max(0, px - sampleRadius);
    const startY = Math.max(0, py - sampleRadius);
    const sampleSize = Math.min(this.resolution - startX, sampleRadius * 2);

    if (sampleSize > 2 && startY + sampleSize < this.resolution) {
      const checkData = this.ctx.getImageData(startX, startY, sampleSize, sampleSize).data;
      const maskData = this.roadMaskCtx.getImageData(startX, startY, sampleSize, sampleSize).data;

      for (let i = 0; i < checkData.length; i += 16) {
        // Red channel > 180 means snowy white; mask > 100 means road
        if (checkData[i] > 180 && maskData[i] > 100) {
          newlyCleared += 2;
        }
      }
    }

    // Carve cleared asphalt road swatch
    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.rotate(bladeAngle);

    // Dark asphalt / scraped pavement with slight frost grain
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(-pixelWidth / 2, -pixelLength / 2, pixelWidth, pixelLength);

    // Subtle tire track indentations
    this.ctx.fillStyle = '#0f172a';
    const tireDist = pixelWidth * 0.35;
    this.ctx.fillRect(-tireDist - 2, -pixelLength / 2 - 2, 4, pixelLength + 4);
    this.ctx.fillRect(tireDist - 2, -pixelLength / 2 - 2, 4, pixelLength + 4);

    // If salt spreader is active, melt an area behind
    if (spreaderRadius > 0) {
      const spreadPx = (spreaderRadius / this.mapSize) * this.resolution;
      const spreadGrad = this.ctx.createRadialGradient(0, -pixelLength * 1.5, 0, 0, -pixelLength * 1.5, spreadPx);
      spreadGrad.addColorStop(0, '#334155');
      spreadGrad.addColorStop(0.7, '#475569');
      spreadGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');
      this.ctx.fillStyle = spreadGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, -pixelLength * 1.5, spreadPx, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();

    this.clearedPixels += newlyCleared;
    this.snowTexture.needsUpdate = true;

    return {
      clearedCount: newlyCleared,
      isPlowing: newlyCleared > 0,
      specialDriftHit: newlyCleared > 35,
    };
  }

  // Get percentage of snow cleared from the target roads
  public getProgress(): number {
    if (this.totalPlowablePixels <= 0) return 0;
    return Math.min(100, Math.round((this.clearedPixels / this.totalPlowablePixels) * 100));
  }

  public dispose() {
    this.snowTexture.dispose();
    this.groundMesh.geometry.dispose();
    if (Array.isArray(this.groundMesh.material)) {
      this.groundMesh.material.forEach((m) => m.dispose());
    } else {
      this.groundMesh.material.dispose();
    }
  }
}
