import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameMaterials, createPlowTruck, createPineTree, createAlpineCabin, createStreetLamp, createSnowman, createGiftBox, createAlpineBoulder } from './models';
import { SnowSystem } from './snowSystem';
import { ParticleManager } from './particles';
import { soundFX } from './audio';
import { LevelConfig, VehicleUpgrades, GameStats } from './types';
import confetti from 'canvas-confetti';

// Math helpers preallocated at module scope (Zero GC in loop)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

export interface EngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onLevelComplete: () => void;
  onComboPopup: (text: string, multiplier: number) => void;
}

export class GameEngine {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private animFrameId: number = 0;
  private lastTime: number = 0;

  // Systems
  public snowSystem!: SnowSystem;
  public particleManager!: ParticleManager;

  // Environment & Lighting
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;

  // Truck actor
  private truckGroup!: THREE.Group;
  private truckBlade!: THREE.Group;
  private truckWheels: THREE.Mesh[] = [];
  private truckBeacon!: THREE.Mesh;
  private spreaderSpinner!: THREE.Mesh;
  private headlightLeft!: THREE.SpotLight;
  private headlightRight!: THREE.SpotLight;

  // Interactive World Props
  private giftBoxes: { group: THREE.Group; x: number; z: number; collected: boolean }[] = [];
  private snowmen: { group: THREE.Group; x: number; z: number; hit: boolean }[] = [];

  // Vehicle Physics State
  private truckPos = new THREE.Vector3(0, 0, 0);
  private truckSpeed = 0;
  private truckHeading = 0; // In radians
  private truckSteer = 0;
  private nitroCharge = 100;
  private isBoosting = false;
  private squashStretch = new THREE.Vector3(1, 1, 1);

  // Upgrades & Config
  public upgrades: VehicleUpgrades = {
    bladeLevel: 1,
    engineLevel: 1,
    tiresLevel: 1,
    spreaderLevel: 0,
    nitroLevel: 1,
  };

  public currentLevel!: LevelConfig;
  public isRunning = false;
  public isPaused = false;
  public isTitleScreen = true;

  // Game Stats
  public stats: GameStats = {
    money: 150,
    score: 0,
    combo: 0,
    maxCombo: 0,
    comboMultiplier: 1.0,
    snowClearedCount: 0,
    totalSnowPlowedKg: 0,
    giftsFound: 0,
    timeElapsed: 0,
  };

  private comboTimer = 0;
  private hitstopTimer = 0;
  private cameraShake = new THREE.Vector3();

  // Input State
  private keysHeld: Record<string, boolean> = {};
  public virtualInput = { forward: 0, steer: 0, boost: false };
  private callbacks: EngineCallbacks;

  constructor(container: HTMLDivElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.checkSoftwareGl();
    this.initRenderer();
    this.initScene();
    this.initControls();

    GameMaterials.init();
  }

  private checkSoftwareGl() {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) {
      this.isSoftwareGl = true;
      return;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  private initScene() {
    this.scene = new THREE.Scene();

    // Studio Reflection Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Isometric Camera setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.5, 300);
    this.camera.position.set(24, 28, 24);
    this.camera.lookAt(0, 0, 0);

    // Warm Key Sun Light
    this.dirLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    this.dirLight.position.set(30, 45, 20);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 120;
    const d = 35;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    // Cool Sky / Ground Fill Light
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x334155, 0.85);
    this.hemiLight.position.set(0, 30, 0);
    this.scene.add(this.hemiLight);

    // Particle Manager
    this.particleManager = new ParticleManager(this.scene);
  }

