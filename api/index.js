const { createClient } = require("@vercel/kv");
const app = require("express")();

const kvClient = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

/**
 * @returns {{ id: string; name: string }[]}}
 */
async function getItems() {
  let items;

  try {
    items = (await kvClient.get("items")) ?? [];
  } catch (err) {
    console.log(err);
    throw err;
  }

  return items;
}

/**
 * @param {{ id: string; name: string }} item
 * @returns {{ id: string; name: string }[]}
 */
async function pushItem(item) {
  let items;
  try {
    items = (await kvClient.get("items")) ?? [];
  } catch (err) {
    console.log(err);
    throw err;
  }

  console.log(items);
  items.push(item);

  await kvClient.set("items", items);

  return items;
}

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  getItems()
    .then((items) => {
      res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
      res.send(JSON.stringify(items));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error");
    });
});

app.post("/", (req, res) => {
  console.log(req);
  const id = req.body.id;
  const name = req.body.name;

  pushItem({ id, name })
    .then((items) => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(items));
    })
    .catch((err) => {
      res.setHeader("Content-Type", "application/json");
      console.log(err);
      res.status(500).send("Error");
    });
});

module.exports = app;
