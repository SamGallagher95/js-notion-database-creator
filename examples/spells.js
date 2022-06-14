import { NotionDatabase } from '../src/index.js';

var NOTION_TOKEN = process.env.NOTION_TOKEN;

async function spells() {
  const db = new NotionDatabase({
    name: 'Spells',
    parentId: '5f058ce21a014d7fb5eb7b6f3cd2a3aa',
    file: 'data/spells.json',
    notionAuth: {
      auth: NOTION_TOKEN,
    },
    transformation: (item) => {
      item.fullJSON = JSON.stringify(item, null, '\t');
      return item;
    },
    fields: {
      Name: {
        type: 'text',
        path: ['name'],
      },
      Level: {
        type: 'number',
        path: ['level'],
      },
      Range: {
        type: 'text',
        path: ['range'],
      },
      'Attack Type': {
        type: 'select',
        path: ['attack_type'],
      },
      Classes: {
        type: 'multi_select',
        path: ['classes'],
        multiselect_key: 'name',
      },
      'Damage Type': {
        type: 'select',
        path: ['damage', 'damage_type', 'name'],
      },
      School: {
        type: 'select',
        path: ['school', 'name'],
      },
    },
    pageTemplate: `{{ desc }}
    **Higher Level**{{ #higher_level }}
    - {{ . }}<br />
    {{ /higher_level }}
    {{ #material }}**Material:** {{ . }}{{ /material }}
    **Duration**: {{ duration }}
    **Casting Time:** {{ casting_time }}\n\n
    {{{ fullJSON }}}`,
  });
  await db.create();
}

(async () => {
  await spells();
})();
