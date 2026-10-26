import * as THREE from 'three';

/**
 * High-performance pooled particle system for snow sprays, falling snowflakes, and exhaust
 */

export class ParticleManager {
  private scene: THREE.Scene;

  // Snow Spray Plume
  private sprayMax = 300;
  private sprayGeometry: THREE.BufferGeometry;
  private sprayPositions: Float32Array;
  private sprayVelocities: Float32Array;
  private sprayLifetimes: Float32Array;
  private sprayMesh: THREE.Points;
  private sprayIdx = 0;

  // Ambient Falling Snowflakes
  private flakeCount = 600;
  private flakeGeometry: THREE.BufferGeometry;
  private flakePositions: Float32Array;
  private flakeVelocities: Float32Array;
  private flakeMesh: THREE.Points;

  // Exhaust Smoke Puffs
  private exhaustMax = 80;
  private exhaustGeometry: THREE.BufferGeometry;
  private exhaustPositions: Float32Array;
  private exhaustVelocities: Float32Array;
  private exhaustLifetimes: Float32Array;
  private exhaustMesh: THREE.Points;
  private exhaustIdx = 0;

  // Sparkles (Gifts / Upgrades)
  private sparkleMax = 120;
  private sparkleGeometry: THREE.BufferGeometry;
  private sparklePositions: Float32Array;
  private sparkleVelocities: Float32Array;
  private sparkleLifetimes: Float32Array;
  private sparkleMesh: THREE.Points;
  private sparkleIdx = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Snow Spray Pool
    this.sprayGeometry = new THREE.BufferGeometry();
    this.sprayPositions = new Float32Array(this.sprayMax * 3);
    this.sprayVelocities = new Float32Array(this.sprayMax * 3);
    this.sprayLifetimes = new Float32Array(this.sprayMax);
    this.sprayGeometry.setAttribute('position', new THREE.BufferAttribute(this.sprayPositions, 3));

