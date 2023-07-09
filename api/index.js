import { createClient } from "@vercel/kv";
import express from "express";

const app = express();

const kvClient = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const itemsKey = "items";

/**
 * @returns {{ id: string; name: string }[]}}
 */
async function getItems() {
  let items;

  try {
    items = (await kvClient.get(itemsKey)) ?? [];
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
    items = (await kvClient.get(itemsKey)) ?? [];
  } catch (err) {
    console.log(err);
    throw err;
  }

  items.push(item);
  console.log(items);

  try {
    await kvClient.set(itemsKey, items);
    console.log(`Items set successfully ${JSON.stringify(items)}`);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return items;
}

async function deleteItem(id) {
  let items;

  try {
    items = (await kvClient.get(itemsKey)) ?? [];
  } catch (err) {
    console.log(err);
    throw err;
  }

  const newItems = items.filter((item) => item.id !== id.toString());

  try {
    await kvClient.set(itemsKey, newItems);
    console.log(`Items set successfully ${JSON.stringify(newItems)}`);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return newItems;
}

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  getItems()
    .then((items) => {
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

  deleteItem(id)
    .then((items) => {
      return res.send(JSON.stringify(items));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error");
      return res.status(500).send(JSON.stringify("Error"));
    });
});

export default app;
