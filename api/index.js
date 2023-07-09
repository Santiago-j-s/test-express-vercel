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

  items.push(item);
  console.log(items);

  await kvClient.set("items", items);

  return items;
}

async function deleteItem(id) {
  let items;

  try {
    items = (await kvClient.get("items")) ?? [];
  } catch (err) {
    console.log(err);
    throw err;
  }

  const newItems = items.filter((item) => item.id !== id);
  kvClient.set("items", newItems);

  return newItems;
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
  res.setHeader("Content-Type", "application/json");

  console.log(req.body);

  if (!req.body) {
    return res.status(400).send(JSON.stringify("No body"));
  }

  const id = req.body.id;
  const name = req.body.name;

  pushItem({ id, name })
    .then((items) => {
      return res.send(JSON.stringify(items));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error");
      return res.status(500).send(JSON.stringify("Error"));
    });
});

app.delete("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  console.log(req.body);

  if (!req.body) {
    return res.status(400).send(JSON.stringify("No body"));
  }

  const id = req.body.id;

  deleteItem()
    .then((items) => {
      return res.send(JSON.stringify(items));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error");
      return res.status(500).send(JSON.stringify("Error"));
    });
});

module.exports = app;
