import * as notion from '@notionhq/client';

export class Notion {
  constructor(auth) {
    this.notion = new notion.Client(auth);
    this.colors = [
      'default',
      'gray',
      'brown',
      'orange',
      'yellow',
      'green',
      'blue',
      'purple',
      'pink',
      'red',
    ];
  }

  async createDatabase(pageId, name, properties) {
    const res = await this.notion.databases.create({
      parent: {
        page_id: pageId,
      },
      title: [
        {
          type: 'text',
          text: {
            content: name,
          },
        },
      ],
      properties,
    });
    return res.id;
  }

  async addDatabasePage(dbId, properties, pageContent) {
    const data = {
      parent: {
        database_id: dbId,
      },
      properties,
    };

    if (pageContent) {
      data.children = pageContent;
    }

    const res = await this.notion.pages.create(data);
    return res.id;
  }

  generateDatabaseProperties(databaseFields, selects) {
    const properties = {};
    for (const [key, o] of Object.entries(databaseFields)) {
      // Based on type
      if (key == 'Name') {
        properties[key] = {
          title: {},
        };
      } else if (o.type == 'text') {
        properties[key] = {
          rich_text: {},
        };
      } else if (o.type == 'number') {
        properties[key] = {
          number: {
            format: 'number',
          },
        };
      } else if (o.type == 'select') {
        properties[key] = this._generateSelect(key, o, selects, 'select');
      } else if (o.type == 'multi_select') {
        properties[key] = this._generateSelect(key, o, selects, 'multi_select');
      }
    }
    return properties;
  }

  _generateSelect(key, field, selects, type) {
    const property = {};
    property[type] = {
      options: [],
    };

    const select = selects.find((s) => s.field == key);
    for (let i = 0; i <= select.options.length; i++) {
      const color = this.colors[i % (this.colors.length - 1)];
      let item = select.options[i];
      if (item == undefined) {
        item = 'N/A';
      }
      property[type].options.push({
        name: item,
        color,
      });
    }

    return property;
  }
}
