const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");
let bd = null;
const initializingdbAndServerRes = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializingdbAndServerRes();

const togetResponseForm = (objectdb) => {
  return {
    playerId: objectdb.player_id,
    playerName: objectdb.player_name,
    jerseyNumber: objectdb.jersey_number,
    role: objectdb.role,
  };
};

app.get("/players/", async (request, response) => {
  const getdatabaseQuery = `
 SELECT * FROM cricket_team ORDER BY player_id;`;
  const array = await db.all(getdatabaseQuery);
  response.send(array.map((eachplayerObj) => togetResponseForm(eachplayerObj)));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const query = `
    INSERT INTO
    cricket_team(player_name, jersey_number, role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
       ' ${role}'
    )`;
  const responseGiv = await db.run(query);

  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getDbquery = `
    SELECT * FROM cricket_team WHERE player_id=${playerId}`;
  const playerDetails = await db.get(getDbquery);
  response.send(togetResponseForm(playerDetails));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDet = request.body;
  const { playerName, jerseyNumber, role } = playerDet;
  const reqDbquery = `
 UPDATE 
 cricket_team 
 SET 
 player_name='${playerName}',
 jersey_number=${jerseyNumber}, 
 role='${role}'
 WHERE player_id=${playerId}`;
  await db.run(reqDbquery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const queryFor = `
    DELETE FROM cricket_team WHERE player_id=${playerId} `;
  await db.run(queryFor);
  response.send("Player Removed");
});

module.exports = app;