  private initControls() {
    window.addEventListener('keydown', (e) => {
      this.keysHeld[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keysHeld = {};
      this.virtualInput = { forward: 0, steer: 0, boost: false };
    });

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Load and initialize level geometry, roads, houses, props, and truck
   */
  public loadLevel(level: LevelConfig, upgrades?: VehicleUpgrades) {
    this.currentLevel = level;
    if (upgrades) this.upgrades = upgrades;

    // Clear previous world objects
    if (this.snowSystem) {
      this.scene.remove(this.snowSystem.groundMesh);
      this.snowSystem.dispose();
    }
    if (this.truckGroup) {
      this.scene.remove(this.truckGroup);
    }

    // Clean up props
    this.giftBoxes.forEach((g) => this.scene.remove(g.group));
    this.giftBoxes = [];
    this.snowmen.forEach((s) => this.scene.remove(s.group));
    this.snowmen = [];

    // Remove old trees/cabins/boulders
    const toRemove: THREE.Object3D[] = [];
    this.scene.traverse((obj) => {
      if (['AlpineCabin', 'PineTree', 'StreetLamp', 'Snowman', 'GiftBox'].includes(obj.name)) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach((obj) => this.scene.remove(obj));

    // Atmosphere & Fog based on Time of Day
    if (level.timeOfDay === 'day') {
      this.scene.background = new THREE.Color(0xdbeafe);
      this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.012);
      this.dirLight.color.setHex(0xfffae0);
      this.dirLight.intensity = 2.4;
      this.hemiLight.color.setHex(0xbae6fd);
      this.hemiLight.groundColor.setHex(0x475569);
    } else if (level.timeOfDay === 'sunset') {
      this.scene.background = new THREE.Color(0xfbcfe8);
      this.scene.fog = new THREE.FogExp2(0xfbcfe8, 0.011);
      this.dirLight.color.setHex(0xfb923c);
      this.dirLight.intensity = 2.0;
      this.hemiLight.color.setHex(0xf472b6);
      this.hemiLight.groundColor.setHex(0x312e81);
    } else {
      // Night
      this.scene.background = new THREE.Color(0x090d16);
      this.scene.fog = new THREE.FogExp2(0x090d16, 0.015);
      this.dirLight.color.setHex(0x38bdf8);
      this.dirLight.intensity = 0.6;
      this.hemiLight.color.setHex(0x1e1b4b);
      this.hemiLight.groundColor.setHex(0x020617);
    }

    // 1. Initialize Snow System
    this.snowSystem = new SnowSystem(level.mapSize, 512);
    this.scene.add(this.snowSystem.groundMesh);

    // 2. Build Road Layouts for level
    const roadSegments: { x1: number; z1: number; x2: number; z2: number; width: number }[] = [];
    const hs = level.mapSize * 0.4;

    if (level.id === 1) {
      // Neighborhood Loop & Driveways
      roadSegments.push(
        { x1: -hs, z1: 0, x2: hs, z2: 0, width: 6.5 },
        { x1: 0, z1: -hs, x2: 0, z2: hs, width: 6.5 },
        { x1: -hs * 0.7, z1: -hs * 0.7, x2: hs * 0.7, z2: -hs * 0.7, width: 5.5 },
        { x1: -hs * 0.7, z1: hs * 0.7, x2: hs * 0.7, z2: hs * 0.7, width: 5.5 },
        { x1: -hs * 0.7, z1: -hs * 0.7, x2: -hs * 0.7, z2: hs * 0.7, width: 5.5 },
        { x1: hs * 0.7, z1: -hs * 0.7, x2: hs * 0.7, z2: hs * 0.7, width: 5.5 }
      );
    } else if (level.id === 2) {
      // Winding Mountain Switchbacks
      roadSegments.push(
        { x1: -hs, z1: -hs * 0.6, x2: hs, z2: -hs * 0.6, width: 6.0 },
        { x1: hs, z1: -hs * 0.6, x2: hs, z2: 0, width: 6.0 },
        { x1: hs, z1: 0, x2: -hs, z2: 0, width: 6.0 },
        { x1: -hs, z1: 0, x2: -hs, z2: hs * 0.6, width: 6.0 },
        { x1: -hs, z1: hs * 0.6, x2: hs, z2: hs * 0.6, width: 6.0 }
      );
    } else {
      // Ski Lodge Resort Plaza & Outer Loop
      roadSegments.push(
        { x1: -hs, z1: -hs, x2: hs, z2: -hs, width: 7.0 },
        { x1: hs, z1: -hs, x2: hs, z2: hs, width: 7.0 },
        { x1: hs, z1: hs, x2: -hs, z2: hs, width: 7.0 },
        { x1: -hs, z1: hs, x2: -hs, z2: -hs, width: 7.0 },
        { x1: -hs * 0.5, z1: 0, x2: hs * 0.5, z2: 0, width: 8.5 },
        { x1: 0, z1: -hs * 0.5, x2: 0, z2: hs * 0.5, width: 8.5 }
      );
    }

    this.snowSystem.setupRoads(roadSegments);

    // 3. Populate Cozy Cabins, Trees, Street Lamps, and Snowmen
    this.populateScenery(level);

    // 4. Spawn Mystery Gifts
    this.spawnGifts(level.bonusGiftsCount, level.mapSize * 0.35);

    // 5. Spawn Truck
    const truckData = createPlowTruck(this.upgrades.bladeLevel);
    this.truckGroup = truckData.group;
    this.truckWheels = truckData.wheels;
    this.truckBeacon = truckData.beacon;
    this.truckBlade = truckData.plowBlade;
    this.spreaderSpinner = truckData.spreaderSpinner;
    this.headlightLeft = truckData.headlightLeft;
    this.headlightRight = truckData.headlightRight;

    this.truckPos.set(0, 0, 0);
    this.truckHeading = 0;
    this.truckSpeed = 0;
    this.truckGroup.position.copy(this.truckPos);
    this.scene.add(this.truckGroup);

    // Turn headlights on/off depending on time of day
    const isDark = level.timeOfDay !== 'day';
    this.headlightLeft.intensity = isDark ? 4.5 : 1.0;
    this.headlightRight.intensity = isDark ? 4.5 : 1.0;
  }

  private populateScenery(level: LevelConfig) {
    const half = level.mapSize * 0.44;

    // Cabins along the roads
    const cabinPositions = [
      { x: -half * 0.6, z: -half * 0.35, rot: 0 },
      { x: half * 0.6, z: -half * 0.35, rot: Math.PI },
      { x: -half * 0.6, z: half * 0.35, rot: 0 },
      { x: half * 0.6, z: half * 0.35, rot: Math.PI },
      { x: 0, z: -half * 0.85, rot: Math.PI / 2 },
      { x: 0, z: half * 0.85, rot: -Math.PI / 2 },
    ];

    cabinPositions.forEach((pos) => {
      const cabin = createAlpineCabin(5.5, 6.5);
      cabin.position.set(pos.x, 0, pos.z);
      cabin.rotation.y = pos.rot;
      this.scene.add(cabin);

      // Street lamp outside cabin
      const lamp = createStreetLamp();
      lamp.position.set(pos.x + 3.5, 0, pos.z + 3.0);
      this.scene.add(lamp);
    });

    // Pine Trees scattered around perimeter and natural barriers
    for (let i = 0; i < 45; i++) {
      const angle = (i / 45) * Math.PI * 2;
      const dist = half * 0.95 + (Math.random() - 0.5) * 8;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const scale = 0.8 + Math.random() * 0.6;
      const tree = createPineTree(scale);
      tree.position.set(x, 0, z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(tree);
    }

    // Rocky outcrops bounding perimeter (never floating indoor walls in void!)
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const dist = half * 1.15;
      const boulder = createAlpineBoulder(1.2 + Math.random() * 0.8);
      boulder.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      this.scene.add(boulder);
    }

    // Snowmen along roads
    for (let i = 0; i < 6; i++) {
      const sm = createSnowman();
      const sx = (Math.random() - 0.5) * half * 1.2;
      const sz = (Math.random() - 0.5) * half * 1.2;
      sm.position.set(sx, 0, sz);
      this.scene.add(sm);
      this.snowmen.push({ group: sm, x: sx, z: sz, hit: false });
    }
  }

  private spawnGifts(count: number, radius: number) {
    for (let i = 0; i < count; i++) {
      const gift = createGiftBox();
      const angle = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * radius;
      const gx = Math.cos(angle) * r;
      const gz = Math.sin(angle) * r;
      gift.position.set(gx, 0, gz);
      this.scene.add(gift);
      this.giftBoxes.push({ group: gift, x: gx, z: gz, collected: false });
    }
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.isTitleScreen = false;
    this.lastTime = performance.now();
    soundFX.resume();
    this.tick();
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public resetLevel() {
    this.stats.combo = 0;
    this.stats.comboMultiplier = 1.0;
    this.loadLevel(this.currentLevel, this.upgrades);
  }

  /**
   * Main 60fps simulation loop
   */
  private tick = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05); // Clamped delta time

    if (!this.isPaused) {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.updateSimulation(dt);
      }
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private updateSimulation(dt: number) {
    this.stats.timeElapsed += dt;

    // Upgrades modifiers
    const maxSpeedBase = 7.0 + this.upgrades.engineLevel * 1.5;
    const accelRate = 12.0 + this.upgrades.engineLevel * 2.5;
    const turnRate = 2.1 + this.upgrades.tiresLevel * 0.4;
    const bladeW = 2.2 + this.upgrades.bladeLevel * 0.35;
    const saltRadius = this.upgrades.spreaderLevel > 0 ? 1.0 + this.upgrades.spreaderLevel * 0.6 : 0;

    // 1. Process Input
    let moveIntent = 0;
    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp'] || this.virtualInput.forward > 0.1) {
      moveIntent = 1;
    } else if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown'] || this.virtualInput.forward < -0.1) {
      moveIntent = -0.6;
    }

    let steerIntent = 0;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft'] || this.virtualInput.steer < -0.1) {
      steerIntent = 1;
    } else if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight'] || this.virtualInput.steer > 0.1) {
      steerIntent = -1;
    }

