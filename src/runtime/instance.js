import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      const props = this._getInitProperties() || [];
      
      // Weapon settings from properties
      this._maxAmmo = Number(props[0]) || 30;
      this._currentAmmo = Number(props[1]) || 30;
      this._fireRate = Number(props[2]) || 0.1;
      this._fireMode = Number(props[3]) || 0;       // 0=single, 1=auto, 2=burst
      this._burstCount = Number(props[4]) || 3;
      this._burstDelay = Number(props[5]) || 0.05;
      this._reloadTime = Number(props[6]) || 2.0;
      this._autoReload = Boolean(props[7]);
      this._reloadType = String(props[8]) || "magazine"; // magazine, per_bullet, speed_reload, passive_reload
      this._reserveAmmo = Number(props[9]) || 0; // 0 = infinite reserves
      
      // Internal state
      this._fireCooldown = 0;
      this._isReloading = false;
      this._reloadTimer = 0;
      this._burstShotsRemaining = 0;
      this._burstTimer = 0;
      this._passiveReloadAccumulator = 0; // Tracks fractional ammo for passive reload

      // Enable ticking for timer updates
      this._setTicking(true);
    }

    _tick() {
      // Performance optimization: Early return if nothing is active
      const hasActiveCooldown = this._fireCooldown > 0;
      const hasActiveReload = this._isReloading;
      const hasActiveBurst = this._burstShotsRemaining > 0;
      const hasPassiveReload = this._reloadType === "passive_reload" && this._currentAmmo < this._maxAmmo;
      
      if (!hasActiveCooldown && !hasActiveReload && !hasActiveBurst && !hasPassiveReload) {
        return;
      }
      
      // Get delta-time from the associated instance, to take in to account the instance's own time scale
      const dt = this.instance.dt;
      
      // Update fire cooldown
      if (this._fireCooldown > 0) {
        this._fireCooldown -= dt;
        if (this._fireCooldown < 0) {
          this._fireCooldown = 0;
        }
      }
      
      // Handle passive reload - regenerate ammo over time
      if (this._reloadType === "passive_reload" && this._currentAmmo < this._maxAmmo) {
        // Use _reloadTime as seconds per bullet (e.g., 2.0 = 1 bullet every 2 seconds)
        const reloadRate = this._reloadTime > 0 ? (1.0 / this._reloadTime) : 1.0; // bullets per second
        this._passiveReloadAccumulator += reloadRate * dt;
        
        // Add whole bullets when accumulator reaches 1.0
        if (this._passiveReloadAccumulator >= 1.0) {
          const bulletsToAdd = Math.floor(this._passiveReloadAccumulator);
          this._passiveReloadAccumulator -= bulletsToAdd;
          
          const oldAmmo = this._currentAmmo;
          this._currentAmmo = Math.min(this._currentAmmo + bulletsToAdd, this._maxAmmo);
          
          // Trigger partial reload for each bullet added
          if (this._currentAmmo > oldAmmo) {
            this._trigger("OnPartialReload");
            
            // If we reached max, trigger reload complete
            if (this._currentAmmo >= this._maxAmmo) {
              this._passiveReloadAccumulator = 0;
              this._trigger("OnReloadComplete");
            }
          }
        }
      }
      
      // Handle reload based on type
      if (this._isReloading) {
        this._reloadTimer -= dt;
        if (this._reloadTimer <= 0) {
          if (this._reloadType === "per_bullet") {
            this._reloadOneBullet();
          } else {
            this._completeReload();
          }
        }
      }
      
      // Handle burst fire timing
      if (this._burstShotsRemaining > 0 && this._burstTimer > 0) {
        this._burstTimer -= dt;
        if (this._burstTimer <= 0) {
          this._fireBurstShot();
        }
      }
    }

    _trigger(method) {
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    // Check if weapon can fire
    canFire() {
      if (this._fireCooldown > 0) return false;
      if (this._isReloading) return false;
      if (this._currentAmmo <= 0) return false;
      if (this._burstShotsRemaining > 0) return false;
      return true;
    }

    // Fire a single shot
    _fireSingleShot() {
      if (this._currentAmmo <= 0) {
        this._trigger("OnEmpty");
        if (this._autoReload) {
          this.startReload();
        }
        return false;
      }
      
      this._currentAmmo--;
      this._fireCooldown = this._fireRate;
      
      // Trigger fire event
      this._trigger("OnFire");
      
      return true;
    }

    // Fire the weapon based on current fire mode
    fire() {
      if (!this.canFire()) {
        if (this._currentAmmo <= 0 && !this._isReloading) {
          this._trigger("OnEmpty");
          if (this._autoReload) {
            this.startReload();
          }
        }
        return false;
      }
      
      // Fire based on mode
      switch (this._fireMode) {
        case 0: // Single shot
        case 1: // Automatic
          return this._fireSingleShot();
        case 2: // Burst fire
          return this._startBurst();
        default:
          return this._fireSingleShot();
      }
    }

    // Start burst fire
    _startBurst() {
      if (this._burstShotsRemaining > 0) return false;
      
      // Check ammo only once for the entire burst
      if (this._currentAmmo <= 0) {
        this._trigger("OnEmpty");
        if (this._autoReload) {
          this.startReload();
        }
        return false;
      }
      
      // Consume one ammo for the entire burst
      this._currentAmmo--;
      this._fireCooldown = this._fireRate;
      
      this._burstShotsRemaining = this._burstCount;
      this._fireBurstShot();
      return true;
    }

    // Fire a single shot in burst mode
    _fireBurstShot() {
      if (this._burstShotsRemaining <= 0) {
        this._burstTimer = 0;
        return;
      }
      
      // Trigger fire event for each shot in burst
      this._trigger("OnFire");
      this._burstShotsRemaining--;
      
      if (this._burstShotsRemaining > 0) {
        this._burstTimer = this._burstDelay;
      } else {
        this._burstTimer = 0;
      }
    }

    // Start reload
    startReload() {
      if (this._isReloading) return false;
      if (this._currentAmmo >= this._maxAmmo) return false;
      
      // Speed reload: check if we have reserve ammo available
      if (this._reloadType === "speed_reload") {
        // If reserves are 0 (infinite) or we have ammo, allow reload
        if (this._reserveAmmo !== 0 && this._reserveAmmo < this._maxAmmo) {
          return false; // Not enough reserve ammo
        }
      }
      
      this._isReloading = true;
      
      // For per-bullet reload, divide total reload time by max ammo
      if (this._reloadType === "per_bullet" && this._maxAmmo > 0) {
        this._reloadTimer = this._reloadTime / this._maxAmmo;
      } else {
        this._reloadTimer = this._reloadTime;
      }
      
      this._trigger("OnReloadStart");
      
      return true;
    }

    // Reload one bullet (for per-bullet reload type)
    _reloadOneBullet() {
      this._trigger("OnPartialReloadStart");
      this._currentAmmo++;
      this._trigger("OnPartialReload");
      
      if (this._currentAmmo >= this._maxAmmo) {
        this._isReloading = false;
        this._reloadTimer = 0;
        this._trigger("OnReloadComplete");
      } else {
        // Continue reloading next bullet using divided reload time
        this._reloadTimer = this._maxAmmo > 0 ? (this._reloadTime / this._maxAmmo) : this._reloadTime;
      }
    }

    // Complete reload
    _completeReload() {
      if (this._reloadType === "speed_reload") {
        // Speed reload: discard remaining ammo and reload from reserves
        const ammoNeeded = this._maxAmmo;
        
        if (this._reserveAmmo === 0) {
          // Infinite reserves
          this._currentAmmo = this._maxAmmo;
        } else {
          // Limited reserves
          const ammoToLoad = Math.min(ammoNeeded, this._reserveAmmo);
          this._reserveAmmo -= ammoToLoad;
          this._currentAmmo = ammoToLoad;
        }
      } else {
        // Standard magazine reload
        this._currentAmmo = this._maxAmmo;
      }
      
      this._isReloading = false;
      this._reloadTimer = 0;
      this._trigger("OnReloadComplete");
    }

    // Cancel reload
    cancelReload() {
      if (!this._isReloading) return false;
      
      this._isReloading = false;
      this._reloadTimer = 0;
      
      return true;
    }

    // Set fire mode
    setFireMode(mode) {
      if (typeof mode === "string") {
        switch (mode.toLowerCase()) {
          case "single": this._fireMode = 0; break;
          case "automatic": 
          case "auto": this._fireMode = 1; break;
          case "burst": this._fireMode = 2; break;
          default: this._fireMode = 0;
        }
      } else {
        this._fireMode = mode;
      }
    }

    // Get fire mode as string
    getFireModeString() {
      switch (this._fireMode) {
        case 0: return "single";
        case 1: return "automatic";
        case 2: return "burst";
        default: return "single";
      }
    }

    // Get reload progress (0-1)
    getReloadProgress() {
      if (!this._isReloading) return 0;
      if (this._reloadTime <= 0) return 1;
      
      return 1 - (this._reloadTimer / this._reloadTime);
    }

    // Get fire cooldown progress (0-1)
    getFireCooldownProgress() {
      if (this._fireRate <= 0) return 1;
      return 1 - (this._fireCooldown / this._fireRate);
    }

    _release() {
      super._release();
    }

    _saveToJson() {
      return {
        currentAmmo: this._currentAmmo,
        maxAmmo: this._maxAmmo,
        fireRate: this._fireRate,
        fireMode: this._fireMode,
        burstCount: this._burstCount,
        burstDelay: this._burstDelay,
        reloadTime: this._reloadTime,
        autoReload: this._autoReload,
        reloadType: this._reloadType,
        isReloading: this._isReloading,
        reloadTimer: this._reloadTimer,
        reserveAmmo: this._reserveAmmo,
        passiveReloadAccumulator: this._passiveReloadAccumulator,
      };
    }

    _loadFromJson(o) {
      this._currentAmmo = o.currentAmmo;
      this._maxAmmo = o.maxAmmo;
      this._fireRate = o.fireRate;
      this._fireMode = o.fireMode;
      this._burstCount = o.burstCount;
      this._burstDelay = o.burstDelay;
      this._reloadTime = o.reloadTime;
      this._autoReload = o.autoReload;
      this._reloadType = o.reloadType || "magazine";
      this._isReloading = o.isReloading;
      this._reloadTimer = o.reloadTimer || 0;
      this._reserveAmmo = o.reserveAmmo !== undefined ? o.reserveAmmo : 0;
      this._passiveReloadAccumulator = o.passiveReloadAccumulator || 0;
    }

    _getDebuggerProperties() {
      return [{
        title: "$" + this.behaviorType.name,
        properties: [
          { name: "$reloadtype", value: this._reloadType },
          { name: "$currentAmmo", value: this._currentAmmo, onedit: v => this._currentAmmo = v },
          { name: "$maxAmmo", value: this._maxAmmo, onedit: v => this._maxAmmo = v },
          { name: "$reserveAmmo", value: this._reserveAmmo, onedit: v => this._reserveAmmo = v },
          { name: "$fireRate", value: this._fireRate, onedit: v => this._fireRate = v },
          { name: "$fireMode", value: this.getFireModeString() },
          { name: "$burstCount", value: this._burstCount, onedit: v => this._burstCount = v },
          { name: "$burstDelay", value: this._burstDelay, onedit: v => this._burstDelay = v },
          { name: "$burstShotsRemaining", value: this._burstShotsRemaining },
          { name: "$reloadType", value: this._reloadType },
          { name: "$reloadTime", value: this._reloadTime, onedit: v => this._reloadTime = v },
          { name: "$isReloading", value: this._isReloading },
          { name: "$reloadProgress", value: this.getReloadProgress() },
        ]
      }];
    }
  };
}
