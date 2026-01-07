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
      this._imagePoint = Number(props[6]) || 0;
      this._spreadAngle = Number(props[7]) || 0;
      this._reloadTime = Number(props[8]) || 2.0;
      this._autoReload = Boolean(props[9]);
      
      // Internal state
      this._isReloading = false;
      this._reloadTimer = 0;
      this._burstShotsRemaining = 0;
      this._burstTimer = 0;

      // / If enabled, start calling _tick() to processtimer updates
      this._setTicking(true);
    }

    _tick() {
      // Early exit if nothing needs updating
      if (!this._isReloading && this._burstShotsRemaining <= 0) return;
      
      // Get delta-time from the associated instance, to take in to account the instance's own time scale
      const dt = this.instance.dt; 
      
      // Handle reload completion
      if (this._isReloading) {
        this._reloadTimer -= dt;
        if (this._reloadTimer <= 0) {
          this._completeReload();
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
      
      if (this._currentAmmo > 0) {
        this._fireSingleShot();
        this._burstShotsRemaining--;
        
        if (this._burstShotsRemaining > 0 && this._currentAmmo > 0) {
          this._burstTimer = this._burstDelay;
        } else {
          this._burstTimer = 0;
        }
      } else {
        this._burstShotsRemaining = 0;
        this._burstTimer = 0;
      }
    }

    // Start reload
    startReload() {
      if (this._isReloading) return false;
      if (this._currentAmmo >= this._maxAmmo) return false;
      
      this._isReloading = true;
      this._reloadTimer = this._reloadTime;
      
      this._trigger("OnReloadStart");
      
      return true;
    }

    // Complete reload
    _completeReload() {
      this._currentAmmo = this._maxAmmo;
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

    // Get spawn position at image point
    getSpawnPosition() {
      const inst = this._inst;
      if (!inst) return { x: 0, y: 0, angle: 0 };
      
      const wi = inst.GetWorldInfo();
      if (!wi) return { x: 0, y: 0, angle: 0 };
      
      let x, y;
      if (this._imagePoint === 0) {
        x = wi.GetX();
        y = wi.GetY();
      } else {
        const imgPt = inst.GetImagePoint(this._imagePoint);
        if (imgPt) {
          x = imgPt[0];
          y = imgPt[1];
        } else {
          x = wi.GetX();
          y = wi.GetY();
        }
      }
      
      // Calculate angle with spread
      let angle = wi.GetAngle();
      if (this._spreadAngle > 0) {
        const halfSpread = this._spreadAngle * (Math.PI / 180) / 2;
        angle += (Math.random() * 2 - 1) * halfSpread;
      }
      
      return { x, y, angle };
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
        imagePoint: this._imagePoint,
        spreadAngle: this._spreadAngle,
        reloadTime: this._reloadTime,
        autoReload: this._autoReload,
        isReloading: this._isReloading,
        reloadTimer: this._reloadTimer,
      };
    }

    _loadFromJson(o) {
      this._currentAmmo = o.currentAmmo;
      this._maxAmmo = o.maxAmmo;
      this._fireRate = o.fireRate;
      this._fireMode = o.fireMode;
      this._burstCount = o.burstCount;
      this._burstDelay = o.burstDelay;
      this._imagePoint = o.imagePoint;
      this._spreadAngle = o.spreadAngle;
      this._reloadTime = o.reloadTime;
      this._autoReload = o.autoReload;
      this._isReloading = o.isReloading;
      this._reloadTimer = o.reloadTimer || 0;
    }

    _getDebuggerProperties() {
      return [{
        title: "$" + this.behaviorType.name,
        properties: [
          { name: "$currentAmmo", value: this._currentAmmo, onedit: v => this._currentAmmo = v },
          { name: "$maxAmmo", value: this._maxAmmo, onedit: v => this._maxAmmo = v },
          { name: "$fireRate", value: this._fireRate, onedit: v => this._fireRate = v },
          { name: "$fireMode", value: this.getFireModeString() },
          { name: "$burstCount", value: this._burstCount, onedit: v => this._burstCount = v },
          { name: "$burstDelay", value: this._burstDelay, onedit: v => this._burstDelay = v },
          { name: "$burstShotsRemaining", value: this._burstShotsRemaining },
          { name: "$spreadAngle", value: this._spreadAngle, onedit: v => this._spreadAngle = v },
          { name: "$reloadTime", value: this._reloadTime, onedit: v => this._reloadTime = v },
          { name: "$isReloading", value: this._isReloading },
          { name: "$reloadProgress", value: this.getReloadProgress() },
        ]
      }];
    }
  };
}
