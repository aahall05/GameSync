import pool from '../db.js';

/**
 * Insert a new team
 * @param {string} name
 * @param {number} owner_id
 * @return {Object} the inserted team's row
 */
export async function createTeam({ name, owner_id }) {
    const result = await pool.query(`
        INSERT INTO Teams (name, owner_id)
        VALUES ($1, $2)
        RETURNING id
        `,
        [name, owner_id]
    )
    return result.rows[0]; // return the new team's row
}

/**
 * Fetch all teams owned by a user
 * @param {number} owner_id
 * @return {Array} list of team rows
 */
export async function getTeamsByOwner(owner_id) {
    const result = await pool.query(`
        SELECT * FROM Teams WHERE owner_id = $1
        `,
        [owner_id]
    );
    return result.rows; // return list of teams owned by the user
}

/**
 * Fetch a team by its id
 * @param {number} team_id
 * @return {Object} the team row with the given id
 */
export async function getTeamByid(team_id) {
    const result = await pool.query(`
        SELECT * FROM Teams WHERE id = $1
        `,
        [team_id]
    );
    return result.rows[0]; // return the team with the given id
}
