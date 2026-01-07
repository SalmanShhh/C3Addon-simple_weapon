<img src="./src/icon.svg" width="100" /><br>
# Simple Weapon
<i>Handle firing, reloading, ammo management, and multiple fire modes without complex events. Perfect for shooters, action games, and any project needing weapon systems.</i> <br>
### Version 0.0.0.0

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/simple_weapon/releases/download/salmanshh_simple_weapon-0.0.0.0.c3addon/salmanshh_simple_weapon-0.0.0.0.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/simple_weapon/releases) </sub> <br>

#### What's New in 0.0.0.0
**Added:**
Initial release.


<sub>[View full changelog](#changelog)</sub>

---
<b><u>Author:</u></b> SalmanShh <br>
<sub>Made using [CAW](https://marketplace.visualstudio.com/items?itemName=skymen.caw) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
npm run build
```

To run the dev server, run

```
npm i
npm run dev
```

## Examples Files

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Max Ammo | Maximum ammunition capacity | integer |
| Starting Ammo | Ammunition when the weapon is created | integer |
| Fire Rate | Time between shots in seconds | float |
| Fire Mode | The firing mode of the weapon | combo |
| Burst Count | Number of shots in burst fire mode | integer |
| Burst Delay | Time between shots in a burst (seconds) | float |
| Image Point | Image point index to spawn projectiles from | integer |
| Spread Angle | Random spread angle in degrees (0 for no spread) | float |
| Reload Time | Time to reload in seconds | float |
| Auto Reload | Automatically reload when empty and firing | check |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Add ammo | Add ammunition to current count (capped at max) | Amount             *(number)* <br> |
| Set current ammo | Set the current ammunition count | Ammo             *(number)* <br> |
| Set max ammo | Set the maximum ammunition capacity | Max Ammo             *(number)* <br> |
| Subtract ammo | Subtract ammunition from current count | Amount             *(number)* <br> |
| Fire | Fire the weapon (respects fire mode, ammo, and cooldown) |  |
| Set burst count | Set the number of shots in burst fire mode | Burst Count             *(number)* <br> |
| Set fire mode | Set the weapon's fire mode | Fire Mode             *(combo)* <br> |
| Set fire rate | Set the time between shots in seconds | Fire Rate             *(number)* <br> |
| Set image point | Set the image point index for projectile spawning | Image Point             *(number)* <br> |
| Set spread angle | Set the random spread angle in degrees | Spread Angle             *(number)* <br> |
| Cancel reload | Cancel the current reload |  |
| Instant reload | Instantly reload the weapon to max ammo |  |
| Start reload | Start reloading the weapon |  |
| Set auto reload | Enable or disable auto reload when empty | Enabled             *(combo)* <br> |
| Set reload time | Set the reload duration in seconds | Reload Time             *(number)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Compare current ammo | Compare the current ammo count | Comparison *(cmp)* <br>Value *(number)* <br> |
| Has ammo | True if the weapon has at least 1 ammo |  |
| Is ammo full | True if current ammo equals max ammo |  |
| On empty | Triggered when trying to fire with no ammo |  |
| Can fire | True if the weapon can fire (has ammo, not reloading, cooldown elapsed) |  |
| Compare fire mode | Check if the weapon is in a specific fire mode | Fire Mode *(combo)* <br> |
| On fire | Triggered when the weapon fires a shot |  |
| Is reloading | True if the weapon is currently reloading |  |
| On reload complete | Triggered when reload finishes |  |
| On reload start | Triggered when reload begins |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| AmmoPercent | Get ammo as a percentage (0-100) | number |  | 
| CurrentAmmo | Get the current ammunition count | number |  | 
| MaxAmmo | Get the maximum ammunition capacity | number |  | 
| BurstCount | Get the number of shots in burst fire mode | number |  | 
| FireMode | Get the current fire mode ("single", "automatic", or "burst") | string |  | 
| FireRate | Get the fire rate (time between shots in seconds) | number |  | 
| ImagePoint | Get the image point index for projectile spawning | number |  | 
| SpawnAngle | Get the angle for spawning projectiles (with spread applied, in degrees) | number |  | 
| SpawnX | Get the X position for spawning projectiles (at image point) | number |  | 
| SpawnY | Get the Y position for spawning projectiles (at image point) | number |  | 
| SpreadAngle | Get the spread angle in degrees | number |  | 
| Reloading | Returns 1 if reloading, 0 if not | number |  | 
| ReloadProgress | Get reload progress as percentage (0-100) | number |  | 
| ReloadTime | Get the reload duration in seconds | number |  | 


---
## Changelog

### Version 0.0.0.0

**Added:**
Initial release.

---
