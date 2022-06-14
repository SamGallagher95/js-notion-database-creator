import * as fs from 'fs';
import cliProgress from 'cli-progress';
import { Markdown } from './helpers/markdown.js';
import { Notion } from './helpers/notion.js';

export class NotionDatabase {
  constructor(config) {
    this.name = config.name;
    this.parentId = config.parentId;
    this.file = config.file;
    this.transformation = config.transformation;
    this.fields = config.fields;
    this.pageTemplate = config.pageTemplate;

    // Helpers
    this.notion = new Notion(config.notionAuth);
    this.markdown = new Markdown();
  }

  async create() {
    // Load the data
    this._loadData();
    console.log('Loaded data...');

    // Apply Transformations
    this._applyTransformations();
    console.log('Applied transformation...');

    // Create select options
    this._initSelects();
    console.log('Created select options...');

    // Create the Notion database
    const properties = this.notion.generateDatabaseProperties(
      this.fields,
      this.selects
    );
    this.dbId = await this.notion.createDatabase(
      this.parentId,
      this.name,
      properties
    );
    console.log('Created Notion Database...');

    // Push the entries to the new Database
    this.progBar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );
    this.progBar.start(this.data.length, 0);
    let i = 0;
    for (const entry of this.data) {
      const notionEntry = this._createEntry(entry);
      const pageContent = this.markdown.template(this.pageTemplate, entry);
      await this.notion.addDatabasePage(this.dbId, notionEntry, pageContent);
      i++;
      this.progBar.update(i);
    }
    this.progBar.stop();
  }

  _applyTransformations() {
    if (!this.transformation) {
      this.data = this.rawData;
      return;
    }

    this.data = [];
    for (let entry of this.rawData) {
      entry = this.transformation(entry);
      this.data.push(entry);
    }
  }

  _createEntry(entry) {
    const notionEntry = {};
    for (const [key, o] of Object.entries(this.fields)) {
      // Per type
      if (key == 'Name') {
        const value = this._selectAttr(entry, key);
        notionEntry.Name = {
          title: [
            {
              text: {
                content: value,
              },
            },
          ],
        };
      } else if (o.type == 'text') {
        const value = this._selectAttr(entry, key);
        notionEntry[key] = {
          rich_text: [
            {
              text: {
                content: value,
              },
            },
          ],
        };
      } else if (o.type == 'number') {
        const value = this._selectAttr(entry, key);
        notionEntry[key] = {
          number: value,
        };
      } else if (o.type == 'select') {
        const value = this._selectAttr(entry, key);
        notionEntry[key] = {
          select: {
            name: value,
          },
        };
      } else if (o.type == 'multi_select') {
        const value = this._selectAttr(entry, key);
        notionEntry[key] = {
          multi_select: [],
        };
        for (let x of value) {
          notionEntry[key].multi_select.push({ name: x[o.multiselect_key] });
        }
      }
    }
    return notionEntry;
  }

  _initSelects() {
    this.selects = [];
    for (const [key, o] of Object.entries(this.fields)) {
      if (o.type == 'multi_select' || o.type == 'select') {
        // Create the base object
        const select = {
          field: key,
          options: [],
        };

        // Grab all possible values
        for (const item of this.data) {
          const selectable = this._selectAttr(item, key);

          // Change based on type of select
          if (o.type == 'multi_select') {
            for (let entry of selectable) {
              const x = entry[o.multiselect_key];
              if (!select.options.includes(x)) {
                select.options.push(x);
              }
            }
          } else if (o.type == 'select') {
            if (!select.options.includes(selectable)) {
              select.options.push(selectable);
            }
          }
        }

        // Push to list
        this.selects.push(select);
      }
    }
  }

  _loadData() {
    const pwd = process.cwd();
    const filePath = `${pwd}/${this.file}`;
    try {
      const fileString = fs.readFileSync(filePath);
      this.rawData = JSON.parse(fileString);
    } catch (err) {
      console.log('There was an error loading the file.');
      console.error(err);
      return;
    }
  }

  _selectAttr(item, field) {
    for (let f of this.fields[field].path) {
      if (Object.keys(item).includes(f)) {
        item = item[f];
      } else {
        item = 'N/A';
        break;
      }
    }
    return item;
  }
}
