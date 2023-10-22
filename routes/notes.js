const express = require("express");
const router = express.Router();

// package which provides a middleware to manage postgres database connections
const pgp = require("pg-promise")();

const dbConfig = {
  user: "postgres",
  host: "localhost",
  database: "node_database",
  password: "root",
  port: 5431, // my mapping PostgreSQL port in container
};

const db = pgp(dbConfig);

router.get("/notes", (req, res) => {
  db.query("SELECT * FROM notes")
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "Database error" });
    });
});

router.post("/notes", (req, res) => {
  const { titre, description } = req.body;

  const insertQuery = `
    INSERT INTO notes (titre, description)
    VALUES ($1, $2)
    RETURNING *;`;

  // Execute the query with parameters
  db.one(insertQuery, [titre, description])
    .then((data) => {
      res.json({
        message: "Data inserted successfully",
        insertedData: data,
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "Database error" });
    });
});

router.put("/notes/:id", (req, res) => {
  const id = req.params.id; // The ID of the record to update
  const { titre, description } = req.body; // New data

  // Define the SQL query for the update
  const updateQuery = `
    UPDATE notes
    SET titre = $1, description = $2
    WHERE id = $3
    RETURNING *;
  `;

  // Execute the query with parameters
  db.one(updateQuery, [titre, description, id])
    .then((data) => {
      res.json({ message: "Data updated successfully", updatedData: data });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "Database error" });
    });
});

router.delete("/notes/:id", (req, res) => {
  const id = req.params.id; // The ID of the record to delete

  // Define the SQL query for the deletion
  const deleteQuery = `
    DELETE FROM notes
    WHERE id = $1
    RETURNING *;
  `;

  // Execute the query with the ID as a parameter
  db.oneOrNone(deleteQuery, id)
    .then((data) => {
      if (data) {
        res.json({ message: "Data deleted successfully", deletedData: data });
      } else {
        res.status(404).json({ error: "Record not found" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "Database error" });
    });
});

module.exports = router;
