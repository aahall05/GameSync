import pool from '../db.js';

/**
 * Insert a new video linked to a collage
 * @param {number} collage_id
 * @param {string} filename
 * @param {string} original_name
 * @param {string} path
 * @param {number} length_seconds
 * @param {number} size
 * @param {string} created_at (optional, defaults to current date)
 * @param {string} timestamp (optional, defaults to current timestamp)
 * @returns {Object} the inserted video row
 */
export async function createVideo({
  collage_id,
  filename,
  original_name,
  path,
  length_seconds = null,
  created_at = null,
  time = null,
  size = null
}) {
  const result = await pool.query(
    `
    INSERT INTO Videos (
      collage_id,
      filename,
      original_name,
      path,
      length_seconds,
      size,
      created_at,
      time
    )
    VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE), COALESCE($8, CURRENT_TIME))
    RETURNING id
    `,
    [
      collage_id,      // $1
      filename,        // $2
      original_name,   // $3
      path,            // $4
      length_seconds,  // $5
      size,            // $6
      created_at,      // $7
      time             // $8
    ]
  );

  return result.rows[0];
}

/**
 * Fetch all videos for a given collage
 * @param {number} collage_id
 * @returns {Array} list of video rows
 */
export async function getVideosByCollage(collage_id) {
  const result = await pool.query(
    `SELECT * FROM videos WHERE collage_id = $1 ORDER BY created_at ASC`,
    [collage_id]
  );

  return result.rows;
}

/**
 * Fetch a video by its id
 * @param {number} video_id
 * @return {Object} the video row with the given id
 */
export async function getVideoById(video_id) {
    const result = await pool.query(
        `SELECT * FROM videos WHERE id = $1`,
        [video_id]
    );
    return result.rows[0]; // return the video with the given id
}