    // Nitro Boost
    const boostPressed = this.keysHeld['Space'] || this.virtualInput.boost;
    if (boostPressed && this.nitroCharge > 10 && moveIntent > 0) {
      if (!this.isBoosting) {
        soundFX.playNitroBoost();
      }
      this.isBoosting = true;
      this.nitroCharge = Math.max(0, this.nitroCharge - dt * 35);
    } else {
      this.isBoosting = false;
      this.nitroCharge = Math.min(100, this.nitroCharge + dt * (12 + this.upgrades.nitroLevel * 4));
    }

    const currentMaxSpeed = this.isBoosting ? maxSpeedBase * 1.6 : maxSpeedBase;

    // 2. Acceleration & Friction
    if (moveIntent !== 0) {
      this.truckSpeed += moveIntent * accelRate * dt;
      if (this.truckSpeed > currentMaxSpeed) this.truckSpeed = currentMaxSpeed;
      if (this.truckSpeed < -maxSpeedBase * 0.5) this.truckSpeed = -maxSpeedBase * 0.5;
    } else {
      // Natural rolling resistance
      this.truckSpeed = THREE.MathUtils.damp(this.truckSpeed, 0, 4.5, dt);
    }

    // 3. Steering & Heading
    if (Math.abs(this.truckSpeed) > 0.1) {
      const dirSign = this.truckSpeed > 0 ? 1 : -1;
      this.truckHeading += steerIntent * turnRate * dt * dirSign;
      this.truckSteer = THREE.MathUtils.damp(this.truckSteer, steerIntent * 0.35, 12, dt);
    } else {
      this.truckSteer = THREE.MathUtils.damp(this.truckSteer, 0, 10, dt);
    }

