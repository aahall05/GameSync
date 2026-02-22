// test-db.js
import 'dotenv/config'; // automatically loads .env
import pool from './server/db.js'; // import the pool
import { 
  createTeam, getTeamsByOwner, getTeamByid 
} from './server/models/teams.js';
import { 
  createCollage, getCollagesByTeam, getCollageById 
} from './server/models/collages.js';
import { 
  createVideo, getVideosByCollage, getVideoById 
} from './server/models/videos.js';

async function testDBFunctions() {
  try {
    console.log('⏳ Attempting to connect to the database...');
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Current time in DB:', res.rows[0].now);

    console.log('\n--- Testing Teams ---');
    const newTeam = await createTeam({ name: 'Test Team', owner_id: 12345 });
    console.log('Created team:', newTeam);

    const teamsByOwner = await getTeamsByOwner(12345);
    console.log('Teams by owner 12345:', teamsByOwner);

    const fetchedTeam = await getTeamByid(newTeam.id);
    console.log('Fetched team by ID:', fetchedTeam);

    console.log('\n--- Testing Collages ---');
    const newCollage = await createCollage({ team_id: newTeam.id, name: 'Test Collage' });
    console.log('Created collage:', newCollage);

    const collagesForTeam = await getCollagesByTeam(newTeam.id);
    console.log('Collages for team:', collagesForTeam);

    const fetchedCollage = await getCollageById(newCollage.id);
    console.log('Fetched collage by ID:', fetchedCollage);

    console.log('\n--- Testing Videos ---');
    const newVideo = await createVideo({
      collage_id: newCollage.id,
      filename: 'video.mp4',
      original_name: 'myvideo.mp4',
      path: '/VideoFileStorage/video.mp4',
      length_seconds: 120,
      size: 10485760
    });
    console.log('Created video:', newVideo);

    const videosForCollage = await getVideosByCollage(newCollage.id);
    console.log('Videos for collage:', videosForCollage);

    const fetchedVideo = await getVideoById(newVideo.id);
    console.log('Fetched video by ID:', fetchedVideo);

  } catch (err) {
    console.error('❌ Error testing DB functions:', err);
  } finally {
    await pool.end();
    console.log('🔒 Connection closed');
  }
}

// Run the test
testDBFunctions();