    const sprayMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.28,
      transparent: true,
      opacity: 0.85,
    });
    this.sprayMesh = new THREE.Points(this.sprayGeometry, sprayMat);
    this.sprayMesh.frustumCulled = false;
    this.scene.add(this.sprayMesh);

    // 2. Ambient Snowflakes
    this.flakeGeometry = new THREE.BufferGeometry();
    this.flakePositions = new Float32Array(this.flakeCount * 3);
    this.flakeVelocities = new Float32Array(this.flakeCount * 3);

    for (let i = 0; i < this.flakeCount; i++) {
      this.flakePositions[i * 3] = (Math.random() - 0.5) * 80;
      this.flakePositions[i * 3 + 1] = Math.random() * 25;
      this.flakePositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      this.flakeVelocities[i * 3] = (Math.random() - 0.5) * 0.4;
      this.flakeVelocities[i * 3 + 1] = -(1.2 + Math.random() * 1.5);
      this.flakeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }

    this.flakeGeometry.setAttribute('position', new THREE.BufferAttribute(this.flakePositions, 3));
    const flakeMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
    });
    this.flakeMesh = new THREE.Points(this.flakeGeometry, flakeMat);
    this.flakeMesh.frustumCulled = false;
    this.scene.add(this.flakeMesh);

    // 3. Exhaust Smoke
    this.exhaustGeometry = new THREE.BufferGeometry();
    this.exhaustPositions = new Float32Array(this.exhaustMax * 3);
    this.exhaustVelocities = new Float32Array(this.exhaustMax * 3);
    this.exhaustLifetimes = new Float32Array(this.exhaustMax);
    this.exhaustGeometry.setAttribute('position', new THREE.BufferAttribute(this.exhaustPositions, 3));

    const exhaustMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.22,
      transparent: true,
      opacity: 0.4,
    });
    this.exhaustMesh = new THREE.Points(this.exhaustGeometry, exhaustMat);
    this.exhaustMesh.frustumCulled = false;
    this.scene.add(this.exhaustMesh);

    // 4. Sparkles
    this.sparkleGeometry = new THREE.BufferGeometry();
    this.sparklePositions = new Float32Array(this.sparkleMax * 3);
    this.sparkleVelocities = new Float32Array(this.sparkleMax * 3);
    this.sparkleLifetimes = new Float32Array(this.sparkleMax);
    this.sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(this.sparklePositions, 3));

    const sparkleMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.35,
      transparent: true,
      opacity: 0.95,
    });
    this.sparkleMesh = new THREE.Points(this.sparkleGeometry, sparkleMat);
    this.sparkleMesh.frustumCulled = false;
    this.scene.add(this.sparkleMesh);
  }

  // Spawn plume of snow thrown out from blade sides
  public spawnSnowSpray(originX: number, originY: number, originZ: number, truckHeading: number, speed: number) {
    const burstCount = Math.min(8, Math.max(2, Math.floor(speed * 1.5)));

    for (let i = 0; i < burstCount; i++) {
      const idx = this.sprayIdx;
      this.sprayIdx = (this.sprayIdx + 1) % this.sprayMax;

      const side = Math.random() > 0.5 ? 1 : -1;
      const angle = truckHeading + (Math.PI / 2) * side + (Math.random() - 0.5) * 0.4;
      const force = 2.5 + Math.random() * 4.0 * (speed / 5);

      this.sprayPositions[idx * 3] = originX + (Math.random() - 0.5) * 0.8;
      this.sprayPositions[idx * 3 + 1] = originY + 0.2 + Math.random() * 0.3;
      this.sprayPositions[idx * 3 + 2] = originZ + (Math.random() - 0.5) * 0.8;

      this.sprayVelocities[idx * 3] = Math.sin(angle) * force;
      this.sprayVelocities[idx * 3 + 1] = 2.0 + Math.random() * 3.5;
      this.sprayVelocities[idx * 3 + 2] = Math.cos(angle) * force;

      this.sprayLifetimes[idx] = 0.5 + Math.random() * 0.4;
    }
  }

  // Spawn exhaust puff from vertical pipes
  public spawnExhaust(x: number, y: number, z: number, isBoosting: boolean) {
    const idx = this.exhaustIdx;
    this.exhaustIdx = (this.exhaustIdx + 1) % this.exhaustMax;

    this.exhaustPositions[idx * 3] = x + (Math.random() - 0.5) * 0.1;
    this.exhaustPositions[idx * 3 + 1] = y;
    this.exhaustPositions[idx * 3 + 2] = z + (Math.random() - 0.5) * 0.1;

    this.exhaustVelocities[idx * 3] = (Math.random() - 0.5) * 0.3;
    this.exhaustVelocities[idx * 3 + 1] = isBoosting ? 3.0 : 1.2;
    this.exhaustVelocities[idx * 3 + 2] = (Math.random() - 0.5) * 0.3;

    this.exhaustLifetimes[idx] = 0.4;
  }

  // Spawn golden celebration sparkles
  public spawnSparkles(x: number, y: number, z: number, count = 25) {
    for (let i = 0; i < count; i++) {
      const idx = this.sparkleIdx;
      this.sparkleIdx = (this.sparkleIdx + 1) % this.sparkleMax;

      const angle = Math.random() * Math.PI * 2;
      const force = 2.0 + Math.random() * 4.0;

      this.sparklePositions[idx * 3] = x;
      this.sparklePositions[idx * 3 + 1] = y;
      this.sparklePositions[idx * 3 + 2] = z;

      this.sparkleVelocities[idx * 3] = Math.cos(angle) * force;
      this.sparkleVelocities[idx * 3 + 1] = 3.0 + Math.random() * 4.0;
      this.sparkleVelocities[idx * 3 + 2] = Math.sin(angle) * force;

      this.sparkleLifetimes[idx] = 0.8 + Math.random() * 0.5;
    }
  }

  // Frame update
  public update(dt: number, centerPos: THREE.Vector3) {
    // 1. Update Snow Spray
    for (let i = 0; i < this.sprayMax; i++) {
      if (this.sprayLifetimes[i] > 0) {
        this.sprayLifetimes[i] -= dt;

        this.sprayPositions[i * 3] += this.sprayVelocities[i * 3] * dt;
        this.sprayPositions[i * 3 + 1] += this.sprayVelocities[i * 3 + 1] * dt;
        this.sprayPositions[i * 3 + 2] += this.sprayVelocities[i * 3 + 2] * dt;

        // Gravity
        this.sprayVelocities[i * 3 + 1] -= 9.8 * dt;

        if (this.sprayPositions[i * 3 + 1] < 0.05) {
          this.sprayLifetimes[i] = 0;
          this.sprayPositions[i * 3 + 1] = -100;
        }
      } else {
        this.sprayPositions[i * 3 + 1] = -100;
      }
    }
    this.sprayGeometry.attributes.position.needsUpdate = true;

    // 2. Update Ambient Snowflakes (wrap around truck)
    for (let i = 0; i < this.flakeCount; i++) {
      this.flakePositions[i * 3] += this.flakeVelocities[i * 3] * dt;
      this.flakePositions[i * 3 + 1] += this.flakeVelocities[i * 3 + 1] * dt;
      this.flakePositions[i * 3 + 2] += this.flakeVelocities[i * 3 + 2] * dt;

      // Wrap if fallen below ground
      if (this.flakePositions[i * 3 + 1] < 0) {
        this.flakePositions[i * 3 + 1] = 22;
        this.flakePositions[i * 3] = centerPos.x + (Math.random() - 0.5) * 70;
        this.flakePositions[i * 3 + 2] = centerPos.z + (Math.random() - 0.5) * 70;
      }
    }
    this.flakeGeometry.attributes.position.needsUpdate = true;

    // 3. Update Exhaust
    for (let i = 0; i < this.exhaustMax; i++) {
      if (this.exhaustLifetimes[i] > 0) {
        this.exhaustLifetimes[i] -= dt;
        this.exhaustPositions[i * 3] += this.exhaustVelocities[i * 3] * dt;
        this.exhaustPositions[i * 3 + 1] += this.exhaustVelocities[i * 3 + 1] * dt;
        this.exhaustPositions[i * 3 + 2] += this.exhaustVelocities[i * 3 + 2] * dt;
      } else {
        this.exhaustPositions[i * 3 + 1] = -100;
      }
    }
    this.exhaustGeometry.attributes.position.needsUpdate = true;

    // 4. Update Sparkles
    for (let i = 0; i < this.sparkleMax; i++) {
      if (this.sparkleLifetimes[i] > 0) {
        this.sparkleLifetimes[i] -= dt;
        this.sparklePositions[i * 3] += this.sparkleVelocities[i * 3] * dt;
        this.sparklePositions[i * 3 + 1] += this.sparkleVelocities[i * 3 + 1] * dt;
        this.sparklePositions[i * 3 + 2] += this.sparkleVelocities[i * 3 + 2] * dt;
        this.sparkleVelocities[i * 3 + 1] -= 9.8 * dt;
      } else {
        this.sparklePositions[i * 3 + 1] = -100;
      }
    }
    this.sparkleGeometry.attributes.position.needsUpdate = true;
  }

  public dispose() {
    this.sprayGeometry.dispose();
    this.flakeGeometry.dispose();
    this.exhaustGeometry.dispose();
    this.sparkleGeometry.dispose();
  }
}