    // 4. Update Position
    const vx = Math.sin(this.truckHeading) * this.truckSpeed;
    const vz = Math.cos(this.truckHeading) * this.truckSpeed;
    this.truckPos.x += vx * dt;
    this.truckPos.z += vz * dt;

    // Soft perimeter boundaries
    const bound = this.currentLevel.mapSize * 0.44;
    this.truckPos.x = THREE.MathUtils.clamp(this.truckPos.x, -bound, bound);
    this.truckPos.z = THREE.MathUtils.clamp(this.truckPos.z, -bound, bound);

    // Apply to 3D Truck Group
    this.truckGroup.position.copy(this.truckPos);
    this.truckGroup.rotation.y = this.truckHeading;

    // Rotate Wheels
    const wheelRotDelta = (this.truckSpeed / 0.42) * dt;
    this.truckWheels.forEach((wheel, idx) => {
      wheel.rotation.x += wheelRotDelta;
      if (idx < 2) {
        // Front steering angle
        wheel.rotation.y = this.truckSteer;
      }
    });

    // Amber roof hazard beacon rotating
    if (this.truckBeacon) {
      this.truckBeacon.rotation.y += dt * 9.0;
    }

    // Salt Spreader spinner plate rotating
    if (this.spreaderSpinner && saltRadius > 0) {
      this.spreaderSpinner.rotation.y += dt * 14.0;
    }

