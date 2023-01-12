const {
  getTokens,
  saveTokensAndTypes,
  runStyledDictionary,
} = require('./functions');

function main() {
  const tokens = getTokens();

  saveTokensAndTypes(tokens);
  runStyledDictionary();
}

main();
