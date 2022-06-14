# Notion Database Creator

This is a simple package that can generate and add entries to Notion databases based on JSON content.

Install via:
```
$ npm install js-notion-database-creator
```

Simple use:

data.json
```json
[
    {
        "name": "Sam",
        "address": "123 Park Place",
        "pizzaToppings": [
            "mushrooms",
            "onions"
        ]
    },
    {
        "name": "Bob",
        "address": "321 Place Park",
        "pizzaToppings": [
            "pineapple", // Gross
            "bacon"
        ]
    }
]
```

index.js
```js
import { NotionDatabase } from "js-notion-database-creator"

var NOTION_TOKEN = process.env.NOTION_TOKEN;

async function main() {
    const db = new NotionDatabase({
        name: "Example DB",
        parentId: "NOTION_PAGE_ID_HERE",
        file: "data.json",
        notionAuth: {
            auth: NOTION_TOKEN
        },
        transformation: (item) => {
            item.hasTaste = item.pizzaToppings.includes("pineapple") ? "nope" : "yea";
            return item;
        },
        fields: {
            Name: {
                tpye: "text",
                path: [ "name" ]
            },
            Address: {
                type: "text",
                path: [ "address" ]
            },
            "Pizza Toppings": {
                type: "multi_select",
                path: [ "pizzaToppings" ]
            },
            "Has Taste": {
                type: "text",
                path: [ "hasTaste" ]
            }
        }
    });
    await db.create();
}
```