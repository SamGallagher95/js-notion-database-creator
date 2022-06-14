import Mustache from 'mustache';
import { markdownToRichText, markdownToBlocks } from '@tryfabric/martian';

export class Markdown {
  constructor() {}

  template(template, entry) {
    // Run the template with mustache
    const text = Mustache.render(template, entry);

    // Convert to Notion format
    const notionText = markdownToBlocks(text);

    return notionText;
  }
}
