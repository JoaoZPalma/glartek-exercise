import express from "express";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.all("/api/task", (req, res) => {
  const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];

  // Log detailed request info to debug
  console.log(`${timestamp} - `, req.body);
  // console.log("Method:", req.method);
  // console.log("Headers:", req.headers);
  // console.log("Body:", req.body);

  // Send response
  res.status(200).send("Received");
});

const port = 4000;
app.listen(port, () => {
  console.log(`Receiver server listening on http://localhost:${port}`);
});
