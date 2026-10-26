import * as THREE from 'three';

/**
 * Procedural 3D models complying with Three.js skill directives:
 * - 3–12 part composite groups with varied roughness and metalness
 * - Bottom-center pivot points flush on ground
 * - Zero external 404 dependencies
 */

// Shared reusable materials
export class GameMaterials {
  public static truckOrange: THREE.MeshStandardMaterial;
  public static truckYellow: THREE.MeshStandardMaterial;
  public static chassisSteel: THREE.MeshStandardMaterial;
  public static chrome: THREE.MeshStandardMaterial;
  public static tireRubber: THREE.MeshStandardMaterial;
  public static glass: THREE.MeshStandardMaterial;
  public static bladeSteel: THREE.MeshStandardMaterial;
  public static beaconAmber: THREE.MeshStandardMaterial;
  public static headlightGlow: THREE.MeshStandardMaterial;
  public static taillightGlow: THREE.MeshStandardMaterial;

  public static pineGreen: THREE.MeshStandardMaterial;
  public static treeTrunk: THREE.MeshStandardMaterial;
  public static snowWhite: THREE.MeshStandardMaterial;
  public static roadAsphalt: THREE.MeshStandardMaterial;
  public static cabinWood: THREE.MeshStandardMaterial;
  public static stoneFoundation: THREE.MeshStandardMaterial;
  public static windowGlow: THREE.MeshStandardMaterial;
  public static streetLampMetal: THREE.MeshStandardMaterial;
  public static carrotOrange: THREE.MeshStandardMaterial;
  public static giftRed: THREE.MeshStandardMaterial;
  public static giftGold: THREE.MeshStandardMaterial;

  public static init() {
    this.truckOrange = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Vibrant safety alpine orange
      roughness: 0.35,
      metalness: 0.15,
    });

    this.truckYellow = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.3,
      metalness: 0.2,
    });

    this.chassisSteel = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.8,
    });

    this.chrome = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.15,
      metalness: 0.95,
    });

    this.tireRubber = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.glass = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.75,
    });

    this.bladeSteel = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber/orange heavy duty plow blade
      roughness: 0.3,
      metalness: 0.5,
    });

    this.beaconAmber = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    this.headlightGlow = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffbeb,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });

    this.taillightGlow = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });

    this.pineGreen = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.treeTrunk = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.9,
      metalness: 0.0,
    });

    this.snowWhite = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.45,
      metalness: 0.02,
    });

    this.roadAsphalt = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.cabinWood = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.7,
      metalness: 0.05,
    });

    this.stoneFoundation = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.windowGlow = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });

    this.streetLampMetal = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.75,
    });

    this.carrotOrange = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.5,
    });

    this.giftRed = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.35,
      metalness: 0.2,
    });

    this.giftGold = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.8,
    });
  }
}

/**
 * Composite Plow Truck Model (12 distinct coordinated parts)
 */
