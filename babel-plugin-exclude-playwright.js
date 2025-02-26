/**
 * A Babel plugin to exclude Playwright imports in client-side code
 */
module.exports = function({ types: t }) {
  return {
    name: "exclude-playwright",
    visitor: {
      ImportDeclaration(path, state) {
        // Check if this is a browser environment and if the import is for playwright
        if ((state.file.opts && !state.file.opts.ssr) && 
            (path.node.source.value === 'playwright' || 
             path.node.source.value === 'playwright-core' ||
             path.node.source.value.includes('playwright'))) {
          
          // Get the local name of the import
          const localName = path.node.specifiers[0].local.name;
          
          // Create a conditional expression to use the mock in browser
          const conditionalRequire = t.conditionalExpression(
            t.binaryExpression(
              '===',
              t.unaryExpression('typeof', t.identifier('window')),
              t.stringLiteral('undefined')
            ),
            t.callExpression(
              t.identifier('require'),
              [t.stringLiteral(path.node.source.value)]
            ),
            t.objectExpression([])
          );
          
          // Create a variable declaration for the import
          const variableDeclaration = t.variableDeclaration('const', [
            t.variableDeclarator(
              t.identifier(localName),
              conditionalRequire
            )
          ]);
          
          // Replace the import with the variable declaration
          path.replaceWith(variableDeclaration);
        }
      }
    }
  };
}; 