    // 5. Snow Plowing Mechanic
    const bladeOffset = 1.85;
    const bladeWorldX = this.truckPos.x + Math.sin(this.truckHeading) * bladeOffset;
    const bladeWorldZ = this.truckPos.z + Math.cos(this.truckHeading) * bladeOffset;

    let isPlowingSnow = false;
    if (Math.abs(this.truckSpeed) > 0.4 && this.truckSpeed > 0) {
      const plowRes = this.snowSystem.plowSnow(
        bladeWorldX,
        bladeWorldZ,
        this.truckHeading,
        bladeW,
        saltRadius
      );

      if (plowRes.isPlowing) {
        isPlowingSnow = true;
        this.stats.snowClearedCount += plowRes.clearedCount;
        const kgPlowed = plowRes.clearedCount * 8;
        this.stats.totalSnowPlowedKg += kgPlowed;

        // Combo increment
        this.stats.combo += plowRes.clearedCount;
        this.comboTimer = 2.4; // 2.4 second window to maintain combo

        // Combo Multipliers
        let newMultiplier = 1.0;
        if (this.stats.combo >= 150) newMultiplier = 8.0;
        else if (this.stats.combo >= 90) newMultiplier = 5.0;
        else if (this.stats.combo >= 50) newMultiplier = 3.0;
        else if (this.stats.combo >= 25) newMultiplier = 2.0;
        else if (this.stats.combo >= 10) newMultiplier = 1.5;

        if (newMultiplier > this.stats.comboMultiplier) {
          this.stats.comboMultiplier = newMultiplier;
          soundFX.playComboChime(Math.floor(newMultiplier * 2));
          this.callbacks.onComboPopup(`${newMultiplier}x COMBO!`, newMultiplier);
        }

        // Earn money based on combo
        const cashGained = Math.round(plowRes.clearedCount * 0.4 * this.stats.comboMultiplier);
        if (cashGained > 0) {
          this.stats.money += cashGained;
          this.stats.score += cashGained * 10;
        }

        // Snow plume particles spray out to sides!
        this.particleManager.spawnSnowSpray(
          bladeWorldX,
          0.3,
          bladeWorldZ,
          this.truckHeading,
          this.truckSpeed
        );

        // Special drift breakthrough hit flash & camera shake
        if (plowRes.specialDriftHit) {
          this.triggerCameraShake(0.35);
          soundFX.playImpactSound(1.2);
        }
      }
    }

