import type {
  CallExpression,
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  Literal,
  MemberExpression,
  Node,
} from "acorn";

export function isImportDeclaration(node: Node): node is ImportDeclaration {
  return node.type === "ImportDeclaration";
}

export function isImportSpecifier(node: Node): node is ImportSpecifier {
  return node.type === "ImportSpecifier";
}

export function isCallExpression(node: Node): node is CallExpression {
  return node.type === "CallExpression";
}

export function isMemberExpression(node: Node): node is MemberExpression {
  return node.type === "MemberExpression";
}

export function isIdentifier(node: Node): node is Identifier {
  return node.type === "Identifier";
}

export function isLiteral(node: Node): node is Literal {
  return node.type === "Literal";
}
