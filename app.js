const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
let db = null;
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
const initalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://:localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initalizeDBAndServer();

const dbObjectToResponseObject = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};
const movieObjectToResponseObject = (eachMovie) => {
  return {
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    movieName: eachMovie.movie_name,
    leadActor: eachMovie.lead_actor,
  };
};
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie
    ORDER BY movie_id;
    `;
  const moviesArray = await db.all(getMoviesQuery);

  response.send(
    moviesArray.map((eachMovie) => dbObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie
    (director_id,movie_name,lead_actor)
    VALUES 
    ('${directorId}',
    '${movieName}',
    '${leadActor}');
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieByIdQuery = `
    SELECT * FROM movie
    WHERE movie_id = '${movieId}';
    `;
  let movieDetails = await db.get(getMovieByIdQuery);

  response.send(movieObjectToResponseObject(movieDetails));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie 
    SET 
    director_id = '${directorId}';
    movie_name = '${movieName}',
    lead_actor = '${leadActor}' 
    WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", (request, response) => {
  const { movieId } = request.params;

  const DeleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `;
  db.run(DeleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT director_id,director_name
    FROM movie
    ORDER BY director_id;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});
module.exports = app;
