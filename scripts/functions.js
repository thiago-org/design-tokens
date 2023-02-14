const fs = require("fs");
const process = require("process");
const { exec } = require("child_process");

const { diff } = require("deep-object-diff");
const JsonToTS = require("json-to-ts");

const ROOT = process.cwd();
const TOKENS_PATH = `${ROOT}/tokens.json`;
const TEMP_TOKENS_PATH = `${ROOT}/tokens-temp.json`;
const PACKAGES_PATH = `${ROOT}/packages`;
const PACKAGES = ["colors", "sizes"];
const CHANGESET_PATH = `${ROOT}/.changeset`;

function executeCommand(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

function getTokens() {
  if (!fs.existsSync(TOKENS_PATH)) {
    throw new Error(`Tokens not found in ${TOKENS_PATH}`);
  }
  return JSON.parse(fs.readFileSync(TOKENS_PATH));
}

function saveTokensAndTypes(tokens) {
  const ignoreKeys = ["global", "$themes", "$metadata"];

  Object.keys(tokens).forEach((k) => {
    if (ignoreKeys.includes(k)) return;

    const tokensData = tokens[k];

    const typesFilePath = `${PACKAGES_PATH}/${k}/src/${k}.types.ts`;
    const typesFileData = JsonToTS(tokensData).reduce(
      (str, t) => str + `\n${t}`,
      ""
    );

    const tokenFilePath = `${PACKAGES_PATH}/${k}/${k}.tokens.json`;
    const tokenFileData = JSON.stringify({ [k]: tokensData });

    fs.writeFileSync(typesFilePath, typesFileData);
    fs.writeFileSync(tokenFilePath, tokenFileData);
  });
}

function runStyledDictionary() {
  PACKAGES.forEach((p) => {
    const configPath = `${PACKAGES_PATH}/${p}/config.json`;
    const command = `style-dictionary build --config ${configPath}`;
    executeCommand(command);
  });
}

function copyStaticsToDist() {
  PACKAGES.forEach((p) => {
    const staticsPath = `${PACKAGES_PATH}/${p}/src/statics`;
    const staticsDistPath = `${PACKAGES_PATH}/${p}/dist`;

    fs.cpSync(staticsPath, staticsDistPath, { recursive: true });
  });
}

function _getChangesetPackages() {
  const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH));
  const tempTokens = JSON.parse(fs.readFileSync(TEMP_TOKENS_PATH));
  const diffObj = diff(tokens, tempTokens);

  return Object.keys(diffObj).filter((k) => PACKAGES.includes(k));
}

function _changesetTemplate(packages, msg) {
  return `
---
${packages.map((p) => `@thiagomcasagrande/${p}: major`).join("\n")}
---

${msg}
  `;
}

function generateChangeset() {
  const timestamp = new Date().getTime();
  const changesetsPath = `${CHANGESET_PATH}/${timestamp}.md`;
  const packages = _getChangesetPackages();

  if (packages.length) {
    const changeset = _changesetTemplate(packages, timestamp);
    fs.writeFileSync(changesetsPath, JSON.stringify(changeset));
  }
}

function saveTempTokensChanges() {
  fs.copyFileSync(TEMP_TOKENS_PATH, TOKENS_PATH);
}

function deleteTempTokens() {
  fs.unlinkSync(TEMP_TOKENS_PATH);
}

module.exports = {
  getTokens,
  saveTokensAndTypes,
  runStyledDictionary,
  copyStaticsToDist,
  generateChangeset,
  saveTempTokensChanges,
  deleteTempTokens,
};
