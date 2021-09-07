const { findAndReplaceIf } = require('find-and-replace-anything');
const fs = require('fs').promises;
const path = require('path');

const languagesNat = {
  English: 'English',
  Russian: 'Pусский',
  German: 'Deutsch',
  Spanish: 'Español',
  French: 'Français',
  Italian: 'Italiano',
  Japanese: '日本',
  Korean: '한국인',
  Portugese: 'Português',
  Chinese: '中国人'
};
const tiers = 11;

function findReplaceString (template, string, replaceWith) {
  const newTemplate = findAndReplaceIf(template, value => {
    if (typeof value === 'string' && value.includes(string)) {
      return value.replace(string, replaceWith);
    }
    return value;
  }, { checkArrayValues: true });
  return newTemplate;
}

const outputs = {};

Object.keys(languagesNat)
  .forEach(language => {
    outputs[`Shop Titans Market Orders (Generated)/combined_${language}.json`] = findReplaceString(
      findReplaceString(
        require('./combined_template.json'),
        'REPLACE_WITH_NAT_LANG',
        languagesNat[language]
      ),
      'REPLACE_WITH_LANG',
      language);
  });

Object.keys(languagesNat)
  .map(language => {
    for (let i = 1; i <= tiers; i++) {
      outputs[`Shop Titans Market Orders (Generated)/${language}_tier${i}.json`] = findReplaceString(
        findReplaceString(
          findReplaceString(
            require('./tier_template.json'),
            'REPLACE_WITH_NAT_LANG',
            languagesNat[language]
          ),
          'REPLACE_WITH_LANG',
          language
        ),
        'REPLACE_WITH_TIER',
        i
      );
    }
  });

const dashboardTemplate = require('./dashboard_template.json');

let id = 0;
let x = -5;
let y = 0;

Object.keys(languagesNat)
  .forEach(language => {
    const panel = findReplaceString(
      require('./dashbord_panel_template.json'),
      'REPLACE_WITH_NAT_LANG',
      languagesNat[language]
    );
    panel.gridPos = {
      h: 20,
      w: 5,
      x: x += 5,
      y: y
    };
    panel.id = ++id;
    if (x === 15) {
      x = -5;
      y += 20;
    }
    dashboardTemplate.panels.push(panel);
  }
  );

outputs['General/home.json'] = dashboardTemplate;

async function writeFiles (out) {
  for (const [key, value] of Object.entries(out)) {
    console.log(`Writing ${key}`);
    await fs.mkdir(path.join(__dirname, 'out', path.dirname(key)), { recursive: true });
    await fs.writeFile(path.join(__dirname, 'out', key), JSON.stringify(value, null, 2));
  }
}

writeFiles(outputs);
