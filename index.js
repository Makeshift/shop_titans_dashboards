const { findAndReplaceIf } = require('find-and-replace-anything');
const fs = require('fs').promises

const languagesNat = {
  "English": "English",
  "Russian": "Pусский",
  "German": "Deutsch",
  "Spanish": "Español",
  "French": "Français",
  "Italian": "Italiano",
  "Japanese": "日本",
  "Korean": "한국인",
  "Portugese": "Português",
  "Chinese": "中国人"
}
const tiers = 11;

function findReplaceString(template, string, replaceWith) {
  let newTemplate = findAndReplaceIf(template, value => {
      if (typeof value === "string" && value.includes(string)) {
          return value.replace(string, replaceWith);
      }
      return value;
  }, { checkArrayValues: true });
  return newTemplate;
}

let outputs = {};

Object.keys(languagesNat)
  .forEach(language => outputs[`combined_${language}.json`] = findReplaceString(
      findReplaceString(
        require('./combined_template.json'),
        "REPLACE_WITH_NAT_LANG",
        languagesNat[language]
      ),
      "REPLACE_WITH_LANG",
      language));

Object.keys(languagesNat)
.map(language => {
    for (let i = 1; i <= tiers; i++) {
        outputs[`${language}_tier${i}.json`] = findReplaceString(
            findReplaceString(
                findReplaceString(
                    require("./tier_template.json"),
                    "REPLACE_WITH_NAT_LANG",
                    languagesNat[language]
                ),
              "REPLACE_WITH_LANG",
              language
            ),
          "REPLACE_WITH_TIER", 
          i
        )
    }
})

let dashboardTemplate = require('./dashboard_template.json');

Object.keys(languagesNat)
.map(language => dashboardTemplate.panels.push(
  findReplaceString(
    require('./dashbord_panel_template.json'),
    "REPLACE_WITH_NAT_LANG",
    languagesNat[language]
  )
))

outputs["dashboard.json"] = dashboardTemplate;

async function writeFiles(out) {
  for (let [key, value] of Object.entries(out)) {
    console.log(`Writing ${key}`)
    await fs.writeFile(`${__dirname}/out/${key}`, JSON.stringify(value, null, 2));
  }
}

writeFiles(outputs);