export function createPlowTruck(bladeLevel = 1): {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  beacon: THREE.Mesh;
  plowBlade: THREE.Group;
  spreaderSpinner: THREE.Mesh;
  headlightLeft: THREE.SpotLight;
  headlightRight: THREE.SpotLight;
} {
  const truck = new THREE.Group();
  truck.name = 'PlowTruck';

  // 1. Heavy Chassis & Step plates
  const chassisGeo = new THREE.BoxGeometry(1.6, 0.4, 3.2);
  const chassis = new THREE.Mesh(chassisGeo, GameMaterials.chassisSteel);
  chassis.position.set(0, 0.5, 0);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  truck.add(chassis);

  // 2. Cab Lower & Hood (Front section)
  const hoodGeo = new THREE.BoxGeometry(1.5, 0.6, 1.3);
  const hood = new THREE.Mesh(hoodGeo, GameMaterials.truckOrange);
  hood.position.set(0, 0.9, 0.85);
  hood.castShadow = true;
  truck.add(hood);

  // Radiator Grill & Chrome Bumper guard
  const grillGeo = new THREE.BoxGeometry(1.3, 0.45, 0.1);
  const grill = new THREE.Mesh(grillGeo, GameMaterials.chrome);
  grill.position.set(0, 0.85, 1.52);
  truck.add(grill);

  // 3. Driver Cabin (Upper section)
  const cabGeo = new THREE.BoxGeometry(1.5, 0.9, 1.4);
  const cab = new THREE.Mesh(cabGeo, GameMaterials.truckOrange);
  cab.position.set(0, 1.45, -0.2);
  cab.castShadow = true;
  truck.add(cab);

  // 4. Windshield & Windows
  const windshieldGeo = new THREE.BoxGeometry(1.35, 0.5, 0.05);
  const windshield = new THREE.Mesh(windshieldGeo, GameMaterials.glass);
  windshield.position.set(0, 1.55, 0.52);
  windshield.rotation.x = -0.15;
  truck.add(windshield);

  // Side Windows
  const sideWindowGeo = new THREE.BoxGeometry(0.05, 0.4, 0.9);
  const leftWindow = new THREE.Mesh(sideWindowGeo, GameMaterials.glass);
  leftWindow.position.set(0.76, 1.55, -0.2);
  truck.add(leftWindow);
  const rightWindow = new THREE.Mesh(sideWindowGeo, GameMaterials.glass);
  rightWindow.position.set(-0.76, 1.55, -0.2);
  truck.add(rightWindow);

  // Sun visor / roof brow
  const visorGeo = new THREE.BoxGeometry(1.55, 0.1, 0.3);
  const visor = new THREE.Mesh(visorGeo, GameMaterials.truckYellow);
  visor.position.set(0, 1.92, 0.48);
  truck.add(visor);

  // 5. Amber Warning Beacon on roof
  const beaconBaseGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12);
  const beaconBase = new THREE.Mesh(beaconBaseGeo, GameMaterials.chassisSteel);
  beaconBase.position.set(0, 1.94, -0.2);
  truck.add(beaconBase);

  const beaconGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.22, 12);
  const beacon = new THREE.Mesh(beaconGeo, GameMaterials.beaconAmber);
  beacon.position.set(0, 2.06, -0.2);
  truck.add(beacon);

  // 6. Rear Salt / Grit Spreader Hopper & Bed
  const bedGeo = new THREE.BoxGeometry(1.5, 0.6, 1.3);
  const bed = new THREE.Mesh(bedGeo, GameMaterials.truckOrange);
  bed.position.set(0, 0.95, -1.2);
  bed.castShadow = true;
  truck.add(bed);

  // Hopper inside bed
  const hopperGeo = new THREE.ConeGeometry(0.65, 0.7, 4);
  const hopper = new THREE.Mesh(hopperGeo, GameMaterials.truckYellow);
  hopper.rotation.y = Math.PI / 4;
  hopper.rotation.x = Math.PI;
  hopper.position.set(0, 1.35, -1.2);
  truck.add(hopper);

  // Spreader spinner disc at bottom rear
  const spinnerGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8);
  const spreaderSpinner = new THREE.Mesh(spinnerGeo, GameMaterials.bladeSteel);
  spreaderSpinner.position.set(0, 0.35, -1.9);
  truck.add(spreaderSpinner);

  // 7. Dual Chrome Exhaust Stacks
  const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
  const exhaustLeft = new THREE.Mesh(exhaustGeo, GameMaterials.chrome);
  exhaustLeft.position.set(0.72, 1.6, -0.95);
  truck.add(exhaustLeft);
  const exhaustRight = new THREE.Mesh(exhaustGeo, GameMaterials.chrome);
  exhaustRight.position.set(-0.72, 1.6, -0.95);
  truck.add(exhaustRight);

  // 8. Rugged Off-road Wheels (4 wheels)
  const wheels: THREE.Mesh[] = [];
  const wheelRadius = 0.42;
  const wheelWidth = 0.32;
  const wheelPositions = [
    [0.9, 0.42, 0.95],   // Front Left
    [-0.9, 0.42, 0.95],  // Front Right
    [0.9, 0.42, -1.15],  // Rear Left
    [-0.9, 0.42, -1.15], // Rear Right
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(x, y, z);

    // Tire rubber with tread
    const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, GameMaterials.tireRubber);
    tire.castShadow = true;

    // Rim
    const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth + 0.02, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, GameMaterials.truckYellow);

    // Hubcap
    const capGeo = new THREE.CylinderGeometry(wheelRadius * 0.25, wheelRadius * 0.25, wheelWidth + 0.05, 8);
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, GameMaterials.chrome);

    tire.add(rim);
    tire.add(cap);
    wheelGroup.add(tire);
    truck.add(wheelGroup);
    wheels.push(tire);
  });

  // 9. Front Heavy V-Plow Blade Assembly
  const plowBlade = new THREE.Group();
  plowBlade.name = 'PlowBlade';
  plowBlade.position.set(0, 0.4, 1.85);

  // Blade width scales with upgrade level (from 2.4m up to 3.8m)
  const bladeWidth = 2.2 + bladeLevel * 0.35;
  const bladeWingWidth = bladeWidth / 2;

  // Angled V-Blade Left & Right wings
  const wingGeo = new THREE.BoxGeometry(bladeWingWidth, 0.7, 0.12);
  const leftWing = new THREE.Mesh(wingGeo, GameMaterials.bladeSteel);
  leftWing.position.set(bladeWingWidth * 0.42, 0.15, -0.15);
  leftWing.rotation.y = 0.38; // Swept back
  leftWing.castShadow = true;
  plowBlade.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, GameMaterials.bladeSteel);
  rightWing.position.set(-bladeWingWidth * 0.42, 0.15, -0.15);
  rightWing.rotation.y = -0.38; // Swept back
  rightWing.castShadow = true;
  plowBlade.add(rightWing);

  // Steel cutting edge bottom scraper
  const edgeGeo = new THREE.BoxGeometry(bladeWidth * 0.95, 0.12, 0.08);
  const cuttingEdge = new THREE.Mesh(edgeGeo, GameMaterials.chrome);
  cuttingEdge.position.set(0, -0.18, 0);
  plowBlade.add(cuttingEdge);

  // Hydraulic Struts connecting plow to chassis
  const strutGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
  strutGeo.rotateX(Math.PI / 2);
  const leftStrut = new THREE.Mesh(strutGeo, GameMaterials.chassisSteel);
  leftStrut.position.set(0.45, 0.15, -0.4);
  plowBlade.add(leftStrut);
  const rightStrut = new THREE.Mesh(strutGeo, GameMaterials.chassisSteel);
  rightStrut.position.set(-0.45, 0.15, -0.4);
  plowBlade.add(rightStrut);

  truck.add(plowBlade);

  // 10. Headlights & Spotlights
  const lightHousingGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10);
  lightHousingGeo.rotateX(Math.PI / 2);

  const leftLens = new THREE.Mesh(lightHousingGeo, GameMaterials.headlightGlow);
  leftLens.position.set(0.55, 0.85, 1.55);
  truck.add(leftLens);

  const rightLens = new THREE.Mesh(lightHousingGeo, GameMaterials.headlightGlow);
  rightLens.position.set(-0.55, 0.85, 1.55);
  truck.add(rightLens);

  // Left Spotlight
  const headlightLeft = new THREE.SpotLight(0xfff5ea, 4.0, 18, Math.PI / 6, 0.4, 1.2);
  headlightLeft.position.set(0.55, 0.9, 1.6);
  headlightLeft.target.position.set(0.55, 0, 8);
  truck.add(headlightLeft);
  truck.add(headlightLeft.target);

  // Right Spotlight
  const headlightRight = new THREE.SpotLight(0xfff5ea, 4.0, 18, Math.PI / 6, 0.4, 1.2);
  headlightRight.position.set(-0.55, 0.9, 1.6);
  headlightRight.target.position.set(-0.55, 0, 8);
  truck.add(headlightRight);
  truck.add(headlightRight.target);

  // Tail lights
  const tailGeo = new THREE.BoxGeometry(0.2, 0.15, 0.05);
  const leftTail = new THREE.Mesh(tailGeo, GameMaterials.taillightGlow);
  leftTail.position.set(0.65, 0.75, -1.86);
  truck.add(leftTail);
  const rightTail = new THREE.Mesh(tailGeo, GameMaterials.taillightGlow);
  rightTail.position.set(-0.65, 0.75, -1.86);
  truck.add(rightTail);

  // Soft contact shadow grounding beneath truck
  const shadowGeo = new THREE.PlaneGeometry(2.4, 4.2);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.position.set(0, 0.03, 0);
  truck.add(contactShadow);

  return {
    group: truck,
    wheels,
    beacon,
    plowBlade,
    spreaderSpinner,
    headlightLeft,
    headlightRight,
  };
}

