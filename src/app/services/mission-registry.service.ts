import { Injectable } from '@angular/core';
import { TerroristsOnEarthMoonColonyMission } from '../missions/easy-missions/terrorists-on-earth-moon-colony';
import { Mission } from '../missions/mission';

@Injectable({
  providedIn: 'root',
})
export class MissionRegistryService {
  private availableMissions: { new (): Mission }[] = [
    TerroristsOnEarthMoonColonyMission,
    // Add other missions here
  ];

  getMissionById(id: string): Mission | null {
    const MissionClass = this.availableMissions.find((MissionClass) => {
      const instance = new MissionClass();
      return instance.id === id;
    });
    return MissionClass ? new MissionClass() : null;
  }

  getAllMissions(): Mission[] {
    return this.availableMissions.map((MissionClass) => new MissionClass());
  }

  getMissionInfo(): Array<{ id: string; name: string; description: string }> {
    return this.availableMissions.map((MissionClass) => {
      const instance = new MissionClass();
      return {
        id: instance.id,
        name: instance.name,
        description: instance.description,
      };
    });
  }
}
