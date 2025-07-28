// @ts-check
const axios = require("axios");

function request(path: string, params?: Record<any, any>) {
  // @ts-ignore
  return axios(`https://${path}`, { params })
    .then((a: { data: any }) => a.data);
}

export type EliteStation = {
  name: string;
  id: number;
  type: string;
  distanceToArrival: number;
  controllingFaction?: { name: string; };
}

export type EliteFaction = {
  influence: number;
  name: string;
  state: string;
  allegiance: string;
  government: string;
  id: number;
}

export type EliteSystem = {
  name: string;
  id: number;
  requirePermit: boolean;
  information: { faction: string; allegiance: string; government: string; population: string; } | null;
  primaryStar: { isScoopable: boolean; type: string; name: string; };
  bodies: EliteBody[];
  stations: EliteStation[];
  factions: EliteFaction[];
  bodiesURL: string;
  stationsURL: string;
  factionsURL: string;
}

export type EliteBody = {
  id: number;
  type: string;
  isScoopable: boolean;
  distanceToArrival: number;
  name: string;
}

async function getSystemInfo(systemName: string) {
  const params = {
    showPrimaryStar: 1,
    showInformation: 1,
    showPermit: 1,
    showId: 1,
    systemName: systemName
  };

  const starSystem: EliteSystem = await request("www.edsm.net/api-v1/system", params);
  if (Array.isArray(starSystem)) return null;

  if (!starSystem.information || Object.keys(starSystem.information).length === 0) starSystem.information = null;

  const bodiesResponse = await request("www.edsm.net/api-system-v1/bodies", { systemName: systemName });
  starSystem.bodies = bodiesResponse.bodies;
  starSystem.bodiesURL = bodiesResponse.url;

  const stationsResponse = await request("www.edsm.net/api-system-v1/stations", { systemName: systemName });
  starSystem.stations = stationsResponse.stations;
  starSystem.stationsURL = stationsResponse.url;

  const factionsResponse = await request("www.edsm.net/api-system-v1/factions", { systemName: systemName });
  starSystem.factions = factionsResponse.factions;
  starSystem.factionsURL = factionsResponse.url;

  return starSystem;
}

function getEliteStatus(): Promise<{ lastUpdate: string; type: string; message: string; status: number; }> {
  return request("www.edsm.net/api-status-v1/elite-server");
}

export default {
  getSystemInfo,
  getEliteStatus
};