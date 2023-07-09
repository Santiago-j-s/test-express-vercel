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
  const item = req.body.item;

  pushItem(item)
    .then((items) => {
      res.send(JSON.stringify(items));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error");
    });
});

module.exports = app;
