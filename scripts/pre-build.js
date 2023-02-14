const {
  getTokens,
  saveTokensAndTypes,
  runStyledDictionary,
  saveTempTokensChanges,
  deleteTempTokens,
  generateChangeset,
} = require("./functions");

function preBuild() {
  generateChangeset();
  saveTempTokensChanges();
  deleteTempTokens();

  const tokens = getTokens();

  saveTokensAndTypes(tokens);
  runStyledDictionary();
}

preBuild();
