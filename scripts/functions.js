const fs = require("fs");
const process = require("process");
const { exec } = require("child_process");

const JsonToTS = require("json-to-ts");

const ROOT = process.cwd();
const TOKENS_PATH = `${ROOT}/tokens.json`;
const PACKAGES_PATH = `${ROOT}/packages`;
const PACKAGES = ["colors", "sizes"];

function log(str) {
  console.log("");
  console.log("=============================================");
  console.log(str);
}

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
  log("1. Reading tokens.json");

  if (!fs.existsSync(TOKENS_PATH)) {
    throw new Error(`Tokens not found in ${TOKENS_PATH}`);
  }
  return JSON.parse(fs.readFileSync(TOKENS_PATH));
}

function saveTokensAndTypes(tokens) {
  log("2. Saving tokens into packages");

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
  log("3. Generating styles with Style Dictionary");

  PACKAGES.forEach((p) => {
    const configPath = `${PACKAGES_PATH}/${p}/config.json`;
    const command = `style-dictionary build --config ${configPath}`;
    executeCommand(command);
  });
}

function copyStaticsToDist() {
  log("4. Moving static files to dist");

  PACKAGES.forEach((p) => {
    const staticsPath = `${PACKAGES_PATH}/${p}/src/statics`;
    const staticsDistPath = `${PACKAGES_PATH}/${p}/dist`;

    fs.cpSync(staticsPath, staticsDistPath, { recursive: true });
  });
}

module.exports = {
  getTokens,
  saveTokensAndTypes,
  runStyledDictionary,
  copyStaticsToDist,
};
