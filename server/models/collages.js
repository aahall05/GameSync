import pool from '../db.js';

/**
 * Insert a new collage
 * @param {number} team_id
 * @param {string} name
 * @param {string} created_at (optional, defaults to current date)
 * @return {Object} the inserted collage's row
 */
export async function createCollage({ team_id, name, created_at = null }) {
    const result = await pool.query(`
        INSERT INTO Collages (team_id, name, created_at)
        VALUES ($1, $2, COALESCE($3, CURRENT_DATE))
        RETURNING id
        `,
        [team_id, name, created_at]
    )
    return result.rows[0]; // return the new collage's row
}

/**
 * Fetch all collages for a given team
 * @param {number} team_id
 * @returns {Array} list of collage rows
 */
export async function getCollagesByTeam(team_id) {
  const result = await pool.query(
    `SELECT * FROM Collages WHERE team_id = $1 ORDER BY created_at ASC`,
    [team_id]
  );

  return result.rows;
}

/**
 * Fetch a collage by its id
 * @param {number} collage_id
 * @return {Object} the collage row with the given id
 */
export async function getCollageById(collage_id) {
    const result = await pool.query(
        `SELECT * FROM Collages WHERE id = $1`,
        [collage_id]
    );
    return result.rows[0]; // return the collage with the given id
}