import { nanoid } from "nanoid";
import Tournament from "../models/Tournament.model";
import names from "../../data/nameParts.json";

type EliminationBracket = {
  startSeed: number;
  position: number;
  fightingFor: number;
  lostRound: number;
  lossReason: number;
}

type RRRound = {
  opponentId: string;
  score: number;
  lossReason: number;
}

type Participant = {
  id: string;
  ign?: string;
}

type Team = {
  id: string;
  name: string;
  roundOver: boolean;
  elimBracket: EliminationBracket;
  rrRounds: RRRound[];
  participants: Participant[];
  checkedIn: boolean;
}

type BaseTourney = {
  name: string;
  description: string;
  details: string;
  system?: string;
  organizerId: string;
  starts: number;
  roundLength: number;
  bracketStyle: number;
  teamSize: number;
  over?: boolean;
}

type ExtraTourney = {
  id: string;
  round: number;
  teams: Team[];
  winners: string[];
}

type Tournament = BaseTourney & ExtraTourney;

function removeEmptyTeams(tournament: Tournament) {
  return tournament.teams.filter(te => te.participants.length > 0);
}

export default {
  /**
   * @param {BaseTourney & {id: string}} tournament
   * @returns {Promise<Tournament>}
   */
  create: (tournament: BaseTourney & { id: string; }): Promise<Tournament> => {
    return Tournament.create(tournament).then(t => t.toObject());
  },
  /**
   * @param {string} id
   * @returns {Promise<Tournament | null>}
  */
  get: (id: string): Promise<Tournament | null> => {
    return Tournament.findOne({ id }, undefined, { lean: true }).exec();
  },
  /**
   * Get a list of tournaments
   * @param {number} [limit]
   * @returns {Promise<Tournament[]>}
   */
  getList: async (limit: number = 50): Promise<Tournament[]> => {
    return Tournament.find({}, undefined, { lean: true })
      .sort({ starts: "asc" })
      .limit(limit).exec();
  },
  /**
   * @param {string} tourneyId
   * @param {Tournament} tournament
   * @returns {Promise<Tournament | null>}
   */
  update: async (tourneyId: string, tournament: Tournament): Promise<Tournament | null> => {
    let t = await Tournament.findOne({ id: tourneyId }).exec();
    if (!t) return null;
    t = Object.assign(t, tournament);
    // cleanup and save
    t.teams = removeEmptyTeams(t);
    return t.save().then(o => o.toObject());
  },
  /**
   * @param {string} id
   * @returns {Promise<Tournament | null>}
  */
  delete: (id: string): Promise<Tournament | null> => {
    return Tournament.findOneAndDelete({ id }, { lean: true, old: true });
  },
  /**
   * @param {string} tourneyId
   * @param {string} userId
   * @param {string | undefined} ign
   * @param {{id: string, name: string}} team
   * @returns {Promise<Tournament|void>}
   */
  manageParticipant: async (tourneyId: string, userId: string, ign: string | undefined, team: { id: string; name: string; }): Promise<Tournament | void> => {
    const tourney = await Tournament.findOne({ id: tourneyId });
    if (!tourney) return;

    let removed = false;
    let inserted = false;

    const newId = nanoid();
    const newTeam = {
      id: newId,
      name: team.name || names.names[Math.floor(Math.random() * names.names.length)]!,
      participants: [{ id: userId, ign }],
      elimBracket: {
        startSeed: 0,
        position: 0,
        lossReason: 0,
        lostRound: 0,
        fightingFor: 0,
      },
      roundOver: false,
      rrRounds: [],
      checkedIn: false,
    };

    if (team.id === "new") {
      tourney.teams.push(newTeam);
      inserted = true;
    }

    for (const t of tourney.teams) {
      if (removed && inserted) break;
      if (!removed && t.id !== newId) {
        const found = t.participants.findIndex(p => p.id === userId);
        if (found > -1) {
          t.participants.splice(found, 1);
          removed = true;
        }
      }
      if (!inserted && t.id === team.id) {
        if (team.name) t.name = team.name;
        t.participants.push({ id: userId, ign });
        inserted = true;
      }
    }

    if (!inserted) {
      tourney.teams.push(newTeam);
    }

    // cleanup and save
    tourney.teams = removeEmptyTeams(tourney);
    return tourney.save().then(o => o.toObject());
  },
  /**
   * @param {string} id
   * @param {Team[]} modifiedTeams
   * @returns
   */
  setRoundResults: async (id: string, modifiedTeams: Team[]) => {
    const tourney = await Tournament.findOne({ id });
    if (!tourney) return;

    for (const t of modifiedTeams) {
      const i = t.participants.findIndex(obj => obj.id === t.id);
      tourney.teams[i] = t;
    }
    // cleanup and save
    tourney.teams = removeEmptyTeams(tourney);
    return tourney.save().then(o => o.toObject());
  },
  /**
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Tournament|void>}
   */
  removeParticipant: async (id: string, userId: string): Promise<Tournament | void> => {
    const tourney = await Tournament.findOne({ id }).exec();
    if (!tourney) return;

    // filter them out
    tourney.teams = tourney.teams.map(t => {
      t.participants = t.participants.filter(p => p.id !== userId);
      return t;
    });
    // cleanup and save
    tourney.teams = removeEmptyTeams(tourney);
    return tourney.save().then(o => o.toObject());
  },
  /**
   * @param {string} id
   * @param {string} teamId
   * @returns {Promise<Tournament|null>}
   */
  checkin: async (id: string, teamId: string): Promise<Tournament | null> => {
    return Tournament.findOneAndUpdate({ id, "teams.id": teamId }, { "teams.$.checkedIn": true }, { lean: true, new: true }).exec() ?? null;
  }
};