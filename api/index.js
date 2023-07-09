const app = require("express")();

const items = [
  { id: 1, name: "Apples" },
  { id: 2, name: "Oranges" },
  { id: 3, name: "Pears" },
];

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");

  res.send(JSON.stringify(items));
});

app.post("/", (req, res) => {
  const item = req.body.item;

  items.push(item);

  res.send(JSON.stringify(item)).end;
});

module.exports = app;