/**
 * Alpine Pine Tree with layered snow caps
 */
export function createPineTree(scale = 1.0): THREE.Group {
  const tree = new THREE.Group();
  tree.name = 'PineTree';

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 1.4 * scale, 8);
  const trunk = new THREE.Mesh(trunkGeo, GameMaterials.treeTrunk);
  trunk.position.y = 0.7 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  // 3 Tiered foliage cones with snow caps
  const tiers = [
    { y: 1.5 * scale, r: 1.6 * scale, h: 1.4 * scale },
    { y: 2.3 * scale, r: 1.2 * scale, h: 1.3 * scale },
    { y: 3.1 * scale, r: 0.8 * scale, h: 1.2 * scale },
  ];

  tiers.forEach((tier) => {
    // Green Pine needles
    const foliageGeo = new THREE.ConeGeometry(tier.r, tier.h, 7);
    const foliage = new THREE.Mesh(foliageGeo, GameMaterials.pineGreen);
    foliage.position.y = tier.y;
    foliage.castShadow = true;
    tree.add(foliage);

    // Crisp white snow cap resting on top of tier
    const snowCapGeo = new THREE.ConeGeometry(tier.r * 0.95, tier.h * 0.45, 7);
    const snowCap = new THREE.Mesh(snowCapGeo, GameMaterials.snowWhite);
    snowCap.position.y = tier.y + tier.h * 0.28;
    tree.add(snowCap);
  });

  return tree;
}

