const express = require("express");
const app = express();

const notes = require("./routes/notes");

// extract or parse formData with urlencoded middleware
app.use(express.urlencoded({ extended: false }));

app.use(notes);

app.listen(3001, () => {
  console.log("Waiting for request");
});
