# Notion Database Creator

This is a simple package that can create Notion databases with schemas defined by the input data, and then add the input data as records to the database.

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
        },
        pageTemplate: `{{ name }} lives at {{ address }}`
    });
    await db.create();
}
```

A larger example is available in the `examples` directory.

## Current supported fields

Not all Notion field types are supported, here is the current list of supported types:

- Text
- Number
- Select
- Multi-Select

More types will be added over time.

## Options

Here is the definition of the options used to configure the `NotionDatabase` class.

```js
NotionDatabase({
    name: "String", // The name of the created Notion database
    parentId: "String", // The UUID of the page this database will be attached to
    file: "file/path.json", // A relative path to the .json file with the data
    notionAuth: {}, // Auth for the @notionhq/client library. See more here https://www.npmjs.com/package/@notionhq/client. This is passed directly into the Client class of that library
    transformation: (entry) => { return entry }, // A function run against every entry to allow data manipulation on each entry before the schema for the Notion database is defined, and before the records are uploaded. This function _must_ return the entry
    fields: { // A map of the fields that will be created on the Notion database
        Name: { // Name is a required field, it is used as the "ID" of the database.
            type: "text", // Define the type of field.
            path: [ "name" ] // The "path" to the data in the entry. This example maps to "entry.name". This can support any level of depth
        }
    }, 
    pageTemplate: "{{ name }}" // Mustache (https://github.com/janl/mustache.js) templating for the content of the supported Notion database pages. This is run through the Mustache engine and the formatted properly to Notion blocks. This method is crude, experimentation is required for a good outcome.
})
```