/**
 * Cozy Alpine Chalet / Log Cabin
 */
export function createAlpineCabin(width = 6, length = 7): THREE.Group {
  const cabin = new THREE.Group();
  cabin.name = 'AlpineCabin';

  // Stone foundation
  const foundGeo = new THREE.BoxGeometry(width + 0.2, 0.5, length + 0.2);
  const foundation = new THREE.Mesh(foundGeo, GameMaterials.stoneFoundation);
  foundation.position.y = 0.25;
  foundation.receiveShadow = true;
  cabin.add(foundation);

  // Wood cabin body
  const bodyHeight = 3.2;
  const bodyGeo = new THREE.BoxGeometry(width, bodyHeight, length);
  const body = new THREE.Mesh(bodyGeo, GameMaterials.cabinWood);
  body.position.y = 0.5 + bodyHeight / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  cabin.add(body);

  // Steep peaked roof with thick snow mantle
  const roofPitch = 2.4;
  const roofOverhang = 0.6;
  const roofGeo = new THREE.ConeGeometry((width + roofOverhang * 2) * 0.72, roofPitch, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, GameMaterials.snowWhite);
  roof.position.y = 0.5 + bodyHeight + roofPitch / 2 - 0.2;
  roof.scale.set(1.0, 1.0, length / width);
  roof.castShadow = true;
  cabin.add(roof);

  // Glowing warm windows
  const winGeo = new THREE.PlaneGeometry(0.9, 0.9);
  // Front window
  const frontWin = new THREE.Mesh(winGeo, GameMaterials.windowGlow);
  frontWin.position.set(1.2, 2.0, length / 2 + 0.02);
  cabin.add(frontWin);

  // Front Door
  const doorGeo = new THREE.PlaneGeometry(1.2, 2.0);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x3f1d0b, roughness: 0.8 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(-1.2, 1.5, length / 2 + 0.02);
  cabin.add(door);

  // Side Windows
  const sideWin1 = new THREE.Mesh(winGeo, GameMaterials.windowGlow);
  sideWin1.position.set(width / 2 + 0.02, 2.0, 0.8);
  sideWin1.rotation.y = Math.PI / 2;
  cabin.add(sideWin1);

  const sideWin2 = new THREE.Mesh(winGeo, GameMaterials.windowGlow);
  sideWin2.position.set(-width / 2 - 0.02, 2.0, -0.8);
  sideWin2.rotation.y = -Math.PI / 2;
  cabin.add(sideWin2);

  // Stone Chimney with warm rim
  const chimGeo = new THREE.BoxGeometry(0.8, 3.8, 0.8);
  const chimney = new THREE.Mesh(chimGeo, GameMaterials.stoneFoundation);
  chimney.position.set(width * 0.28, 3.6, -length * 0.2);
  chimney.castShadow = true;
  cabin.add(chimney);

  // Soft porch light
  const porchLight = new THREE.PointLight(0xfef08a, 1.8, 7);
  porchLight.position.set(0, 2.5, length / 2 + 0.8);
  cabin.add(porchLight);

  return cabin;
}

/**
 * Street Lamp with warm point light
 */