    // Combo Timer Decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        if (this.stats.combo > this.stats.maxCombo) {
          this.stats.maxCombo = this.stats.combo;
        }
        this.stats.combo = 0;
        this.stats.comboMultiplier = 1.0;
      }
    }

    // 6. Check Mystery Gift Box Collisions
    this.giftBoxes.forEach((gift) => {
      if (!gift.collected) {
        const dx = this.truckPos.x - gift.x;
        const dz = this.truckPos.z - gift.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 2.0) {
          gift.collected = true;
          this.scene.remove(gift.group);
          this.stats.giftsFound++;
          const bonus = 250;
          this.stats.money += bonus;
          soundFX.playCoinSound();
          this.particleManager.spawnSparkles(gift.x, 1.0, gift.z, 35);
          this.callbacks.onComboPopup(`+$${bonus} SECRET GIFT!`, 2.0);
        }
      }
    });

    // 7. Check Snowman Bumps (fun interactive physics)
    this.snowmen.forEach((sm) => {
      if (!sm.hit) {
        const dx = this.truckPos.x - sm.x;
        const dz = this.truckPos.z - sm.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.8) {
          sm.hit = true;
          this.triggerHitstop(0.04);
          this.triggerCameraShake(0.25);
          soundFX.playImpactSound(0.8);
          this.particleManager.spawnSnowSpray(sm.x, 1.0, sm.z, this.truckHeading, 8.0);
          // Knock over snowman
          sm.group.rotation.x = 1.2;
          sm.group.position.y = -0.2;
          this.stats.money += 40;
          this.callbacks.onComboPopup('+$40 SNOWMAN CLEAR!', 1.5);
        }
      }
    });

    // 8. Exhaust Particles
    if (Math.abs(this.truckSpeed) > 0.5) {
      const ex1 = this.truckPos.x + Math.sin(this.truckHeading + 2.8) * 1.3;
      const ez1 = this.truckPos.z + Math.cos(this.truckHeading + 2.8) * 1.3;
      this.particleManager.spawnExhaust(ex1, 1.6, ez1, this.isBoosting);
    }

    // 9. Audio update
    const speedRatio = Math.abs(this.truckSpeed) / currentMaxSpeed;
    soundFX.updatePlowDrive(speedRatio, isPlowingSnow, this.isBoosting);

    // 10. Particle System update
    this.particleManager.update(dt, this.truckPos);

    // 11. Camera Smooth Damping (Isometric follow with lookahead)
    const lookaheadDist = this.truckSpeed * 0.4;
    const targetLookAtX = this.truckPos.x + Math.sin(this.truckHeading) * lookaheadDist;
    const targetLookAtZ = this.truckPos.z + Math.cos(this.truckHeading) * lookaheadDist;

    // Classic 45° isometric offset
    const isoDist = 26;
    const isoHeight = 30;
    const targetCamX = this.truckPos.x + isoDist + this.cameraShake.x;
    const targetCamY = isoHeight + (this.isBoosting ? 3.0 : 0) + this.cameraShake.y;
    const targetCamZ = this.truckPos.z + isoDist + this.cameraShake.z;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 6.0, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 6.0, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 6.0, dt);

    _v1.set(targetLookAtX, 0.5, targetLookAtZ);
    this.camera.lookAt(_v1);

    // Decay camera shake
    this.cameraShake.multiplyScalar(Math.exp(-12 * dt));

    // 12. Check Victory condition
    const progress = this.snowSystem.getProgress();
    if (progress >= this.currentLevel.targetSnow && this.isRunning) {
      this.triggerVictory();
    }

    // Send stats back to React UI
    this.callbacks.onStatsUpdate({
      ...this.stats,
    });
  }

  public triggerHitstop(duration = 0.05) {
    this.hitstopTimer = duration;
  }

  public triggerCameraShake(intensity = 0.3) {
    this.cameraShake.set(
      (Math.random() - 0.5) * intensity * 2,
      (Math.random() - 0.5) * intensity * 2,
      (Math.random() - 0.5) * intensity * 2
    );
  }

  private triggerVictory() {
    this.isRunning = false;
    soundFX.playVictoryJingle();
    this.stats.money += this.currentLevel.rewardCash;
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    this.callbacks.onLevelComplete();
  }

  // Camera pan during Title Screen
  public tickTitleScreen() {
    if (!this.isTitleScreen) return;
    const time = performance.now() * 0.0003;
    const rad = 28;
    this.camera.position.set(Math.cos(time) * rad, 22, Math.sin(time) * rad);
    this.camera.lookAt(0, 1.5, 0);

    if (this.particleManager) {
      _v2.set(0, 0, 0);
      this.particleManager.update(0.016, _v2);
    }

    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public applyUpgrades(newUpgrades: VehicleUpgrades) {
    this.upgrades = newUpgrades;
    // Refresh plow truck blade model to match new blade size
    if (this.truckGroup) {
      this.scene.remove(this.truckGroup);
      const truckData = createPlowTruck(this.upgrades.bladeLevel);
      this.truckGroup = truckData.group;
      this.truckWheels = truckData.wheels;
      this.truckBeacon = truckData.beacon;
      this.truckBlade = truckData.plowBlade;
      this.spreaderSpinner = truckData.spreaderSpinner;
      this.headlightLeft = truckData.headlightLeft;
      this.headlightRight = truckData.headlightRight;
      this.truckGroup.position.copy(this.truckPos);
      this.truckGroup.rotation.y = this.truckHeading;
      this.scene.add(this.truckGroup);
    }
  }

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.snowSystem) this.snowSystem.dispose();
    if (this.particleManager) this.particleManager.dispose();
  }
}