export function createStreetLamp(): THREE.Group {
  const lamp = new THREE.Group();
  lamp.name = 'StreetLamp';

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8);
  const base = new THREE.Mesh(baseGeo, GameMaterials.streetLampMetal);
  base.position.y = 0.2;
  lamp.add(base);

  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.09, 3.2, 8);
  const pole = new THREE.Mesh(poleGeo, GameMaterials.streetLampMetal);
  pole.position.y = 1.8;
  pole.castShadow = true;
  lamp.add(pole);

  // Curved top bracket
  const bracketGeo = new THREE.BoxGeometry(0.6, 0.08, 0.08);
  const bracket = new THREE.Mesh(bracketGeo, GameMaterials.streetLampMetal);
  bracket.position.set(0.25, 3.3, 0);
  lamp.add(bracket);

  // Lantern housing
  const lanternGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.4, 6);
  const lantern = new THREE.Mesh(lanternGeo, GameMaterials.windowGlow);
  lantern.position.set(0.5, 3.1, 0);
  lamp.add(lantern);

  // Snow cap on lantern
  const snowGeo = new THREE.ConeGeometry(0.24, 0.18, 6);
  const snow = new THREE.Mesh(snowGeo, GameMaterials.snowWhite);
  snow.position.set(0.5, 3.35, 0);
  lamp.add(snow);

  // Warm light casting onto snow
  const warmLight = new THREE.PointLight(0xffe8ba, 2.2, 10);
  warmLight.position.set(0.5, 3.0, 0);
  lamp.add(warmLight);

  return lamp;
}

/**
 * Cozy Snowman prop (can be driven around or cleared for combo bonuses)
 */
export function createSnowman(): THREE.Group {
  const snowman = new THREE.Group();
  snowman.name = 'Snowman';

  // Bottom sphere
  const botGeo = new THREE.SphereGeometry(0.6, 12, 10);
  const bot = new THREE.Mesh(botGeo, GameMaterials.snowWhite);
  bot.position.y = 0.55;
  bot.castShadow = true;
  snowman.add(bot);

  // Middle sphere
  const midGeo = new THREE.SphereGeometry(0.42, 12, 10);
  const mid = new THREE.Mesh(midGeo, GameMaterials.snowWhite);
  mid.position.y = 1.25;
  mid.castShadow = true;
  snowman.add(mid);

  // Head
  const headGeo = new THREE.SphereGeometry(0.28, 12, 10);
  const head = new THREE.Mesh(headGeo, GameMaterials.snowWhite);
  head.position.y = 1.75;
  head.castShadow = true;
  snowman.add(head);

  // Carrot nose
  const noseGeo = new THREE.ConeGeometry(0.06, 0.28, 6);
  noseGeo.rotateX(Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, GameMaterials.carrotOrange);
  nose.position.set(0, 1.75, 0.32);
  snowman.add(nose);

  // Top hat
  const hatBrimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10);
  const hatBrim = new THREE.Mesh(hatBrimGeo, GameMaterials.chassisSteel);
  hatBrim.position.set(0, 1.98, 0);
  snowman.add(hatBrim);

  const hatTopGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 10);
  const hatTop = new THREE.Mesh(hatTopGeo, GameMaterials.chassisSteel);
  hatTop.position.set(0, 2.16, 0);
  snowman.add(hatTop);

  return snowman;
}

/**
 * Mystery Gift Box hidden under snowdrifts
 */
export function createGiftBox(): THREE.Group {
  const gift = new THREE.Group();
  gift.name = 'GiftBox';

  const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const box = new THREE.Mesh(boxGeo, GameMaterials.giftRed);
  box.position.y = 0.4;
  box.castShadow = true;
  gift.add(box);

  // Gold Ribbon
  const ribbonXGeo = new THREE.BoxGeometry(0.84, 0.82, 0.16);
  const ribbonX = new THREE.Mesh(ribbonXGeo, GameMaterials.giftGold);
  ribbonX.position.y = 0.4;
  gift.add(ribbonX);

  const ribbonZGeo = new THREE.BoxGeometry(0.16, 0.82, 0.84);
  const ribbonZ = new THREE.Mesh(ribbonZGeo, GameMaterials.giftGold);
  ribbonZ.position.y = 0.4;
  gift.add(ribbonZ);

  // Bow
  const bowGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const bow = new THREE.Mesh(bowGeo, GameMaterials.giftGold);
  bow.position.y = 0.85;
  gift.add(bow);

  return gift;
}

/**
 * Alpine Boulder for natural perimeters and obstacle barriers
 */
export function createAlpineBoulder(scale = 1.0): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(1.2 * scale, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.85,
    metalness: 0.1,
  });
  const boulder = new THREE.Mesh(geo, mat);
  boulder.position.y = 0.7 * scale;
  boulder.castShadow = true;
  boulder.receiveShadow = true;
  return boulder;
}
